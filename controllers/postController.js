const Post = require('../models/post');
const { body, validationResult, cookie } = require('express-validator');
const User = require('../models/user');

// Get all posts
const all_posts = async (req, res, next) => {
  try {
    const posts_list = await Post.find().populate('comments').populate('user');
    return res.json(posts_list);
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Get post posted by friends
const friends_posts = async (req, res, next) => {
  try {
    const friend_list = await User.findById(req.session.user._id).populate(
      'friends'
    );
    const post_list = await Post.find({ user: { $in: friend_list.friends } })
      .populate('user')
      .populate('comments');

    return res.json(post_list);
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Get own posted posts
const get_own_posts = async (req, res, next) => {
  try {
    const post_list = await Post.find({ user: req.session.user._id }).populate(
      'comments'
    );

    return res.json(post_list);
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Creates a post
const create_post = [
  body('text', 'Text must not be empty').trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json(errors.array());
    } else {
      const post = new Post({
        text: req.body.text,
        createdAt: new Date(),
        user: req.session.user,
      });
      try {
        const savedPost = await post.save();
        return res.json('posted');
      } catch (err) {
        return res.json({ message: err.message });
      }
    }
  },
];

// Edit an excisitng post
const edit_post = [
  body('text', 'Text must not be empty').trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json(errors.array());
    } else {
      try {
        const updatePost = await Post.updateOne(
          { _id: req.params.id },
          {
            text: req.body.text,
            lastUpdated: new Date(),
            _id: req.params.id,
          }
        );
        return res.json('Updated');
      } catch (err) {
        return res.json({ message: err.message });
      }
    }
  },
];

//Get number of likes a post has
const get_likes_post = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.json(post.likes);
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Add a like to the post
const post_like = async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  // Checks if the post is already liked by the user
  if (post.likedByUser.includes(req.session.id)) {
    return res.json('already liked');
  }

  Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 }, $push: { likedByUser: req.session.id } },
    {},
    function (err, result) {
      if (err) return res.json({ message: err.message });
      return res.json('Liked!');
    }
  );
};

module.exports = {
  all_posts,
  friends_posts,
  create_post,
  edit_post,
  get_likes_post,
  post_like,
  get_own_posts,
};
