'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { api, setSession } from '@/lib/api'
import { Button, ErrorBox, Field } from '@/components/UI'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr('')

    try {
      const session = await api<{
        access_token: string
        refresh_token?: string | null
        token_type?: string
        must_change_password?: boolean
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      setSession(session)

      if (session.must_change_password) {
        router.replace('/change-password')
      } else {
        router.replace('/dashboard')
      }
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : String(ex))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <Link href="/" className="logo" aria-label="NCOF home" style={{ textDecoration: 'none' }}>
          N
        </Link>

        <h1>One platform for NCOF operations.</h1>

        <p>
          Members, finance, governance, meetings and elections in one
          controlled workspace connected to the NCOF Platform API.
        </p>

        <div className="pill-row">
          <span className="badge blue">FastAPI</span>
          <span className="badge blue">PostgreSQL</span>
          <span className="badge blue">NCOF API v1.7.x</span>
        </div>
      </div>

      <div className="login-box">
        <div className="login-card">
          <ShieldCheck size={28} color="#3b82f6" aria-hidden />

          <h2>Sign in</h2>

          <p>Use your NCOF account credentials.</p>

          {err && <ErrorBox message={err} />}

          <form onSubmit={submit}>
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@ncof.org"
            />

            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />

            <Button loading={busy} type="submit">
              Sign in
            </Button>
          </form>

          <p
            style={{
              marginTop: 16,
              marginBottom: 0,
              fontSize: 11,
              color: 'var(--text-dim)',
            }}
          >
            Credentials are sent directly to the NCOF API over HTTPS.
          </p>

          <p style={{ marginTop: 14, marginBottom: 0, textAlign: 'center' }}>
            <Link
              href="/"
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                textDecoration: 'none',
              }}
            >
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
