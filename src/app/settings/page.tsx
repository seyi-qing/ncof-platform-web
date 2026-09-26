'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {LogOut, Activity, User} from 'lucide-react'
import AppShell from '@/components/AppShell'
import {api, getSession, API_BASE} from '@/lib/api'
import {getRole} from '@/lib/auth'
import {Card, PageHeader, Button, ErrorBox, SuccessBox, Field} from '@/components/UI'

function tokenClaims(): Record<string, unknown> {
  const s = getSession()
  if (!s?.access_token) return {}
  try {
    const part = s.access_token.split('.')[1]
    if (!part) return {}
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return {}
  }
}

export default function Settings() {
  const router = useRouter()
  const role = getRole()
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')
  const [health, setHealth] = useState<any>(null)
  const [ready, setReady] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [edit, setEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({full_name: '', phone: '', email: ''})
  const [noMember, setNoMember] = useState(false)

  const claims = tokenClaims()
  const session = typeof window !== 'undefined' ? getSession() : null

  async function ping() {
    setErr('')
    try {
      const base = API_BASE.replace(/\/api\/v1\/?$/, '')
      const [h, r] = await Promise.all([
        fetch(`${base}/health`).then((x) => x.json()),
        fetch(`${base}/ready`).then((x) => x.json()),
      ])
      setHealth(h)
      setReady(r)
    } catch (e: any) {
      setErr(e.message || 'Health check failed')
    }
  }

  async function loadProfile() {
    try {
      const m = await api<any>('/members/me')
      setProfile(m)
      setNoMember(false)
      setForm({
        full_name: m.full_name || '',
        phone: m.phone || '',
        email: m.email || '',
      })
    } catch (e: any) {
      setNoMember(true)
      setProfile(null)
    }
  }

  useEffect(() => {
    void ping()
    void loadProfile()
  }, [])

  function signOut() {
    localStorage.removeItem('ncof_session')
    router.replace('/login')
  }

  async function saveProfile() {
    setErr('')
    setOk('')
    setSaving(true)
    try {
      const body: Record<string, string> = {}
      if (form.full_name.trim()) body.full_name = form.full_name.trim()
      if (form.email.trim()) body.email = form.email.trim()
      body.phone = form.phone.trim()

      const m = await api<any>('/members/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      setProfile(m)
      setForm({
        full_name: m.full_name || '',
        phone: m.phone || '',
        email: m.email || '',
      })
      setEdit(false)
      setOk('Profile updated.')
    } catch (e: any) {
      setErr(e.message || 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  const displayName =
    profile?.full_name ||
    (typeof claims.full_name === 'string' ? claims.full_name : null) ||
    (typeof claims.email === 'string' ? claims.email : null) ||
    'Signed-in user'

  const displayEmail =
    profile?.email ||
    (typeof claims.email === 'string' ? claims.email : null) ||
    '—'

  return (
    <AppShell title="Settings">
      <div className="content">
        <PageHeader
          title="Settings"
          description="Account, API connection and session."
          action={
            <Button variant="secondary" onClick={signOut}>
              <LogOut size={15} /> Sign out
            </Button>
          }
        />

        {err && <ErrorBox message={err} />}
        {ok && <SuccessBox message={ok} />}

        <div className="grid grid-2">
          <Card>
            <div className="section-title">
              <h3>
                <User size={16} style={{verticalAlign: '-3px'}} /> Account
              </h3>
            </div>

            <p style={{fontSize: 16, fontWeight: 600, marginBottom: 4}}>{displayName}</p>
            <p className="muted" style={{fontSize: 13, marginBottom: 12}}>{displayEmail}</p>

            {profile?.member_no && (
              <p className="muted" style={{fontSize: 12}}>
                Member no: <b>{profile.member_no}</b>
              </p>
            )}
            {profile?.phone && !edit && (
              <p className="muted" style={{fontSize: 12}}>
                Phone: <b>{profile.phone}</b>
              </p>
            )}
            {profile?.membership_status && (
              <p className="muted" style={{fontSize: 12}}>
                Membership:{' '}
                <span className="badge green">{profile.membership_status}</span>
              </p>
            )}

            <p className="muted" style={{fontSize: 13, marginTop: 12}}>
              Role: <b style={{textTransform: 'capitalize'}}>{role || '—'}</b>
            </p>
            <p className="muted" style={{fontSize: 12}}>
              Session: {session?.access_token ? 'Signed in' : 'No session'}
            </p>

            {noMember && (
              <p className="muted" style={{fontSize: 12, marginTop: 10}}>
                No member profile is linked to this login. An admin can link one from Members.
              </p>
            )}

            {!noMember && !edit && (
              <div style={{marginTop: 12}}>
                <Button variant="secondary" onClick={() => setEdit(true)}>
                  Edit profile
                </Button>
                <p className="muted" style={{fontSize: 11, marginTop: 8}}>
                  You can update name, email and phone. Membership status is managed by staff.
                  Change password from the security prompt when required.
                </p>
              </div>
            )}

            {!noMember && edit && (
              <div style={{marginTop: 12}}>
                <Field
                  label="Full name"
                  value={form.full_name}
                  onChange={(e: any) => setForm({...form, full_name: e.target.value})}
                  required
                />
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e: any) => setForm({...form, email: e.target.value})}
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(e: any) => setForm({...form, phone: e.target.value})}
                />
                <div className="form-actions">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setEdit(false)
                      setForm({
                        full_name: profile?.full_name || '',
                        phone: profile?.phone || '',
                        email: profile?.email || '',
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" loading={saving} onClick={() => void saveProfile()}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="section-title">
              <h3>
                <Activity size={16} style={{verticalAlign: '-3px'}} /> API connection
              </h3>
              <Button
                variant="secondary"
                onClick={() => {
                  void ping().then(() => setOk('Connection check completed.'))
                }}
              >
                Recheck
              </Button>
            </div>
            <p className="muted" style={{fontSize: 11, wordBreak: 'break-all'}}>
              {API_BASE}
            </p>
            <p className="muted" style={{fontSize: 12, marginTop: 8}}>
              Health: <b>{health?.status || '—'}</b>
              {health?.version ? ` · v${health.version}` : ''}
            </p>
            <p className="muted" style={{fontSize: 12}}>
              Database: <b>{ready?.database || ready?.status || '—'}</b>
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
