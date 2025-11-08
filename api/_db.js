import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) throw new Error("Missing MONGODB_URI environment variable");

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { dbName: "guide_staff" }).then(m => {
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const userSchema = new mongoose.Schema({
  username: String,
  role: String,
  ip: String,
  createdAt: { type: Date, default: Date.now }
});
const logSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  username: String,
  role: String,
  ip: String,
  action: String
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Log = mongoose.models.Log || mongoose.model("Log", logSchema);
