const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.baseUrl = API_BASE
  }

  getHeaders() {
    const token = localStorage.getItem('sellerToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: this.getHeaders(),
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, options)
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`)
    }

    return data
  }

  // Auth
  login(email, password) {
    return this.request('POST', '/auth/login', { email, password })
  }

  register(data) {
    return this.request('POST', '/auth/register', data)
  }

  getMe() {
    return this.request('GET', '/auth/me')
  }

  verifyPassword(password) {
    return this.request('POST', '/auth/verify-password', { password })
  }

  updatePassword(newPassword) {
    return this.request('POST', '/auth/update-password', { newPassword })
  }

  // Seller Dashboard
  getDashboardStats() {
    return this.request('GET', '/seller/dashboard/stats')
  }

  getListings() {
    return this.request('GET', '/seller/listings')
  }

  createListing(data) {
    return this.request('POST', '/seller/listings', data)
  }

  getRequests() {
    return this.request('GET', '/seller/requests')
  }

  acceptRequest(id) {
    return this.request('PUT', `/seller/requests/${id}/accept`)
  }

  rejectRequest(id) {
    return this.request('PUT', `/seller/requests/${id}/reject`)
  }

  // Settings
  getSettings() {
    return this.request('GET', '/seller/settings')
  }

  updateSettings(data) {
    return this.request('PUT', '/seller/settings', data)
  }

  // Messages
  getConversations() {
    return this.request('GET', '/messages/conversations')
  }

  getMessages(conversationId) {
    return this.request('GET', `/messages/${conversationId}`)
  }

  sendMessage(data) {
    return this.request('POST', '/messages', data)
  }
}

export const api = new ApiService()
export default api
