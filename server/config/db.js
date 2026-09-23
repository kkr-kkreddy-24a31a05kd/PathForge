import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

let mongoServerInstance = null;

export const connectDB = async () => {
  const isAtlasConfigured = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());

  if (!isAtlasConfigured) {
    console.log('⚡ No MONGODB_URI found. Initializing embedded MongoDB Memory Server for zero-friction setup...');
    mongoServerInstance = await MongoMemoryServer.create();
    const mongoUri = mongoServerInstance.getUri();
    console.log(`📦 Embedded MongoDB started successfully at: ${mongoUri}`);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      dbName: 'pathforge'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  }

  // When MONGODB_URI is configured, connect strictly to MongoDB Atlas without falling back to memory server
  try {
    mongoose.connection.on('error', (err) => {
      console.error('⚠️ MongoDB Connection Error:', err?.message || err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB Disconnected. Mongoose will automatically attempt reconnect.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB Reconnected.');
    });

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      dbName: 'pathforge'
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    // Explicitly do NOT fall back to an in-memory database when Atlas is configured
    throw error;
  }
};

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServerInstance) {
    await mongoServerInstance.stop();
  }
};
