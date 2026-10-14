// Display helpers shared by the dashboards

export const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${formatDate(date)}, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
}

export const formatTime = (value) =>
  new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

// "Just now", "5 min ago", "Yesterday", or a date
export const timeAgo = (value) => {
  if (!value) return ''
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`
  if (seconds < 172800) return 'Yesterday'
  return formatDate(value)
}

// Short human-friendly reference for a MongoDB id, e.g. "#A1B2C3D4"
export const shortId = (id) => (id ? `#${String(id).slice(-8).toUpperCase()}` : '')

export const statusLabel = (status) =>
  ({
    pending: 'Pending',
    accepted: 'Accepted',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  })[status] || status

// "12 Nov 2026 • 10:30" from the stored schedule fields
export const scheduleText = ({ scheduledDate, scheduledTime }) =>
  [formatDate(scheduledDate), scheduledTime].filter(Boolean).join(' • ')
