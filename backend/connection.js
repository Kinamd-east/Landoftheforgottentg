require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI; // Replace with your MongoDB connection string

let client;
let db;

async function connectDB() {
  if (db) {
    // If db is already initialized, return it
    console.log('Database connection already established.');
    return db;
  } else {
    // If db is not initialized, create a new connection
    try {
      client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
      await client.connect();
      db = client.db('landoftheforgotten'); // Your database name
      console.log('Database connection established.');
      return db;
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw new Error('Failed to connect to the database.');
    }
  }
}

module.exports = { connectDB };
