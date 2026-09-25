'use client'
import {FormEvent,useState} from 'react'
import {useRouter} from 'next/navigation'
import {ShieldCheck} from 'lucide-react'
import {api,setSession} from '@/lib/api'
import {Button,ErrorBox,Field} from '@/components/UI'

export default function Login(){
  const r=useRouter()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [busy,setBusy]=useState(false)
  const [err,setErr]=useState('')
  async function submit(e:FormEvent){
    e.preventDefault(); setBusy(true); setErr('')
    try{
      const s=await api<any>('/auth/login',{method:'POST',body:JSON.stringify({email,password})})
      setSession(s); r.replace('/dashboard')
    }catch(e:any){ setErr(e.message) }
    finally{ setBusy(false) }
  }
  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="logo">N</div>
        <h1>One platform for NCOF operations.</h1>
        <p>Members, finance, governance, meetings and elections in one controlled workspace connected to the NCOF Platform API.</p>
        <div className="pill-row">
          <span className="badge blue">FastAPI</span>
          <span className="badge blue">PostgreSQL</span>
          <span className="badge blue">NCOF API v1.7.x</span>
        </div>
      </div>
      <div className="login-box">
        <div className="login-card">
          <ShieldCheck size={28} color="#1677ff"/>
          <h2>Sign in</h2>
          <p>Use your NCOF account credentials.</p>
          {err&&<ErrorBox message={err}/>}
          <form onSubmit={submit}>
            <Field label="Email" type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} required autoComplete="email"/>
            <Field label="Password" type="password" value={password} onChange={(e:any)=>setPassword(e.target.value)} required autoComplete="current-password"/>
            <Button loading={busy}>Sign in</Button>
          </form>
          <p style={{marginTop:20,fontSize:10}}>Your credentials are sent directly to the NCOF API over HTTPS.</p>
        </div>
      </div>
    </div>
  )
}
