const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 5 },
  createdAt: { type: Date },
  profilePicture: { data: Buffer, contentType: String },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  facebookId: { type: String },
  about: { type: String, maxLength: 400 },
});

module.exports = mongoose.model('User', UserSchema);
