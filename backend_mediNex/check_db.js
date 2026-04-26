import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const bookings = await db.collection('bookings').find({}).toArray();
    console.log("Total Bookings:", bookings.length);
    if(bookings.length > 0) {
       console.log("Last 5 Bookings:");
       console.log(bookings.slice(-5).map(b => ({
          date: b.date, 
          status: b.status, 
          token: b.queue_token_number,
          patientId: b.patientId,
          doctorId: b.doctorId
       })));
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
