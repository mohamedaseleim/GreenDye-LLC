const ChatService = require('../services/chatService');
const chatService = new ChatService();

exports.createSession = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id ? req.user.id : null;
    const { courseId } = req.body;
    const session = await chatService.createSession(userId, courseId);
    return res.status(201).json({ success: true, data: session });
  } catch (error) {
    return next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;
    const userId = req.user && req.user.id ? req.user.id : null;
    const message = await chatService.sendMessage(sessionId, userId, content);
    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    return next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const messages = await chatService.getMessages(sessionId, page, limit);
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    return next(error);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id ? req.user.id : null;
    const conversations = await chatService.getConversationsForUser(userId);
    return res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    return next(error);
  }
};
