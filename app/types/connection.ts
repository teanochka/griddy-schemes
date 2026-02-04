export type HandlePosition = 'top' | 'right' | 'bottom' | 'left'

export interface Connection {
    id: string | number
    sourceId: string | number
    targetId: string | number
    sourceHandle: HandlePosition
    targetHandle: HandlePosition
    type: 'straight' | 'orthogonal' | 'curved'
    markerEnd?: 'arrow' | 'none'
    style?: Record<string, string>
}
