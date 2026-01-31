<template>
  <div>
    <label class="block text-xs font-medium text-gray-600 mb-1.5">{{ label }}</label>
    <div class="flex items-center gap-2">
      <div class="relative">
        <input
          type="color"
          :value="value ?? '#ffffff'"
          class="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
          @input="$emit('update', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <input
        type="text"
        :value="value ?? '#ffffff'"
        class="flex-1 px-2 py-1.5 text-sm font-mono rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors uppercase"
        @input="$emit('update', ($event.target as HTMLInputElement).value)"
        placeholder="#000000"
        maxlength="9"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string
}>()

defineEmits<{
  update: [value: string]
}>()
</script>
