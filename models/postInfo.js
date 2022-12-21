const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostInfoSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  likedByUser: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
});

module.exports = mongoose.model('PostInfo', PostInfoSchema);
