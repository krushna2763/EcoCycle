// Holds the Socket.IO server so HTTP handlers can act on live connections without importing index.js
let io = null

// Number of open sockets per user, for online indicators
const openSockets = new Map()

// Private per-user room; clients cannot join it (see the `join` handler in index.js)
export const userRoom = (userId) => `user:${userId}`

export const registerSocketServer = (server) => {
  io = server
}

// Drop every live socket of a user, e.g. after a password change revokes their tokens
export const disconnectUserSockets = (userId) => {
  io?.in(userRoom(userId)).disconnectSockets(true)
}

// Deliver an event to every open tab of each user (a socket in several rooms receives it once)
export const emitToUsers = (userIds, event, payload) => {
  if (!io || userIds.length === 0) return
  io.to(userIds.map((id) => userRoom(String(id)))).emit(event, payload)
}

export const emitToUser = (userId, event, payload) => emitToUsers([userId], event, payload)

// Track sockets per user; returns true when the user's online state changed
export const markSocketOpen = (userId) => {
  const count = (openSockets.get(userId) || 0) + 1
  openSockets.set(userId, count)
  return count === 1
}

export const markSocketClosed = (userId) => {
  const count = (openSockets.get(userId) || 1) - 1
  if (count <= 0) openSockets.delete(userId)
  else openSockets.set(userId, count)
  return count <= 0
}

export const isOnline = (userId) => openSockets.has(String(userId))
