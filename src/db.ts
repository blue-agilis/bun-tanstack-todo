import mongoose from "mongoose";

const MONGODB_URI = process.env.DATABASE_URL!;

if (!MONGODB_URI) {
  throw new Error("DATABASE_URL environment variable is not set");
}

declare global {
  var __mongoose: typeof mongoose | undefined;
}

async function connectDB() {
  if (globalThis.__mongoose) {
    return globalThis.__mongoose;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  await mongoose.connect(MONGODB_URI);

  if (process.env.NODE_ENV !== "production") {
    globalThis.__mongoose = mongoose;
  }

  return mongoose;
}

export { connectDB };
