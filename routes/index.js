const express = require('express');
const router = express.Router();
const passport = require('passport');

const comment_controller = require('../controllers/commentController');
const post_controller = require('../controllers/postController');
const user_controller = require('../controllers/userController');
const friendRequest_controller = require('../controllers/friendRequestController');
const conversation_controller = require('../controllers/messagingController');

const User = require('../models/user');

/// USER ROUTES ///
// Redirect the user to Facebook for authentication
router.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

// Facebook will redirect the user back to this route after authentication
router.get(
  'auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login',
    failureMessage: true,
    successRedirect: '/home',
  }),
  function (req, res) {
    return res.json('fb');
  }
);

router.post('/login', user_controller.log_in);
router.post('/sign_up', user_controller.sign_up);
router.get('/user/isLoggedIn', user_controller.is_logged_in);
router.get('/log_out', user_controller.log_out);
router.get('/user/getFriends', user_controller.get_friends);
router.post('/search_user', user_controller.search_user);
router.get('/home/user/:id', user_controller.get_user);
router.get('/user/get_current_user', user_controller.get_current_user);

const fs = require('fs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

// const upload = multer({ dest: 'uploads/' });

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: Storage,
});

router.post(
  '/user/upload_profile_picture',
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      console.log(req.file);
      const user = await User.updateOne(
        { _id: req.session.user._id },
        {
          profilePicture: {
            data: fs.readFileSync('uploads/' + req.file.filename),
            contentType: req.file.mimetype,
          },
        }
      );

      console.log(user);

      return res.json('Updated');
    } catch (err) {
      console.log(err);
    }
  }
);

/// POST ROUTES ///
router.get('/post/get_all_posts', post_controller.all_posts);
router.get('/post/get_friends_posts', post_controller.friends_posts);
router.get('/post/get_own_posts', post_controller.get_own_posts);
router.post('/post/create_new_post', post_controller.create_post);
router.get(
  '/post/get_display_posts',
  post_controller.get_friends_and_own_posts
);
router.post('/post/:id/edit_post', post_controller.edit_post);
router.get('/post/:id/get_likes', post_controller.get_likes_post);
router.post('/post/:id/like_post', post_controller.post_like);
router.post('/post/:id/dislike_post', post_controller.post_dislike);
router.get('/post/get_user_post/:id', post_controller.get_user_posts);

/// COMMENT ROUTES ///
router.post('/comment/:id/create_comment', comment_controller.comment_create);
router.post('/comment/:id/like', comment_controller.comment_like);
router.post('/comment/:id/dislike', comment_controller.comment_dislike);
router.post('/comment/:id/delete', comment_controller.comment_delete);
router.get('/comment/:id/get_likes', comment_controller.get_likes_comment);
router.post('/comment/:id/delete_all', comment_controller.delete_all_comments);
// router.post('/comment/:id/post_delete', comment_controller.delete_comment_post);

/// FRIEND REQUEST ROUTES ///
router.post('/friend_req/accept/:id', friendRequest_controller.accept_friend);
router.post('/friend_req/reject/:id', friendRequest_controller.reject_friend);
router.get(
  '/friend_request/show_recipient',
  friendRequest_controller.show_recipient_request
);

router.get(
  '/friend_request/show_sender',
  friendRequest_controller.show_sender_request
);

router.post('/friend_req/:id/send_req', friendRequest_controller.send_request);
router.get('/friend_request/:id/find', friendRequest_controller.find_request);

/// CONVERSATION ROUTES ///
router.post('/conversation/find', conversation_controller.find_conversation);
router.post(
  '/conversation/create_new_conversation',
  conversation_controller.create_new_conversation
);

module.exports = router;
