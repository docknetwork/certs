import mongoose from 'mongoose';
import User from './user';

const Schema = mongoose.Schema;

// include this to avoid error: OverwriteModelError: Cannot overwrite `Receiver` model once compiled.
delete mongoose.connection.models['Receiver'];

const ReceiverSchema = new Schema({
  created: { type: Date, default: Date.now },
  email: { type: String, required: false },
  did: { type: String, required: false },
  name: { type: String, required: true },
  reference: { type: String, required: true },
  issuer: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
});

module.exports = mongoose.model('Receiver', ReceiverSchema);
