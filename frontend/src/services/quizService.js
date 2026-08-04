import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/quizzes`;

// Fetch a published quiz by ID
export async function fetchQuiz(id) {
  const response = await axios.get(`${API_URL}/${id}`, {
    withCredentials: true
  });
  return response.data.data;
}

// Submit a quiz attempt
export async function submitQuiz(id, answers, courseId) {
  const body = { answers, courseId };
  const response = await axios.post(`${API_URL}/${id}/submit`, body, {
    withCredentials: true
  });
  return response.data.data;
}

// Get past attempts for this quiz
export async function getQuizAttempts(id) {
  const response = await axios.get(`${API_URL}/${id}/attempts`, {
    withCredentials: true
  });
  return response.data.data;
}
