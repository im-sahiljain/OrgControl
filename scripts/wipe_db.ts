import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function wipe() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    try {
      await collection.drop();
      console.log(`Dropped collection: ${collectionName}`);
    } catch (e: any) {
      if (e.message === "ns not found") return;
      if (e.message.includes("a background operation is currently running")) return;
      console.error(`Failed to drop collection ${collectionName}: ${e.message}`);
    }
  }

  console.log("Database wiped successfully.");
  process.exit(0);
}

wipe().catch(console.error);
