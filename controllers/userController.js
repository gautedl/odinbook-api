const { application } = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv').config();
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: 'uploads/' });

const upload_photo = 12;

// creates a user
const sign_up = [
  body('email', 'Must be a valid email')
    .trim()
    .isLength({ min: 1 })
    .isEmail()
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 char long')
    .if(body('confirmPassword').exists())
    .notEmpty()
    .custom((value, { req }) => value === req.body.confirmPassword)
    .withMessage('Passwords do not match')
    .escape(),
  body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    const existEmail = await User.findOne({ email: req.body.email });
    if (existEmail) {
      return res.json('Email is taken');
    }

    if (!errors.isEmpty()) {
      return res.json(errors.array());
    }

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        createdAt: new Date(),
      }).save((err) => {
        if (err) {
          return next(err);
        }
        return res.json('Success');
      });
    });
  },
];

// Accepts POST requests to the /login endpoint
const log_in = async function (req, res, next) {
  // Authenticate the user using passport
  passport.authenticate('login', async function (err, user) {
    try {
      if (err || !user) {
        // If there is an error or the user is not found, return an error
        return res.status(401).json({
          message: 'Authentication failed',
          error: err,
        });
      }
      // If the user is found, generate a JWT token for the user and return it in the response
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { _id: user._id, email: user.email };

        const token = jwt.sign(
          {
            user: body,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1d',
          }
        );

        req.session.user = user;
        return res.json({ token, user });
      });
    } catch (err) {
      return next(err);
    }
  })(req, res, next);
};

// Checks if user is logged in to the server
const is_logged_in = (req, res) => {
  if (req.session.user) {
    return res.json('Logged in');
  } else {
    return res.json('Not logged in');
  }
};

// Logs out the user
const log_out = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    return res.json('logged out');
  });
};

// Get the friends of a user
const get_friends = async (req, res, next) => {
  try {
    const friend_list = await User.findById(req.session.user._id).populate(
      'friends'
    );
    return res.json(friend_list.friends);
  } catch (err) {
    return res.json({ message: err.message });
  }
};

const search_user = async (req, res, next) => {
  try {
    const find_user = await User.find({
      name: new RegExp(`^${req.body.search_name}`, 'i'),
    });
    return res.json(find_user);
  } catch (err) {
    return res.json({ message: err.message });
  }
};

const get_user = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    return res.json(user);
  } catch (err) {
    return res.json({ message: err.message });
  }
};

module.exports = {
  sign_up,
  log_in,
  log_out,
  is_logged_in,
  get_friends,
  search_user,
  get_user,
  upload_photo,
  // profile_picture,
};
