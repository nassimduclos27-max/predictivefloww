import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://predictivefloww-production-a2eb.up.railway.app/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pf_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pf_token')
      localStorage.removeItem('pf_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

export const machinesAPI = {
  list: () => api.get('/machines'),
  get: (id) => api.get(`/machines/${id}`),
  create: (data) => api.post('/machines', data),
  update: (id, data) => api.put(`/machines/${id}`, data),
  delete: (id) => api.delete(`/machines/${id}`),
  listComponents: (machineId) => api.get(`/machines/${machineId}/components`),
  createComponent: (machineId, data) => api.post(`/machines/${machineId}/components`, data),
  updateComponent: (machineId, componentId, data) => api.put(`/machines/${machineId}/components/${componentId}`, data),
  deleteComponent: (machineId, componentId) => api.delete(`/machines/${machineId}/components/${componentId}`),
}

export const sensorsAPI = {
  latest: (machineId) => api.get(`/sensors/latest/${machineId}`),
  history: (componentId, from, to) => api.get(`/sensors/history/${componentId}`, { params: { from, to } }),
  push: (data) => api.post('/sensors/push', data),
  overview: () => api.get('/sensors/overview'),
}

export const alertsAPI = {
  list: (params) => api.get('/alerts', { params }),
  resolve: (id) => api.put(`/alerts/${id}/resolve`),
  stats: () => api.get('/alerts/stats'),
}

export const adminAPI = {
  listUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  assignMachines: (userId, machineIds) => api.put(`/admin/users/${userId}/machines`, { machineIds }),
}

export const weibullAPI = {
  analyze: (componentId, params) => api.post(`/sensors/weibull/${componentId}`, params),
  stats: (machineId) => api.get(`/weibull/machine/${machineId}`),
}

export const quotesAPI = {
  list: (params) => api.get('/quotes', { params }),
  get: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  updateStatus: (id, status) => api.patch(`/quotes/${id}/status`, { status }),
  delete: (id) => api.delete(`/quotes/${id}`),
  getPdfUrl: (id) => `${BASE_URL}/quotes/${id}/pdf`,
}

export const invoicesAPI = {
  list: (params) => api.get('/invoices', { params }),
  get: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  markPaid: (id) => api.patch(`/invoices/${id}/pay`),
  delete: (id) => api.delete(`/invoices/${id}`),
  stats: () => api.get('/invoices/stats'),
  getPdfUrl: (id) => `${BASE_URL}/invoices/${id}/pdf`,
}

export const projectsAPI = {
  list: (params) => api.get('/projects', { params }),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addStep: (projectId, data) => api.post(`/projects/${projectId}/steps`, data),
  updateStep: (projectId, stepId, data) => api.patch(`/projects/${projectId}/steps/${stepId}`, data),
  deleteStep: (projectId, stepId) => api.delete(`/projects/${projectId}/steps/${stepId}`),
  listInterventions: (projectId) => api.get(`/projects/${projectId}/interventions`),
  addIntervention: (projectId, data) => api.post(`/projects/${projectId}/interventions`, data),
  updateIntervention: (projectId, intId, data) => api.put(`/projects/${projectId}/interventions/${intId}`, data),
  deleteIntervention: (projectId, intId) => api.delete(`/projects/${projectId}/interventions/${intId}`),
}

export const messagesAPI = {
  contacts: () => api.get('/messages/contacts'),
  conversation: (userId, params) => api.get(`/messages/conversation/${userId}`, { params }),
  poll: (userId, since) => api.get(`/messages/poll/${userId}`, { params: { since } }),
  unreadCount: () => api.get('/messages/unread-count'),
  send: (receiver_id, content) => api.post('/messages', { receiver_id, content }),
  delete: (id) => api.delete(`/messages/${id}`),
}

export default api
