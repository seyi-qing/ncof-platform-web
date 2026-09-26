'use client'

import {useEffect, useState} from 'react'
import {Plus, Users, KeyRound, RefreshCw, Pencil} from 'lucide-react'
import AppShell from '@/components/AppShell'
import {api} from '@/lib/api'
import {getRole} from '@/lib/auth'
import {Card, PageHeader, Table, Button, Modal, Field, ErrorBox, SuccessBox, Empty} from '@/components/UI'

type Member = {
  id: string
  member_no: string
  full_name: string
  email?: string | null
  phone?: string | null
  membership_status: string
  joined_at: string
  has_login_account: boolean
}

const STAFF_ROLES = [
  {value: 'member', label: 'Member'},
  {value: 'treasurer', label: 'Treasurer'},
  {value: 'executive', label: 'Executive'},
  {value: 'secretary', label: 'Secretary'},
  {value: 'auditor', label: 'Auditor'},
  {value: 'admin', label: 'Admin'},
]

export default function Members(){
  const role = getRole()
  const [data,setData] = useState<Member[]>([])
  const [open,setOpen] = useState(false)
  const [selected,setSelected] = useState<Member|null>(null)
  const [editing,setEditing] = useState<Member|null>(null)
  const [err,setErr] = useState('')
  const [success,setSuccess] = useState('')
  const [loading,setLoading] = useState(false)
  const [accountBusy,setAccountBusy] = useState(false)
  const [editBusy,setEditBusy] = useState(false)
  const [form,setForm] = useState({full_name:'',email:'',phone:''})
  const [editForm,setEditForm] = useState({full_name:'',email:'',phone:'',membership_status:'active'})
  const [accountPassword,setAccountPassword] = useState('')
  const [accountRole,setAccountRole] = useState('member')
  const [roleTarget,setRoleTarget] = useState<Member|null>(null)
  const [roleBusy,setRoleBusy] = useState(false)
  const [newRole,setNewRole] = useState('member')

  const load = async () => {
    setErr('')
    setLoading(true)
    try {
      setData(await api<Member[]>('/members'))
    } catch(e:any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function save(e:any){
    e.preventDefault()
    setErr('')
    setSuccess('')
    try{
      await api('/members',{
        method:'POST',
        body:JSON.stringify({
          ...form,
          email:form.email || null,
          phone:form.phone || null
        })
      })
      setSuccess('Member created successfully.')
      setOpen(false)
      setForm({full_name:'',email:'',phone:''})
      await load()
    }catch(e:any){
      setErr(e.message)
    }
  }

  function openAccount(member:Member){
    setSelected(member)
    setAccountPassword('')
    setAccountRole('member')
    setErr('')
    setSuccess('')
  }

  function openEdit(member:Member){
    setEditing(member)
    setEditForm({
      full_name: member.full_name || '',
      email: member.email || '',
      phone: member.phone || '',
      membership_status: member.membership_status || 'active',
    })
    setErr('')
    setSuccess('')
  }

  function openRole(member:Member){
    setRoleTarget(member)
    setNewRole('member')
    setErr('')
    setSuccess('')
  }

  async function saveRole(e:any){
    e.preventDefault()
    if(!roleTarget) return
    setErr('')
    setSuccess('')
    setRoleBusy(true)
    try{
      const res = await api<{role:string; email:string}>(`/members/${roleTarget.id}/role`,{
        method:'PATCH',
        body:JSON.stringify({role: newRole})
      })
      setSuccess(`Role for ${roleTarget.full_name} set to ${res.role || newRole}.`)
      setRoleTarget(null)
      await load()
    }catch(e:any){
      setErr(e.message)
    }finally{
      setRoleBusy(false)
    }
  }

  async function saveEdit(e:any){
    e.preventDefault()
    if(!editing) return
    setErr('')
    setSuccess('')
    setEditBusy(true)
    try{
      await api(`/members/${editing.id}`,{
        method:'PATCH',
        body:JSON.stringify({
          full_name: editForm.full_name,
          email: editForm.email || null,
          phone: editForm.phone || null,
          membership_status: editForm.membership_status,
        })
      })
      setSuccess(`Updated ${editForm.full_name}.`)
      setEditing(null)
      await load()
    }catch(e:any){
      setErr(e.message)
    }finally{
      setEditBusy(false)
    }
  }

  async function createAccount(e:any){
    e.preventDefault()
    if(!selected) return

    setErr('')
    setSuccess('')
    setAccountBusy(true)

    try{
      const res = await api<{role:string; email:string}>(`/members/${selected.id}/account`,{
        method:'POST',
        body:JSON.stringify({
          password: accountPassword,
          role: accountRole,
        })
      })
      setSuccess(`Login created for ${selected.full_name} as ${res.role || accountRole}.`)
      setSelected(null)
      setAccountPassword('')
      setAccountRole('member')
      await load()
    }catch(e:any){
      setErr(e.message)
    }finally{
      setAccountBusy(false)
    }
  }

  const canCreateAccount = role === 'admin'
  const canEdit = role === 'admin' || role === 'executive' || role === 'secretary'

  return (
    <AppShell title="Members">
      <div className="content">
        <PageHeader
          title="Members"
          description="Member registry, membership status and login-account management."
          action={
            <div style={{display:'flex',gap:8}}>
              <button className="iconbtn" onClick={()=>void load()} disabled={loading} title="Refresh">
                <RefreshCw size={16} className={loading ? 'spin' : ''}/>
              </button>
              {role !== 'unknown' && (
                <Button onClick={()=>setOpen(true)}>
                  <Plus size={15}/>Add member
                </Button>
              )}
            </div>
          }
        />

        {err&&<ErrorBox message={err}/>}
        {success&&<SuccessBox message={success}/>}

        <Card>
          <div className="section-title">
            <h3><Users size={17} style={{verticalAlign:'-3px'}}/> Member registry</h3>
            <span className="badge gray">{data.length} records</span>
          </div>

          {data.length ? (
            <Table
              headers={['Member no.','Name','Email','Phone','Status','Login','Joined','Action']}
              rows={data.map(m=>[
                <b key={m.id}>{m.member_no}</b>,
                m.full_name,
                m.email||'—',
                m.phone||'—',
                <span key="status" className={'badge '+(m.membership_status==='active'?'green':'gray')}>
                  {m.membership_status}
                </span>,
                <span key="login" className={'badge '+(m.has_login_account?'green':'amber')}>
                  {m.has_login_account ? 'Active' : 'Not created'}
                </span>,
                new Date(m.joined_at).toLocaleDateString(),
                <div key="actions" style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {canEdit && (
                    <Button variant="secondary" onClick={()=>openEdit(m)}>
                      <Pencil size={14}/>Edit
                    </Button>
                  )}
                  {canCreateAccount && !m.has_login_account && (
                    <Button variant="secondary" onClick={()=>openAccount(m)}>
                      <KeyRound size={14}/>Create login
                    </Button>
                  )}
                  {canCreateAccount && m.has_login_account && (
                    <Button variant="secondary" onClick={()=>openRole(m)}>
                      Set role
                    </Button>
                  )}
                  {!canCreateAccount && !canEdit && (
                      <span className="muted" style={{fontSize:11}}>
                        {m.has_login_account ? 'Account exists' : '—'}
                      </span>
                  )}
                </div>
              ])}
            />
          ) : (
            <Empty text={loading ? 'Loading members…' : 'No members available.'}/>
          )}
        </Card>
      </div>

      {open&&(
        <Modal title="Add member" onClose={()=>setOpen(false)}>
          <form onSubmit={save}>
            <Field
              label="Full name"
              value={form.full_name}
              onChange={(e:any)=>setForm({...form,full_name:e.target.value})}
              required
              minLength={2}
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(e:any)=>setForm({...form,email:e.target.value})}
              placeholder="Required later for login"
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(e:any)=>setForm({...form,phone:e.target.value})}
            />
            <div className="form-actions">
              <Button type="button" variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button type="submit">Create member</Button>
            </div>
          </form>
        </Modal>
      )}

      {editing&&(
        <Modal title={`Edit — ${editing.full_name}`} onClose={()=>setEditing(null)}>
          <form onSubmit={saveEdit}>
            <Field
              label="Full name"
              value={editForm.full_name}
              onChange={(e:any)=>setEditForm({...editForm,full_name:e.target.value})}
              required
              minLength={2}
            />
            <Field
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e:any)=>setEditForm({...editForm,email:e.target.value})}
            />
            <Field
              label="Phone"
              value={editForm.phone}
              onChange={(e:any)=>setEditForm({...editForm,phone:e.target.value})}
            />
            <label className="field">
              <span className="field-label">Membership status</span>
              <select
                className="input"
                value={editForm.membership_status}
                onChange={(e)=>setEditForm({...editForm,membership_status:e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
            <div className="form-actions">
              <Button type="button" variant="ghost" onClick={()=>setEditing(null)}>Cancel</Button>
              <Button type="submit" loading={editBusy}>Save changes</Button>
            </div>
          </form>
        </Modal>
      )}

      {selected&&(
        <Modal title={`Create login — ${selected.full_name}`} onClose={()=>setSelected(null)}>
          <form onSubmit={createAccount}>
            <div className="alert" style={{marginBottom:12}}>
              <KeyRound size={16}/>
              Login email: <b>{selected.email || 'missing — add email via Edit first'}</b>
            </div>

            {!selected.email && (
              <ErrorBox message="This member has no email. Use Edit to add an email before creating a login."/>
            )}

            <label className="field">
              <span className="field-label">Role</span>
              <select
                className="input"
                value={accountRole}
                onChange={(e)=>setAccountRole(e.target.value)}
              >
                {STAFF_ROLES.map(r=>(
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </label>

            <Field
              label="Temporary password"
              type="password"
              value={accountPassword}
              onChange={(e:any)=>setAccountPassword(e.target.value)}
              required
              minLength={12}
              placeholder="At least 12 characters"
              autoComplete="new-password"
            />
            <p className="muted" style={{fontSize:12,marginTop:-8,marginBottom:12}}>
              User must change this password on first login.
            </p>

            <div className="form-actions">
              <Button type="button" variant="ghost" onClick={()=>setSelected(null)}>Cancel</Button>
              <Button type="submit" loading={accountBusy} disabled={!selected.email || accountPassword.length < 12}>
                Create login
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {roleTarget&&(
        <Modal title={`Set role — ${roleTarget.full_name}`} onClose={()=>setRoleTarget(null)}>
          <form onSubmit={saveRole}>
            <p className="muted" style={{fontSize:12,marginBottom:12}}>
              Changes the login role for <b>{roleTarget.email || 'this member'}</b>.
            </p>
            <label className="field">
              <span className="field-label">Role</span>
              <select className="input" value={newRole} onChange={(e)=>setNewRole(e.target.value)}>
                {STAFF_ROLES.map(r=>(
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <Button type="button" variant="ghost" onClick={()=>setRoleTarget(null)}>Cancel</Button>
              <Button type="submit" loading={roleBusy}>Save role</Button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  )
}
