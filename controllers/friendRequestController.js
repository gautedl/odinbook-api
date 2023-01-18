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
    await User.updateOne(
      { _id: req.session.user._id },
      { $push: { friends: friendRequest.sender } }
    );

    //Updates friend list of sender
    await User.updateOne(
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

    if (friendRequest.status === 'rejected') {
      await friendRequest.delete();
    }

    return res.json('rejected');
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Shows the request as a recipient
const show_recipient_request = async (req, res) => {
  try {
    const friendRequests = await FriendRequest.find({
      recipient: req.session.user._id,
    })
      .populate('sender')
      .populate('recipient');

    return res.json(friendRequests);
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// shows outgoing requests
const show_sender_request = async (req, res) => {
  try {
    const friendRequests = await FriendRequest.find({
      sender: req.session.user._id,
    });

    return res.json(friendRequests);
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Send friend request
const send_request = async (req, res) => {
  try {
    const friendRequest = new FriendRequest({
      sender: req.session.user._id,
      // sender: req.body.user,
      recipient: req.params.id,
    });

    friendRequest.save();

    return res.json('sent');
  } catch (err) {
    return res.json({ message: err.message });
  }
};

const find_request = async (req, res) => {
  try {
    const friendRequest_send = await FriendRequest.findOne({
      sender: req.session.user._id,
      recipient: req.params.id,
    });
    const friendRequest_received = await FriendRequest.findOne({
      sender: req.params.id,
      recipient: req.session.user._id,
    });
    console.log(friendRequest_send);
    console.log(friendRequest_received);

    if (friendRequest_received === null && friendRequest_send === null) {
      return res.json('Not sent');
    }

    if (friendRequest_received === null) {
      if (friendRequest_send.status === 'accepted') {
        return res.json('Friends');
      }

      if (friendRequest_send === 'pending') {
        return res.json('Request sent');
      }

      return res.json('Request sent');
    } else if (friendRequest_send === null) {
      if (friendRequest_received.status === 'accepted') {
        return res.json('Friends');
      }

      if (friendRequest_received === 'pending') {
        return res.json('Request received');
      }

      return res.json('Request received');
    }
  } catch (err) {
    return res.json({ message: err.message });
  }
};

module.exports = {
  accept_friend,
  reject_friend,
  show_recipient_request,
  show_sender_request,
  send_request,
  find_request,
};
