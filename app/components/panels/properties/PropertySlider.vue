<template>
  <div>
    <div class="flex items-center justify-between mb-1.5">
      <label class="text-xs font-medium text-gray-600">{{ label }}</label>
      <span class="text-xs text-gray-500 font-mono">{{ value }}{{ suffix }}</span>
    </div>
    <input
      type="range"
      :value="value"
      :min="min"
      :max="max"
      :step="step"
      class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      @input="$emit('update', Number(($event.target as HTMLInputElement).value))"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  suffix?: string
}>(), {
  min: 0,
  max: 100,
  step: 1,
  suffix: ''
})

defineEmits<{
  update: [value: number]
}>()
</script>
