'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/api'

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!getSession()?.access_token) {
      router.replace('/login')
      return
    }
    setOk(true)
  }, [router])

  if (!ok) {
    return <div className="loading">Loading NCOF Portal…</div>
  }
  return <>{children}</>
}
