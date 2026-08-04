import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/assignments`;

const assignmentService = {
  // Get all assignments for a course or lesson
  getAssignments: async (courseId, lessonId = null) => {
    const params = { courseId };
    if (lessonId) params.lessonId = lessonId;
    
    const response = await axios.get(API_URL, {
      params,
      withCredentials: true
    });
    return response.data;
  },

  // Get a single assignment
  getAssignment: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, {
      withCredentials: true
    });
    return response.data;
  },

  // Create a new assignment
  createAssignment: async (assignmentData) => {
    const response = await axios.post(API_URL, assignmentData, {
      withCredentials: true
    });
    return response.data;
  },

  // Update an assignment
  updateAssignment: async (id, assignmentData) => {
    const response = await axios.put(`${API_URL}/${id}`, assignmentData, {
      withCredentials: true
    });
    return response.data;
  },

  // Delete an assignment
  deleteAssignment: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true
    });
    return response.data;
  },

  // Submit an assignment
  submitAssignment: async (id, submissionData) => {
    const response = await axios.post(`${API_URL}/${id}/submit`, submissionData, {
      withCredentials: true
    });
    return response.data;
  },

  // Get user's submission for an assignment
  getMySubmission: async (id) => {
    const response = await axios.get(`${API_URL}/${id}/my-submission`, {
      withCredentials: true
    });
    return response.data;
  },

  // Get all submissions for an assignment (trainer/admin)
  getAssignmentSubmissions: async (id, params = {}) => {
    const response = await axios.get(`${API_URL}/${id}/submissions`, {
      params,
      withCredentials: true
    });
    return response.data;
  },

  // Grade a submission (trainer/admin)
  gradeSubmission: async (submissionId, gradeData) => {
    const response = await axios.put(`${API_URL}/submissions/${submissionId}/grade`, gradeData, {
      withCredentials: true
    });
    return response.data;
  },

  // Get assignment analytics (trainer/admin)
  getAssignmentAnalytics: async (id) => {
    const response = await axios.get(`${API_URL}/${id}/analytics`, {
      withCredentials: true
    });
    return response.data;
  }
};

export default assignmentService;
