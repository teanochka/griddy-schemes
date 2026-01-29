'use client'

import { useRef, useCallback } from 'react'
import { useProjectSocket } from './useProjectSocket'

export function useMyCursor(
  projectId: number | string | undefined,
  nickname: string | undefined
) {
  const lastSent = useRef(0);

  const { send } = useProjectSocket(projectId, nickname);

  const sendCursor = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastSent.current < 30) return;

    send({
      type: 'cursor_move',
      x,
      y,
    });

    lastSent.current = now;
  }, [send]);

  return { sendCursor };
}