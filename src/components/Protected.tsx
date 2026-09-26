'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/api'

export default function Protected({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const session = getSession()

    if (!session?.access_token) {
      router.replace('/login')
      return
    }

    if (session.must_change_password) {
      router.replace('/change-password')
      return
    }

    setOk(true)
  }, [router])

  if (!ok) {
    return <div className="loading">Loading NCOF Portal…</div>
  }

  return <>{children}</>
}
