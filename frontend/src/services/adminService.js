import apiClient from './apiClient';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ADMIN_URL = `${BASE_URL}/api/admin`;
const request = async (method, url, data, options = {}) => {
  const response = await apiClient({ method, url: url.replace(`${BASE_URL}/api`, ''), data, ...options });
  return response.data;
};

const adminService = {
  getAllCertificates: (params = {}) => request('get', `${ADMIN_URL}/certificates`, undefined, { params }),
  createCertificate: data => request('post', `${ADMIN_URL}/certificates`, data),
  updateCertificate: (id, data) => request('put', `${ADMIN_URL}/certificates/${id}`, data),
  deleteCertificate: (id, reason) => request('delete', `${ADMIN_URL}/certificates/${id}`, { reason }),
  regenerateCertificate: id => request('post', `${ADMIN_URL}/certificates/${id}/regenerate`, {}),
  bulkUploadCertificates: certificates => request('post', `${ADMIN_URL}/certificates/bulk`, { certificates }),
  revokeCertificate: (id, reason) => request('put', `${ADMIN_URL}/certificates/${id}/revoke`, { reason }),
  restoreCertificate: id => request('put', `${ADMIN_URL}/certificates/${id}/restore`, {}),
  archiveCertificate: (id, reason) => request('put', `${ADMIN_URL}/certificates/${id}/archive`, { reason }),
  unarchiveCertificate: id => request('put', `${ADMIN_URL}/certificates/${id}/unarchive`, {}),
  exportCertificates: (params = {}) => request('get', `${ADMIN_URL}/certificates/export`, undefined, { params, responseType: 'blob' }),

  getAllTrainers: (params = {}) => request('get', `${ADMIN_URL}/trainers`, undefined, { params }),
  getPendingApplications: (params = {}) => request('get', `${ADMIN_URL}/trainers/applications/pending`, undefined, { params }),
  createTrainer: data => request('post', `${ADMIN_URL}/trainers`, data),
  updateTrainer: (id, data) => request('put', `${ADMIN_URL}/trainers/${id}`, data),
  deleteTrainer: id => request('delete', `${ADMIN_URL}/trainers/${id}`),
  approveTrainer: (id, notes = '') => request('put', `${ADMIN_URL}/trainers/${id}/approve`, { notes }),
  rejectTrainer: (id, notes = '') => request('put', `${ADMIN_URL}/trainers/${id}/reject`, { notes }),
  updateVerificationStatus: (id, isVerified, notes = '') => request('put', `${ADMIN_URL}/trainers/${id}/verification`, { isVerified, notes }),
  getTrainerMetrics: id => request('get', `${ADMIN_URL}/trainers/${id}/metrics`),
  getTrainerPayouts: (id, params = {}) => request('get', `${ADMIN_URL}/trainers/${id}/payouts`, undefined, { params }),
  createPayout: (id, data) => request('post', `${ADMIN_URL}/trainers/${id}/payouts`, data),

  getUsers: (params = {}) => request('get', `${BASE_URL}/api/users`, undefined, { params }),
  getCredentialRecipients: () => request('get', `${BASE_URL}/api/users`, undefined, { params: { limit: 100 } }),
  getCredentialCatalog: async () => ({ success: true, data: [], message: 'Credentials are created independently; Moodle learning records remain in Moodle' }),
  updateUser: (id, data) => request('put', `${BASE_URL}/api/users/${id}`, data),
  deleteUser: id => request('delete', `${BASE_URL}/api/users/${id}`),
  suspendUser: (id, reason = '') => request('put', `${BASE_URL}/api/users/${id}/suspend`, { reason }),
  activateUser: id => request('put', `${BASE_URL}/api/users/${id}/activate`, {}),
  getUserActivity: (id, params = {}) => request('get', `${BASE_URL}/api/users/${id}/activity`, undefined, { params }),
  resetUserPassword: (id, newPassword) => request('post', `${BASE_URL}/api/users/${id}/reset-password`, { newPassword }),
  bulkUpdateUsers: (userIds, updates) => request('post', `${BASE_URL}/api/users/bulk-update`, { userIds, updates }),
  bulkDeleteUsers: userIds => request('post', `${BASE_URL}/api/users/bulk-delete`, { userIds }),

  getAllPages: (params = {}) => request('get', `${ADMIN_URL}/cms/pages`, undefined, { params }),
  createPage: data => request('post', `${ADMIN_URL}/cms/pages`, data),
  updatePage: (id, data) => request('put', `${ADMIN_URL}/cms/pages/${id}`, data),
  deletePage: id => request('delete', `${ADMIN_URL}/cms/pages/${id}`),
  publishPage: id => request('put', `${ADMIN_URL}/cms/pages/${id}/publish`, {}),
  getAllMedia: (params = {}) => request('get', `${ADMIN_URL}/cms/media`, undefined, { params }),
  uploadMedia: formData => request('post', `${ADMIN_URL}/cms/media/upload`, formData),
  updateMedia: (id, data) => request('put', `${ADMIN_URL}/cms/media/${id}`, data),
  deleteMedia: id => request('delete', `${ADMIN_URL}/cms/media/${id}`),
  getAllAnnouncements: (params = {}) => request('get', `${ADMIN_URL}/cms/announcements`, undefined, { params }),
  createAnnouncement: data => request('post', `${ADMIN_URL}/cms/announcements`, data),
  updateAnnouncement: (id, data) => request('put', `${ADMIN_URL}/cms/announcements/${id}`, data),
  deleteAnnouncement: id => request('delete', `${ADMIN_URL}/cms/announcements/${id}`),

  getContentSettings: () => request('get', `${ADMIN_URL}/content-settings`),
  updateHomeContent: data => request('put', `${ADMIN_URL}/content-settings/home`, data),
  updateAboutContent: data => request('put', `${ADMIN_URL}/content-settings/about`, data),
  updateContactContent: data => request('put', `${ADMIN_URL}/content-settings/contact`, data),

  getAllTransactions: (params = {}) => request('get', `${ADMIN_URL}/payments`, undefined, { params }),
  getPaymentStats: () => request('get', `${ADMIN_URL}/payments/stats`),
  getRevenueAnalytics: (params = {}) => request('get', `${ADMIN_URL}/payments/analytics/revenue`, undefined, { params }),
  exportTransactions: (params = {}) => request('get', `${ADMIN_URL}/payments/export`, undefined, { params }),
  getGatewayConfig: () => request('get', `${ADMIN_URL}/payments/gateway-config`),

  getAllCampaigns: (params = {}) => request('get', `${ADMIN_URL}/email-marketing/campaigns`, undefined, { params }),
  createCampaign: data => request('post', `${ADMIN_URL}/email-marketing/campaigns`, data),
  updateCampaign: (id, data) => request('put', `${ADMIN_URL}/email-marketing/campaigns/${id}`, data),
  deleteCampaign: id => request('delete', `${ADMIN_URL}/email-marketing/campaigns/${id}`),
  sendCampaign: id => request('post', `${ADMIN_URL}/email-marketing/campaigns/${id}/send`, {}),
  getEmailMarketingStats: () => request('get', `${ADMIN_URL}/email-marketing/stats`),
  getAllNewsletters: (params = {}) => request('get', `${ADMIN_URL}/email-marketing/newsletters`, undefined, { params }),
  createNewsletter: data => request('post', `${ADMIN_URL}/email-marketing/newsletters`, data),
  updateNewsletter: (id, data) => request('put', `${ADMIN_URL}/email-marketing/newsletters/${id}`, data),
  deleteNewsletter: id => request('delete', `${ADMIN_URL}/email-marketing/newsletters/${id}`),
  publishNewsletter: id => request('post', `${ADMIN_URL}/email-marketing/newsletters/${id}/publish`, {}),

  getSettings: () => request('get', `${BASE_URL}/api/settings`),
  updateGeneralSettings: data => request('put', `${BASE_URL}/api/settings/general`, data),
  updateEmailTemplates: data => request('put', `${BASE_URL}/api/settings/email-templates`, data),
  updateNotificationSettings: data => request('put', `${BASE_URL}/api/settings/notifications`, data),
  updateLocalizationSettings: data => request('put', `${BASE_URL}/api/settings/localization`, data),
  getApiKeys: () => request('get', `${BASE_URL}/api/settings/api-keys`),
  createApiKey: data => request('post', `${BASE_URL}/api/settings/api-keys`, data),
  deleteApiKey: keyId => request('delete', `${BASE_URL}/api/settings/api-keys/${keyId}`),
  regenerateApiKey: keyId => request('post', `${BASE_URL}/api/settings/api-keys/${keyId}/regenerate`, {}),

  createDatabaseBackup: () => request('post', `${ADMIN_URL}/backup/database`, {}),
  exportAllData: () => request('post', `${ADMIN_URL}/backup/export`, {}),
  restoreDatabase: (filename, mode) => request('post', `${ADMIN_URL}/backup/restore`, { filename, mode }),
  importData: (filename, mode) => request('post', `${ADMIN_URL}/backup/import`, { filename, mode }),
  listBackups: () => request('get', `${ADMIN_URL}/backup/list`),
  downloadBackup: filename => request('get', `${ADMIN_URL}/backup/download/${encodeURIComponent(filename)}`),
  downloadExport: filename => request('get', `${ADMIN_URL}/backup/download-export/${encodeURIComponent(filename)}`),
  deleteBackupFile: (type, filename) => request('delete', `${ADMIN_URL}/backup/${type}/${encodeURIComponent(filename)}`)
};

export default adminService;
