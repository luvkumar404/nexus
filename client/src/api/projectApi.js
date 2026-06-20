import api from './axios';

export const projectApi = {
  create: (data) => api.post('/projects', data),
  list: () => api.get('/projects'),
  get: (id) => api.get(`/projects/${id}`),
  delete: (id) => api.delete(`/projects/${id}`)
};
