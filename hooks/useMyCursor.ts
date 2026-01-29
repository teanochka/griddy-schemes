'use client'

import { useState, useRef, useCallback } from 'react'
import { useProjectSocket } from './useProjectSocket'

export function useMyCursor(
  projectId: number | string | undefined,
  nickname: string | undefined
) {
  const lastSent = useRef(0);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [message, setMessage] = useState<string>('');

  const { send } = useProjectSocket(projectId, nickname);

  const sendCursor = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastSent.current < 30) return;

    setCursor({ x, y });
    
    send({
      type: 'cursor_move',
      x,
      y,
    });

    lastSent.current = now;
  }, [send]);

  const clearCursor = useCallback(() => {
    setCursor(null);
  }, []);

  const updateCursor = useCallback((cursor: { x: number; y: number } | null) => {
    if (cursor) {
      sendCursor(cursor.x, cursor.y);
    } else {
      setCursor(null);
    }
  }, [sendCursor]);

  return {
    cursor,
    message,
    updateCursor,
    clearCursor,
    setMessage,
    sendCursor,
  };
}