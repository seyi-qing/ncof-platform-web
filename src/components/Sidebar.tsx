'use client'
import Link from 'next/link'
import {usePathname,useRouter} from 'next/navigation'
import {LayoutDashboard,Users,WalletCards,Landmark,CalendarDays,Vote,ShieldCheck,Bell,FileText,LogOut,X,Settings,ClipboardList} from 'lucide-react'
import {clearSession} from '@/lib/api'
import {getRole} from '@/lib/auth'

const items=[
  ['/dashboard','Dashboard',LayoutDashboard,'all'],
  ['/members','Members',Users,'staff'],
  ['/finance','Finance',WalletCards,'finance'],
  ['/operations','Operations',Landmark,'staff'],
  ['/meetings','Meetings',CalendarDays,'staff+member'],
  ['/elections','Elections',Vote,'all'],
  ['/governance','Governance',ShieldCheck,'all'],
  ['/documents','Documents',FileText,'all'],
  ['/notifications','Notifications',Bell,'all'],
  ['/settings','Settings',Settings,'all'],
] as const

function allowed(kind:string,role:string){
  if(kind==='all')return true
  if(kind==='staff')return role!=='member'
  if(kind==='finance')return ['admin','executive','treasurer','auditor','member'].includes(role)
  return true
}

export default function Sidebar({open,onClose}:{open:boolean;onClose:()=>void}){
  const p=usePathname()
  const r=useRouter()
  const role=getRole()
  return (
    <aside className={'sidebar '+(open?'open':'')}>
      <div className="brand">
        <div className="logo">N</div>
        <div><b>NCOF</b><span>Association Platform</span></div>
        <button className="mobilemenu" onClick={onClose}><X size={18}/></button>
      </div>
      <nav className="nav">
        <small>WORKSPACE</small>
        {items.filter(x=>allowed(x[3],role)).map(([href,label,Icon])=>(
          <Link key={href} href={href} className={p===href||p.startsWith(href+'/')?'active':''} onClick={onClose}>
            <Icon size={17}/>{label}
          </Link>
        ))}
        <small className="nav-section">SYSTEM</small>
        {role!=='member'&&(
          <Link href="/audit" className={p.startsWith('/audit')?'active':''} onClick={onClose}>
            <ClipboardList size={17}/>Audit & Controls
          </Link>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="org-note">Nigerian Committee of Friends<br/><span>Connected to NCOF API v1.7.x</span></div>
        <button className="btn ghost" style={{width:'100%'}} onClick={()=>{clearSession();r.replace('/login')}}>
          <LogOut size={15}/>Sign out
        </button>
      </div>
    </aside>
  )
}
