'use client'
import AppShell from '@/components/AppShell'
import {API_BASE} from '@/lib/api'
import {Card,PageHeader} from '@/components/UI'
import {getRole} from '@/lib/auth'

export default function Settings(){
  return (
    <AppShell title="Settings">
      <div className="content">
        <PageHeader title="Settings" description="Portal and connection information."/>
        <div className="grid grid-2">
          <Card>
            <h3>Account</h3>
            <p className="muted" style={{fontSize:12}}>Current role: <b style={{textTransform:'capitalize'}}>{getRole()}</b></p>
            <p className="muted" style={{fontSize:12}}>Authentication is handled by the NCOF API.</p>
          </Card>
          <Card>
            <h3>API connection</h3>
            <p className="muted" style={{fontSize:11,wordBreak:'break-all'}}>{API_BASE}</p>
            <p className="muted" style={{fontSize:11}}>Frontend environment variable: <code>NEXT_PUBLIC_API_URL</code></p>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
