import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import api from '../services/api'
import { useApi } from './useApi'
import { useSocketEvent } from './useLiveUpdates'

const PAGE_SIZE = 20

// Paged notification list for the Notifications pages, kept live through the socket
export function useNotificationFeed(filter) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState('')
  const filterKey = JSON.stringify(filter)
  const { data, loading, error, reload, setData } = useApi(
    () => api.getNotifications({ ...filter, page, limit: PAGE_SIZE }),
    [filterKey, page]
  )

  useSocketEvent('notification', reload)
  useSocketEvent('notificationsChanged', reload)

  const markReadLocally = (id) =>
    setData((prev) => prev && {
      ...prev,
      notifications: prev.notifications.map((n) => (n._id === id ? { ...n, read: true } : n)),
      counts: { ...prev.counts, unread: Math.max((prev.counts?.unread || 1) - 1, 0) },
    })

  const markRead = async (notification) => {
    if (notification.read) return
    try {
      await api.markNotificationRead(notification._id)
      markReadLocally(notification._id)
    } catch (err) {
      setActionError(err.message)
    }
  }

  const markAllRead = async () => {
    setActionError('')
    try {
      await api.markAllNotificationsRead()
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  // Mark as read, then follow the notification's link (path plus optional ?c= conversation)
  const open = async (notification) => {
    await markRead(notification)
    if (!notification.link) return
    const [to, query] = notification.link.split('?')
    const search = Object.fromEntries(new URLSearchParams(query || ''))
    navigate({ to, search })
  }

  return {
    notifications: data?.notifications || [],
    counts: data?.counts || {},
    pages: data?.pages || 1,
    page,
    setPage,
    loading: loading && !data,
    error,
    actionError,
    reload,
    markRead,
    markAllRead,
    open,
  }
}
