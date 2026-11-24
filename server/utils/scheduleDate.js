import Settings from '../models/Settings.js'

// Collection dates are calendar dates without a time or timezone ("YYYY-MM-DD", what the
// dashboard's <input type="date"> sends) and are stored as that string. Whether a date is in the
// past is decided by the seller's own calendar: "today" is taken in the timezone from their
// settings, so the result does not depend on the server's timezone.
const DEFAULT_TIMEZONE = 'Asia/Kolkata' // matches the Settings model default
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

// "2026-02-30", "2026-13-01" and other impossible dates are rejected
export const isCalendarDate = (value) => {
  const match = DATE_ONLY.exec(value)
  if (!match) return false
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

// IANA zone from a timezone setting such as "(GMT+05:30) Asia/Kolkata"; unknown values fall back
// to the default instead of failing
export const timezoneFromSetting = (setting) => {
  const zone = typeof setting === 'string' ? setting.trim().split(/\s+/).pop() : ''
  if (!zone) return DEFAULT_TIMEZONE
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone })
    return zone
  } catch {
    return DEFAULT_TIMEZONE
  }
}

// The calendar date ("YYYY-MM-DD") in `timeZone` at the instant `now`
export const dateIn = (timeZone, now = new Date()) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(now)
      .map(({ type, value }) => [type, value])
  )
  return `${parts.year}-${parts.month}-${parts.day}`
}

// Today's date for a user, in the timezone from their settings
export const todayFor = async (userId) => {
  const settings = await Settings.findOne({ seller: userId }).select('timezone').lean()
  return dateIn(timezoneFromSetting(settings?.timezone))
}
