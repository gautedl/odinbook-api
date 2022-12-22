const User = require('../models/user');
const FriendRequest = require('../models/friendRequest');

// Accept a friend request
const accept_friend = async (req, res) => {
  try {
    // Find the friend request
    const friendRequest = await FriendRequest.findById(req.params.id);

    // Make sure the friend request exists and is pending
    if (!friendRequest || friendRequest.status !== 'pending') {
      return res.json({ message: 'Invalid' });
    }

    // Make sure the authenticated user is the recipient of the request
    if (
      friendRequest.recipient.toString() !== req.session.user._id.toString()
    ) {
      return res.json({ message: 'Unauthorized' });
    }

    // Update the status of the friend request to 'accepted'
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Updates friend list of recipient
    User.updateOne(
      { _id: req.session.user._id },
      { $push: { friends: friendRequest.sender } }
    );

    //Updates friend list of sender
    User.updateOne(
      { _id: friendRequest.sender },
      { $push: { friends: friendRequest.recipient } }
    );

    return res.json('accepted');
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Reject request
const reject_friend = async (req, res) => {
  try {
    // Find the friend request
    const friendRequest = await FriendRequest.findById(req.params.id);

    // Make sure the friend request exists and is pending
    if (!friendRequest || friendRequest.status !== 'pending') {
      return res.json({ message: 'Invalid' });
    }

    // Make sure the authenticated user is the recipient of the request
    if (
      friendRequest.recipient.toString() !== req.session.user._id.toString()
    ) {
      return res.json({ message: 'Unauthorized' });
    }

    // Update the status of the friend request to 'accepted'
    friendRequest.status = 'rejected';
    await friendRequest.save();

    return res.json('rejected');
  } catch (err) {
    return res.json({ message: err.message });
  }
};

module.exports = {
  accept_friend,
  reject_friend,
};
