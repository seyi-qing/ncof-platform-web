'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {Activity, LogOut, Shield} from 'lucide-react'
import AppShell from '@/components/AppShell'
import {API_BASE, getSession} from '@/lib/api'
import {getRole} from '@/lib/auth'
import {Card, PageHeader, Button, ErrorBox, SuccessBox} from '@/components/UI'

export default function Settings(){
  const router = useRouter()
  const role = getRole()
  const [health, setHealth] = useState<any>(null)
  const [ready, setReady] = useState<any>(null)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  async function ping(){
    setErr('')
    setOk('')
    try{
      const base = API_BASE.replace(/\/api\/v1\/?$/, '')
      const [h, r] = await Promise.all([
        fetch(`${base}/health`).then(x=>x.json()),
        fetch(`${base}/ready`).then(x=>x.json()),
      ])
      setHealth(h)
      setReady(r)
      setOk('Connection check completed.')
    }catch(e:any){
      setErr(e.message || 'Health check failed')
    }
  }

  useEffect(()=>{ void ping() }, [])

  function signOut(){
    localStorage.removeItem('ncof_session')
    router.replace('/login')
  }

  const session = typeof window !== 'undefined' ? getSession() : null

  return (
    <AppShell title="Settings">
      <div className="content">
        <PageHeader
          title="Settings"
          description="Account, API connection and session."
          action={
            <Button variant="secondary" onClick={signOut}>
              <LogOut size={15}/> Sign out
            </Button>
          }
        />

        {err && <ErrorBox message={err}/>}
        {ok && <SuccessBox message={ok}/>}

        <div className="grid grid-2">
          <Card>
            <div className="section-title">
              <h3><Shield size={16} style={{verticalAlign:'-3px'}}/> Account</h3>
            </div>
            <p className="muted" style={{fontSize:13}}>
              Role: <b style={{textTransform:'capitalize'}}>{role || '—'}</b>
            </p>
            <p className="muted" style={{fontSize:12}}>
              Session: {session?.access_token ? 'Signed in' : 'No session'}
            </p>
            <p className="muted" style={{fontSize:12,marginTop:8}}>
              Change password from the security prompt when required, or contact an admin for a reset.
            </p>
          </Card>

          <Card>
            <div className="section-title">
              <h3><Activity size={16} style={{verticalAlign:'-3px'}}/> API connection</h3>
              <Button variant="secondary" onClick={()=>void ping()}>Recheck</Button>
            </div>
            <p className="muted" style={{fontSize:11,wordBreak:'break-all'}}>{API_BASE}</p>
            <p className="muted" style={{fontSize:12,marginTop:8}}>
              Health: <b>{health?.status || '—'}</b>
              {health?.version ? ` · v${health.version}` : ''}
            </p>
            <p className="muted" style={{fontSize:12}}>
              Database: <b>{ready?.database || ready?.status || '—'}</b>
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
