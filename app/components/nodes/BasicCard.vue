<template>
  <div
    class="w-full h-full p-2 flex items-center justify-center rounded-lg border border-gray-300 bg-white"
    :style="nodeStyle"
  >
    <input
      ref="contentInput"
      type="text"
      id="cardInput"
      class="text-gray-700 text-sm w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 text-center"
      :class="textAlignClass"
      :value="node.content"
      @input="onInput"
    />
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
}>()

const contentInput = ref<HTMLInputElement | null>(null)

const nodeStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.node.backgroundColor) s.backgroundColor = props.node.backgroundColor
  return s
})

const textAlignClass = computed(() => {
  const a = props.node.textAlign ?? 'center'
  return a === 'left' ? 'text-left' : a === 'right' ? 'text-right' : 'text-center'
})

function onInput(e: Event) {
  const t = (e.target as HTMLInputElement).value
  emit('update:content', t)
}
</script>
