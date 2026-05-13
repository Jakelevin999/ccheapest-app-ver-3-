'use client'

import { useEffect, useState } from 'react'
import { getSession } from '../lib/auth'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const { data } = await getSession()

      if (!data.session) {
        window.location.href = '/login'
        return
      }

      setLoading(false)
    }

    checkSession()
  }, [])

  if (loading) {
    return (
      <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f7'}}>
        Loading...
      </div>
    )
  }

  return <>{children}</>
}
