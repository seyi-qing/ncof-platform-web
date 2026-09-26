'use client'

import {useEffect, useState} from 'react'
import {Bell, Check} from 'lucide-react'
import AppShell from '@/components/AppShell'
import {api} from '@/lib/api'
import {getRole} from '@/lib/auth'
import {
  Card, PageHeader, Button, Modal, Field, Textarea, Select, ErrorBox, SuccessBox, Empty,
} from '@/components/UI'

export default function Notifications() {
  const role = getRole()
  const [data, setData] = useState<any[]>([])
  const [prefs, setPrefs] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    title: '',
    body: '',
    notification_type: 'general',
    priority: 'normal',
  })

  const load = async () => {
    try {
      setData(await api<any[]>('/member-portal/notifications'))
      setPrefs(await api<any>('/member-portal/notification-preferences'))
    } catch (e: any) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function read(id: string) {
    try {
      await api(`/member-portal/notifications/${id}/read`, {method: 'POST'})
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function broadcast(e: any) {
    e.preventDefault()
    try {
      const r = await api<any>('/member-portal/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setSuccess(`Sent to ${r.created} active member accounts.`)
      setOpen(false)
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function pref(field: string, value: boolean) {
    try {
      await api('/member-portal/notification-preferences', {
        method: 'PATCH',
        body: JSON.stringify({[field]: value}),
      })
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  return (
    <AppShell title="Notifications">
      <div className="content">
        <PageHeader
          title="Notifications"
          description="Member alerts and notification preferences."
          action={
            ['admin', 'executive', 'secretary'].includes(role) ? (
              <Button onClick={() => setOpen(true)}>Broadcast</Button>
            ) : undefined
          }
        />
        {err && <ErrorBox message={err} />}
        {success && <SuccessBox message={success} />}

        <div className="grid grid-2">
          <Card>
            <div className="section-title">
              <h3>
                <Bell size={17} /> Inbox
              </h3>
              <span className="badge gray">{data.length}</span>
            </div>
            {data.length ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                {data.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      border: '1px solid #243044',
                      borderRadius: 10,
                      padding: '12px 14px',
                      background: n.read_at ? 'transparent' : 'rgba(59,130,246,0.06)',
                    }}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap'}}>
                      <b style={{fontSize: 14}}>{n.title}</b>
                      <span
                        className={
                          'badge ' +
                          (n.priority === 'urgent'
                            ? 'red'
                            : n.priority === 'high'
                              ? 'amber'
                              : 'blue')
                        }
                      >
                        {n.priority}
                      </span>
                    </div>
                    <p className="muted" style={{fontSize: 12, marginTop: 6, whiteSpace: 'pre-wrap'}}>
                      {n.body}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span className="muted" style={{fontSize: 11}}>
                        {n.notification_type} · {new Date(n.created_at).toLocaleString()}
                      </span>
                      {n.read_at ? (
                        <span className="badge gray">Read</span>
                      ) : (
                        <Button variant="secondary" onClick={() => void read(n.id)}>
                          <Check size={13} /> Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="No notifications." />
            )}
          </Card>

          <Card>
            <div className="section-title">
              <h3>Preferences</h3>
            </div>
            {prefs ? (
              Object.entries(prefs)
                .filter(([k]) => k.endsWith('_enabled'))
                .map(([k, v]: any) => (
                  <label key={k} className="pref">
                    <span>{k.replaceAll('_', ' ')}</span>
                    <input
                      type="checkbox"
                      checked={!!v}
                      onChange={(e: any) => void pref(k, e.target.checked)}
                    />
                  </label>
                ))
            ) : (
              <p className="muted" style={{fontSize: 12}}>Loading preferences…</p>
            )}
          </Card>
        </div>
      </div>

      {open && (
        <Modal title="Broadcast notification" onClose={() => setOpen(false)}>
          <form onSubmit={broadcast}>
            <Field
              label="Title"
              value={form.title}
              onChange={(e: any) => setForm({...form, title: e.target.value})}
              required
            />
            <Textarea
              label="Message"
              value={form.body}
              onChange={(e: any) => setForm({...form, body: e.target.value})}
              required
            />
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e: any) => setForm({...form, priority: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
            <div className="form-actions">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Broadcast</Button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  )
}
