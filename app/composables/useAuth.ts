'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
  const router = useRouter()
  const [user, setUser] = useState<{ id: number; nickname?: string; email?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('auth_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const form = new URLSearchParams()
      form.append('username', email)
      form.append('password', password)

      const response = await fetch('http://127.0.0.1:8000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })

      if (response.ok) {
        const data = await response.json()
        const accessToken = data.access_token
        localStorage.setItem('auth_token', accessToken)
        setToken(accessToken)
        const u = { id: data.user_id, nickname: data.nickname, email }
        localStorage.setItem('auth_user', JSON.stringify(u))
        setUser(u)
        router.push('/dashboard')
        return true
      }
      return false
    } catch (e) {
      console.error('Login error', e)
      return false
    } finally {
      setLoading(false)
    }
  }, [router])

  const register = useCallback(async (email: string, nickname: string, password: string) => {
    setLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nickname, password }),
      })
      if (response.ok) {
        // Auto-login after successful registration
        await login(email, password)
        return true
      }
      const data = await response.json().catch(() => ({}))
      console.error('Register failed', data)
      return false
    } catch (e) {
      console.error('Register error', e)
      return false
    } finally {
      setLoading(false)
    }
  }, [login])

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    setToken(null)
    setUser(null)
    router.push('/login')
  }, [router])

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const t = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null)
    const baseUrl = 'http://127.0.0.1:8000'
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
    const headers = {
      ...(options.headers || {}),
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    }
    return fetch(fullUrl, { ...options, headers })
  }, [token])

  return { user, token, login, register, logout, loading, authFetch }
}