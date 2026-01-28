'use client'

import { Button } from '@/components/ui/button'
import React from 'react'
import { useAuth } from '../../composables/useAuth'

function Dashboard() {
  const { logout } = useAuth()

  return (
    <div className="flex justify-between items-center p-4">
      <div>Dashboard</div>
      <Button onClick={logout}>Logout</Button>
    </div>
  )
}

export default Dashboard