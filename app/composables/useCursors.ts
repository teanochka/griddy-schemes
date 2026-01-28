import { ref, onUnmounted } from 'vue'

export function useCursors(
    projectId: string | string[], 
    nickname: string, 
    onRemoteCardsUpdate?: (cards: any[]) => void
) {
  const cursors = ref({})
  let socket: WebSocket | null = null

  const getRandomColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
    return '#' + '00000'.substring(0, 6 - c.length) + c
  }

  const connect = () => {
    if (!projectId || !nickname) return

    socket = new WebSocket(`ws://127.0.0.1:8000/ws/${projectId}/${nickname}`)

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      if (msg.type === 'update_cards') {
         if (onRemoteCardsUpdate && msg.data) {
             onRemoteCardsUpdate(msg.data)
         }
      }
      else if (msg.type === 'disconnect') {
        const newCursors = { ...cursors.value }
        delete newCursors[msg.user]
        cursors.value = newCursors
      } 
      else if (msg.data && msg.data.type === 'cursor_move') {
        cursors.value = {
          ...cursors.value,
          [msg.user]: {
            x: msg.data.x,
            y: msg.data.y,
            user: msg.user,
            color: cursors.value[msg.user]?.color || getRandomColor(msg.user)
          }
        }
      }
    }
  }

  const sendData = (payload: any) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(payload))
      }
  }

  let lastSent = 0
  const sendCursor = (x: number, y: number) => {
    const now = Date.now()
    if (now - lastSent < 30) return
    
    sendData({ type: 'cursor_move', x, y })
    lastSent = now
  }

  onUnmounted(() => {
    if (socket) socket.close()
  })

  return { cursors, sendCursor, sendData, connect }
}