'use client'

import {useEffect, useState} from 'react'
import {Plus, FileText, ExternalLink, Pencil} from 'lucide-react'
import AppShell from '@/components/AppShell'
import {api} from '@/lib/api'
import {getRole} from '@/lib/auth'
import {
  Card, PageHeader, Table, Button, Modal, Field, Textarea, ErrorBox, SuccessBox, Empty,
} from '@/components/UI'

export default function Documents() {
  const role = getRole()
  const canManage = role !== 'member' && role !== 'unknown'
  const [data, setData] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<any>(null)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    title: '',
    document_type: 'policy',
    storage_url: '',
    description: '',
  })
  const [editForm, setEditForm] = useState({
    title: '',
    document_type: '',
    storage_url: '',
    description: '',
  })

  const load = () =>
    api<any[]>('/governance/documents')
      .then(setData)
      .catch((e) => setErr(e.message))

  useEffect(() => {
    void load()
  }, [])

  async function save(e: any) {
    e.preventDefault()
    setErr('')
    try {
      await api('/governance/documents', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          description: form.description || null,
        }),
      })
      setSuccess('Document added.')
      setOpen(false)
      setForm({title: '', document_type: 'policy', storage_url: '', description: ''})
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  function startEdit(d: any) {
    setEdit(d)
    setEditForm({
      title: d.title || '',
      document_type: d.document_type || '',
      storage_url: d.storage_url || '',
      description: d.description || '',
    })
  }

  async function saveEdit(e: any) {
    e.preventDefault()
    if (!edit) return
    setErr('')
    try {
      await api(`/governance/documents/${edit.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...editForm,
          description: editForm.description || null,
        }),
      })
      setSuccess('Document updated.')
      setEdit(null)
      load()
    } catch (e: any) {
      setErr(e.message)
    }
  }

  return (
    <AppShell title="Documents">
      <div className="content">
        <PageHeader
          title="Documents"
          description="Association policies, minutes, records and shared resources."
          action={
            canManage ? (
              <Button onClick={() => setOpen(true)}>
                <Plus size={15} /> Add document
              </Button>
            ) : undefined
          }
        />
        {err && <ErrorBox message={err} />}
        {success && <SuccessBox message={success} />}

        <Card>
          <div className="section-title">
            <h3>
              <FileText size={17} /> Document library
            </h3>
          </div>
          {data.length ? (
            <Table
              headers={['Title', 'Type', 'Description', 'Added', 'Actions']}
              rows={data.map((d) => [
                d.title,
                d.document_type,
                d.description || '-',
                new Date(d.created_at).toLocaleDateString(),
                <div key="a" style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                  <a
                    className="btn secondary"
                    href={d.storage_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={13} /> Open
                  </a>
                  {canManage && (
                    <Button variant="secondary" onClick={() => startEdit(d)}>
                      <Pencil size={13} /> Edit
                    </Button>
                  )}
                </div>,
              ])}
            />
          ) : (
            <Empty text="No documents available." />
          )}
        </Card>
      </div>

      {open && (
        <Modal title="Add document" onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <Field
              label="Title"
              value={form.title}
              onChange={(e: any) => setForm({...form, title: e.target.value})}
              required
            />
            <Field
              label="Document type"
              value={form.document_type}
              onChange={(e: any) => setForm({...form, document_type: e.target.value})}
              required
            />
            <Field
              label="Storage URL"
              value={form.storage_url}
              onChange={(e: any) => setForm({...form, storage_url: e.target.value})}
              required
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e: any) => setForm({...form, description: e.target.value})}
            />
            <div className="form-actions">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add document</Button>
            </div>
          </form>
        </Modal>
      )}

      {edit && (
        <Modal title="Edit document" onClose={() => setEdit(null)}>
          <form onSubmit={saveEdit}>
            <Field
              label="Title"
              value={editForm.title}
              onChange={(e: any) => setEditForm({...editForm, title: e.target.value})}
              required
            />
            <Field
              label="Document type"
              value={editForm.document_type}
              onChange={(e: any) => setEditForm({...editForm, document_type: e.target.value})}
              required
            />
            <Field
              label="Storage URL"
              value={editForm.storage_url}
              onChange={(e: any) => setEditForm({...editForm, storage_url: e.target.value})}
              required
            />
            <Textarea
              label="Description"
              value={editForm.description}
              onChange={(e: any) => setEditForm({...editForm, description: e.target.value})}
            />
            <div className="form-actions">
              <Button variant="ghost" type="button" onClick={() => setEdit(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  )
}
