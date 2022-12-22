const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  text: { type: String, required: true, minLength: 1 },
  createdAt: { type: Date },
  lastUpdated: { type: Date },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  likes: { type: Number, default: 0 },
  likedByUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Post', PostSchema);
