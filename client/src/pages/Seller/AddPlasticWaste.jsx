import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Eye,
  FileText,
  ImagePlus,
  Leaf,
  MapPin,
  Recycle,
  Send,
  Trash2,
  Upload,
} from 'lucide-react'
import api, { assetUrl } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const PLASTIC_TYPES = ['PET', 'HDPE', 'PVC', 'LDPE', 'PP', 'PS', 'Mixed', 'Other']
const UNITS = ['Kilogram (kg)', 'Gram (g)', 'Ton', 'Piece']
const CONDITIONS = ['Clean', 'Dirty', 'Mixed', 'Contaminated']
const COLLECTION_TYPES = ['Household', 'Commercial', 'Industrial', 'Street Collection', 'Market', 'Other']
const AVAILABILITY_OPTIONS = ['Immediately', 'Within 1 day', 'Within 1 week', 'Within 1 month', 'Scheduled pickup']
const MAX_IMAGES = 5
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const TIPS = [
  'Provide accurate quantity',
  'Add clear photos',
  'Mention the condition',
  'Set a fair expected price',
  'Share your exact location',
]

const initialForm = {
  title: '',
  plasticType: '',
  quantity: '',
  unit: 'Kilogram (kg)',
  price: '',
  location: '',
  description: '',
  condition: '',
  collectionType: '',
  availability: '',
  additionalInfo: '',
}

// Photos are either already stored ({ url }) or picked in this session ({ file, preview })
const photoSrc = (photo) => photo.preview || assetUrl(photo.url)

