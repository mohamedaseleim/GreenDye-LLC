import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ========== DASHBOARD ==========
const getDashboardStats = async () => {
  const response = await axios.get(`${API_URL}/cms/stats`, getAuthHeader());
  return response.data;
};

// ========== CERTIFICATE MANAGEMENT ==========
const getAllCertificates = async (params = {}) => {
  const response = await axios.get(`${API_URL}/certificates`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const createCertificate = async (data) => {
  const response = await axios.post(`${API_URL}/certificates`, data, getAuthHeader());
  return response.data;
};

const updateCertificate = async (id, data) => {
  const response = await axios.put(`${API_URL}/certificates/${id}`, data, getAuthHeader());
  return response.data;
};

const deleteCertificate = async (id) => {
  const response = await axios.delete(`${API_URL}/certificates/${id}`, getAuthHeader());
  return response.data;
};

const regenerateCertificate = async (id) => {
  const response = await axios.post(`${API_URL}/certificates/${id}/regenerate`, {}, getAuthHeader());
  return response.data;
};

const bulkUploadCertificates = async (certificates) => {
  const response = await axios.post(`${API_URL}/certificates/bulk`, certificates, getAuthHeader());
  return response.data;
};

const revokeCertificate = async (id, reason) => {
  const response = await axios.put(`${API_URL}/certificates/${id}/revoke`, { reason }, getAuthHeader());
  return response.data;
};

const restoreCertificate = async (id) => {
  const response = await axios.put(`${API_URL}/certificates/${id}/restore`, {}, getAuthHeader());
  return response.data;
};

const getCertificateHistory = async (id) => {
  const response = await axios.get(`${API_URL}/certificates/${id}/history`, getAuthHeader());
  return response.data;
};

const exportCertificates = async (params = {}) => {
  const response = await axios.get(`${API_URL}/certificates/export`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

// ========== PAGE MANAGEMENT ==========
const getAllPages = async (params = {}) => {
  const response = await axios.get(`${API_URL}/cms/pages`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const getPage = async (id) => {
  const response = await axios.get(`${API_URL}/cms/pages/${id}`, getAuthHeader());
  return response.data;
};

const createPage = async (data) => {
  const response = await axios.post(`${API_URL}/cms/pages`, data, getAuthHeader());
  return response.data;
};

const updatePage = async (id, data) => {
  const response = await axios.put(`${API_URL}/cms/pages/${id}`, data, getAuthHeader());
  return response.data;
};

const deletePage = async (id) => {
  const response = await axios.delete(`${API_URL}/cms/pages/${id}`, getAuthHeader());
  return response.data;
};

const publishPage = async (id) => {
  const response = await axios.put(`${API_URL}/cms/pages/${id}/publish`, {}, getAuthHeader());
  return response.data;
};

// ========== MEDIA MANAGEMENT ==========
const getAllMedia = async (params = {}) => {
  const response = await axios.get(`${API_URL}/cms/media`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const getMedia = async (id) => {
  const response = await axios.get(`${API_URL}/cms/media/${id}`, getAuthHeader());
  return response.data;
};

const uploadMedia = async (formData, config = {}) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/cms/media/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  });
  return response.data;
};

const updateMedia = async (id, data) => {
  const response = await axios.put(`${API_URL}/cms/media/${id}`, data, getAuthHeader());
  return response.data;
};

const deleteMedia = async (id) => {
  const response = await axios.delete(`${API_URL}/cms/media/${id}`, getAuthHeader());
  return response.data;
};

// ========== ANNOUNCEMENT MANAGEMENT ==========
const getAllAnnouncements = async (params = {}) => {
  const response = await axios.get(`${API_URL}/cms/announcements`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const createAnnouncement = async (data) => {
  const response = await axios.post(`${API_URL}/cms/announcements`, data, getAuthHeader());
  return response.data;
};

const updateAnnouncement = async (id, data) => {
  const response = await axios.put(`${API_URL}/cms/announcements/${id}`, data, getAuthHeader());
  return response.data;
};

const deleteAnnouncement = async (id) => {
  const response = await axios.delete(`${API_URL}/cms/announcements/${id}`, getAuthHeader());
  return response.data;
};

// ========== COURSE MANAGEMENT ==========
const getAdminCourses = async (params = {}) => {
  const response = await axios.get(`${API_URL}/courses`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const getAdminCourse = async (id) => {
  const response = await axios.get(`${API_URL}/courses/${id}`, getAuthHeader());
  return response.data;
};

const createAdminCourse = async (data) => {
  const response = await axios.post(`${API_URL}/courses`, data, getAuthHeader());
  return response.data;
};

const updateAdminCourse = async (id, data) => {
  const response = await axios.put(`${API_URL}/courses/${id}`, data, getAuthHeader());
  return response.data;
};

const deleteAdminCourse = async (id) => {
  const response = await axios.delete(`${API_URL}/courses/${id}`, getAuthHeader());
  return response.data;
};

const getPendingCourses = async (params = {}) => {
  const response = await axios.get(`${API_URL}/courses/pending`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const approveCourse = async (id) => {
  const response = await axios.put(`${API_URL}/courses/${id}/approve`, {}, getAuthHeader());
  return response.data;
};

const rejectCourse = async (id) => {
  const response = await axios.put(`${API_URL}/courses/${id}/reject`, {}, getAuthHeader());
  return response.data;
};

const setCoursePricing = async (id, pricingData) => {
  const response = await axios.put(`${API_URL}/courses/${id}/pricing`, pricingData, getAuthHeader());
  return response.data;
};

const getCourseAnalytics = async (id) => {
  const response = await axios.get(`${API_URL}/courses/${id}/analytics`, getAuthHeader());
  return response.data;
};

const getCourseCategories = async () => {
  const response = await axios.get(`${API_URL}/courses/categories`, getAuthHeader());
  return response.data;
};

const updateCourseCategory = async (id, category) => {
  const response = await axios.put(`${API_URL}/courses/${id}/category`, { category }, getAuthHeader());
  return response.data;
};

const getCourseTags = async () => {
  const response = await axios.get(`${API_URL}/courses/tags`, getAuthHeader());
  return response.data;
};

const updateCourseTags = async (id, tags) => {
  const response = await axios.put(`${API_URL}/courses/${id}/tags`, { tags }, getAuthHeader());
  return response.data;
};

const bulkUpdateCourses = async (courseIds, updates) => {
  const response = await axios.put(`${API_URL}/courses/bulk-update`, { courseIds, updates }, getAuthHeader());
  return response.data;
};

const getCourseStatistics = async () => {
  const response = await axios.get(`${API_URL}/courses/statistics`, getAuthHeader());
  return response.data;
};

// ========== MODERATION ==========
const getPendingForumPosts = async (params = {}) => {
  const response = await axios.get(`${API_URL}/cms/moderation/forums`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const moderateForumPost = async (id, status, reason = '') => {
  const response = await axios.put(`${API_URL}/cms/moderation/forums/${id}`, { status, reason }, getAuthHeader());
  return response.data;
};

// ========== TRAINER MANAGEMENT ==========
const getAllTrainers = async (params = {}) => {
  const response = await axios.get(`${API_URL}/trainers`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const getTrainerById = async (id) => {
  const response = await axios.get(`${API_URL}/trainers/${id}`, getAuthHeader());
  return response.data;
};

const createTrainer = async (data) => {
  const response = await axios.post(`${API_URL}/trainers`, data, getAuthHeader());
  return response.data;
};

const updateTrainer = async (id, data) => {
  const response = await axios.put(`${API_URL}/trainers/${id}`, data, getAuthHeader());
  return response.data;
};

const deleteTrainer = async (id) => {
  const response = await axios.delete(`${API_URL}/trainers/${id}`, getAuthHeader());
  return response.data;
};

const approveTrainer = async (id, notes = '') => {
  const response = await axios.put(`${API_URL}/trainers/${id}/approve`, { notes }, getAuthHeader());
  return response.data;
};

const rejectTrainer = async (id, notes = '') => {
  const response = await axios.put(`${API_URL}/trainers/${id}/reject`, { notes }, getAuthHeader());
  return response.data;
};

const getPendingApplications = async (params = {}) => {
  const response = await axios.get(`${API_URL}/trainers/applications/pending`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const updateVerificationStatus = async (id, isVerified, notes = '') => {
  const response = await axios.put(`${API_URL}/trainers/${id}/verification`, { isVerified, notes }, getAuthHeader());
  return response.data;
};

const getTrainerMetrics = async (id) => {
  const response = await axios.get(`${API_URL}/trainers/${id}/metrics`, getAuthHeader());
  return response.data;
};

const getTrainerPayouts = async (id, params = {}) => {
  const response = await axios.get(`${API_URL}/trainers/${id}/payouts`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const createPayout = async (id, data) => {
  const response = await axios.post(`${API_URL}/trainers/${id}/payouts`, data, getAuthHeader());
  return response.data;
};

const getAllPayouts = async (params = {}) => {
  const response = await axios.get(`${API_URL}/trainers/payouts`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const updatePayoutStatus = async (payoutId, data) => {
  const response = await axios.put(`${API_URL}/trainers/payouts/${payoutId}`, data, getAuthHeader());
  return response.data;
};

// ========== COURSE MANAGEMENT (for enrollment) ==========
const getAllCoursesForEnrollment = async () => {
  const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/courses`, getAuthHeader());
  return response.data;
};

// ========== USER MANAGEMENT ==========
const USER_API_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users`;

const getAllUsersForEnrollment = async () => {
  const response = await axios.get(USER_API_URL, getAuthHeader());
  return response.data;
};

const getUsers = async (params = {}) => {
  const response = await axios.get(USER_API_URL, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const getUser = async (id) => {
  const response = await axios.get(`${USER_API_URL}/${id}`, getAuthHeader());
  return response.data;
};

const createUser = async (data) => {
  const response = await axios.post(USER_API_URL, data, getAuthHeader());
  return response.data;
};

const updateUser = async (id, data) => {
  const response = await axios.put(`${USER_API_URL}/${id}`, data, getAuthHeader());
  return response.data;
};

const deleteUser = async (id) => {
  const response = await axios.delete(`${USER_API_URL}/${id}`, getAuthHeader());
  return response.data;
};

const suspendUser = async (id, reason = '') => {
  const response = await axios.put(`${USER_API_URL}/${id}/suspend`, { reason }, getAuthHeader());
  return response.data;
};

const activateUser = async (id) => {
  const response = await axios.put(`${USER_API_URL}/${id}/activate`, {}, getAuthHeader());
  return response.data;
};

const getUserActivity = async (id, params = {}) => {
  const response = await axios.get(`${USER_API_URL}/${id}/activity`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const resetUserPassword = async (id, newPassword) => {
  const response = await axios.post(`${USER_API_URL}/${id}/reset-password`, { newPassword }, getAuthHeader());
  return response.data;
};

const bulkUpdateUsers = async (userIds, updates) => {
  const response = await axios.post(`${USER_API_URL}/bulk-update`, { userIds, updates }, getAuthHeader());
  return response.data;
};

const bulkDeleteUsers = async (userIds) => {
  const response = await axios.post(`${USER_API_URL}/bulk-delete`, { userIds }, getAuthHeader());
  return response.data;
};

// ========== ENROLLMENT MANAGEMENT ==========
const getAllEnrollments = async (params = {}) => {
  const response = await axios.get(`${API_URL}/enrollments`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const getEnrollmentDetails = async (id) => {
  const response = await axios.get(`${API_URL}/enrollments/${id}`, getAuthHeader());
  return response.data;
};

const getEnrollmentAnalytics = async (params = {}) => {
  const response = await axios.get(`${API_URL}/enrollments/analytics`, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const manualEnrollment = async (data) => {
  const response = await axios.post(`${API_URL}/enrollments`, data, getAuthHeader());
  return response.data;
};

const manualUnenrollment = async (id, reason = '') => {
  const response = await axios.delete(`${API_URL}/enrollments/${id}`, {
    ...getAuthHeader(),
    data: { reason },
  });
  return response.data;
};

const updateEnrollmentStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/enrollments/${id}/status`, { status }, getAuthHeader());
  return response.data;
};

// ========== REFUND MANAGEMENT ==========
const REFUND_API_URL = '/api/refunds';

const getRefundRequests = async (params = {}) => {
  const response = await axios.get(REFUND_API_URL, {
    ...getAuthHeader(),
    params,
  });
  return response.data;
};

const approveRefund = async (id) => {
  const response = await axios.put(`${REFUND_API_URL}/${id}/approve`, {}, getAuthHeader());
  return response.data;
};

const rejectRefund = async (id, responseMessage) => {
  const response = await axios.put(`${REFUND_API_URL}/${id}/reject`, { responseMessage }, getAuthHeader());
  return response.data;
};

const adminService = {
  // Dashboard
  getDashboardStats,
  
  // Certificates
  getAllCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  regenerateCertificate,
  bulkUploadCertificates,
  revokeCertificate,
  restoreCertificate,
  getCertificateHistory,
  exportCertificates,
  
  // Pages
  getAllPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
  publishPage,
  
  // Media
  getAllMedia,
  getMedia,
  uploadMedia,
  updateMedia,
  deleteMedia,
  
  // Announcements
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  
  // Courses
  getAdminCourses,
  getAdminCourse,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  setCoursePricing,
  getCourseAnalytics,
  getCourseCategories,
  updateCourseCategory,
  getCourseTags,
  updateCourseTags,
  bulkUpdateCourses,
  getCourseStatistics,
  
  // Moderation
  getPendingForumPosts,
  moderateForumPost,
  
  // Trainers
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  approveTrainer,
  rejectTrainer,
  getPendingApplications,
  updateVerificationStatus,
  getTrainerMetrics,
  getTrainerPayouts,
  createPayout,
  getAllPayouts,
  updatePayoutStatus,

  // User Management
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  getUserActivity,
  resetUserPassword,
  bulkUpdateUsers,
  bulkDeleteUsers,
  
  // Enrollment Management
  getAllEnrollments,
  getEnrollmentDetails,
  getEnrollmentAnalytics,
  manualEnrollment,
  manualUnenrollment,
  updateEnrollmentStatus,
  getAllUsersForEnrollment,
  getAllCoursesForEnrollment,
  
  // Refund Management
  getRefundRequests,
  approveRefund,
  rejectRefund,
  
  // System Settings
  getSettings: async () => {
    const response = await axios.get(`${API_URL}/settings`, getAuthHeader());
    return response.data;
  },
  
  updateGeneralSettings: async (data) => {
    const response = await axios.put(`${API_URL}/settings/general`, data, getAuthHeader());
    return response.data;
  },
  
  updateEmailTemplates: async (data) => {
    const response = await axios.put(`${API_URL}/settings/email-templates`, data, getAuthHeader());
    return response.data;
  },
  
  updateNotificationSettings: async (data) => {
    const response = await axios.put(`${API_URL}/settings/notifications`, data, getAuthHeader());
    return response.data;
  },
  
  updateLocalizationSettings: async (data) => {
    const response = await axios.put(`${API_URL}/settings/localization`, data, getAuthHeader());
    return response.data;
  },
  
  getApiKeys: async () => {
    const response = await axios.get(`${API_URL}/settings/api-keys`, getAuthHeader());
    return response.data;
  },
  
  createApiKey: async (data) => {
    const response = await axios.post(`${API_URL}/settings/api-keys`, data, getAuthHeader());
    return response.data;
  },
  
  updateApiKey: async (keyId, data) => {
    const response = await axios.put(`${API_URL}/settings/api-keys/${keyId}`, data, getAuthHeader());
    return response.data;
  },
  
  deleteApiKey: async (keyId) => {
    const response = await axios.delete(`${API_URL}/settings/api-keys/${keyId}`, getAuthHeader());
    return response.data;
  },
  
  regenerateApiKey: async (keyId) => {
    const response = await axios.post(`${API_URL}/settings/api-keys/${keyId}/regenerate`, {}, getAuthHeader());
    return response.data;
  },
  
  testEmailTemplate: async (templateType, testEmail) => {
    const response = await axios.post(`${API_URL}/settings/email-templates/test`, { templateType, testEmail }, getAuthHeader());
    return response.data;
  },

  // ========== LESSON MANAGEMENT ==========
  getLessons: async (courseId) => {
    const response = await axios.get('/api/lessons', {
      ...getAuthHeader(),
      params: { courseId },
    });
    return response.data;
  },

  getLesson: async (id) => {
    const response = await axios.get(`/api/lessons/${id}`, getAuthHeader());
    return response.data;
  },

  createLesson: async (data) => {
    const response = await axios.post('/api/lessons', data, getAuthHeader());
    return response.data;
  },

  updateLesson: async (id, data) => {
    const response = await axios.put(`/api/lessons/${id}`, data, getAuthHeader());
    return response.data;
  },

  deleteLesson: async (id) => {
    const response = await axios.delete(`/api/lessons/${id}`, getAuthHeader());
    return response.data;
  },

  reorderLessons: async (orderedIds) => {
    const response = await axios.put('/api/lessons/reorder', { orderedIds }, getAuthHeader());
    return response.data;
  },

  // ========== QUIZ MANAGEMENT ==========
  getQuizzes: async (courseId, lessonId = null) => {
    const params = { courseId };
    if (lessonId) params.lessonId = lessonId;
    const response = await axios.get('/api/quizzes', {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  },

  getQuiz: async (id) => {
    const response = await axios.get(`/api/quizzes/${id}`, getAuthHeader());
    return response.data;
  },

  createQuiz: async (data) => {
    const response = await axios.post('/api/quizzes', data, getAuthHeader());
    return response.data;
  },

  updateQuiz: async (id, data) => {
    const response = await axios.put(`/api/quizzes/${id}`, data, getAuthHeader());
    return response.data;
  },

  deleteQuiz: async (id) => {
    const response = await axios.delete(`/api/quizzes/${id}`, getAuthHeader());
    return response.data;
  },

  getQuizAnalytics: async (id) => {
    const response = await axios.get(`/api/quizzes/${id}/analytics`, getAuthHeader());
    return response.data;
  },

  // ========== ASSIGNMENT MANAGEMENT ==========
  getAssignments: async (courseId, lessonId = null) => {
    const params = { courseId };
    if (lessonId) params.lessonId = lessonId;
    const response = await axios.get('/api/assignments', {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  },

  getAssignment: async (id) => {
    const response = await axios.get(`/api/assignments/${id}`, getAuthHeader());
    return response.data;
  },

  createAssignment: async (data) => {
    const response = await axios.post('/api/assignments', data, getAuthHeader());
    return response.data;
  },

  updateAssignment: async (id, data) => {
    const response = await axios.put(`/api/assignments/${id}`, data, getAuthHeader());
    return response.data;
  },

  deleteAssignment: async (id) => {
    const response = await axios.delete(`/api/assignments/${id}`, getAuthHeader());
    return response.data;
  },

  getAssignmentAnalytics: async (id) => {
    const response = await axios.get(`/api/assignments/${id}/analytics`, getAuthHeader());
    return response.data;
  },

  // ========== REVIEW MANAGEMENT ==========
  getAllReviews: async (params = {}) => {
    const response = await axios.get(`${API_URL}/reviews`, {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  },

  getReviewDetails: async (id) => {
    const response = await axios.get(`${API_URL}/reviews/${id}`, getAuthHeader());
    return response.data;
  },

  approveReview: async (id, reason) => {
    const response = await axios.put(`${API_URL}/reviews/${id}/approve`, { reason }, getAuthHeader());
    return response.data;
  },

  rejectReview: async (id, reason) => {
    const response = await axios.put(`${API_URL}/reviews/${id}/reject`, { reason }, getAuthHeader());
    return response.data;
  },

  flagReview: async (id, reason, description) => {
    const response = await axios.put(`${API_URL}/reviews/${id}/flag`, { reason, description }, getAuthHeader());
    return response.data;
  },

  removeReview: async (id, reason) => {
    const response = await axios.delete(`${API_URL}/reviews/${id}`, {
      ...getAuthHeader(),
      data: { reason }
    });
    return response.data;
  },

  respondToReview: async (id, response) => {
    const res = await axios.put(`${API_URL}/reviews/${id}/respond`, { response }, getAuthHeader());
    return res.data;
  },

  getReviewStats: async (courseId = null) => {
    const params = courseId ? { courseId } : {};
    const response = await axios.get(`${API_URL}/reviews/analytics/stats`, {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  },

  // ========== EMAIL MARKETING ==========
  getEmailMarketingStats: async () => {
    const response = await axios.get(`${API_URL}/email-marketing/stats`, getAuthHeader());
    return response.data;
  },

  // Campaigns
  getAllCampaigns: async (params = {}) => {
    const response = await axios.get(`${API_URL}/email-marketing/campaigns`, {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  },

  getCampaign: async (id) => {
    const response = await axios.get(`${API_URL}/email-marketing/campaigns/${id}`, getAuthHeader());
    return response.data;
  },

  createCampaign: async (data) => {
    const response = await axios.post(`${API_URL}/email-marketing/campaigns`, data, getAuthHeader());
    return response.data;
  },

  updateCampaign: async (id, data) => {
    const response = await axios.put(`${API_URL}/email-marketing/campaigns/${id}`, data, getAuthHeader());
    return response.data;
  },

  deleteCampaign: async (id) => {
    const response = await axios.delete(`${API_URL}/email-marketing/campaigns/${id}`, getAuthHeader());
    return response.data;
  },

  sendCampaign: async (id) => {
    const response = await axios.post(`${API_URL}/email-marketing/campaigns/${id}/send`, {}, getAuthHeader());
    return response.data;
  },

  getCampaignStats: async (id) => {
    const response = await axios.get(`${API_URL}/email-marketing/campaigns/${id}/stats`, getAuthHeader());
    return response.data;
  },

  // Newsletters
  getAllNewsletters: async (params = {}) => {
    const response = await axios.get(`${API_URL}/email-marketing/newsletters`, {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  },

  getNewsletter: async (id) => {
    const response = await axios.get(`${API_URL}/email-marketing/newsletters/${id}`, getAuthHeader());
    return response.data;
  },

  createNewsletter: async (data) => {
    const response = await axios.post(`${API_URL}/email-marketing/newsletters`, data, getAuthHeader());
    return response.data;
  },

  updateNewsletter: async (id, data) => {
    const response = await axios.put(`${API_URL}/email-marketing/newsletters/${id}`, data, getAuthHeader());
    return response.data;
  },

  deleteNewsletter: async (id) => {
    const response = await axios.delete(`${API_URL}/email-marketing/newsletters/${id}`, getAuthHeader());
    return response.data;
  },

  publishNewsletter: async (id) => {
    const response = await axios.post(`${API_URL}/email-marketing/newsletters/${id}/publish`, {}, getAuthHeader());
    return response.data;
  },

  // ========== CONTENT SETTINGS ==========
  getContentSettings: async () => {
    const response = await axios.get(`${API_URL}/content-settings`, getAuthHeader());
    return response.data;
  },

  updateHomeContent: async (data) => {
    const response = await axios.put(`${API_URL}/content-settings/home`, data, getAuthHeader());
    return response.data;
  },

  updateAboutContent: async (data) => {
    const response = await axios.put(`${API_URL}/content-settings/about`, data, getAuthHeader());
    return response.data;
  },

  updateContactContent: async (data) => {
    const response = await axios.put(`${API_URL}/content-settings/contact`, data, getAuthHeader());
    return response.data;
  },

  // ========== PAYMENT MANAGEMENT ==========
  getAllTransactions: async (params = {}) => {
    const response = await axios.get(`${API_URL}/payments`, {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  },

  getPaymentStats: async () => {
    const response = await axios.get(`${API_URL}/payments/stats`, getAuthHeader());
    return response.data;
  },

  getRevenueAnalytics: async () => {
    const response = await axios.get(`${API_URL}/payments/analytics/revenue`, getAuthHeader());
    return response.data;
  },

  exportTransactions: async (params = {}) => {
    const response = await axios.get(`${API_URL}/payments/export`, {
      ...getAuthHeader(),
      params,
    });
    return response.data;
  },

  getGatewayConfig: async () => {
    const response = await axios.get(`${API_URL}/payments/gateway-config`, getAuthHeader());
    return response.data;
  },

  updateGatewayConfig: async (data) => {
    const response = await axios.put(`${API_URL}/payments/gateway-config`, data, getAuthHeader());
    return response.data;
  },

  // ========== BACKUP & EXPORT ==========
  createDatabaseBackup: async () => {
    const response = await axios.post(`${API_URL}/backup/database`, {}, getAuthHeader());
    return response.data;
  },

  exportAllData: async () => {
    const response = await axios.post(`${API_URL}/backup/export`, {}, getAuthHeader());
    return response.data;
  },

  restoreDatabase: async (filename, mode = 'merge') => {
    const response = await axios.post(`${API_URL}/backup/restore`, { filename, mode }, getAuthHeader());
    return response.data;
  },

  importData: async (filename, mode = 'merge') => {
    const response = await axios.post(`${API_URL}/backup/import`, { filename, mode }, getAuthHeader());
    return response.data;
  },

  listBackups: async () => {
    const response = await axios.get(`${API_URL}/backup/list`, getAuthHeader());
    return response.data;
  },

  downloadBackup: async (filename) => {
    const response = await axios.get(`${API_URL}/backup/download/${filename}`, {
      ...getAuthHeader(),
      responseType: 'blob',
    });
    return response.data;
  },

  downloadExport: async (filename) => {
    const response = await axios.get(`${API_URL}/backup/download-export/${filename}`, {
      ...getAuthHeader(),
      responseType: 'blob',
    });
    return response.data;
  },

  deleteBackupFile: async (type, filename) => {
    const response = await axios.delete(`${API_URL}/backup/${type}/${filename}`, getAuthHeader());
    return response.data;
  },
};

export default adminService;
