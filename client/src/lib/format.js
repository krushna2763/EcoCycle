// Display helpers shared by the dashboards

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

export const formatDate = (value) => {
  if (!value) return ''
  // A date without a time ("2026-11-01", e.g. a collection date) is a calendar date: read it in
  // local time, since new Date("2026-11-01") means UTC midnight and shows the day before west of UTC
  const parts = typeof value === 'string' && DATE_ONLY.exec(value)
  const date = parts ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])) : new Date(value)
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

// Today's date in the browser's timezone, as an <input type="date"> value
export const todayInputValue = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
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

export const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-IN')
