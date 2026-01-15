import mongoose, { type Connection } from 'mongoose';

/**
 * Global interface to extend the Node.js global type with our cached connection.
 * This allows TypeScript to recognize the cached connection on the global object.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  } | undefined;
}

/**
 * MongoDB connection URI from environment variables.
 * Falls back to a default local URI if MONGODB_URI is not set.
 * In production, always set MONGODB_URI in your environment variables.
 */
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextjs-app';

/**
 * Cached connection object stored on the global object.
 * This prevents creating multiple connections during development hot-reloads.
 * In Next.js, modules can be reloaded, but global variables persist.
 */
const cached: {
  conn: Connection | null;
  promise: Promise<Connection> | null;
} = global.mongoose || {
  conn: null,
  promise: null,
};

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Implements connection caching to prevent multiple connections during development.
 * 
 * @returns {Promise<Connection>} A promise that resolves to the MongoDB connection
 * @throws {Error} If MONGODB_URI is not defined or connection fails
 */
async function connectDB(): Promise<Connection> {
  // If we already have a cached connection, return it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a connection promise yet, create one
  if (!cached.promise) {
    // Validate that MONGODB_URI is set
    if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }

    // Set connection options for optimal performance and reliability
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    // Create the connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      // Return the connection object from the mongoose instance
      return mongooseInstance.connection;
    });
  }

  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (error) {
    // If connection fails, clear the promise so we can retry
    cached.promise = null;
    throw error;
  }

  // Store the cached connection on the global object for persistence across hot-reloads
  if (!global.mongoose) {
    global.mongoose = cached;
  }

  return cached.conn;
}

/**
 * Closes the MongoDB connection.
 * Useful for cleanup in tests or when shutting down the application.
 * 
 * @returns {Promise<void>} A promise that resolves when the connection is closed
 */
async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    if (global.mongoose) {
      global.mongoose = cached;
    }
  }
}

export { connectDB, disconnectDB };
