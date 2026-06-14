<script setup lang="ts">
import type { Item } from '@/types/item'

// defineProps declares data flowing DOWN from the parent. In <script setup>,
// the template can use `item` directly (no need to write `props.item`).
defineProps<{
  item: Item
}>()

// Events flowing UP. The parent decides what toggling/removing actually does.
const emit = defineEmits<{
  toggle: [id: string]
  remove: [id: string]
}>()
</script>

<template>
  <!-- :class object syntax: the "done" class is applied only when item.done is true -->
  <li class="item" :class="{ done: item.done }">
    <label class="item__main">
      <!-- We don't mutate the prop directly (props are read-only); we emit instead -->
      <input type="checkbox" :checked="item.done" @change="emit('toggle', item.id)" />
      <span class="item__name">{{ item.name }}</span>
      <span v-if="item.quantity > 1" class="item__qty">×{{ item.quantity }}</span>
    </label>
    <button class="item__remove" aria-label="Remove" @click="emit('remove', item.id)">✕</button>
  </li>
</template>

<style scoped>
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.9rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-bottom: 0.5rem;
}
.item__main {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
}
.item.done .item__name {
  text-decoration: line-through;
  color: var(--muted);
}
.item__qty {
  color: var(--muted);
  font-size: 0.9rem;
}
.item__remove {
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 1rem;
}
.item__remove:hover {
  color: var(--danger);
}
</style>
