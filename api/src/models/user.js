import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// include this to avoid error: OverwriteModelError: Cannot overwrite `User` model once compiled.
delete mongoose.connection.models['User'];

const UserSchema = new Schema({
  created: { type: Date, default: Date.now },
  email: { type: String, required: true },
  entityName: { type: String, required: false, default: 'Untitled Institute' },
  sector: { type: String, required: false, default: '' },
  name: { type: String, required: false, default: '' },
  issuer: { type: String, required: true, unique: true }, // did:ethr:public_address
});

module.exports = mongoose.model('User', UserSchema);
