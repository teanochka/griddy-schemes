<template>
  <div>
    <label class="block text-xs font-medium text-gray-600 mb-1">{{ label }}</label>
    <input
      type="number"
      :value="value"
      :min="min"
      :max="max"
      :step="step"
      class="w-full px-2 py-1.5 text-sm rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
      @input="$emit('update', Number(($event.target as HTMLInputElement).value))"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  min?: number
  max?: number
  step?: number
}>()

defineEmits<{
  update: [value: number]
}>()
</script>
