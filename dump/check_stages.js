const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const orgId = new mongoose.Types.ObjectId('6a2161415b2d4dbff95e7c0c');
  const stages = await mongoose.connection.db.collection('candidates').aggregate([
    { $match: { orgId: orgId } },
    { $group: { _id: "$stage", count: { $sum: 1 } } }
  ]).toArray();

  console.log("Candidate Stages Breakdown:", stages);
  await mongoose.disconnect();
}

check().catch(console.error);
