import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function wipe() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Check .env.local or .env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("Connected. Dropping database...");

  await mongoose.connection.db!.dropDatabase();
  console.log("Database dropped successfully.");

  await mongoose.disconnect();
  console.log("Disconnected. Done.");
}

wipe().catch((err) => {
  console.error("Wipe failed:", err);
  process.exit(1);
});
