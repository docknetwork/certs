import mongoose from 'mongoose';

import CredentialTemplate from './credential-type';
import User from './user';
import Receiver from './receiver';

const Schema = mongoose.Schema;

// include this to avoid error: OverwriteModelError: Cannot overwrite `Todo` model once compiled.
delete mongoose.connection.models['Credential'];

const CredentialSchema = new Schema({
  created: { type: Date, default: Date.now },
  credential: { type: Object, required: true },
  recipientReference: { type: String, required: true },
  template: {
    type: Schema.Types.ObjectId,
    ref: CredentialTemplate,
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: Receiver,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
});

module.exports = mongoose.model('Credential', CredentialSchema);
