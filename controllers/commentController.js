const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');
const Post = require('../models/post');

// Creates a comment
const comment_create = [
  body('text', 'Text must not be empty').trim().isLength({ min: 1 }).escape(),
  body('user').trim().escape(),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json(errors.array());
    } else {
      const comment = new Comment({
        text: req.body.text,
        createdAt: new Date(),
        user: req.session.user._id,
      });

      try {
        await comment.save();

        const updatePost = await Post.updateOne(
          { _id: req.params.id },
          { $push: { comments: comment } }
        );

        await comment.populate('user');
        return res.json({ msg: 'posted', comment: comment });
      } catch (err) {
        return res.json({ message: err.message });
      }
    }
  },
];

// Deletes the comment from the post
// const delete_comment_post = async (req, res) => {
//   try {
//     const updatePost = await Post.updateOne(
//       { _id: req.body.id },
//       { $pull: { comments: req.params.id } }
//     );
//     return res.json('removed');
//   } catch (err) {
//     return res.json({ message: err.message });
//   }
// };

// Delete comment as logged in user
const comment_delete = async (req, res) => {
  try {
    // if (req.session.user === false) {
    //   return res.json('Not signed in');
    // } else {
    const deleteComment = await Comment.findByIdAndDelete(req.params.id);
    const updatePost = await Post.updateOne(
      { _id: req.body.id },
      { $pull: { comments: req.params.id } }
    );

    return res.json('deleted');
    // }
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Deletes all comments - takes post id as param
const delete_all_comments = async (req, res) => {
  try {
    // if (req.session.user === false) {
    //   return res.json('Not loggedi n');
    // }

    const deleteComments = await Post.findById(req.params.id);

    const deleteAll = await Comment.deleteMany({
      _id: { $in: deleteComments.comments },
    });
    return res.json('deleted');
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Like comment
const comment_like = async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  // Checks if the comment is already liked by the user
  if (comment.likedByUser.includes(req.session.user._id)) {
    return res.json('already liked');
  }
  Comment.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 }, $push: { likedByUser: req.session.user._id } },
    {},
    function (err, result) {
      if (err) return res.json({ message: err.message });
      return res.json('Liked!');
    }
  );
};

//Get number of likes a comment has
const get_likes_comment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    return res.json(comment.likes);
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Dislikes the comment
const comment_dislike = async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  // Checks if the comment is already liked by the user
  if (!comment.likedByUser.includes(req.session.user._id)) {
    return res.json({ message: 'Comment Not Liked' });
  }

  Comment.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: -1 }, $pull: { likedByUser: req.session.user._id } },
    {},
    function (err, result) {
      if (err) return res.json({ message: err.message });
      return res.json('Disliked!');
    }
  );
};

module.exports = {
  comment_create,
  comment_delete,
  comment_like,
  get_likes_comment,
  delete_all_comments,
  comment_dislike,
  //   delete_comment_post,
};
