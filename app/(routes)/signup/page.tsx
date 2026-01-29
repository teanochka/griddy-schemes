'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export default function SignUp() {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const { register, loading } = useAuth()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!nickname.trim()) newErrors.nickname = 'Nickname is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const ok = await register(email, nickname, password)
    if (!ok) setErrors({ submit: 'Registration failed' })
  }

  return (
    <div className="py-16">
      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
        <div
          className="hidden lg:block lg:w-1/2 bg-cover"
          style={{
            backgroundImage:
              "url('https://source.unsplash.com/Mv9hjnEUHR4/600x800')",
          }}
        />
        <div className="w-full p-8 lg:w-1/2">
          <h2 className="text-2xl font-semibold text-gray-700 text-center mb-2">Create an Account!</h2>

          <form onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.submit}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Your Nickname"
                className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:shadow-outline ${
                  errors.nickname ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nickname && (
                <p className="text-xs italic text-red-500 mt-1">{errors.nickname}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:shadow-outline ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-xs italic text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:shadow-outline ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && (
                  <p className="text-xs italic text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:shadow-outline ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs italic text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Registering...' : 'Register Account'}
              </Button>
            </div>

            <hr className="mb-4" />

            <div className="text-center mb-3">
              <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-800">
                Forgot Password?
              </Link>
            </div>

            <div className="text-center">
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-800">
                Already have an account? <span className="font-semibold">Login!</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}