import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../services/api'
import { getSocket } from '../services/socket'

// Subscribe to a Socket.IO event on the shared connection for the component's lifetime
export function useSocketEvent(event, handler) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return undefined
    const listener = (payload) => handlerRef.current(payload)
    socket.on(event, listener)
    return () => socket.off(event, listener)
  }, [event])
}

// Subscribe to a same-tab browser event (used to refresh badges after local actions)
export function useWindowEvent(event, handler) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const listener = (e) => handlerRef.current(e)
    window.addEventListener(event, listener)
    return () => window.removeEventListener(event, listener)
  }, [event])
}

// Announce that request data changed in this tab (sidebar badges, dashboards refresh)
export const announceRequestsChanged = () => window.dispatchEvent(new Event('requests:changed'))

// Unread notification count for the navbar bell, kept live through the socket
export function useUnreadNotificationCount() {
  const [count, setCount] = useState(0)

  const refresh = useCallback(() => {
    api.getUnreadNotificationCount()
      .then((data) => setCount(data.count))
      .catch(() => {})
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])
  useSocketEvent('notification', refresh)
  useSocketEvent('notificationsChanged', refresh)
  useSocketEvent('connect', refresh)

  return count
}

// Pending request count for the seller sidebar badge
export function usePendingRequestCount() {
  const [count, setCount] = useState(0)

  const refresh = useCallback(() => {
    api.getDashboardStats()
      .then((data) => setCount(data.stats.pendingRequests || 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])
  useSocketEvent('notification', refresh)
  useWindowEvent('requests:changed', refresh)

  return count
}
