const express = require('express');
const router = express.Router();

const comment_controller = require('../controllers/commentController');
const post_controller = require('../controllers/postController');
const user_controller = require('../controllers/userController');
const friendRequest_controller = require('../controllers/friendRequestController');

/// USER ROUTES ///
// Redirect the user to Facebook for authentication
router.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user back to this route after authentication
router.get(
  '/auth/facebook',
  passport.authenticate('facebook', {
    successRedirect: '/home',
    failureRedirect: '/login',
  })
);

router.post('/login', user_controller.log_in);
router.post('/sign_up', user_controller.sign_up);
router.post('/user/isLoggedIn', user_controller.is_logged_in);
router.post('/log_out', user_controller.log_out);
router.get('/user/getFriends', user_controller.get_friends);
router.post('/search_user', user_controller.search_user);
router.get('/home/user/:id', user_controller.get_user);

/// POST ROUTES ///
router.get('/post/get_all_posts', post_controller.all_posts);
router.get('/post/get_friends_posts', post_controller.friends_posts);
router.post('/post/create_new_post', post_controller.create_post);
router.post('/post/:id/edit_post', post_controller.edit_post);
router.get('/post/:id/get_likes', post_controller.get_likes_post);
router.post('/post/:id/like_post', post_controller.post_like);

/// COMMENT ROUTES ///
router.post('/comment/:id/create_comment', comment_controller.comment_create);
router.post('/comment/:id/like', comment_controller.comment_like);
router.post('/comment/:id/delete', comment_controller.comment_delete);
router.get('/comment/:id/get_likes', comment_controller.get_likes_comment);
router.post('/comment/:id/delete_all', comment_controller.delete_all_comments);
// router.post('/comment/:id/post_delete', comment_controller.delete_comment_post);

/// FRIEND REQUEST ROUTES ///
router.post('/friend_req/accept', friendRequest_controller.accept_friend);
router.post('/friend_req/reject', friendRequest_controller.reject_friend);
router.get(
  '/friend_request/show_recipient',
  friendRequest_controller.show_recipient_request
);
router.get(
  '/friend_request/show_sender',
  friendRequest_controller.show_sender_request
);
router.send('/friend_req/:id/send_req', friendRequest_controller.send_request);
