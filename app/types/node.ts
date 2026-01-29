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
  /** Базовые карточки, текст и т.п. */
  content?: string
  /** Заливка, цвет обводки и т.д. */
  backgroundColor?: string
  textAlign?: 'left' | 'center' | 'right'
  /** image-block */
  src?: string
  /** Совместимость со старыми карточками */
  style?: Record<string, string>
  [key: string]: unknown
}

export interface CreateNodeDefaults {
  width?: number
  height?: number
  content?: string
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
  return {
    id: overrides.id ?? Date.now(),
    type,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    width: overrides.width ?? defW,
    height: overrides.height ?? defH,
    parentId: overrides.parentId ?? null,
    ...overrides,
  } as Node
}
