import { useState } from 'react'
import {
  Bell,
  Globe,
  Save,
  CheckCircle2,
} from 'lucide-react'

export default function BuyerSettings() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    newLotNotifications: true,
    collectionReminders: true,
    currency: 'INR (₹)',
    language: 'English',
  })

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="min-h-full bg-[#f8faf8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Buyer Preferences & Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Configure notifications, supply match alerts, and localization settings.</p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4" /> Preferences saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Notifications Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Procurement Alerts</h2>
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Email Notification on Seller Acceptance</p>
                  <p className="text-xs text-slate-500">Receive an email immediately when a seller accepts your buy request.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">New Supply Lot Notifications</p>
                  <p className="text-xs text-slate-500">Alert me when new verified plastic waste is listed in my region.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.newLotNotifications}
                  onChange={(e) => setSettings({ ...settings, newLotNotifications: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Collection Pickup Reminders</p>
                  <p className="text-xs text-slate-500">Get reminders 2 hours before scheduled collection handovers.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.collectionReminders}
                  onChange={(e) => setSettings({ ...settings, collectionReminders: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
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
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
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
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
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
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Save className="h-4 w-4" /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
