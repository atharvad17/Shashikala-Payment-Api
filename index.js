const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./app/schema');
const resolvers = require('./app/resolvers');
const connectDB = require('./db');
//const stripe = require('stripe');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();
const mongoose = require('mongoose');

async function startServer() {
  const app = express();
  await connectDB();

  // Test database connection
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
  } catch (error) {
    console.error('Error listing collections:', error);
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ 
      req,
      stripe // Pass the stripe instance to the context
    }),
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
});
