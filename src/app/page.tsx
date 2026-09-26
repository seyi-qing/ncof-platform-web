'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  WalletCards,
  CalendarDays,
  Vote,
  ShieldCheck,
  Bell,
  Landmark,
  ArrowRight,
  Check,
} from 'lucide-react'
import { getSession } from '@/lib/api'

const FEATURES = [
  {
    icon: Users,
    title: 'Members & roles',
    text: 'Member records, login accounts, and role-based access for admin, treasurer, secretary, and more.',
  },
  {
    icon: WalletCards,
    title: 'Dues & finance',
    text: 'Generate monthly dues, post payments, track outstanding balances, and keep a clear ledger.',
  },
  {
    icon: CalendarDays,
    title: 'Meetings',
    text: 'Schedule meetings, set agendas, record attendance, and capture minutes for the association.',
  },
  {
    icon: Vote,
    title: 'Elections',
    text: 'Secret-ballot style voting with positions, candidates, and results after the election closes.',
  },
  {
    icon: ShieldCheck,
    title: 'Governance',
    text: 'Committees, announcements, and shared documents in one controlled workspace.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    text: 'Broadcast updates to active members and let everyone manage what they want to hear about.',
  },
]

const AUDIENCE = [
  'Cooperatives and thrift societies',
  'Staff and professional associations',
  'Community savings groups',
  'Unions and welfare committees',
  'Any group that collects dues and holds meetings',
]

const STEPS = [
  { n: '1', title: 'Admin sets up members', text: 'Add members, create login accounts, assign roles.' },
  { n: '2', title: 'Run the monthly cycle', text: 'Generate dues, post payments, hold meetings, share announcements.' },
  { n: '3', title: 'Members stay informed', text: 'Check balances, receive notices, vote when elections open.' },
]

export default function HomePage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const s = getSession()
    if (s?.access_token) {
      router.replace('/dashboard')
      return
    }
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="landing-loading">
        <div className="logo">N</div>
      </div>
    )
  }

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="logo" aria-hidden>
              N
            </div>
            <div>
              <b>NCOF Platform</b>
              <span>Association operations</span>
            </div>
          </div>
          <div className="landing-nav-actions">
            <a href="#features" className="landing-link">
              Features
            </a>
            <a href="#who" className="landing-link">
              Who it&apos;s for
            </a>
            <Link href="/login" className="btn secondary">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <p className="landing-eyebrow">Built for associations that run on trust</p>
            <h1>
              One platform for members, dues, meetings and governance.
            </h1>
            <p className="landing-lead">
              NCOF Platform helps cooperatives and associations manage membership,
              monthly dues, finance, meetings, elections and announcements —
              without scattering everything across spreadsheets and chat groups.
            </p>
            <div className="landing-cta">
              <Link href="/login" className="btn primary">
                Sign in <ArrowRight size={16} />
              </Link>
              <a
                className="btn secondary"
                href="mailto:demo@ncof.org?subject=NCOF%20Platform%20demo%20request"
              >
                Request demo
              </a>
            </div>
            <div className="landing-trust">
              <span className="badge blue">Role-based access</span>
              <span className="badge blue">Dues & ledger</span>
              <span className="badge blue">Mobile-ready</span>
            </div>
          </div>
        </section>

        <section id="features" className="landing-section">
          <div className="landing-section-inner">
            <h2>What you get</h2>
            <p className="landing-section-lead">
              Practical tools for how associations already work — not a generic project board.
            </p>
            <div className="landing-features">
              {FEATURES.map((f) => (
                <article key={f.title} className="landing-feature">
                  <div className="landing-feature-icon">
                    <f.icon size={20} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="who" className="landing-section landing-section-alt">
          <div className="landing-section-inner landing-split">
            <div>
              <h2>Who it&apos;s for</h2>
              <p className="landing-section-lead">
                Groups that collect contributions, hold meetings, and need clear records —
                especially where committees and members share the work.
              </p>
              <ul className="landing-list">
                {AUDIENCE.map((item) => (
                  <li key={item}>
                    <Check size={16} /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="landing-card-highlight">
              <Landmark size={28} />
              <h3>Built around real association work</h3>
              <p>
                Monthly dues, attendance, welfare claims, and secret ballots are first-class —
                not afterthoughts bolted onto a generic CRM.
              </p>
            </div>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-section-inner">
            <h2>How it works</h2>
            <div className="landing-steps">
              {STEPS.map((s) => (
                <div key={s.n} className="landing-step">
                  <span className="landing-step-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-cta-band">
          <div className="landing-section-inner landing-cta-band-inner">
            <h2>Ready to run your association in one place?</h2>
            <p>
              Sign in if you already have an account, or request a demo for your committee.
            </p>
            <div className="landing-cta">
              <Link href="/login" className="btn primary">
                Sign in
              </Link>
              <a
                className="btn secondary"
                href="mailto:demo@ncof.org?subject=NCOF%20Platform%20demo%20request"
              >
                Request demo
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-brand">
            <div className="logo" aria-hidden>
              N
            </div>
            <div>
              <b>NCOF Platform</b>
              <span>v1.8 · Association operations</span>
            </div>
          </div>
          <p className="muted">
            © {new Date().getFullYear()} NCOF Platform. For authorized association use.
          </p>
        </div>
      </footer>
    </div>
  )
}
