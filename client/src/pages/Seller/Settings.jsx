import { useState } from 'react'
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  MessageSquare,
  Phone,
  Save,
  Settings as SettingsIcon,
  Shield,
  Truck,
  User,
  FileText,
} from 'lucide-react'
import api from '../../services/api'
import { useApi } from '../../hooks/useApi'

// Only these keys are edited on this page; everything else in the settings document is left alone
const editable = (settings) => ({
  language: settings.language,
  timezone: settings.timezone,
  dateFormat: settings.dateFormat,
  notifications: {
    collectionUpdates: settings.notifications.collectionUpdates,
    messages: settings.notifications.messages,
    requestUpdates: settings.notifications.requestUpdates,
  },
  privacy: settings.privacy,
})

export default function Settings() {
  const { data, loading, error, reload, setData } = useApi(() => api.getSettings('seller'), [])
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const settings = draft || data?.settings

  const change = (update) => {
    setDraft((prev) => update(prev || data.settings))
    setSaved(false)
  }

  const updateGeneral = (field, value) => change((p) => ({ ...p, [field]: value }))

  const updateNotification = (field) =>
    change((p) => ({ ...p, notifications: { ...p.notifications, [field]: !p.notifications[field] } }))

  const updatePrivacy = (field, value) =>
    change((p) => ({
      ...p,
      privacy: { ...p.privacy, [field]: typeof value === 'boolean' || value === undefined ? !p.privacy[field] : value },
    }))

  const handleSave = async () => {
    if (!settings || saving) return
    setSaving(true)
    setSaveError('')
    try {
      const res = await api.updateSettings(editable(settings), 'seller')
      setData({ settings: res.settings })
      setDraft(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex h-full items-center justify-center">
        {error ? (
          <div className="text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={reload} className="mt-3 rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
              Try again
            </button>
          </div>
        ) : (
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        )}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account preferences and privacy.</p>

        <div className="mt-6 space-y-6">
          {/* General Settings */}
          <Card icon={SettingsIcon} title="General Settings" subtitle="Manage your general preferences.">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex-1">
                <SettingColumn
                  icon={<Globe className="h-5 w-5 text-brand-600" />}
                  label="Language"
                  desc="Choose your preferred language."
                  value={settings.language}
                  onChange={(v) => updateGeneral('language', v)}
                  options={['English', 'Hindi', 'Marathi']}
                />
              </div>
              <div className="hidden w-px bg-slate-200 sm:block" />
              <div className="flex-1">
                <SettingColumn
                  icon={<Clock className="h-5 w-5 text-brand-600" />}
                  label="Timezone"
                  desc="Select your current timezone."
                  value={settings.timezone}
                  onChange={(v) => updateGeneral('timezone', v)}
                  options={['(GMT+05:30) Asia/Kolkata', '(GMT+00:00) UTC', '(GMT-05:00) America/New_York']}
                />
              </div>
              <div className="hidden w-px bg-slate-200 sm:block" />
              <div className="flex-1">
                <SettingColumn
                  icon={<Calendar className="h-5 w-5 text-brand-600" />}
                  label="Date Format"
                  desc="Choose how dates are displayed."
                  value={settings.dateFormat}
                  onChange={(v) => updateGeneral('dateFormat', v)}
                  options={['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']}
                />
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card icon={Bell} title="Notification Settings" subtitle="Choose what you want to be notified about.">
            <div className="divide-y divide-slate-100">
              <NotificationRow
                icon={<Truck className="h-5 w-5 text-brand-600" />}
                title="Collection Updates"
                desc="Get notified about collection scheduling, rescheduling and completions."
                enabled={settings.notifications.collectionUpdates}
                onToggle={() => updateNotification('collectionUpdates')}
              />
              <NotificationRow
                icon={<MessageSquare className="h-5 w-5 text-brand-600" />}
                title="Messages"
                desc="Get notified when you receive new messages."
                enabled={settings.notifications.messages}
                onToggle={() => updateNotification('messages')}
              />
              <NotificationRow
                icon={<FileText className="h-5 w-5 text-brand-600" />}
                title="Request Updates"
                desc="Get notified about request status changes."
                enabled={settings.notifications.requestUpdates}
                onToggle={() => updateNotification('requestUpdates')}
              />
            </div>
          </Card>

          {/* Privacy Settings */}
          <Card icon={Shield} title="Privacy Settings" subtitle="Manage your privacy preferences.">
            <div className="divide-y divide-slate-100">
              <PrivacyRow
                icon={<User className="h-5 w-5 text-brand-600" />}
                title="Profile Visibility"
                desc="Control who can see your profile."
                value={settings.privacy.profileVisibility}
                onChange={(v) => updatePrivacy('profileVisibility', v)}
                options={['Public', 'Verified Recyclers Only', 'Private']}
              />
              <PrivacyRow
                icon={<Phone className="h-5 w-5 text-brand-600" />}
                title="Show Contact Information"
                desc="Show your phone number to recyclers."
                enabled={settings.privacy.showContactInformation}
                onToggle={() => updatePrivacy('showContactInformation')}
              />
            </div>
          </Card>

          {/* Save button */}
          <div className="flex items-center justify-end gap-3">
            {saveError && (
              <span className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {saveError}
              </span>
            )}
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-brand-600">
                <CheckCircle2 className="h-4 w-4" />
                Settings saved successfully.
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !draft}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Card({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
          <Icon className="h-5 w-5 text-brand-600" strokeWidth={1.8} />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  )
}

function SettingColumn({ icon, label, desc, value, onChange, options }) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">{icon}</span>
        <div>
          <p className="text-sm font-bold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function NotificationRow({ icon, title, desc, enabled, onToggle }) {
  return (
    <div className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button onClick={onToggle} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-brand-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}

function PrivacyRow({ icon, title, desc, value, onChange, options, enabled, onToggle }) {
  return (
    <div className="flex items-center gap-4 py-5 first:pt-0 last:pb-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-500"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <button onClick={onToggle} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? 'bg-brand-600' : 'bg-slate-300'}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      )}
    </div>
  )
}
