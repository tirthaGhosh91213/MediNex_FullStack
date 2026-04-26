import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const doc = await db.collection('doctors').findOne({ schedule: { $exists: true, $type: 'array', $ne: [] } });
  console.log(JSON.stringify(doc, null, 2));
  process.exit(0);
});
