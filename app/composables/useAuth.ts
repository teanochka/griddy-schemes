'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
  const router = useRouter()
  const [user, setUser] = useState<{
    user_id: number
    nickname: string
    email: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  // Загружаем пользователя один раз при инициализации
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!res.ok) {
          setUser(null)
          return
        }
        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error('Failed to fetch user:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

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
        return await login(email, password)
      } finally {
        setLoading(false)
      }
    },
    [login]
  )

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    router.push('/login')
  }, [router])

  return { user, login, register, logout, loading }
}