import api from './api';

export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data)
};

export const patientApi = {
  list: (params) => api.get('/patients', { params }).then((res) => res.data),
  create: (payload) => api.post('/patients', payload).then((res) => res.data),
  remove: (id) => api.delete(`/patients/${id}`).then((res) => res.data),
  status: (id, status) => api.patch(`/patients/${id}/status`, { status }).then((res) => res.data),
  estimate: (tokenNumber) => api.get(`/patients/estimate/${tokenNumber}`).then((res) => res.data)
};

export const queueApi = {
  current: () => api.get('/queue/current').then((res) => res.data),
  next: () => api.post('/queue/next').then((res) => res.data)
};

export const settingsApi = {
  get: () => api.get('/settings').then((res) => res.data),
  update: (payload) => api.put('/settings', payload).then((res) => res.data)
};
