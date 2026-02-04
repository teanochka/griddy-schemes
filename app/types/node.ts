/**
 * Базовый тип узла редактора диаграмм.
 * Единый формат для фронта и JSON-хранилища (cards).
 * Тип-специфичные поля (content, src, textAlign, backgroundColor и т.д.) — в том же объекте.
 */
export interface Node {
  id: number | string
  type: string
  x: number
  y: number
  width: number
  height: number
  parentId?: number | string | null

  // Content
  /** Базовые карточки, текст и т.п. */
  content?: string
  /** image-block */
  src?: string
  /** Multiple editable fields for advanced nodes like UML classes */
  fields?: Array<{ id: string; value: string }>

  // Fill & Stroke
  /** Заливка */
  backgroundColor?: string
  /** Цвет обводки */
  borderColor?: string
  /** Толщина обводки */
  borderWidth?: number
  /** Радиус скругления (число для px, строка для % или других значений) */
  borderRadius?: number | string

  // Typography
  /** Выравнивание текста */
  textAlign?: 'left' | 'center' | 'right'
  /** Размер шрифта */
  fontSize?: number
  /** Цвет текста */
  textColor?: string
  /** Жирность текста */
  fontWeight?: number

  // Effects
  /** Прозрачность (0-100) */
  opacity?: number
  /** Цвет тени */
  shadowColor?: string
  /** Размытие тени */
  shadowBlur?: number
  /** Смещение тени по X */
  shadowOffsetX?: number
  /** Смещение тени по Y */
  shadowOffsetY?: number

  /** Совместимость со старыми карточками */
  style?: Record<string, string>
  [key: string]: unknown
}

export interface CreateNodeDefaults {
  width?: number
  height?: number
  content?: string
  defaultProps?: Record<string, unknown>
}

/**
 * Создаёт узел с дефолтами. id генерируется, если не передан.
 * defaults обычно берутся из реестра компонентов по type.
 */
export function createNode(
  type: string,
  overrides: Partial<Node> = {},
  defaults?: CreateNodeDefaults
): Node {
  const defW = defaults?.width ?? 120
  const defH = defaults?.height ?? 120
  const base = {
    id: overrides.id ?? Date.now(),
    type,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    width: overrides.width ?? defW,
    height: overrides.height ?? defH,
    parentId: overrides.parentId ?? null,
  }
  return { ...base, ...defaults?.defaultProps, ...overrides } as Node
}

/**
 * Node types that can contain children (layout category)
 */
export const CONTAINER_TYPES = ['flex-container'] as const

/**
 * Check if a node type can contain children
 */
export function isContainerType(type: string): boolean {
  return (CONTAINER_TYPES as readonly string[]).includes(type)
}

/**
 * Check if a node is a container
 */
export function isContainer(node: Node): boolean {
  return isContainerType(node.type)
}

/**
 * Get direct children of a node
 */
export function getChildren(nodes: Node[], parentId: number | string): Node[] {
  return nodes.filter((n) => n.parentId === parentId)
}

/**
 * Get root nodes (nodes with no parent)
 */
export function getRootNodes(nodes: Node[]): Node[] {
  return nodes.filter((n) => n.parentId == null)
}

/**
 * Get all container nodes from the list
 */
export function getContainers(nodes: Node[]): Node[] {
  return nodes.filter(isContainer)
}