export default function AddPlasticWaste() {
  const { edit: editParam } = useSearch({ strict: false })
  const editId = editParam ? String(editParam) : null
  const { seller } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [photos, setPhotos] = useState([])
  const [errors, setErrors] = useState({})
  const [photoError, setPhotoError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loadingListing, setLoadingListing] = useState(Boolean(editId))
  const fileInputRef = useRef(null)
  const photosRef = useRef(photos)
  const navigate = useNavigate()

  // Release object URLs created for previews
  useEffect(() => {
    photosRef.current = photos
  }, [photos])
  useEffect(() => () => photosRef.current.forEach((p) => p.preview && URL.revokeObjectURL(p.preview)), [])

  // Edit mode: load the seller's own listing
  useEffect(() => {
    if (!editId) return
    let cancelled = false
    api.getListing(editId)
      .then(({ listing }) => {
        if (cancelled) return
        setForm({
          title: listing.title || '',
          plasticType: listing.plasticType || '',
          quantity: String(listing.quantity ?? ''),
          unit: listing.unit || 'Kilogram (kg)',
          price: String(listing.pricePerKg ?? ''),
          location: listing.location || '',
          description: listing.description || '',
          condition: listing.condition || '',
          collectionType: listing.collectionType || '',
          availability: listing.availability || '',
          additionalInfo: listing.additionalInfo || '',
        })
        const stored = listing.images?.length ? listing.images : [listing.image]
        setPhotos(stored.filter((url) => assetUrl(url)).map((url) => ({ url })))
      })
      .catch((error) => !cancelled && setSubmitError(error.message))
      .finally(() => !cancelled && setLoadingListing(false))
    return () => { cancelled = true }
  }, [editId])

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleImageUpload = (files) => {
    setPhotoError('')
    const picked = Array.from(files)
    const valid = picked.filter((f) => ['image/jpeg', 'image/png'].includes(f.type) && f.size <= MAX_IMAGE_BYTES)
    if (valid.length < picked.length) setPhotoError('Only JPG or PNG images up to 5MB are allowed.')
    const room = MAX_IMAGES - photos.length
    if (valid.length > room) setPhotoError(`You can add at most ${MAX_IMAGES} photos.`)
    const added = valid.slice(0, Math.max(room, 0)).map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setPhotos((prev) => [...prev, ...added])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleImageUpload(e.dataTransfer.files)
  }

  const removeImage = (idx) => {
    setPhotos((prev) => {
      const removed = prev[idx]
      if (removed?.preview) URL.revokeObjectURL(removed.preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (form.title.length > 60) errs.title = 'Max 60 characters'
    if (!form.plasticType) errs.plasticType = 'Select plastic type'
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'Enter valid quantity'
    if (!form.price || Number(form.price) <= 0) errs.price = 'Enter valid price'
    if (!form.location.trim()) errs.location = 'Location is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (form.description.length > 500) errs.description = 'Max 500 characters'
    if (!form.condition) errs.condition = 'Select condition'
    if (!form.collectionType) errs.collectionType = 'Select collection type'
    if (!form.availability) errs.availability = 'Select availability'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePublish = async () => {
    if (submitting || !validate()) return
    setSubmitting(true)
    setSubmitError('')
    let uploaded = []

    try {
      // Upload new photos first so the listing only references stored images
      const newFiles = photos.filter((p) => p.file).map((p) => p.file)
      uploaded = newFiles.length > 0 ? await api.uploadImages(newFiles) : []
      let next = 0
      const images = photos.map((p) => (p.file ? uploaded[next++].url : p.url))

      const payload = {
        title: form.title.trim(),
        plasticType: form.plasticType,
        quantity: Number(form.quantity),
        unit: form.unit,
        pricePerKg: Number(form.price),
        location: form.location.trim(),
        description: form.description.trim(),
        condition: form.condition,
        collectionType: form.collectionType,
        availability: form.availability,
        additionalInfo: form.additionalInfo.trim(),
        images,
      }

      if (editId) await api.updateListing(editId, payload)
      else await api.createListing(payload)

      setSuccess(true)
      setTimeout(() => navigate({ to: '/seller/dashboard/listings' }), 2000)
    } catch (error) {
      // The listing was not saved, so photos uploaded for it would be left unused
      if (uploaded.length > 0) api.discardUploads(uploaded)
      setSubmitError(error.message || 'Could not save the listing. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const profileLocation = [seller?.city, seller?.pincode].filter(Boolean).join(' ') || seller?.pickupAddress

  if (success) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-brand-600" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">{editId ? 'Listing Updated!' : 'Listing Submitted!'}</h2>
          <p className="mt-2 text-sm text-slate-500">It will be visible to buyers once it is approved.</p>
          <p className="mt-1 text-sm text-slate-500">Redirecting to My Listings...</p>
        </div>
      </div>
    )
  }

  if (loadingListing) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/seller/dashboard" className="transition-colors hover:text-brand-600">Home</Link>
          <span className="text-slate-300">›</span>
          <span className="font-medium text-slate-700">{editId ? 'Edit Listing' : 'Add Plastic Waste'}</span>
        </nav>

        <div className="mt-4">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{editId ? 'Edit Listing' : 'Add Plastic Waste'}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {editId
              ? 'Saving changes sends the listing back for review before buyers can see it again.'
              : 'Provide accurate details to help recycling companies find your waste.'}
          </p>
        </div>

        {submitError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {submitError}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* ── Left: Form ── */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Section icon={FileText} title="Basic Information">
              <Field label="Listing Title" required error={errors.title}>
                <input
                  type="text"
                  placeholder="Example: Used PET Bottles"
                  value={form.title}
                  onChange={update('title')}
                  maxLength={60}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <span className="mt-1 text-right text-xs text-slate-400">{form.title.length} / 60</span>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Plastic Type" required error={errors.plasticType}>
                  <select value={form.plasticType} onChange={update('plasticType')} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                    <option value="">Select plastic type</option>
                    {PLASTIC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Quantity" required error={errors.quantity}>
                  <div className="flex">
                    <input type="number" placeholder="Enter quantity" value={form.quantity} onChange={update('quantity')} min="0" className="w-full rounded-l-xl border border-r-0 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                    <span className="flex items-center rounded-r-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">kg</span>
                  </div>
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Unit" required>
                  <select value={form.unit} onChange={update('unit')} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </Field>
                <Field label="Expected Price (₹)" required error={errors.price}>
                  <div className="flex">
                    <input type="number" placeholder="Enter price per unit" value={form.price} onChange={update('price')} min="0" className="w-full rounded-l-xl border border-r-0 border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                    <span className="flex items-center rounded-r-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">/ unit</span>
                  </div>
                </Field>
              </div>

              <Field label="Location" required error={errors.location}>
                <div className="flex gap-3">
                  <input type="text" placeholder="Enter city or area" value={form.location} onChange={update('location')} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                  {profileLocation && (
                    <button type="button" onClick={() => setForm((p) => ({ ...p, location: profileLocation }))} className="flex shrink-0 items-center gap-2 rounded-xl border border-brand-300 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100">
                      <MapPin className="h-4 w-4" />
                      <span className="hidden sm:inline">Use Profile Location</span>
                    </button>
                  )}
                </div>
              </Field>

              <Field label="Detailed Description" required error={errors.description}>
                <textarea rows={4} placeholder="Describe the condition, source, and any other important details..." value={form.description} onChange={update('description')} maxLength={500} className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                <span className="mt-1 text-right text-xs text-slate-400">{form.description.length} / 500</span>
              </Field>
            </Section>

            {/* Waste Details */}
            <Section icon={Recycle} title="Waste Details">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Condition" required error={errors.condition}>
                  <select value={form.condition} onChange={update('condition')} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                    <option value="">Select condition</option>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Collection Type" required error={errors.collectionType}>
                  <select value={form.collectionType} onChange={update('collectionType')} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                    <option value="">Select collection type</option>
                    {COLLECTION_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Availability" required error={errors.availability}>
                <select value={form.availability} onChange={update('availability')} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                  <option value="">When is the waste available?</option>
                  {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </Field>
            </Section>

            {/* Photos */}
            <Section icon={Camera} title="Photos" subtitle="Add clear photos of your plastic waste">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition-colors hover:border-brand-400 hover:bg-brand-50/30"
              >
                <Upload className="h-10 w-10 text-brand-500" strokeWidth={1.5} />
                <p className="text-sm font-medium text-slate-700">
                  <span className="text-brand-600">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-slate-400">PNG, JPG up to 5MB each (Max 5 images)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                multiple
                className="hidden"
                onChange={(e) => { handleImageUpload(e.target.files); e.target.value = '' }}
              />
              {photoError && <p className="mt-2 text-xs text-red-500">{photoError}</p>}

              {/* Image previews */}
              <div className="mt-4 grid grid-cols-5 gap-3">
                {Array.from({ length: MAX_IMAGES }).map((_, idx) => (
                  <div key={idx} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {photos[idx] ? (
                      <>
                        <img src={photoSrc(photos[idx])} alt="" className="h-full w-full object-cover" />
                        <button type="button" aria-label="Remove photo" onClick={() => removeImage(idx)} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImagePlus className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>

            {/* Additional Info */}
            <Section icon={Leaf} title="Additional Information" subtitle="Any extra information that might be helpful">
              <textarea rows={3} placeholder="Example: Regular supply, easy loading, material is clean..." value={form.additionalInfo} onChange={update('additionalInfo')} maxLength={300} className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              <span className="mt-1 text-right text-xs text-slate-400">{form.additionalInfo.length} / 300</span>
            </Section>

            {/* Bottom actions */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Link to="/seller/dashboard/listings" className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                Cancel
              </Link>
              <button onClick={handlePublish} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper disabled:opacity-50">
                {submitting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-4 w-4" />}
                {submitting ? 'Saving...' : editId ? 'Save Changes' : 'Publish Listing'}
              </button>
            </div>
          </div>

          {/* ── Right: Tips + Preview ── */}
          <div className="space-y-6">
            {/* Tips */}
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100">
                  <Leaf className="h-3.5 w-3.5 text-brand-600" />
                </span>
                Tips for better listings
              </h3>
              <ul className="mt-4 space-y-3">
                {TIPS.map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {tip}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex justify-center">
                <Recycle className="h-16 w-16 text-brand-300 opacity-50" strokeWidth={1} />
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Eye className="h-4 w-4 text-slate-500" />
                Preview
              </h3>
              {form.title || form.plasticType ? (
                <div className="mt-4 space-y-3">
                  {form.title && (
                    <div>
                      <p className="text-xs text-slate-400">Title</p>
                      <p className="text-sm font-semibold text-slate-900">{form.title}</p>
                    </div>
                  )}
                  {form.plasticType && (
                    <div>
                      <p className="text-xs text-slate-400">Type</p>
                      <p className="text-sm font-semibold text-slate-900">{form.plasticType}</p>
                    </div>
                  )}
                  {form.quantity && (
                    <div>
                      <p className="text-xs text-slate-400">Quantity</p>
                      <p className="text-sm font-semibold text-slate-900">{form.quantity} {form.unit}</p>
                    </div>
                  )}
                  {form.price && (
                    <div>
                      <p className="text-xs text-slate-400">Price</p>
                      <p className="text-sm font-semibold text-slate-900">₹{form.price} / unit</p>
                    </div>
                  )}
                  {form.location && (
                    <div>
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="text-sm font-semibold text-slate-900">{form.location}</p>
                    </div>
                  )}
                  {form.condition && (
                    <div>
                      <p className="text-xs text-slate-400">Condition</p>
                      <p className="text-sm font-semibold text-slate-900">{form.condition}</p>
                    </div>
                  )}
                  {photos[0] && (
                    <img src={photoSrc(photos[0])} alt="" className="mt-2 h-32 w-full rounded-xl object-cover" />
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-400">Your listing preview will appear here</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100">
          <Icon className="h-4.5 w-4.5 text-brand-600" strokeWidth={2} />
        </span>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>
      {subtitle && <p className="mt-1 ml-[42px] text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-5 space-y-5">
        {children}
      </div>
    </div>
  )
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
