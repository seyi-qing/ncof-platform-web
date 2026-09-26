'use client'
import {useEffect,useState} from 'react'
import {Users,WalletCards,CalendarDays,ArrowUpRight,Vote,Landmark,Bell} from 'lucide-react'
import AppShell from '@/components/AppShell'
import {api} from '@/lib/api'
import {getRole} from '@/lib/auth'
import {Card,Stat,PageHeader,Table,Empty,ErrorBox,Refresh} from '@/components/UI'

const naira=(v:any)=>{
  const n=Number(v)
  if(!Number.isFinite(n)) return '\u20A60.00'
  return '\u20A6'+n.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})
}

export default function Dashboard(){
  const role=getRole()
  const[staff,setStaff]=useState<any>(null)
  const[member,setMember]=useState<any>(null)
  const[err,setErr]=useState('')
  const load=()=>{
    setErr('')
    const p=role==='member'
      ?api('/member-portal/dashboard').then(setMember)
      :api('/admin/dashboard').then(setStaff)
    p.catch(e=>setErr(e.message))
  }
  useEffect(()=>{void load()}, [])
  return (
    <AppShell title="Dashboard">
      <div className="content">
        <PageHeader
          title="Overview"
          description={role==='member'?'Your NCOF membership at a glance.':'Association-wide operational overview.'}
          action={<Refresh onClick={load}/>}
        />
        {err&&<ErrorBox message={err}/>}
        {role==='member'?<MemberHome data={member}/>:<StaffHome data={staff} role={role}/>}
      </div>
    </AppShell>
  )
}

function MemberHome({data}:any){
  if(!data) return <div className="card">Loading dashboard…</div>
  return (
    <>
      <div className="hero">
        <div className="eyebrow" style={{color:'#62dff2'}}>MEMBER PORTAL</div>
        <h2>Welcome, {data.member.full_name}</h2>
        <p>Member {data.member.member_no} · <span className="badge green">{data.member.status}</span></p>
      </div>
      <div className="grid grid-3" style={{marginTop:16}}>
        <Stat label="Dues outstanding" value={naira(data.balances.dues_outstanding)} meta="Current balance" icon={WalletCards}/>
        <Stat label="Savings balance" value={naira(data.balances.savings)} meta="Posted balance" icon={ArrowUpRight}/>
        <Stat label="Loan outstanding" value={naira(data.balances.loan_outstanding)} meta="Repayment balance" icon={Landmark}/>
      </div>
      <div className="grid grid-2" style={{marginTop:16}}>
        <Card>
          <div className="section-title"><h3>Membership</h3><Users size={18}/></div>
          <p className="muted" style={{fontSize:12}}>Attendance records: <b>{data.attendance_records}</b></p>
          <p className="muted" style={{fontSize:12}}>Unread notifications: <b>{data.unread_notifications}</b></p>
        </Card>
        <Card>
          <div className="section-title"><h3>Quick actions</h3></div>
          <div className="quick-grid">
            <a className="quick" href="/finance"><WalletCards size={17}/><b>Finance</b><span>View dues & transactions</span></a>
            <a className="quick" href="/elections"><Vote size={17}/><b>Elections</b><span>View active ballots</span></a>
            <a className="quick" href="/notifications"><Bell size={17}/><b>Notifications</b><span>Read updates</span></a>
          </div>
        </Card>
      </div>
    </>
  )
}

function StaffHome({data,role}:any){
  if(!data) return <div className="card">Loading dashboard…</div>
  return (
    <>
      <div className="grid grid-4">
        <Stat label="Members" value={data.members} meta={`${data.users} linked users`} icon={Users}/>
        <Stat label="Meetings" value={data.meetings} meta="Recorded meetings" icon={CalendarDays}/>
        <Stat label="Transactions" value={data.transactions} meta="Posted financial records" icon={WalletCards}/>
        <Stat label="Savings deposits" value={naira(data.savings_deposits)} meta="Total credits" icon={ArrowUpRight}/>
      </div>
      <div className="grid grid-2" style={{marginTop:16}}>
        <Card>
          <div className="section-title"><h3>Dues position</h3></div>
          <Table headers={['Metric','Amount']} rows={[[<>Due</>,naira(data.dues_due)],[<>Paid</>,naira(data.dues_paid)]]}/>
        </Card>
        <Card>
          <div className="section-title"><h3>Workspace</h3><span className="badge blue">{role}</span></div>
          <div className="quick-grid">
            <a className="quick" href="/members"><Users/><b>Members</b><span>Manage member records</span></a>
            <a className="quick" href="/finance"><WalletCards/><b>Finance</b><span>Dues & transactions</span></a>
            <a className="quick" href="/elections"><Vote/><b>Elections</b><span>Governance voting</span></a>
          </div>
        </Card>
      </div>
    </>
  )
}
