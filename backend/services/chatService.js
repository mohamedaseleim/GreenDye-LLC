const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');

class ChatService {
  constructor() {
    // Initialize any providers or settings here if needed
  }

  /**
   * Create a new chat conversation for a user. Optionally ties it to a course.
   * @param {String} userId
   * @param {String} [courseId]
   */
  async createSession(userId, courseId) {
    const conversation = new ChatConversation({
      participants: [userId],
      status: 'open',
      meta: {
        courseId: courseId || undefined,
      },
    });
    await conversation.save();
    return conversation;
  }

  /**
   * Send a text message in an existing conversation
   * @param {String} sessionId
   * @param {String} userId
   * @param {String} content
   */
  async sendMessage(sessionId, userId, content) {
    const message = new ChatMessage({
      conversation: sessionId,
      sender: userId,
      senderType: 'user',
      type: 'text',
      text: content,
    });
    await message.save();
    await ChatConversation.findByIdAndUpdate(sessionId, { lastMessageAt: new Date() });
    return message;
  }

  /**
   * Retrieve messages for a conversation with optional pagination
   * @param {String} sessionId
   * @param {Number} [page=1]
   * @param {Number} [limit=50]
   */
  async getMessages(sessionId, page = 1, limit = 50) {
    return ChatMessage.find({ conversation: sessionId })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  /**
   * Get all conversations for a user
   * @param {String} userId
   */
  async getConversationsForUser(userId) {
    return ChatConversation.find({ participants: userId }).sort({ lastMessageAt: -1 });
  }
}

module.exports = ChatService;
