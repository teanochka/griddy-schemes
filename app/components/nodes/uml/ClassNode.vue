<template>
  <div
    class="w-full h-full flex flex-col border border-gray-300"
    :style="blockStyle"
  >
    <!-- Class Name Section -->
    <div class="flex-none p-2 border-b" :style="{ borderColor: borderColorValue }">
      <textarea
        ref="classNameInput"
        class="text-gray-700 w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 text-center font-semibold resize-none overflow-hidden"
        :class="textAlignClass"
        :style="textStyle"
        :value="classNameField?.value || 'ClassName'"
        rows="1"
        @input="onFieldInput('className', $event)"
        @keydown.enter.prevent="onEnter('className')"
      />
    </div>
    
    <!-- Attributes Section -->
    <div class="flex-1 p-2 border-b text-sm" :style="{ borderColor: borderColorValue }">
      <textarea
        ref="attributesInput"
        class="text-gray-600 w-full h-full min-w-0 bg-transparent border-none outline-none focus:ring-0 resize-none"
        :style="textStyle"
        :value="attributesField?.value || '+ attribute: Type'"
        @input="onFieldInput('attributes', $event)"
      />
    </div>
    
    <!-- Methods Section -->
    <div class="flex-1 p-2 text-sm">
      <textarea
        ref="methodsInput"
        class="text-gray-600 w-full h-full min-w-0 bg-transparent border-none outline-none focus:ring-0 resize-none"
        :style="textStyle"
        :value="methodsField?.value || '+ method(): Type'"
        @input="onFieldInput('methods', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Node } from '@/types/node'

const props = defineProps<{
  node: Node
}>()

const emit = defineEmits<{
  'update:content': [value: string]
  'update:fields': [fields: Array<{ id: string; value: string }>]
}>()

const classNameInput = ref<HTMLTextAreaElement | null>(null)
const attributesInput = ref<HTMLTextAreaElement | null>(null)
const methodsInput = ref<HTMLTextAreaElement | null>(null)

const borderColorValue = computed(() => props.node.borderColor ?? '#6b7280')

const classNameField = computed(() => {
  return props.node.fields?.find(f => f.id === 'className')
})

const attributesField = computed(() => {
  return props.node.fields?.find(f => f.id === 'attributes')
})

const methodsField = computed(() => {
  return props.node.fields?.find(f => f.id === 'methods')
})

const blockStyle = computed(() => {
  const s: Record<string, string> = {}
  
  // Background
  if (props.node.backgroundColor) {
    s.backgroundColor = props.node.backgroundColor
  } else {
    s.backgroundColor = '#ffffff'
  }
  
  // Border
  if (props.node.borderColor) {
    s.borderColor = props.node.borderColor
  } else {
    s.borderColor = '#6b7280'
  }
  if (props.node.borderWidth !== undefined) {
    s.borderWidth = `${props.node.borderWidth}px`
  } else {
    s.borderWidth = '1px'
  }
  
  // Border radius (minimal for class diagrams)
  if (props.node.borderRadius !== undefined) {
    if (typeof props.node.borderRadius === 'string') {
      s.borderRadius = props.node.borderRadius
    } else {
      s.borderRadius = `${props.node.borderRadius}px`
    }
  } else {
    s.borderRadius = '0px'
  }
  
  // Shadow
  if (props.node.shadowColor || props.node.shadowBlur) {
    const color = props.node.shadowColor ?? '#00000040'
    const blur = props.node.shadowBlur ?? 10
    const offsetX = props.node.shadowOffsetX ?? 0
    const offsetY = props.node.shadowOffsetY ?? 5
    s.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`
  }
  
  return s
})

const textAlignClass = computed(() => {
  const a = props.node.textAlign ?? 'center'
  return a === 'left' ? 'text-left' : a === 'right' ? 'text-right' : 'text-center'
})

const textStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.node.fontSize) s.fontSize = `${props.node.fontSize}px`
  if (props.node.textColor) s.color = props.node.textColor
  if (props.node.fontWeight) s.fontWeight = String(props.node.fontWeight)
  return s
})

function onFieldInput(fieldId: string, e: Event) {
  const value = (e.target as HTMLTextAreaElement).value
  const currentFields = props.node.fields || []
  const existingFieldIndex = currentFields.findIndex(f => f.id === fieldId)
  
  let updatedFields: Array<{ id: string; value: string }>
  if (existingFieldIndex >= 0) {
    updatedFields = [...currentFields]
    updatedFields[existingFieldIndex] = { id: fieldId, value }
  } else {
    updatedFields = [...currentFields, { id: fieldId, value }]
  }
  
  emit('update:fields', updatedFields)
}

function onEnter(fieldId: string) {
  if (fieldId === 'className') {
    attributesInput.value?.focus()
  }
}

defineExpose({
  classNameInput,
  attributesInput,
  methodsInput,
})
</script>
