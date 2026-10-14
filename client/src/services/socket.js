import { io } from 'socket.io-client'
import { SOCKET_URL, getToken } from './api'

// One shared Socket.IO connection per signed-in tab. The token is read on every (re)connect,
// so a fresh token (e.g. after a password change) is picked up automatically.
let socket = null

export function getSocket() {
  if (!getToken()) return null
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: (cb) => cb({ token: getToken() }),
    })
    // The server disconnects sockets whose token was revoked; reconnect only if we now hold a new one
    let tokenAtConnect = getToken()
    socket.on('connect', () => { tokenAtConnect = getToken() })
    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect' && getToken() && getToken() !== tokenAtConnect) socket.connect()
    })
  }
  return socket
}

// Reconnect after this tab received a new token (the old one was revoked server-side)
export function reconnectSocket() {
  if (socket && !socket.connected) socket.connect()
}

export function closeSocket() {
  socket?.disconnect()
  socket = null
}
