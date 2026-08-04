import React, { useState, useEffect } from 'react';
import { createChatSession, sendChatMessage, getChatMessages } from '../services/chatService';

const Chat = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        // Create a new chat session (replace 1 with actual userId if available)
        const session = await createChatSession(1);
        const id = session.sessionId || session.id || session._id;
        setSessionId(id);
        // Fetch initial messages
        const msgs = await getChatMessages(id);
        if (Array.isArray(msgs)) {
          setMessages(msgs);
        }
      } catch (err) {
        console.error('Error initializing chat session', err);
      }
    };
    init();
  }, []);

  const fetchMessages = async (id) => {
    try {
      const msgs = await getChatMessages(id);
      if (Array.isArray(msgs)) {
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Error fetching messages', err);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !sessionId) return;
    try {
      await sendChatMessage(sessionId, message);
      setMessage('');
      await fetchMessages(sessionId);
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Live Chat Support</h2>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '10px',
        }}
      >
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {msg.message || msg.text || ''}
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, marginRight: '10px', padding: '8px' }}
        />
        <button onClick={handleSend} style={{ padding: '8px 16px' }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
