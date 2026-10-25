import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('evetramasy_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('evetramasy_token');
      localStorage.removeItem('evetramasy_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data: object) => api.post('/auth/register', data),
  login: (data: object) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Events
export const eventsAPI = {
  getAll: (params?: object) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: object) => api.post('/events', data),
  update: (id: string, data: object) => api.put(`/events/${id}`, data),
  getStats: (id: string) => api.get(`/events/${id}/stats`),
  getManagerEvents: () => api.get('/events/manager/my-events'),
};

// Parking
export const parkingAPI = {
  getZones: (eventId: string) => api.get(`/events/${eventId}/parking`),
  createZone: (eventId: string, data: object) => api.post(`/events/${eventId}/parking`, data),
  updateZone: (id: string, data: object) => api.put(`/parking/${id}`, data),
  getRecommendations: (eventId: string) => api.get(`/events/${eventId}/recommendations`),
  getRoute: (eventId: string, zoneId: string) => api.get(`/events/${eventId}/route`, { params: { zoneId } }),
};

// Traffic
export const trafficAPI = {
  getZones: (eventId: string) => api.get(`/events/${eventId}/traffic`),
  createZone: (eventId: string, data: object) => api.post(`/events/${eventId}/traffic`, data),
  updateZone: (id: string, data: object) => api.put(`/traffic/${id}`, data),
  getRisk: (eventId: string) => api.get(`/events/${eventId}/traffic-risk`),
  getAlerts: (eventId: string) => api.get(`/events/${eventId}/alerts`),
  getGates: (eventId: string) => api.get(`/events/${eventId}/gates`),
  createGate: (eventId: string, data: object) => api.post(`/events/${eventId}/gates`, data),
  updateGate: (id: string, data: object) => api.put(`/traffic/gates/${id}`, data),
};

// Vehicles
export const vehiclesAPI = {
  getAll: () => api.get('/vehicles'),
  add: (data: object) => api.post('/vehicles', data),
  update: (id: string, data: object) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
};

// Reservations
export const reservationsAPI = {
  create: (data: object) => api.post('/reservations', data),
  getAll: () => api.get('/reservations'),
  getById: (id: string) => api.get(`/reservations/${id}`),
  cancel: (id: string) => api.delete(`/reservations/${id}`),
  getQR: (id: string) => api.get(`/reservations/${id}/qr`),
  verify: (data: object) => api.post('/reservations/verify', data),
  getEventReservations: (eventId: string) => api.get(`/events/manager/${eventId}/reservations`),
};

// Updates & Notifications
export const updatesAPI = {
  getEventUpdates: (eventId: string) => api.get(`/events/${eventId}/updates`),
  createUpdate: (eventId: string, data: object) => api.post(`/events/${eventId}/updates`, data),
  getForecast: (eventId: string) => api.get(`/events/${eventId}/forecast`),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Admin
export const adminAPI = {
  getUsers: (params?: object) => api.get('/admin/users', { params }),
  updateUserStatus: (id: string, status: string) => api.put(`/admin/users/${id}/status`, { status }),
  getAllEvents: () => api.get('/admin/events'),
  approveEvent: (id: string) => api.post(`/admin/events/${id}/approve`),
  rejectEvent: (id: string, reason: string) => api.post(`/admin/events/${id}/reject`, { reason }),
  getAnalytics: () => api.get('/admin/analytics'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
};

// Simulation
export const simulationAPI = {
  start: (eventId: string) => api.post(`/events/${eventId}/simulation/start`),
  stop: (eventId: string) => api.post(`/events/${eventId}/simulation/stop`),
  getStatus: (eventId: string) => api.get(`/events/${eventId}/simulation/status`),
};

// Facilities (Parking Owner)
export const facilitiesAPI = {
  getAll: () => api.get('/facilities'),
  getMy: () => api.get('/facilities/my'),
  create: (data: object) => api.post('/facilities', data),
  update: (id: string, data: object) => api.put(`/facilities/${id}`, data),
  createEventRequest: (facilityId: string, data: object) => api.post(`/facilities/${facilityId}/event-request`, data),
  getMyRequests: () => api.get('/facilities/event-requests/my'),
  getEventRequests: (eventId: string) => api.get(`/facilities/event-requests/${eventId}`),
  respondToRequest: (reqId: string, data: object) => api.put(`/facilities/event-requests/${reqId}/respond`, data),
};

// Fines
export const finesAPI = {
  getMy: () => api.get('/fines'),
  pay: (id: string) => api.put(`/fines/${id}/pay`),
  getAll: () => api.get('/admin/fines'),
  getSettings: () => api.get('/admin/fines/settings'),
  updateSettings: (data: object) => api.put('/admin/fines/settings', data),
};

