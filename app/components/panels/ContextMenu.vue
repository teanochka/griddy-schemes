<template>
  <div
    v-if="node"
    class="fixed right-64 top-20 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-30"
    style="max-height: calc(100vh - 120px);"
    @mousedown.stop
  >
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <h3 class="text-sm font-semibold text-gray-800">Свойства</h3>
      <p class="text-xs text-gray-500 mt-0.5">{{ node.type }}</p>
    </div>

    <!-- Scrollable Content -->
    <div class="overflow-y-auto" style="max-height: calc(100vh - 200px);">
      <!-- Position & Size -->
      <PropertySection title="Позиция и размер">
        <div class="grid grid-cols-2 gap-2">
          <PropertyInput
            label="X"
            :value="node.x"
            @update="(v) => updateProp('x', v)"
          />
          <PropertyInput
            label="Y"
            :value="node.y"
            @update="(v) => updateProp('y', v)"
          />
          <PropertyInput
            label="Ширина"
            :value="node.width"
            :min="50"
            :max="1200"
            @update="(v) => updateProp('width', v)"
          />
          <PropertyInput
            label="Высота"
            :value="node.height"
            :min="50"
            :max="1200"
            @update="(v) => updateProp('height', v)"
          />
        </div>
      </PropertySection>

      <!-- Fill -->
      <PropertySection title="Заливка">
        <PropertyColorPicker
          label="Цвет"
          :value="node.backgroundColor"
          @update="(v) => updateProp('backgroundColor', v)"
        />
        <PropertySlider
          label="Прозрачность"
          :value="node.opacity ?? 100"
          :min="0"
          :max="100"
          suffix="%"
          @update="(v) => updateProp('opacity', v)"
        />
      </PropertySection>

      <!-- Stroke -->
      <PropertySection title="Обводка">
        <PropertyColorPicker
          label="Цвет"
          :value="node.borderColor"
          @update="(v) => updateProp('borderColor', v)"
        />
        <PropertySlider
          label="Толщина"
          :value="node.borderWidth ?? 0"
          :min="0"
          :max="20"
          suffix="px"
          @update="(v) => updateProp('borderWidth', v)"
        />
        <PropertySlider
          label="Скругление"
          :value="node.borderRadius ?? 0"
          :min="0"
          :max="100"
          suffix="px"
          @update="(v) => updateProp('borderRadius', v)"
        />
      </PropertySection>

      <!-- Typography -->
      <PropertySection v-if="hasText" title="Текст">
        <PropertySlider
          label="Размер"
          :value="node.fontSize ?? 14"
          :min="8"
          :max="72"
          suffix="px"
          @update="(v) => updateProp('fontSize', v)"
        />
        <PropertyColorPicker
          label="Цвет"
          :value="node.textColor"
          @update="(v) => updateProp('textColor', v)"
        />
        <PropertySlider
          label="Жирность"
          :value="node.fontWeight ?? 400"
          :min="100"
          :max="900"
          :step="100"
          @update="(v) => updateProp('fontWeight', v)"
        />
        <PropertyButtonGroup
          label="Выравнивание"
          :value="node.textAlign ?? 'center'"
          :options="[
            { value: 'left', icon: 'align-left', title: 'По левому краю' },
            { value: 'center', icon: 'align-center', title: 'По центру' },
            { value: 'right', icon: 'align-right', title: 'По правому краю' }
          ]"
          @update="(v) => updateProp('textAlign', v)"
        />
      </PropertySection>

      <!-- Shadow -->
      <PropertySection title="Тень">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-medium text-gray-600">Включить тень</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              :checked="hasShadow"
              @change="toggleShadow"
            />
            <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div v-if="hasShadow">
          <PropertyColorPicker
            label="Цвет"
            :value="node.shadowColor ?? '#00000040'"
            @update="(v) => updateProp('shadowColor', v)"
          />
          <PropertySlider
            label="Размытие"
            :value="node.shadowBlur ?? 10"
            :min="0"
            :max="50"
            suffix="px"
            @update="(v) => updateProp('shadowBlur', v)"
          />
          <div class="grid grid-cols-2 gap-2">
            <PropertySlider
              label="X"
              :value="node.shadowOffsetX ?? 0"
              :min="-50"
              :max="50"
              suffix="px"
              @update="(v) => updateProp('shadowOffsetX', v)"
            />
            <PropertySlider
              label="Y"
              :value="node.shadowOffsetY ?? 5"
              :min="-50"
              :max="50"
              suffix="px"
              @update="(v) => updateProp('shadowOffsetY', v)"
            />
          </div>
        </div>
      </PropertySection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/types/node'
import PropertySection from './properties/PropertySection.vue'
import PropertyInput from './properties/PropertyInput.vue'
import PropertySlider from './properties/PropertySlider.vue'
import PropertyColorPicker from './properties/PropertyColorPicker.vue'
import PropertyButtonGroup from './properties/PropertyButtonGroup.vue'

const props = defineProps<{
  node: Node | null
}>()

const emit = defineEmits<{
  'update:node': []
}>()

// Check if node type supports text
const hasText = computed(() => {
  return props.node?.type === 'basic-card' || props.node?.content !== undefined
})

const hasShadow = computed(() => {
  return (
    props.node?.shadowColor !== undefined ||
    props.node?.shadowBlur !== undefined ||
    props.node?.shadowOffsetX !== undefined ||
    props.node?.shadowOffsetY !== undefined
  )
})

function updateProp(key: string, value: any) {
  if (props.node) {
    ;(props.node as any)[key] = value
    emit('update:node')
  }
}

function toggleShadow(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (props.node) {
    if (checked) {
      props.node.shadowColor = props.node.shadowColor ?? '#00000040'
      props.node.shadowBlur = props.node.shadowBlur ?? 10
      props.node.shadowOffsetX = props.node.shadowOffsetX ?? 0
      props.node.shadowOffsetY = props.node.shadowOffsetY ?? 5
    } else {
      delete props.node.shadowColor
      delete props.node.shadowBlur
      delete props.node.shadowOffsetX
      delete props.node.shadowOffsetY
    }
    emit('update:node')
  }
}
</script>
