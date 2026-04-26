import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const doctors = await db.collection('doctors').find({}).toArray();
    console.log("Total Doctors:", doctors.length);
    if(doctors.length > 0) {
       console.log("Schedules of first 3:");
       doctors.slice(0, 3).forEach(d => console.log(d.schedule));
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
