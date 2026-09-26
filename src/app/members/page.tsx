'use client'

import {useEffect, useState} from 'react'
import {Plus, Users, KeyRound, RefreshCw} from 'lucide-react'
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

export default function Members(){
  const role = getRole()
  const [data,setData] = useState<Member[]>([])
  const [open,setOpen] = useState(false)
  const [selected,setSelected] = useState<Member|null>(null)
  const [err,setErr] = useState('')
  const [success,setSuccess] = useState('')
  const [loading,setLoading] = useState(false)
  const [accountBusy,setAccountBusy] = useState(false)
  const [form,setForm] = useState({full_name:'',email:'',phone:''})
  const [accountPassword,setAccountPassword] = useState('')

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

  useEffect(() => { load() }, [])

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
    setErr('')
    setSuccess('')
  }

  async function createAccount(e:any){
    e.preventDefault()
    if(!selected) return

    setErr('')
    setSuccess('')
    setAccountBusy(true)

    try{
      await api(`/members/${selected.id}/account`,{
        method:'POST',
        body:JSON.stringify({password:accountPassword})
      })
      setSuccess(`Login account created for ${selected.full_name}.`)
      setSelected(null)
      setAccountPassword('')
      await load()
    }catch(e:any){
      setErr(e.message)
    }finally{
      setAccountBusy(false)
    }
  }

  const canCreateAccount = role === 'admin'

  return (
    <AppShell title="Members">
      <div className="content">
        <PageHeader
          title="Members"
          description="Member registry, membership status and login-account management."
          action={
            <div style={{display:'flex',gap:8}}>
              <button className="iconbtn" onClick={load} disabled={loading} title="Refresh">
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
                canCreateAccount && !m.has_login_account ? (
                  <Button key="account" variant="secondary" onClick={()=>openAccount(m)}>
                    <KeyRound size={14}/>Create login
                  </Button>
                ) : (
                  <span key="account-status" className="muted" style={{fontSize:11}}>
                    {m.has_login_account ? 'Account exists' : 'Admin only'}
                  </span>
                )
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
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(e:any)=>setForm({...form,email:e.target.value})}
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

      {selected&&(
        <Modal title={`Create login — ${selected.full_name}`} onClose={()=>setSelected(null)}>
          <form onSubmit={createAccount}>
            <div className="alert" style={{marginBottom:12}}>
              <KeyRound size={16}/>
              This creates a member login using <b>{selected.email || 'the member email'}</b>.
            </div>

            {!selected.email && (
              <ErrorBox message="This member has no email address. Add an email to the member record before creating a login."/>
            )}

            <Field
              label="Temporary password"
              type="password"
              minLength={12}
              maxLength={128}
              value={accountPassword}
              onChange={(e:any)=>setAccountPassword(e.target.value)}
              placeholder="At least 12 characters"
              required
              disabled={!selected.email}
              autoComplete="new-password"
            />

            <p className="muted" style={{fontSize:11,marginTop:-4}}>
              The member will sign in with their email address and this password.
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
    </AppShell>
  )
              }
