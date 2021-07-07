import mongoose from 'mongoose';

let db;

export default async function connect() {
  if (!db) {
    db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  return db;
}
