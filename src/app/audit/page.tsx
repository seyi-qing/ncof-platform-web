'use client'
import {useEffect,useState} from 'react'
import AppShell from '@/components/AppShell'
import {api} from '@/lib/api'
import {Card,PageHeader,Stat,ErrorBox} from '@/components/UI'

export default function Audit(){
  const [health,setHealth]=useState<any>(null)
  const [audit,setAudit]=useState<any>(null)
  const [err,setErr]=useState('')
  useEffect(()=>{
    Promise.all([api('/controls/controls/health'),api('/controls/audit/verify')])
      .then(([h,a])=>{setHealth(h);setAudit(a)})
      .catch(e=>setErr(e.message))
  },[])
  return (
    <AppShell title="Audit & Controls">
      <div className="content">
        <PageHeader title="Audit & Controls" description="Control-plane health and audit integrity checks."/>
        {err&&<ErrorBox message={err}/>}
        <div className="grid grid-3">
          <Stat label="Controls" value={health?.status||'—'} meta="Backend control health"/>
          <Stat label="Audit chain" value={audit?.valid===true?'Valid':audit?.valid===false?'Invalid':'—'} meta="Integrity verification"/>
          <Stat label="API" value="Online" meta="Connected to production API"/>
        </div>
        <Card className="json-card"><pre>{JSON.stringify({health,audit},null,2)}</pre></Card>
      </div>
    </AppShell>
  )
}
