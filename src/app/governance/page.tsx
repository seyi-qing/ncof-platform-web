'use client'

import {useEffect, useState} from 'react'
import {Plus, ShieldCheck} from 'lucide-react'
import AppShell from '@/components/AppShell'
import {api} from '@/lib/api'
import {getRole} from '@/lib/auth'
import {
  Card, PageHeader, Table, Button, Modal, Field, Textarea, ErrorBox, SuccessBox, Empty,
} from '@/components/UI'

export default function Governance() {
  const role = getRole()
  const isStaff = role !== 'member' && role !== 'unknown'

  const [committees, setCommittees] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [announcement, setAnnouncement] = useState(false)
  const [detail, setDetail] = useState<any>(null)
  const [editC, setEditC] = useState(false)
  const [form, setForm] = useState({name: '', description: ''})
  const [editForm, setEditForm] = useState({name: '', description: '', status: 'active'})
  const [addMem, setAddMem] = useState({member_id: '', position: 'member'})
  const [ann, setAnn] = useState({title: '', body: '', audience: 'all_members', published: true})
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [viewAnn, setViewAnn] = useState<any>(null)

  const load = async () => {
    try {
      setCommittees(await api<any[]>('/governance/committees'))
      const path = isStaff
        ? '/governance/announcements/all'
        : '/governance/announcements'
      setAnnouncements(await api<any[]>(path))
      if (isStaff) {
        setMembers(await api<any[]>('/members'))
      }
    } catch (e: any) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function createCommittee(e: any) {
    e.preventDefault()
    setErr('')
    try {
      await api('/governance/committees', {
        method: 'POST',
        body: JSON.stringify({...form, description: form.description || null}),
      })
      setSuccess('Committee created.')
      setOpen(false)
      setForm({name: '', description: ''})
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function openCommittee(c: any) {
    setErr('')
    setEditC(false)
    try {
      const d = await api<any>(`/governance/committees/${c.id}`)
      setDetail(d)
      setEditForm({
        name: d.name || '',
        description: d.description || '',
        status: d.status || 'active',
      })
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function saveCommittee(e: any) {
    e.preventDefault()
    if (!detail) return
    setErr('')
    try {
      await api(`/governance/committees/${detail.id}`, {
        method: 'PATCH',
        body: JSON.stringify(editForm),
      })
      setSuccess('Committee updated.')
      setEditC(false)
      await openCommittee(detail)
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function addMember(e: any) {
    e.preventDefault()
    if (!detail) return
    setErr('')
    try {
      await api(`/governance/committees/${detail.id}/members`, {
        method: 'POST',
        body: JSON.stringify(addMem),
      })
      setSuccess('Member added to committee.')
      setAddMem({member_id: '', position: 'member'})
      await openCommittee(detail)
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function createAnn(e: any) {
    e.preventDefault()
    setErr('')
    try {
      await api('/governance/announcements', {
        method: 'POST',
        body: JSON.stringify(ann),
      })
      setSuccess(ann.published ? 'Announcement published.' : 'Draft saved.')
      setAnnouncement(false)
      setAnn({title: '', body: '', audience: 'all_members', published: true})
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function publish(id: string) {
    setErr('')
    try {
      await api(`/governance/announcements/${id}/publish`, {method: 'POST'})
      setSuccess('Announcement published.')
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  const memberName = (id: string) => {
    const m = members.find((x) => x.id === id)
    return m ? m.full_name : id?.slice(0, 8) || '-'
  }

  return (
    <AppShell title="Governance">
      <div className="content">
        <PageHeader
          title="Governance"
          description="Committees, announcements and organizational governance."
          action={
            isStaff ? (
              <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                <Button variant="secondary" onClick={() => setOpen(true)}>
                  <Plus size={15} /> Committee
                </Button>
                <Button onClick={() => setAnnouncement(true)}>
                  <Plus size={15} /> Announcement
                </Button>
              </div>
            ) : undefined
          }
        />
        {err && <ErrorBox message={err} />}
        {success && <SuccessBox message={success} />}

        <Card>
          <div className="section-title">
            <h3>
              <ShieldCheck size={17} style={{verticalAlign: '-3px'}} /> Committees
            </h3>
          </div>
          {committees.length ? (
            <Table
              headers={['Name', 'Description', 'Status', 'Actions']}
              rows={committees.map((c) => [
                <b key="n">{c.name}</b>,
                c.description || '-',
                <span key="s" className={'badge ' + (c.status === 'active' ? 'green' : 'gray')}>
                  {c.status || 'active'}
                </span>,
                <Button key="a" variant="secondary" onClick={() => void openCommittee(c)}>
                  Open
                </Button>,
              ])}
            />
          ) : (
            <Empty text="No committees yet." />
          )}
        </Card>

        <div style={{marginTop: 16}}>
          <Card>
            <div className="section-title">
              <h3>Announcements</h3>
              <span className="badge gray">{announcements.length}</span>
            </div>
            {announcements.length ? (
              <Table
                headers={['Title', 'Audience', 'Status', 'Actions']}
                rows={announcements.map((a) => [
                  a.title,
                  a.audience || 'all_members',
                  <span key="s" className={'badge ' + (a.published ? 'green' : 'amber')}>
                    {a.published ? 'Published' : 'Draft'}
                  </span>,
                  <div key="act" style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                    <Button variant="secondary" onClick={() => setViewAnn(a)}>
                      View
                    </Button>
                    {isStaff && !a.published && (
                      <Button variant="secondary" onClick={() => void publish(a.id)}>
                        Publish
                      </Button>
                    )}
                  </div>,
                ])}
              />
            ) : (
              <Empty text={isStaff ? 'No announcements yet. Create one as draft or published.' : 'No published announcements.'} />
            )}
          </Card>
        </div>
      </div>

      {open && (
        <Modal title="New committee" onClose={() => setOpen(false)}>
          <form onSubmit={createCommittee}>
            <Field label="Name" value={form.name} onChange={(e: any) => setForm({...form, name: e.target.value})} required />
            <Textarea label="Description" value={form.description} onChange={(e: any) => setForm({...form, description: e.target.value})} />
            <div className="form-actions">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Modal>
      )}

      {announcement && (
        <Modal title="New announcement" onClose={() => setAnnouncement(false)}>
          <form onSubmit={createAnn}>
            <Field label="Title" value={ann.title} onChange={(e: any) => setAnn({...ann, title: e.target.value})} required />
            <Textarea label="Body" value={ann.body} onChange={(e: any) => setAnn({...ann, body: e.target.value})} required />
            <label className="field">
              <span className="field-label">Publish now?</span>
              <select
                className="input"
                value={ann.published ? 'yes' : 'no'}
                onChange={(e) => setAnn({...ann, published: e.target.value === 'yes'})}
              >
                <option value="yes">Yes - publish</option>
                <option value="no">No - save draft</option>
              </select>
            </label>
            <div className="form-actions">
              <Button type="button" variant="ghost" onClick={() => setAnnouncement(false)}>Cancel</Button>
              <Button type="submit">{ann.published ? 'Publish' : 'Save draft'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {viewAnn && (
        <Modal title={viewAnn.title} onClose={() => setViewAnn(null)}>
          <p className="muted" style={{fontSize: 12, marginBottom: 8}}>
            {viewAnn.published ? 'Published' : 'Draft'} · {viewAnn.audience}
          </p>
          <p style={{fontSize: 14, whiteSpace: 'pre-wrap'}}>{viewAnn.body}</p>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setViewAnn(null)}>Close</Button>
          </div>
        </Modal>
      )}

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)}>
          {!editC ? (
            <>
              <p className="muted" style={{fontSize: 13}}>{detail.description || 'No description'}</p>
              <p className="muted" style={{fontSize: 12}}>
                Status: <b>{detail.status || 'active'}</b>
              </p>
              {isStaff && (
                <div style={{margin: '12px 0'}}>
                  <Button variant="secondary" onClick={() => setEditC(true)}>Edit</Button>
                </div>
              )}
              <h4 style={{fontSize: 14, marginTop: 12}}>Members</h4>
              {(detail.members || []).length ? (
                <ul style={{fontSize: 13, paddingLeft: 18}}>
                  {detail.members.map((m: any) => (
                    <li key={m.id || m.member_id}>
                      {memberName(m.member_id)}{' - '}{m.position}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted" style={{fontSize: 12}}>No members on this committee.</p>
              )}
              {isStaff && (
                <form onSubmit={addMember} style={{marginTop: 12, borderTop: '1px solid #243044', paddingTop: 12}}>
                  <label className="field">
                    <span className="field-label">Add member</span>
                    <select
                      className="input"
                      value={addMem.member_id}
                      onChange={(e) => setAddMem({...addMem, member_id: e.target.value})}
                      required
                    >
                      <option value="">Select</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.full_name}</option>
                      ))}
                    </select>
                  </label>
                  <Field
                    label="Position"
                    value={addMem.position}
                    onChange={(e: any) => setAddMem({...addMem, position: e.target.value})}
                  />
                  <div className="form-actions">
                    <Button type="submit">Add</Button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={saveCommittee}>
              <Field label="Name" value={editForm.name} onChange={(e: any) => setEditForm({...editForm, name: e.target.value})} required />
              <Textarea label="Description" value={editForm.description} onChange={(e: any) => setEditForm({...editForm, description: e.target.value})} />
              <label className="field">
                <span className="field-label">Status</span>
                <select
                  className="input"
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <div className="form-actions">
                <Button type="button" variant="ghost" onClick={() => setEditC(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </AppShell>
  )
}
