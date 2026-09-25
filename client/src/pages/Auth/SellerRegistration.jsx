import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Leaf,
  MapPin,
  Recycle,
  ShieldCheck,
  Store,
  Upload,
  User,
} from 'lucide-react'
import ProgressStepper from '../../components/common/ProgressStepper'
import FormField from '../../components/common/FormField'
import SellerTypeCard from '../../components/common/SellerTypeCard'
import BenefitsList from '../../components/common/BenefitsList'
import PlasticTypeChips from '../../components/common/PlasticTypeChips'
import FileUpload from '../../components/common/FileUpload'
import ImageWithFallback from '../../components/common/ImageWithFallback'
import heroImg from '../../assets/impact/livelihood.png'
import congImg from '../../assets/cong.png'

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Verified & Trusted Buyers',
    description: 'Connect with verified and trusted buyers.',
  },
  {
    icon: Store,
    title: 'Best Prices',
    description: 'Get the best market prices for your waste.',
  },
  {
    icon: MapPin,
    title: 'Easy Pickup',
    description: 'Buyers will pickup waste from your location.',
  },
  {
    icon: Leaf,
    title: 'Better Environment',
    description: 'Be a part of a cleaner and sustainable tomorrow.',
  },
]

const COLLECTION_OPTIONS = [
  'Select an option',
  'Household waste',
  'Market collection',
  'Office/commercial waste',
  'Industrial waste',
  'Street/road collection',
  'Other',
]

const QUANTITY_OPTIONS = [
  'Select quantity range',
  'Less than 10 kg',
  '10 – 50 kg',
  '50 – 100 kg',
  '100 – 500 kg',
  'More than 500 kg',
]

const BUSINESS_TYPES = [
  'Select business type',
  'Recycling Center',
  'Scrap Shop',
  'Waste Management Company',
  'Manufacturing Unit',
  'Wholesaler',
  'Other',
]

const YEAR_OPTIONS = [
  'Select year',
  ...Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i)),
]

const EMPLOYEE_OPTIONS = [
  'Select range',
  '1 – 5',
  '6 – 20',
  '21 – 50',
  '51 – 200',
  '200+',
]

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}

function NextStep({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50">
        <Icon className="h-4.5 w-4.5 text-brand-600" strokeWidth={2} />
      </span>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  )
}

