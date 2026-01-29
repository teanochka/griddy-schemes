'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useProjectSocket } from './useProjectSocket'

export function useBroadcast(
  projectId: number | string | undefined,
  nickname: string | undefined
) {
  const callbacksRef = useRef<((event: any) => void)[]>([]);
  
  const handleMessage = useCallback((msg: any) => {
    callbacksRef.current.forEach(cb => cb(msg));
  }, []);

  const { send } = useProjectSocket(projectId, nickname, handleMessage);

  const onEvent = useCallback((callback: (event: any) => void) => {
    callbacksRef.current.push(callback);
    
    // Return cleanup function
    return () => {
      const index = callbacksRef.current.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.splice(index, 1);
      }
    };
  }, []);

  return { broadcast: send, onEvent };
}