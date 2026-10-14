import { useState } from 'react'
import {
  AlertCircle,
  Bell,
  Globe,
  Info,
  Save,
  CheckCircle2,
} from 'lucide-react'
import api from '../../services/api'
import { useApi } from '../../hooks/useApi'

// Form fields <-> stored settings
const formFrom = (settings) => ({
  emailAlerts: settings.channels?.email ?? true,
  newLotNotifications: settings.notifications?.newListings ?? true,
  collectionReminders: settings.notifications?.collectionReminders ?? true,
  currency: settings.currency || 'INR (₹)',
  language: settings.language || 'English',
})

const payloadFrom = (form) => ({
  language: form.language,
  currency: form.currency,
  channels: { email: form.emailAlerts },
  notifications: { newListings: form.newLotNotifications, collectionReminders: form.collectionReminders },
})

export default function BuyerSettings() {
  const { data, loading, error, reload, setData } = useApi(() => api.getSettings('buyer'), [])
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const settings = draft || (data?.settings ? formFrom(data.settings) : null)

  const change = (patch) => {
    setDraft({ ...settings, ...patch })
    setSaved(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!settings || saving) return
    setSaving(true)
    setSaveError('')
    try {
      const res = await api.updateSettings(payloadFrom(settings), 'buyer')
      setData({ settings: res.settings })
      setDraft(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#f8faf8] py-20">
        {error ? (
          <div className="text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={reload} className="mt-3 rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
              Try again
            </button>
          </div>
        ) : (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Buyer Preferences & Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Configure notifications, supply match alerts, and localization settings.</p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Preferences saved successfully!
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
            <AlertCircle className="h-4 w-4" /> {saveError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Notifications Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Procurement Alerts</h2>
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              In-app notifications for your requests and collections are always on. These preferences are saved now and
              apply once email alerts, new-lot alerts and pickup reminders are launched.
            </p>

            <div className="mt-5 divide-y divide-slate-100">
              <CheckboxRow
                title="Email Notification on Seller Acceptance"
                desc="Receive an email immediately when a seller accepts your buy request."
                checked={settings.emailAlerts}
                onChange={(v) => change({ emailAlerts: v })}
              />
              <CheckboxRow
                title="New Supply Lot Notifications"
                desc="Alert me when new verified plastic waste is listed in my region."
                checked={settings.newLotNotifications}
                onChange={(v) => change({ newLotNotifications: v })}
              />
              <CheckboxRow
                title="Collection Pickup Reminders"
                desc="Get reminders 2 hours before scheduled collection handovers."
                checked={settings.collectionReminders}
                onChange={(v) => change({ collectionReminders: v })}
              />
            </div>
          </div>

          {/* Regional Settings */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Localization</h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-600">Display Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => change({ language: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Trading Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => change({ currency: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !draft}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CheckboxRow({ title, desc, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
    </label>
  )
}
