import type { Component } from 'vue'
import BasicCard from '@/components/nodes/BasicCard.vue'
import FlexContainer from '@/components/nodes/FlexContainer.vue'
import CircleShape from '~/components/nodes/shapes/CircleShape.vue'
import DiamondShape from '~/components/nodes/shapes/DiamondShape.vue'
import SquareShape from '~/components/nodes/shapes/SquareShape.vue'
import StarShape from '~/components/nodes/shapes/StarShape.vue'
import TrapezoidShape from '~/components/nodes/shapes/TrapezoidShape.vue'
import TriangleShape from '~/components/nodes/shapes/TriangleShape.vue'
import StartEndBlock from '~/components/nodes/flowchart/StartEndBlock.vue'
import ProcessBlock from '~/components/nodes/flowchart/ProcessBlock.vue'
import InputOutputBlock from '~/components/nodes/flowchart/InputOutputBlock.vue'
import DecisionBlock from '~/components/nodes/flowchart/DecisionBlock.vue'

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

  {
    id: 'shapes',
    name: 'Фигуры',
    types: [
      {
        id: 'circle-shape',
        name: 'Круг',
        component: CircleShape,
        defaultWidth: 100,
        defaultHeight: 100,
        previewBg: '#dbeafe',
        previewBorder: '#3b82f6',
        defaultProps: {
          backgroundColor: '#3b82f6',
          borderColor: '#1d4ed8',
        },
      },
      {
        id: 'square-shape',
        name: 'Квадрат',
        component: SquareShape,
        defaultWidth: 100,
        defaultHeight: 100,
        previewBg: '#d1fae5',
        previewBorder: '#10b981',
        defaultProps: {
          backgroundColor: '#10b981',
          borderColor: '#047857',
        },
      },
      {
        id: 'triangle-shape',
        name: 'Треугольник',
        component: TriangleShape,
        defaultWidth: 100,
        defaultHeight: 100,
        previewBg: '#fef3c7',
        previewBorder: '#f59e0b',
        defaultProps: {
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
        },
      },
      {
        id: 'diamond-shape',
        name: 'Ромб',
        component: DiamondShape,
        defaultWidth: 100,
        defaultHeight: 100,
        previewBg: '#f3e8ff',
        previewBorder: '#8b5cf6',
        defaultProps: {
          backgroundColor: '#8b5cf6',
          borderColor: '#7c3aed',
        },
      },
      {
        id: 'star-shape',
        name: 'Звезда',
        component: StarShape,
        defaultWidth: 100,
        defaultHeight: 100,
        previewBg: '#fef3c7',
        previewBorder: '#fbbf24',
        defaultProps: {
          backgroundColor: '#fbbf24',
          borderColor: '#f59e0b',
        },
      },
      {
        id: 'trapezoid-shape',
        name: 'Трапеция',
        component: TrapezoidShape,
        defaultWidth: 120,
        defaultHeight: 80,
        previewBg: '#fee2e2',
        previewBorder: '#ef4444',
        defaultProps: {
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
        },
      },
    ]
  },

  { id: 'uml', name: 'UML', types: [] },
  {
    id: 'flowchart',
    name: 'Блок-схемы',
    types: [
      {
        id: 'flowchart-start-end',
        name: 'Начало/Конец',
        component: StartEndBlock,
        defaultWidth: 160,
        defaultHeight: 80,
        previewBg: '#f9fafb',
        previewBorder: '#d1d5db',
        defaultProps: {
          content: 'Начало',
          backgroundColor: '#ffffff',
          borderColor: '#6b7280',
          borderWidth: 1,
          borderRadius: 100,
        },
      },
      {
        id: 'flowchart-process',
        name: 'Процесс',
        component: ProcessBlock,
        defaultWidth: 160,
        defaultHeight: 80,
        previewBg: '#f9fafb',
        previewBorder: '#d1d5db',
        defaultProps: {
          content: 'Процесс',
          backgroundColor: '#ffffff',
          borderColor: '#6b7280',
          borderWidth: 1,
          borderRadius: 0,
        },
      },
      {
        id: 'flowchart-input-output',
        name: 'Ввод/Вывод',
        component: InputOutputBlock,
        defaultWidth: 160,
        defaultHeight: 80,
        previewBg: '#f9fafb',
        previewBorder: '#d1d5db',
        defaultProps: {
          content: 'Ввод/Вывод',
          backgroundColor: '#ffffff',
          borderColor: '#6b7280',
          borderWidth: 1,
        },
      },
      {
        id: 'flowchart-decision',
        name: 'Решение',
        component: DecisionBlock,
        defaultWidth: 160,
        defaultHeight: 120,
        previewBg: '#f9fafb',
        previewBorder: '#d1d5db',
        defaultProps: {
          content: 'Условие?',
          backgroundColor: '#ffffff',
          borderColor: '#6b7280',
          borderWidth: 1,
        },
      },
    ]
  },
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
