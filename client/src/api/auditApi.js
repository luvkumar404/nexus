import api from './axios';

export const auditApi = {
  start: (data) => api.post('/audits/start', data),
  get: (id) => api.get(`/audits/${id}`),
  status: (id) => api.get(`/crawler/status/${id}`),
  projectAudits: (projectId) => api.get(`/audits/project/${projectId}`),
  delete: (id) => api.delete(`/audits/${id}`),
  downloadPdf: (id) => api.get(`/audits/${id}/pdf`, { responseType: 'blob' }),
  preview: (url) => api.post('/crawler/preview', { url })
};
