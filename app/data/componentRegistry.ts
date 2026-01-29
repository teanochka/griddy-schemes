import type { Component } from 'vue'
import BasicCard from '@/components/nodes/BasicCard.vue'
import FlexContainer from '@/components/nodes/FlexContainer.vue'

export interface ComponentTypeMeta {
  id: string
  name: string
  component: Component
  defaultWidth: number
  defaultHeight: number
  /** Цвет фона превью (панель, DragImage) */
  previewBg?: string
  /** Цвет рамки превью */
  previewBorder?: string
  defaultProps?: Record<string, unknown>
}

export interface ComponentCategory {
  id: string
  name: string
  types: ComponentTypeMeta[]
}

const categories: ComponentCategory[] = [
  {
    id: 'base',
    name: 'Базовые',
    types: [
      {
        id: 'basic-card',
        name: 'Карточка',
        component: BasicCard,
        defaultWidth: 120,
        defaultHeight: 120,
        previewBg: '#fef3c7',
        previewBorder: '#f59e0b',
        defaultProps: { content: 'Новый элемент' },
      },
    ],
  },
  {
    id: 'layout',
    name: 'Layout',
    types: [
      {
        id: 'flex-container',
        name: 'Контейнер',
        component: FlexContainer,
        defaultWidth: 200,
        defaultHeight: 120,
        previewBg: '#f3e8ff',
        previewBorder: '#8b5cf6',
      },
    ],
  },
  { id: 'shapes', name: 'Фигуры', types: [] },
  { id: 'uml', name: 'UML', types: [] },
  { id: 'flowchart', name: 'Блок-схемы', types: [] },
  { id: 'other', name: 'Прочее', types: [] },
]

const byType = new Map<string, ComponentTypeMeta>()
for (const cat of categories) {
  for (const t of cat.types) {
    byType.set(t.id, t)
  }
}

export const componentRegistry = {
  categories,

  getType(typeId: string): ComponentTypeMeta | undefined {
    return byType.get(typeId)
  },

  getDefaults(typeId: string): { width: number; height: number; defaultProps?: Record<string, unknown> } | undefined {
    const meta = byType.get(typeId)
    if (!meta) return undefined
    return {
      width: meta.defaultWidth,
      height: meta.defaultHeight,
      defaultProps: meta.defaultProps,
    }
  },

  getPreviewColors(typeId: string): { bg: string; border: string } {
    const meta = byType.get(typeId)
    return {
      bg: meta?.previewBg ?? '#e5e7eb',
      border: meta?.previewBorder ?? '#9ca3af',
    }
  },

  getAllTypes(): ComponentTypeMeta[] {
    return [...byType.values()]
  },
}
