const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/chat`;

export async function createChatSession(userId) {
  const response = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  });
  return response.json();
}

export async function sendChatMessage(sessionId, message) {
  const response = await fetch(`${API_URL}/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });
  return response.json();
}

export async function getChatMessages(sessionId) {
  const response = await fetch(`${API_URL}/${sessionId}/messages`);
  return response.json();
}
