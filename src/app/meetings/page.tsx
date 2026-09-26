'use client'

import {useEffect, useState} from 'react'
import {Plus, CalendarDays, Pencil, Users} from 'lucide-react'
import AppShell from '@/components/AppShell'
import {api} from '@/lib/api'
import {getRole} from '@/lib/auth'
import {
  Card, PageHeader, Table, Button, Modal, Field, ErrorBox, SuccessBox, Empty, Textarea,
} from '@/components/UI'

type Meeting = {
  id: string
  title: string
  meeting_date: string
  location?: string | null
}

export default function Meetings() {
  const role = getRole()
  const canManage = role === 'admin' || role === 'executive' || role === 'secretary'

  const [data, setData] = useState<Meeting[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [agenda, setAgenda] = useState<any>(null)
  const [agendaItems, setAgendaItems] = useState<any[]>([])
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({title: '', meeting_date: '', location: ''})
  const [editForm, setEditForm] = useState({title: '', meeting_date: '', location: ''})
  const [agendaForm, setAgendaForm] = useState({item_no: '1', title: '', description: '', presenter: ''})
  const [attForm, setAttForm] = useState({member_id: '', status: 'present'})

  const load = () =>
    api<Meeting[]>('/meetings')
      .then(setData)
      .catch((e) => setErr(e.message))

  useEffect(() => {
    void load()
    if (canManage) {
      api<any[]>('/members').then(setMembers).catch(() => {})
    }
  }, [])

  async function create(e: any) {
    e.preventDefault()
    setErr('')
    try {
      await api('/meetings', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          meeting_date: form.meeting_date,
          location: form.location || null,
        }),
      })
      setSuccess('Meeting created.')
      setOpen(false)
      setForm({title: '', meeting_date: '', location: ''})
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function openDetail(m: Meeting) {
    setErr('')
    setEditing(false)
    try {
      if (canManage && members.length === 0) {
        try {
          setMembers(await api<any[]>('/members'))
        } catch {}
      }
      const d = await api<any>(`/meetings/${m.id}`)
      setDetail(d)
      setEditForm({
        title: d.title || '',
        meeting_date: d.meeting_date ? String(d.meeting_date).slice(0, 16) : '',
        location: d.location || '',
      })
      try {
        setAgendaItems(await api<any[]>(`/governance/meetings/${m.id}/agenda`))
      } catch {
        setAgendaItems([])
      }
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function saveEdit(e: any) {
    e.preventDefault()
    if (!detail) return
    setErr('')
    try {
      await api(`/meetings/${detail.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editForm.title,
          meeting_date: editForm.meeting_date,
          location: editForm.location || null,
        }),
      })
      setSuccess('Meeting updated.')
      setEditing(false)
      await openDetail({id: detail.id, title: editForm.title, meeting_date: editForm.meeting_date})
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function saveAttendance(e: any) {
    e.preventDefault()
    if (!detail) return
    setErr('')
    try {
      await api(`/meetings/${detail.id}/attendance`, {
        method: 'POST',
        body: JSON.stringify(attForm),
      })
      setSuccess('Attendance recorded.')
      setAttForm({member_id: '', status: 'present'})
      await openDetail(detail)
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function addAgenda(e: any) {
    e.preventDefault()
    if (!agenda) return
    setErr('')
    try {
      await api(`/governance/meetings/${agenda.id}/agenda`, {
        method: 'POST',
        body: JSON.stringify({
          ...agendaForm,
          item_no: Number(agendaForm.item_no),
          description: agendaForm.description || null,
          presenter: agendaForm.presenter || null,
        }),
      })
      setSuccess('Agenda item added.')
      setAgendaForm({item_no: '1', title: '', description: '', presenter: ''})
      try {
        setAgendaItems(await api<any[]>(`/governance/meetings/${agenda.id}/agenda`))
      } catch {}
    } catch (e: any) {
      setErr(e.message)
    }
  }

  const memberName = (id: string, fallbackName?: string | null) => {
    if (fallbackName) return fallbackName
    const m = members.find((x) => x.id === id)
    return m ? m.full_name : 'Member'
  }

  return (
    <AppShell title="Meetings">
      <div className="content">
        <PageHeader
          title="Meetings"
          description="Plan meetings, manage agendas and record attendance."
          action={
            canManage ? (
              <Button onClick={() => setOpen(true)}>
                <Plus size={15} /> Create meeting
              </Button>
            ) : undefined
          }
        />
        {err && <ErrorBox message={err} />}
        {success && <SuccessBox message={success} />}

        <Card>
          <div className="section-title">
            <h3>
              <CalendarDays size={17} style={{verticalAlign: '-3px'}} /> Meeting calendar
            </h3>
            <span className="badge gray">{data.length} records</span>
          </div>
          {data.length ? (
            <Table
              headers={['Title', 'Date', 'Location', 'Actions']}
              rows={data.map((m) => [
                <b key="t">{m.title}</b>,
                new Date(m.meeting_date).toLocaleString(),
                m.location || '-',
                <div key="a" style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                  <Button variant="secondary" onClick={() => void openDetail(m)}>
                    Open
                  </Button>
                  {canManage && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setAgenda(m)
                        setAgendaItems([])
                        api<any[]>(`/governance/meetings/${m.id}/agenda`)
                          .then(setAgendaItems)
                          .catch(() => {})
                      }}
                    >
                      Agenda
                    </Button>
                  )}
                </div>,
              ])}
            />
          ) : (
            <Empty text="No meetings have been created." />
          )}
        </Card>
      </div>

      {open && (
        <Modal title="Create meeting" onClose={() => setOpen(false)}>
          <form onSubmit={create}>
            <Field label="Title" value={form.title} onChange={(e: any) => setForm({...form, title: e.target.value})} required />
            <Field label="Date & time" type="datetime-local" value={form.meeting_date} onChange={(e: any) => setForm({...form, meeting_date: e.target.value})} required />
            <Field label="Location" value={form.location} onChange={(e: any) => setForm({...form, location: e.target.value})} />
            <div className="form-actions">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Modal>
      )}

      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)}>
          {!editing ? (
            <>
              <p className="muted" style={{fontSize: 13}}>
                {new Date(detail.meeting_date).toLocaleString()}
                {detail.location ? ` · ${detail.location}` : ''}
              </p>
              {canManage && (
                <div style={{margin: '12px 0'}}>
                  <Button variant="secondary" onClick={() => setEditing(true)}>
                    <Pencil size={14} /> Edit meeting
                  </Button>
                </div>
              )}

              <h4 style={{marginTop: 16, fontSize: 14}}>Agenda</h4>
              {agendaItems.length ? (
                <ul style={{fontSize: 13, paddingLeft: 18}}>
                  {agendaItems.map((a) => (
                    <li key={a.id || a.item_no}>
                      <b>{a.item_no}. {a.title}</b>
                      {a.presenter ? ` - ${a.presenter}` : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted" style={{fontSize: 12}}>No agenda items yet.</p>
              )}

              <h4 style={{marginTop: 16, fontSize: 14}}>
                <Users size={14} style={{verticalAlign: '-2px'}} /> Attendance
              </h4>
              {(detail.attendance || []).length ? (
                <ul style={{fontSize: 13, paddingLeft: 18}}>
                  {detail.attendance.map((a: any, i: number) => (
                    <li key={i}>
                      {memberName(a.member_id, a.member_name)}{' - '}
                      <span className="badge gray">{a.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted" style={{fontSize: 12}}>No attendance recorded.</p>
              )}

              {canManage && (
                <form onSubmit={saveAttendance} style={{marginTop: 12, borderTop: '1px solid #243044', paddingTop: 12}}>
                  <label className="field">
                    <span className="field-label">Member</span>
                    <select
                      className="input"
                      value={attForm.member_id}
                      onChange={(e) => setAttForm({...attForm, member_id: e.target.value})}
                      required
                    >
                      <option value="">Select member</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field-label">Status</span>
                    <select
                      className="input"
                      value={attForm.status}
                      onChange={(e) => setAttForm({...attForm, status: e.target.value})}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="excused">Excused</option>
                      <option value="late">Late</option>
                    </select>
                  </label>
                  <div className="form-actions">
                    <Button type="submit">Record attendance</Button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={saveEdit}>
              <Field label="Title" value={editForm.title} onChange={(e: any) => setEditForm({...editForm, title: e.target.value})} required />
              <Field label="Date & time" type="datetime-local" value={editForm.meeting_date} onChange={(e: any) => setEditForm({...editForm, meeting_date: e.target.value})} required />
              <Field label="Location" value={editForm.location} onChange={(e: any) => setEditForm({...editForm, location: e.target.value})} />
              <div className="form-actions">
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {agenda && (
        <Modal title={`Agenda - ${agenda.title}`} onClose={() => setAgenda(null)}>
          {agendaItems.length > 0 && (
            <ul style={{fontSize: 13, paddingLeft: 18, marginBottom: 12}}>
              {agendaItems.map((a) => (
                <li key={a.id || a.item_no}>{a.item_no}. {a.title}</li>
              ))}
            </ul>
          )}
          <form onSubmit={addAgenda}>
            <div style={{display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8}}>
              <Field label="No." value={agendaForm.item_no} onChange={(e: any) => setAgendaForm({...agendaForm, item_no: e.target.value})} />
              <Field label="Presenter" value={agendaForm.presenter} onChange={(e: any) => setAgendaForm({...agendaForm, presenter: e.target.value})} />
            </div>
            <Field label="Title" value={agendaForm.title} onChange={(e: any) => setAgendaForm({...agendaForm, title: e.target.value})} required />
            <Textarea label="Description" value={agendaForm.description} onChange={(e: any) => setAgendaForm({...agendaForm, description: e.target.value})} />
            <div className="form-actions">
              <Button variant="ghost" type="button" onClick={() => setAgenda(null)}>Close</Button>
              <Button type="submit">Add item</Button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  )
}
