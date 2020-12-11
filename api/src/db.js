import mongoose from 'mongoose';

async function connect(callback) {
  const db = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  callback(db);
}

export default function (callback) {
  connect(callback);
}