export default function SellerRegistration() {
  const [step, setStep] = useState(1)
  const [sellerType, setSellerType] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()

  // Step 1
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Step 3 — Individual
  const [individual, setIndividual] = useState({
    city: '',
    pincode: '',
    address: '',
    plasticTypes: [],
    collectionSource: '',
    avgQuantity: '',
    additionalInfo: '',
  })

  // Step 4 — Individual verification
  const [idType, setIdType] = useState('Aadhaar Card')
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [aadhaarFile, setAadhaarFile] = useState(null)

  // Step 4 — Business verification
  const [bizDocType, setBizDocType] = useState('gst')
  const [bizDocFile, setBizDocFile] = useState(null)
  const [panFile, setPanFile] = useState(null)

  // Step 3 — Business
  const [business, setBusiness] = useState({
    businessName: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    yearOfEstablishment: '',
    numberOfEmployees: '',
    businessAddress: '',
    city: '',
    pincode: '',
    plasticTypes: [],
    businessDescription: '',
  })

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const updateIndividual = (field) => (e) =>
    setIndividual((prev) => ({ ...prev, [field]: e.target.value }))

  const updateBusiness = (field) => (e) =>
    setBusiness((prev) => ({ ...prev, [field]: e.target.value }))

  const canContinue =
    step === 1
      ? form.fullName && form.phone && form.email && form.password && form.confirmPassword
      : step === 2
        ? sellerType !== null
        : step === 3
          ? sellerType === 'individual'
            ? individual.city && individual.pincode && individual.address && individual.plasticTypes.length > 0
            : business.businessName && business.businessType && business.businessAddress && business.city && business.pincode && business.plasticTypes.length > 0
          : true

  return (
    <div className="min-h-screen bg-[#f8faf8]">
      <div className="mx-auto max-w-app px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
          {/* ── Left Panel ── */}
          <aside className="flex flex-col items-center lg:items-start">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Join as a{' '}
              <span className="text-brand-600">
                Seller{' '}
                <Leaf className="mb-0.5 inline-block h-5 w-5 text-brand-500" strokeWidth={2.5} />
              </span>
            </h2>
            <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-slate-500">
              Create your seller account and start selling recyclable plastic
              waste to verified buyers.
            </p>
            <div className="mt-6 w-full max-w-[260px] overflow-hidden rounded-2xl">
              <ImageWithFallback
                src={heroImg}
                alt="EcoCycle seller illustration"
                className="h-auto w-full object-contain"
                fallback={<Recycle className="mx-auto h-20 w-20 text-brand-500" strokeWidth={1.5} />}
              />
            </div>
            <div className="mt-6 w-full max-w-[260px]">
              <BenefitsList benefits={BENEFITS} />
            </div>
          </aside>

          {/* ── Right Panel ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Seller Registration
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {step === 1
                ? 'Fill in your details to create your seller account.'
                : 'Create your seller account in a few simple steps.'}
            </p>

            <div className="mt-8">
              <ProgressStepper currentStep={step} />
            </div>

            {submitError && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {submitError}
              </div>
            )}

            {/* ══════════════════════════════════════════ STEP 1 ══════════════════════════════════════════ */}
            {step === 1 && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-slate-900">Account Information</h2>
                <p className="mt-1 text-sm text-slate-500">Enter your basic details to get started.</p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <FormField label="Full Name" id="fullName" placeholder="Enter your full name" icon={User} required value={form.fullName} onChange={update('fullName')} />
                  <FormField label="Phone Number" id="phone" type="tel" placeholder="Enter your phone number" required value={form.phone} onChange={update('phone')} rightElement={<span className="text-xs font-medium text-slate-400">+91</span>} />
                </div>
                <div className="mt-5">
                  <FormField label="Email Address" id="email" type="email" placeholder="Enter your email address" required value={form.email} onChange={update('email')} />
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <FormField label="Password" id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" required value={form.password} onChange={update('password')} rightElement={<button type="button" onClick={() => setShowPassword((p) => !p)} className="text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}</button>} />
                  <FormField label="Confirm Password" id="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Confirm your password" required value={form.confirmPassword} onChange={update('confirmPassword')} rightElement={<button type="button" onClick={() => setShowConfirm((p) => !p)} className="text-slate-400 hover:text-slate-600">{showConfirm ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}</button>} />
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <p className="text-sm text-slate-600">We will never share your personal information with anyone. Your data is safe and secure with us.</p>
                </div>

                <div className="mt-8 flex justify-end">
                  <button type="button" onClick={() => canContinue && setStep(2)} disabled={!canContinue} className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper disabled:cursor-not-allowed disabled:opacity-50">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════ STEP 2 ══════════════════════════════════════════ */}
            {step === 2 && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-slate-900">Select Seller Type</h2>
                <p className="mt-1 text-sm text-slate-500">Choose the option that best describes you.</p>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <SellerTypeCard icon={User} title="Individual Seller" description="I am an individual and sell plastic waste from my home or personal source." badge="For Individuals" selected={sellerType === 'individual'} onSelect={() => setSellerType('individual')} />
                  <SellerTypeCard icon={Building2} title="Business Seller" description="I represent a shop, recycling center or company that deals in plastic waste." badge="For Businesses" selected={sellerType === 'business'} onSelect={() => setSellerType('business')} />
                </div>

                <div className="mt-10 flex items-center justify-between">
                  <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={() => canContinue && setStep(3)} disabled={!canContinue} className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper disabled:cursor-not-allowed disabled:opacity-50">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════ STEP 3 — INDIVIDUAL ══════════════════════════════════════════ */}
            {step === 3 && sellerType === 'individual' && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-slate-900">Individual Seller Details</h2>
                <p className="mt-1 text-sm text-slate-500">Tell us more about yourself and your selling preferences.</p>

                {/* Location */}
                <h3 className="mt-8 text-base font-bold text-slate-900">Location Information</h3>
                <p className="mt-0.5 text-xs text-slate-500">Where will we pick up plastic waste?</p>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <FormField label="City" id="ind-city" placeholder="Enter city name" required value={individual.city} onChange={updateIndividual('city')} />
                  <FormField label="Pincode" id="ind-pincode" placeholder="Enter pincode" required value={individual.pincode} onChange={updateIndividual('pincode')} />
                </div>
                <div className="mt-5">
                  <FormField label="Pickup Address" id="ind-address" placeholder="Enter your complete address" required value={individual.address} onChange={updateIndividual('address')} />
                </div>

                {/* Plastic types */}
                <h3 className="mt-8 text-base font-bold text-slate-900">Plastic Waste Information</h3>
                <p className="mt-0.5 text-xs text-slate-500">What type of plastic waste do you usually sell?</p>
                <div className="mt-4">
                  <PlasticTypeChips selected={individual.plasticTypes} onChange={(types) => setIndividual((p) => ({ ...p, plasticTypes: types }))} />
                </div>

                {/* Additional info */}
                <h3 className="mt-8 text-base font-bold text-slate-900">Additional Information <span className="text-sm font-normal text-slate-400">(Optional)</span></h3>

                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">How did you collect this plastic waste?</label>
                    <select value={individual.collectionSource} onChange={updateIndividual('collectionSource')} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                      {COLLECTION_OPTIONS.map((o) => <option key={o} disabled={o === 'Select an option'}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Average quantity you have per month</label>
                    <select value={individual.avgQuantity} onChange={updateIndividual('avgQuantity')} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                      {QUANTITY_OPTIONS.map((o) => <option key={o} disabled={o === 'Select quantity range'}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Anything else you want to tell buyers?</label>
                  <textarea rows={3} placeholder="Write anything about your collection, quality, etc." value={individual.additionalInfo} onChange={updateIndividual('additionalInfo')} className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={() => canContinue && setStep(4)} disabled={!canContinue} className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper disabled:cursor-not-allowed disabled:opacity-50">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-4 text-center text-xs text-slate-400">Don&apos;t worry, you can always update this information later from your profile.</p>
              </div>
            )}

            {/* ══════════════════════════════════════════ STEP 3 — BUSINESS ══════════════════════════════════════════ */}
            {step === 3 && sellerType === 'business' && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-slate-900">Business Seller Details</h2>
                <p className="mt-1 text-sm text-slate-500">Tell us more about your business.</p>

                {/* Business Info */}
                <h3 className="mt-8 text-base font-bold text-slate-900">Business Information</h3>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <FormField label="Business Name" id="biz-name" placeholder="Enter business name" required value={business.businessName} onChange={updateBusiness('businessName')} />
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Business Type <span className="text-red-500">*</span></label>
                    <select value={business.businessType} onChange={updateBusiness('businessType')} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                      {BUSINESS_TYPES.map((o) => <option key={o} disabled={o === 'Select business type'}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <FormField label="GST Number" id="biz-gst" placeholder="Enter GST number" value={business.gstNumber} onChange={updateBusiness('gstNumber')} />
                  <FormField label="PAN Number" id="biz-pan" placeholder="Enter PAN number" value={business.panNumber} onChange={updateBusiness('panNumber')} />
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Year of Establishment</label>
                    <select value={business.yearOfEstablishment} onChange={updateBusiness('yearOfEstablishment')} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                      {YEAR_OPTIONS.map((o) => <option key={o} disabled={o === 'Select year'}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Number of Employees</label>
                    <select value={business.numberOfEmployees} onChange={updateBusiness('numberOfEmployees')} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20">
                      {EMPLOYEE_OPTIONS.map((o) => <option key={o} disabled={o === 'Select range'}>{o}</option>)}
                    </select>
                  </div>
                </div>

                {/* Business Address */}
                <h3 className="mt-8 text-base font-bold text-slate-900">Business Address</h3>
                <div className="mt-4">
                  <FormField label="Business Address" id="biz-address" placeholder="Complete business address" required value={business.businessAddress} onChange={updateBusiness('businessAddress')} />
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <FormField label="City" id="biz-city" placeholder="Enter city name" required value={business.city} onChange={updateBusiness('city')} />
                  <FormField label="Pincode" id="biz-pincode" placeholder="Enter pincode" required value={business.pincode} onChange={updateBusiness('pincode')} />
                </div>

                {/* Plastic types */}
                <h3 className="mt-8 text-base font-bold text-slate-900">Plastic Waste Information</h3>
                <p className="mt-0.5 text-xs text-slate-500">What type of plastic waste do you deal in?</p>
                <div className="mt-4">
                  <PlasticTypeChips selected={business.plasticTypes} onChange={(types) => setBusiness((p) => ({ ...p, plasticTypes: types }))} />
                </div>

                {/* Business Description */}
                <h3 className="mt-8 text-base font-bold text-slate-900">Business Description <span className="text-sm font-normal text-slate-400">(Optional)</span></h3>
                <div className="mt-4">
                  <textarea rows={3} placeholder="Write about your business, services, quality standards, etc." value={business.businessDescription} onChange={updateBusiness('businessDescription')} className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={() => canContinue && setStep(4)} disabled={!canContinue} className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper disabled:cursor-not-allowed disabled:opacity-50">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-4 text-center text-xs text-slate-400">Don&apos;t worry, you can always update this information later from your profile.</p>
              </div>
            )}

            {/* ══════════════════════════════════════════ STEP 4 — INDIVIDUAL VERIFICATION ══════════════════════════════════════════ */}
            {step === 4 && sellerType === 'individual' && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-slate-900">Verify Your Identity</h2>
                <p className="mt-1 text-sm text-slate-500">
                  To keep our platform safe and trustworthy, please verify your identity.
                </p>

                <div className="mt-8">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Select ID Type</label>
                  <select value={idType} onChange={(e) => setIdType(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 sm:w-80">
                    <option>Aadhaar Card</option>
                    <option>PAN Card</option>
                    <option>Voter ID</option>
                    <option>Driving License</option>
                  </select>
                </div>

                <div className="mt-6">
                  <FormField label="Aadhaar Card Number" id="aadhaar" placeholder="Enter your 12 digit Aadhaar number" required value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} icon={FileText} />
                </div>

                <div className="mt-6">
                  <FileUpload label="Upload Aadhaar Card" accept='.jpg,.jpeg,.png,.pdf' maxSize="5MB" file={aadhaarFile} onFile={setAadhaarFile} />
                  <p className="mt-2 text-xs text-slate-400">Please upload a clear photo of the front side of your Aadhaar card.</p>
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <p className="text-sm text-slate-600">Your information is secure and will only be used for verification purposes.</p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button type="button" onClick={() => setStep(3)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={async () => { setSubmitting(true); setSubmitError(''); try { const res = await fetch('http://localhost:5000/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: form.fullName, phone: form.phone, email: form.email, password: form.password, sellerType, city: individual.city, pincode: individual.pincode, pickupAddress: individual.address, plasticTypes: individual.plasticTypes, collectionSource: individual.collectionSource, averageQuantity: individual.avgQuantity, additionalNotes: individual.additionalInfo }) }); const data = await res.json(); if (!res.ok) { setSubmitError(data.message || 'Registration failed'); return; } localStorage.setItem('sellerToken', data.token); localStorage.setItem('sellerData', JSON.stringify(data.seller)); setStep(5); } catch { setStep(5); } finally { setSubmitting(false); } }} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit for Verification'} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════ STEP 4 — BUSINESS VERIFICATION ══════════════════════════════════════════ */}
            {step === 4 && sellerType === 'business' && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-slate-900">Verify Your Business</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Please provide your business documents to verify your business.
                </p>

                <h3 className="mt-8 text-base font-bold text-slate-900">Business Verification Documents</h3>
                <p className="mt-0.5 text-xs text-slate-500">Select one of the following documents</p>

                <div className="mt-4 space-y-3">
                  {[
                    { value: 'gst', label: 'GST Certificate' },
                    { value: 'registration', label: 'Business Registration Certificate' },
                    { value: 'shop', label: 'Shop & Establishment Certificate' },
                  ].map(({ value, label }) => (
                    <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-brand-300">
                      <input type="radio" name="bizDoc" value={value} checked={bizDocType === value} onChange={(e) => setBizDocType(e.target.value)} className="h-4 w-4 accent-brand-600" />
                      <span className="text-sm font-medium text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-6">
                  <FileUpload label="Upload Document" accept='.jpg,.jpeg,.png,.pdf' maxSize="5MB" file={bizDocFile} onFile={setBizDocFile} />
                  <p className="mt-2 text-xs text-slate-400">Please upload a clear copy of the selected document.</p>
                </div>

                <div className="mt-6">
                  <FileUpload label="PAN Card (Optional)" accept='.jpg,.jpeg,.png,.pdf' maxSize="5MB" file={panFile} onFile={setPanFile} />
                  <p className="mt-2 text-xs text-slate-400">Upload your PAN card for faster verification process.</p>
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <p className="text-sm text-slate-600">Your information is secure and will only be used for verification purposes.</p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button type="button" onClick={() => setStep(3)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:text-brand-700">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="button" onClick={async () => { setSubmitting(true); setSubmitError(''); try { const res = await fetch('http://localhost:5000/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName: form.fullName, phone: form.phone, email: form.email, password: form.password, sellerType, businessName: business.businessName, businessType: business.businessType, gstNumber: business.gstNumber, panNumber: business.panNumber, yearOfEstablishment: business.yearOfEstablishment, numberOfEmployees: business.numberOfEmployees, businessAddress: business.businessAddress, city: business.city, pincode: business.pincode, plasticTypes: business.plasticTypes, businessDescription: business.businessDescription }) }); const data = await res.json(); if (!res.ok) { setSubmitError(data.message || 'Registration failed'); return; } localStorage.setItem('sellerToken', data.token); localStorage.setItem('sellerData', JSON.stringify(data.seller)); setStep(5); } catch { setStep(5); } finally { setSubmitting(false); } }} disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit for Verification'} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════ STEP 5 — COMPLETE ══════════════════════════════════════════ */}
            {step === 5 && (
              <div className="mt-10">
                {/* Success illustration */}
                <div className="flex justify-center">
                  <div className="w-full max-w-[280px] overflow-hidden">
                    <ImageWithFallback
                      src={congImg}
                      alt="Registration complete"
                      className="h-auto w-full object-contain"
                      fallback={<CheckCircle2 className="mx-auto h-20 w-20 text-brand-600" />}
                    />
                  </div>
                </div>

                <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900">
                  Registration Completed!
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500">
                  {sellerType === 'individual'
                    ? 'Congratulations! Your seller account has been created successfully.'
                    : 'Congratulations! Your business seller account has been created successfully.'}
                </p>

                {/* Review notice */}
                <div className="mx-auto mt-6 flex max-w-lg items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <p className="text-sm text-slate-600">
                    {sellerType === 'individual'
                      ? 'Your account is now under review. We will verify your details and notify you once your account is approved.'
                      : 'Your account is now under review. We will verify your business documents and notify you once your account is approved.'}
                  </p>
                </div>

                {/* Account Summary */}
                <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">
                      {sellerType === 'individual' ? 'Your Account Summary' : 'Your Business Summary'}
                    </h3>
                    <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                      {sellerType === 'individual' ? 'Individual Seller' : 'Business Seller'}
                    </span>
                  </div>

                  <div className="mt-5 divide-y divide-slate-100">
                    {sellerType === 'individual' ? (
                      <>
                        <SummaryRow label="Seller Type" value="Individual" />
                        <SummaryRow label="Name" value={form.fullName || '—'} />
                        <SummaryRow label="Phone Number" value={form.phone ? `+91 ${form.phone}` : '—'} />
                        <SummaryRow label="Email Address" value={form.email || '—'} />
                        <SummaryRow label="Pickup Location" value={[individual.city, individual.address].filter(Boolean).join(', ') || '—'} />
                        <SummaryRow label="Plastic Types" value={individual.plasticTypes.join(', ') || '—'} />
                      </>
                    ) : (
                      <>
                        <SummaryRow label="Business Name" value={business.businessName || '—'} />
                        <SummaryRow label="Business Type" value={business.businessType || '—'} />
                        <SummaryRow label="Phone Number" value={form.phone ? `+91 ${form.phone}` : '—'} />
                        <SummaryRow label="Email Address" value={form.email || '—'} />
                        <SummaryRow label="Business Location" value={[business.city, business.businessAddress].filter(Boolean).join(', ') || '—'} />
                        <SummaryRow label="Plastic Types" value={business.plasticTypes.join(', ') || '—'} />
                      </>
                    )}
                  </div>
                </div>

                {/* What's Next */}
                <div className="mx-auto mt-8 max-w-lg">
                  <h3 className="text-base font-bold text-slate-900">What&apos;s Next?</h3>
                  <div className="mt-4 space-y-3">
                    <NextStep
                      icon={ShieldCheck}
                      title={sellerType === 'individual' ? 'We will verify your identity and details' : 'We will verify your business documents'}
                      description="This usually takes 1–3 business days."
                    />
                    <NextStep
                      icon={CheckCircle2}
                      title='You will receive an email/SMS once approved'
                      description="You can then start listing your plastic waste."
                    />
                    <NextStep
                      icon={Store}
                      title={sellerType === 'individual' ? 'Start selling and earn more' : 'Start selling and grow your business'}
                      description={sellerType === 'individual' ? 'Connect with buyers and get the best prices.' : 'Connect with more buyers and increase your earnings.'}
                    />
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="mx-auto mt-8 flex max-w-lg flex-col items-center gap-3">
                  <Link to="/seller/dashboard" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-deep px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-deeper">
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/" className="text-sm font-semibold text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-800">
                    Go to Home
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
