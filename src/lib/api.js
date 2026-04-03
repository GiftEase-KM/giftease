import { supabase } from './supabase';

const API_BASE = '/api';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}

async function request(path, options = {}) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Profile
  getProfile: () => request('/profile'),
  updateProfile: (body) => request('/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Persons
  getPersons: () => request('/persons'),
  getFavorites: () => request('/persons/favorites'),
  getPerson: (id) => request(`/persons/${id}`),
  createPerson: (body) => request('/persons', { method: 'POST', body: JSON.stringify(body) }),
  updatePerson: (id, body) => request(`/persons/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePerson: (id) => request(`/persons/${id}`, { method: 'DELETE' }),

  // Addresses
  addAddress: (personId, body) => request(`/persons/${personId}/addresses`, { method: 'POST', body: JSON.stringify(body) }),
  updateAddress: (personId, id, body) => request(`/persons/${personId}/addresses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAddress: (personId, id) => request(`/persons/${personId}/addresses/${id}`, { method: 'DELETE' }),

  // Events
  getEventTypes: () => request('/events/types'),
  getEvents: (status) => request(`/events${status ? `?status=${status}` : ''}`),
  getUpcomingEvents: (limit = 5) => request(`/events/upcoming?limit=${limit}`),
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (body) => request('/events', { method: 'POST', body: JSON.stringify(body) }),
  updateEvent: (id, body) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  // Payment Methods
  getPaymentMethods: () => request('/payment-methods'),
  addPaymentMethod: (body) => request('/payment-methods', { method: 'POST', body: JSON.stringify(body) }),
  deletePaymentMethod: (id) => request(`/payment-methods/${id}`, { method: 'DELETE' }),

  // Handwrytten
  getHWCategories: () => request('/handwrytten/categories'),
  getHWCards: (categoryId, page = 0) => request(`/handwrytten/cards?page=${page}${categoryId ? `&category_id=${categoryId}` : ''}`),
  getHWCard: (id) => request(`/handwrytten/cards/${id}`),
  getHWFonts: () => request('/handwrytten/fonts'),
  placeHWOrder: (body) => request('/handwrytten/order', { method: 'POST', body: JSON.stringify(body) }),
  getHWOrder: (id) => request(`/handwrytten/order/${id}`),
};