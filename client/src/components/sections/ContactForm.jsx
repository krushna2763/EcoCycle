import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'

const CONTACT_INFO = [
  {
    icon: Mail,
    title: 'Email Us',
    primary: 'support@ecocycle.com',
    secondary: "We'll get back to you as soon as possible.",
  },
  {
    icon: Phone,
    title: 'Call Us',
    primary: '+91 98765 43210',
    secondary: 'Mon - Sat, 9:00 AM – 6:00 PM',
  },
  {
    icon: MapPin,
    title: 'Our Location',
    primary: 'EcoCycle Pvt. Ltd.',
    secondary: 'Baner, Pune – 411045, Maharashtra, India',
  },
  {
    icon: Clock,
    title: 'Business Hours',
    primary: 'Monday – Saturday',
    secondary: '9:00 AM – 6:00 PM',
  },
]

const SUBJECTS = [
  'Select a subject',
  'General Inquiry',
  'Seller Support',
  'Buyer Support',
  'Partnership',
  'Feedback',
  'Other',
]

export default function ContactForm() {
  return (
    <section className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left — Contact Info */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Get in Touch
          </h2>
          <span className="mt-3 block h-1 w-12 rounded-full bg-brand-600" />

          <div className="mt-8 space-y-5">
            {CONTACT_INFO.map(({ icon: Icon, title, primary, secondary }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50">
                  <Icon
                    className="h-6 w-6 text-brand-600"
                    strokeWidth={1.8}
                  />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-sm font-semibold text-brand-700">
                    {primary}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">{secondary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Contact Form */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Send Us a Message
          </h2>
          <span className="mt-3 block h-1 w-12 rounded-full bg-brand-600" />

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Your Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Subject
              </label>
              <select
                id="subject"
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject} disabled={subject === 'Select a subject'}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Type your message here..."
                className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-deep px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-deeper sm:w-auto"
            >
              Send Message
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
