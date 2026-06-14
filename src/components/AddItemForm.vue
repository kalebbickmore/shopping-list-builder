<script setup lang="ts">
import { ref } from 'vue'

// defineEmits declares the events this component can send UP to its parent.
// Typing them means the parent gets autocomplete + type-checking on the payload.
const emit = defineEmits<{
  add: [name: string, quantity: number]
}>()

// Local form state. v-model in the template keeps these in sync with the inputs.
const name = ref('')
const quantity = ref(1)

function submit() {
  if (!name.value.trim()) return
  emit('add', name.value, quantity.value) // hand the data to the parent
  name.value = '' // reset the form
  quantity.value = 1
}
</script>

<template>
  <!-- @submit.prevent: handle submit but stop the browser's full-page reload -->
  <form class="add-form" @submit.prevent="submit">
    <input v-model="name" type="text" placeholder="Add an item…" aria-label="Item name" />
    <!-- .number modifier casts the input's string to a real number -->
    <input v-model.number="quantity" type="number" min="1" aria-label="Quantity" class="qty" />
    <button type="submit">Add</button>
  </form>
</template>

<style scoped>
.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.add-form input {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font: inherit;
}
.add-form input[type='text'] {
  flex: 1;
}
.qty {
  width: 4.5rem;
}
.add-form button {
  padding: 0 1.1rem;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-weight: 600;
}
</style>
