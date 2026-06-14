<script setup lang="ts">
import { ref } from 'vue'
import type { Item } from '~/types'

const props = defineProps<{
  item: Item
}>()

const emit = defineEmits<{
  toggle: [id: string]
  remove: [id: string]
}>()

const dragging = ref(false)

function onDragStart(e: DragEvent) {
  dragging.value = true
  // Hand the item's id to the drop target via the drag payload.
  e.dataTransfer?.setData('text/plain', props.item.id)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  dragging.value = false
}
</script>

<template>
  <li
    draggable="true"
    :class="['flex items-center justify-between gap-3 py-2', dragging ? 'opacity-50' : '']"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="flex min-w-0 items-center gap-3">
      <UIcon
        name="i-lucide-grip-vertical"
        class="size-4 shrink-0 cursor-grab text-dimmed"
      />
      <UCheckbox
        :model-value="item.done"
        @update:model-value="emit('toggle', item.id)"
      />
      <span :class="['truncate text-sm', item.done ? 'text-muted line-through' : 'text-highlighted']">
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
      size="xs"
      aria-label="Remove item"
      @click="emit('remove', item.id)"
    />
  </li>
</template>
