import { ArrowRight, HelpCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const FAQS = [
  {
    question: 'How do I sell my plastic?',
    answer: 'Visit our How It Works page to learn the simple steps.',
    link: '/how-it-works',
    linkLabel: 'Learn More',
  },
  {
    question: 'How do payments work?',
    answer: 'Payments are made securely after pickup and verification.',
    link: '#',
    linkLabel: 'Learn More',
  },
  {
    question: 'Is it safe to use EcoCycle?',
    answer: 'Yes! We verify all users and ensure safe and secure transactions.',
    link: '#',
    linkLabel: 'Learn More',
  },
  {
    question: 'Still have questions?',
    answer: "Contact our support team. We're happy to help!",
    link: '/contact',
    linkLabel: 'Contact Support',
  },
]

export default function ContactFAQ() {
  return (
    <section className="bg-brand-50/50">
      <div className="mx-auto max-w-app px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <span className="mx-auto mt-3 block h-1 w-12 rounded-full bg-brand-600" />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FAQS.map(({ question, answer, link, linkLabel }) => (
            <div
              key={question}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                <HelpCircle
                  className="h-6 w-6 text-brand-600"
                  strokeWidth={1.8}
                />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {question}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                {answer}
              </p>
              <Link
                to={link}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
              >
                {linkLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
