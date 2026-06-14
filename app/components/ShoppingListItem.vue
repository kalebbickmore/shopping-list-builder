<script setup lang="ts">
import type { Item } from '~/types'

// props = data DOWN. Components in app/components are auto-imported by Nuxt,
// but interfaces still need importing.
defineProps<{
  item: Item
}>()

// emits = events UP. We never mutate the prop; we ask the parent/store.
const emit = defineEmits<{
  toggle: [id: string]
  remove: [id: string]
}>()
</script>

<template>
  <!-- Tailwind utility classes do all the styling. The "border-default",
       "bg-default", "text-muted" tokens come from Nuxt UI's design system. -->
  <li class="flex items-center justify-between gap-3 rounded-lg border border-default bg-default px-3 py-2">
    <div class="flex items-center gap-3">
      <!-- UCheckbox is a Nuxt UI component. It emits update:model-value when toggled. -->
      <UCheckbox
        :model-value="item.done"
        @update:model-value="emit('toggle', item.id)"
      />
      <span :class="['truncate', item.done ? 'text-muted line-through' : 'text-highlighted']">
        {{ item.name }}
      </span>
      <UBadge
        v-if="item.quantity > 1"
        color="neutral"
        variant="subtle"
        size="sm"
      >
        ×{{ item.quantity }}
      </UBadge>
    </div>

    <UButton
      icon="i-lucide-x"
      color="neutral"
      variant="ghost"
      size="sm"
      aria-label="Remove item"
      @click="emit('remove', item.id)"
    />
  </li>
</template>
