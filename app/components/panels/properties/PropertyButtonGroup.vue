<template>
  <div>
    <label class="block text-xs font-medium text-gray-600 mb-1.5">{{ label }}</label>
    <div class="flex gap-1">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="flex-1 p-2 rounded border transition-all"
        :class="value === option.value 
          ? 'bg-blue-50 border-blue-500 text-blue-600' 
          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'"
        :title="option.title"
        @mousedown.prevent="$emit('update', option.value)"
      >
        <!-- Built-in line icons -->
        <svg
          v-if="['align-left', 'align-center', 'align-right'].includes(option.icon)"
          class="w-4 h-4 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="option.icon === 'align-left'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h10M4 18h16"
          />
          <path
            v-else-if="option.icon === 'align-center'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M7 12h10M4 18h16"
          />
          <path
            v-else-if="option.icon === 'align-right'"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M10 12h10M4 18h16"
          />
        </svg>

        <!-- External SVG icons (using mask for color inheritance) -->
        <div
          v-else
          class="w-4 h-4 mx-auto bg-current"
          :style="{
            maskImage: `url(/svg/${option.icon}.svg)`,
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            WebkitMaskImage: `url(/svg/${option.icon}.svg)`,
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat'
          }"
        ></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ButtonOption {
  value: string
  icon: string
  title: string
}

defineProps<{
  label: string
  value: string
  options: ButtonOption[]
}>()

defineEmits<{
  update: [value: string]
}>()
</script>
