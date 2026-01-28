'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      try {
        const form = new URLSearchParams()
        form.append('username', email)
        form.append('password', password)

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          body: form,
          credentials: 'include',
        })

        if (!res.ok) return false

        const data = await res.json()
        setUser(data)
        router.push('/dashboard')
        return true
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const register = useCallback(
    async (email: string, nickname: string, password: string) => {
      setLoading(true)
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, nickname, password }),
          credentials: 'include',
        })

        if (!res.ok) return false

        // сразу логинимся → cookie установится
        return await login(email, password)
      } finally {
        setLoading(false)
      }
    },
    [login]
  )

  const logout = useCallback(async () => {
    setUser(null)
    router.push('/login')
  }, [router])

  return { user, login, register, logout, loading }
}
