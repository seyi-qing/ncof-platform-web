'use client'
import {useState} from 'react'
import {Menu} from 'lucide-react'
import Protected from '@/components/Protected'
import Sidebar from '@/components/Sidebar'
import {getRole} from '@/lib/auth'

export default function AppShell({title,children}:{title:string;children:React.ReactNode}){
  const [open,setOpen]=useState(false)
  const role=getRole()
  return (
    <Protected>
      <div className="shell">
        <Sidebar open={open} onClose={()=>setOpen(false)}/>
        <div className="main">
          <header className="topbar">
            <button className="mobilemenu" onClick={()=>setOpen(true)}><Menu size={18}/></button>
            <div>
              <h1>{title}</h1>
              <p className="muted" style={{fontSize:11,margin:0}}>Signed in as <b style={{textTransform:'capitalize'}}>{role}</b></p>
            </div>
          </header>
          {children}
        </div>
      </div>
    </Protected>
  )
}
