import mongoose from 'mongoose';
import User from './user';

const Schema = mongoose.Schema;

// include this to avoid error: OverwriteModelError: Cannot overwrite `Todo` model once compiled.
delete mongoose.connection.models['Template'];

const TemplateSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: false },
  fields: { type: Array, required: true },
  created: { type: Date, default: Date.now },
  creator: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  }
});

module.exports = mongoose.model('Template', TemplateSchema);
