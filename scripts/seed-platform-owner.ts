import mongoose from "mongoose";
import PlatformOwner from "../src/models/PlatformOwner";
import * as dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/orgcontrol";

async function seedPlatformOwner() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Platform Owner Seeding.");

    // Check if the platform owner already exists
    const existing = await PlatformOwner.findOne({ email: "admin@saasmaker.in" });
    if (existing) {
      console.log("Platform owner admin@saasmaker.in already exists.");
      return;
    }

    await PlatformOwner.create({
      name: "Platform Owner",
      email: "admin@saasmaker.in",
      password: "admin123", // Matches our documentation
      role: "platform_admin",
    });

    console.log("Platform owner admin@saasmaker.in successfully seeded!");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedPlatformOwner();
