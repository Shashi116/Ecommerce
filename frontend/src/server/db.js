import mongoose from 'mongoose';
import './env';

const MONGO_URI = process.env.MONGO_URI;

let cached = globalThis.mongooseConnection;

if (!cached) {
  cached = globalThis.mongooseConnection = { conn: null, promise: null };
}

export async function connectDB() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI must be defined in the environment.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
