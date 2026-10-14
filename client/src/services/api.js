export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Origin that serves /api/uploads/... image paths (works for absolute and relative VITE_API_URL)
const API_ORIGIN = new URL(API_BASE, window.location.origin).origin
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_ORIGIN

const TOKEN_KEY = 'sellerToken'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

// Resolve a stored image path to a URL the browser can load; anything else (old blob: URLs,
// seed placeholders) returns null so the UI shows its placeholder instead of a broken image
export const assetUrl = (path) => (typeof path === 'string' && path.startsWith('/api/uploads/') ? `${API_ORIGIN}${path}` : null)

const queryString = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value)
  })
  const text = search.toString()
  return text ? `?${text}` : ''
}

class ApiService {
  constructor() {
    this.baseUrl = API_BASE
  }

  getHeaders(json = true) {
    const token = getToken()
    return {
      ...(json && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(method, endpoint, body = null) {
    const isForm = body instanceof FormData
    const options = {
      method,
      headers: this.getHeaders(!isForm),
    }

    if (body) {
      options.body = isForm ? body : JSON.stringify(body)
    }

    let res
    try {
      res = await fetch(`${this.baseUrl}${endpoint}`, options)
    } catch {
      throw new Error('Cannot reach the server. Check your connection and try again.')
    }

    let data = {}
    try {
      data = await res.json()
    } catch {
      // Empty or non-JSON body
    }

    if (!res.ok) {
      // A rejected token means the session ended (expired, or revoked by a password change)
      if (res.status === 401 && options.headers.Authorization) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
      const error = new Error(data.message || `Request failed with status ${res.status}`)
      error.status = res.status
      throw error
    }

    return data
  }

  // Auth & profile
  login(email, password) {
    return this.request('POST', '/auth/login', { email, password })
  }

  register(data) {
    return this.request('POST', '/auth/register', data)
  }

  getMe() {
    return this.request('GET', '/auth/me')
  }

  updateProfile(data) {
    return this.request('PUT', '/auth/me', data)
  }

  verifyPassword(password) {
    return this.request('POST', '/auth/verify-password', { password })
  }

  updatePassword(currentPassword, newPassword) {
    return this.request('POST', '/auth/update-password', { currentPassword, newPassword })
  }

  // Images: returns [{ id, url }]
  async uploadImages(files) {
    const form = new FormData()
    Array.from(files).forEach((file) => form.append('images', file))
    const data = await this.request('POST', '/uploads', form)
    return data.files
  }

  deleteUpload(id) {
    return this.request('DELETE', `/uploads/${id}`)
  }

  // Best-effort removal of uploads that ended up unused (the server also cleans up later)
  discardUploads(files) {
    return Promise.all(files.map((file) => this.deleteUpload(file.id).catch(() => {})))
  }

  // Seller dashboard
  getDashboardStats() {
    return this.request('GET', '/seller/dashboard/stats')
  }

  getListings(params) {
    return this.request('GET', `/seller/listings${queryString(params)}`)
  }

  getListing(id) {
    return this.request('GET', `/seller/listings/${id}`)
  }

  createListing(data) {
    return this.request('POST', '/seller/listings', data)
  }

  updateListing(id, data) {
    return this.request('PUT', `/seller/listings/${id}`, data)
  }

  deleteListing(id) {
    return this.request('DELETE', `/seller/listings/${id}`)
  }

  getRequests(params) {
    return this.request('GET', `/seller/requests${queryString(params)}`)
  }

  acceptRequest(id) {
    return this.request('PUT', `/seller/requests/${id}/accept`)
  }

  rejectRequest(id, reason) {
    return this.request('PUT', `/seller/requests/${id}/reject`, { reason })
  }

  scheduleCollection(id, schedule) {
    return this.request('PUT', `/seller/requests/${id}/schedule`, schedule)
  }

  updateRequestStatus(id, status, reason) {
    return this.request('PUT', `/seller/requests/${id}/status`, { status, reason })
  }

  // Buyer
  getBuyerStats() {
    return this.request('GET', '/buyer/dashboard/stats')
  }

  getMarketplaceListings(params) {
    return this.request('GET', `/buyer/listings${queryString(params)}`)
  }

  getMarketplaceListing(id) {
    return this.request('GET', `/buyer/listings/${id}`)
  }

  createBuyRequest(data) {
    return this.request('POST', '/buyer/requests', data)
  }

  getBuyerRequests() {
    return this.request('GET', '/buyer/requests')
  }

  cancelBuyerRequest(id, reason) {
    return this.request('PUT', `/buyer/requests/${id}/cancel`, { reason })
  }

  completeBuyerCollection(id) {
    return this.request('PUT', `/buyer/requests/${id}/complete`)
  }

  // Settings (role: 'seller' | 'buyer')
  getSettings(role = 'seller') {
    return this.request('GET', `/${role}/settings`)
  }

  updateSettings(data, role = 'seller') {
    return this.request('PUT', `/${role}/settings`, data)
  }

  // Messages
  getConversations() {
    return this.request('GET', '/messages/conversations')
  }

  getMessages(conversationId, before) {
    return this.request('GET', `/messages/${conversationId}${queryString({ before })}`)
  }

  sendMessage(data) {
    return this.request('POST', '/messages', data)
  }

  markConversationRead(conversationId) {
    return this.request('PUT', `/messages/${conversationId}/read`)
  }

  // Notifications
  getNotifications(params) {
    return this.request('GET', `/notifications${queryString(params)}`)
  }

  getUnreadNotificationCount() {
    return this.request('GET', '/notifications/unread-count')
  }

  markNotificationRead(id) {
    return this.request('PUT', `/notifications/${id}/read`)
  }

  markAllNotificationsRead() {
    return this.request('PUT', '/notifications/read-all')
  }
}

export const api = new ApiService()
export default api
