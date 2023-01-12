const User = require('../models/user');
const Message = require('../models/message');
const Conversation = require('../models/conversation');

// Finds a conversation by checking if the session user is currently in a conversation with the users provided
const find_conversation = async (req, res) => {
  const users = Object.values(req.body);
  const usersID = [...users, req.session.user._id];
  try {
    const conversation = await Conversation.find({
      users: { $in: usersID },
    })
      .populate('users')
      .populate('messages');

    if (conversation) return res.json(conversation);
    else return res.json('Not found');
  } catch (err) {
    return res.json({ message: err.message });
  }
};

const create_new_conversation = (req, res) => {
  const users = Object.values(req.body);
  const usersID = [...users, req.session.user._id];
  try {
    const conversation = new Conversation({
      users: usersID.map((user) => user),
    });

    conversation.save();
    return res.json({ conv: conversation, msg: 'saved' });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

const send_message = async (req, res) => {
  const usersID = [req.params.id, req.session.user.id];
  try {
    const message = await new Message({
      senderId: req.session.user._id,
      receiverId: req.params.id,
      message: req.body.message,
    });

    const conversation = await Conversation.find({
      users: { $in: usersID },
    });

    message.save();

    find_conversation;
    return res.json({ conv: conversation, msg: 'saved' });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

module.exports = {
  find_conversation,
  create_new_conversation,
};
