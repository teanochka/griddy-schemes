'use client'

import { useEffect, useRef } from 'react'

export type WSMessage = {
  type: string
  [key: string]: any
}

export function useProjectSocket(
  projectId: number | string | undefined,
  nickname: string | undefined,
  onMessage?: (msg: WSMessage) => void
) {
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!projectId || !nickname) return

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/${projectId}/${nickname}`
    )

    socketRef.current = ws

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        onMessage?.(msg)
      } catch (e) {
        console.error('WS parse error', e)
      }
    }

    return () => {
      ws.close()
    }
  }, [projectId, nickname, onMessage])

  const send = (payload: WSMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload))
    }
  }

  return { send }
}
