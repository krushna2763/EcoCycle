import { Link } from '@tanstack/react-router'
import { Mail, MapPin, Phone, Recycle } from 'lucide-react'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from '../common/SocialIcons'

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Categories', to: '/categories' },
  { label: 'Impact', to: '/impact' },
  { label: 'Contact', to: '/contact' },
]

const SELLER_LINKS = [
  { label: 'Register as Seller', to: '/register-seller' },
  { label: 'Seller Guidelines', href: '#' },
  { label: 'Pricing Guide', href: '#' },
  { label: 'Help Center', href: '#' },
]

const BUYER_LINKS = [
  { label: 'Register as Buyer', to: '/signup' },
  { label: 'How to Buy', href: '#' },
  { label: 'Bulk Solutions', href: '#' },
  { label: 'Partner With Us', href: '#' },
]

const SOCIALS = [
  { label: 'Facebook', icon: FacebookIcon, href: '#' },
  { label: 'Twitter', icon: TwitterIcon, href: '#' },
  { label: 'Instagram', icon: InstagramIcon, href: '#' },
  { label: 'LinkedIn', icon: LinkedInIcon, href: '#' },
]

function FooterLink({ item }) {
  if (item.to) {
    return (
      <Link
        to={item.to}
        className="text-sm text-white/80 transition-colors hover:text-white"
      >
        {item.label}
      </Link>
    )
  }
  return (
    <a
      href={item.href}
      className="text-sm text-white/80 transition-colors hover:text-white"
    >
      {item.label}
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#0a5c36] text-white">
      <div className="mx-auto max-w-app px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & socials */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Recycle className="h-5 w-5 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-2xl font-bold tracking-tight text-white">
                EcoCycle
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">
              Connecting waste generators with responsible recyclers. Clean
              Earth, Better Tomorrow.
            </p>
            <div className="mt-5 flex gap-3">
              {SOCIALS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#07452a] text-white transition-colors hover:bg-[#052e1c]"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((item) => (
                <li key={item.label}>
                  <FooterLink item={item} />
                </li>
              ))}
            </ul>
          </div>

          {/* For Sellers / For Buyers */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              For Sellers
            </h4>
            <ul className="mt-4 space-y-2.5">
              {SELLER_LINKS.map((item) => (
                <li key={item.label}>
                  <FooterLink item={item} />
                </li>
              ))}
            </ul>
            <h4 className="mt-7 text-sm font-bold uppercase tracking-wider text-white">
              For Buyers
            </h4>
            <ul className="mt-4 space-y-2.5">
              {BUYER_LINKS.map((item) => (
                <li key={item.label}>
                  <FooterLink item={item} />
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact Info
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Mail className="h-4 w-4 shrink-0 text-emerald-300" />
                support@ecocycle.com
              </li>
              <li className="flex items-center gap-3 text-sm text-white/80">
                <Phone className="h-4 w-4 shrink-0 text-emerald-300" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-3 text-sm text-white/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>
                  Baner, Pune - 411045,
                  <br />
                  Maharashtra, India
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-app px-4 py-5 text-center text-sm text-white/70">
          © {new Date().getFullYear()} EcoCycle. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
