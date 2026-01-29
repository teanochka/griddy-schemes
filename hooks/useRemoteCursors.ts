'use client'

import { useState, useCallback } from 'react'
import { useProjectSocket } from './useProjectSocket'

type RemoteCursor = {
  x: number
  y: number
  user: string
  color: string
}

const getRandomColor = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase()
  return '#' + '00000'.substring(0, 6 - c.length) + c
}

export function useRemoteCursors(
  projectId: number | string | undefined,
  nickname: string | undefined
) {
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({})

  const handleMessage = useCallback((msg: any) => {
    if (msg.type === 'disconnect') {
      setCursors((prev) => {
        const copy = { ...prev }
        delete copy[msg.user]
        return copy
      })
    }

    if (msg.type === 'cursor_move' && msg.data) {
      setCursors((prev) => ({
        ...prev,
        [msg.user]: {
          x: msg.data.x,
          y: msg.data.y,
          user: msg.user,
          color: prev[msg.user]?.color ?? getRandomColor(msg.user),
        },
      }))
    }
  }, [])

  useProjectSocket(projectId, nickname, handleMessage)

  return cursors
}