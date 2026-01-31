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
