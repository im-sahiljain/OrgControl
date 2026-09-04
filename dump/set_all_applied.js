const mongoose = require('mongoose');
require('dotenv').config();

async function updateAllToApplied() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  const orgId = new mongoose.Types.ObjectId("6a2161415b2d4dbff95e7c0c");

  const result = await mongoose.connection.db.collection('candidates').updateMany(
    { orgId },
    { $set: { stage: "applied", offerStatus: "none" } }
  );

  console.log(`✓ Updated ${result.modifiedCount} candidates to stage: "applied" and offerStatus: "none".`);
  await mongoose.disconnect();
}

updateAllToApplied().catch(console.error);
