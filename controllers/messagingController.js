const User = require('../models/user');
const Message = require('../models/message');
const Conversation = require('../models/conversation');

// Finds a conversation by checking for logged in user and provided user. Supports conversations with multiple users
const find_conversation = async (req, res) => {
  const users = Object.values(req.body);
  const usersID = [...users, req.params.id];
  try {
    const conversation = await Conversation.find({
      users: { $all: usersID },
    })
      .populate('users')
      .populate('messages');

    if (conversation) return res.json(conversation);
    else return res.json('Not found');
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Creates a new conversation
const create_new_conversation = (req, res) => {
  const users = Object.values(req.body);
  const usersID = [...users, req.params.id];
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

// Sends a message, creates a conversation if it doesn't already exist
const send_message = async (req, res) => {
  const usersID = [req.params.id, req.body.curUserId];
  try {
    const message = new Message({
      senderId: req.body.curUserId,
      receiverId: req.params.id,
      message: req.body.message,
    });

    message.save();

    // Checks if both users are present in the users array of a conversation.
    let conversation = await Conversation.findOne({
      users: { $all: usersID },
      $expr: {
        //Checks if the size is the same of both arrays.
        $eq: [
          { $size: { $setIntersection: ['$users', usersID] } },
          usersID.length,
        ],
      },
    });

    if (!conversation) {
      conversation = new Conversation({ users: usersID, messages: message });
      conversation.save();
    }

    return res.json({ conv: conversation, message: message, msg: 'sent' });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Gets all conversations for a user
const get_all_conversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      users: { $elemMatch: { $eq: req.params.id } },
    })
      .populate('users')
      .populate('messages');

    return res.json({ conversations: conversations, message: 'done' });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Gets a single conversation
const get_conversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('users')
      .populate('messages');

    return res.json({ conversation: conversation, message: 'done' });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Search for a conversation with a user
const search_user_conversation = async (req, res) => {
  try {
    const find_user = await User.find({
      name: new RegExp(`^${req.body.search_user}`, 'i'),
    });

    const conversation_list = [];

    for (const user of find_user) {
      const usersID = [user._id, req.params.id];

      const conversation = await Conversation.find({
        users: { $all: usersID },
      })
        .populate('users')
        .populate('messages');

      if (conversation.length !== 0) conversation_list.push(conversation);
    }

    if (conversation_list.length === 0)
      return res.json({ msg: 'no conversation' });

    return res.json({ result: conversation_list, msg: 'done' });
  } catch (err) {
    return res.json({ message: err.message });
  }
};

// Search for messages in a conversation
const search_message_in_conversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate(
      'messages'
    );

    if (!conversation) return res.json({ msg: 'no conversation' });

    const messages = conversation.messages;

    const searchResults = messages.filter((message) =>
      message.message.match(new RegExp(req.body.search_message, 'i'))
    );

    return res.json({ result: searchResults, msg: 'done' });
  } catch (err) {
    return res.json({ msg: err.message });
  }
};

// Search for messages in all of the conversations of a user
const search_message_in_all_users_conversation = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      users: { $in: req.params.id },
    }).populate('messages');

    if (!conversations) return res.json({ msg: 'no conversation' });
    let searchResults = [];

    for (const conversation of conversations) {
      const messages = await Message.find({
        _id: { $in: conversation.messages },
        message: { $regex: new RegExp(req.body.search_message, 'i') },
      });
      searchResults = [...searchResults, ...messages];
    }
    return res.json({ result: searchResults, msg: 'done' });
  } catch (err) {
    return res.json({ msg: err.message });
  }
};

// Mark a message as read on open
const mark_messages_as_read = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.json({ message: 'Conversation not found' });
    }

    const messages = await Message.updateMany(
      {
        _id: { $in: conversation.messages },
        receiverId: req.params.userId,
        read: false,
      },
      { $set: { read: true } }
    );

    return res.json({ messages });
  } catch (err) {
    return res.json({ msg: err.message });
  }
};

// Count the number of unread messages in a conversation
const count_messages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({
      _id: { $in: conversation.messages },
      receiverId: req.params.userId,
      read: false,
    });

    const lenMessages = messages.length;

    return res.json({ lenMessages });
  } catch (err) {
    return res.json({ msg: err.message });
  }
};

// Counts the total number of unread messages from a user
const count_all_unread_messages = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      users: { $in: req.params.id },
    }).populate('messages');

    let unreadMessageCount = 0;
    conversations.forEach((conversation) => {
      conversation.messages.forEach((message) => {
        if (message.read === false) {
          unreadMessageCount++;
        }
      });
    });

    return res.json(unreadMessageCount);
  } catch (err) {
    return res.json({ msg: err.message });
  }
};

module.exports = {
  find_conversation,
  create_new_conversation,
  send_message,
  get_all_conversations,
  get_conversation,
  search_message_in_conversation,
  search_message_in_all_users_conversation,
  search_user_conversation,
  mark_messages_as_read,
  count_messages,
  count_all_unread_messages,
};
