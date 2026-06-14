<script setup lang="ts">
import { ref } from 'vue'
import { useFoodSearch } from '@/composables/useFoodSearch'
import type { FoodSuggestion } from '@/services/foodApi'

const emit = defineEmits<{
  add: [name: string, quantity: number]
}>()

// The composable owns the search logic; the component just renders its state.
// We reuse `query` as the text-input's model, so typing both fills the field
// AND drives the live API search.
const { query, results, loading, error, clear } = useFoodSearch()
const quantity = ref(1)
const showSuggestions = ref(false)

function submit() {
  const name = query.value.trim()
  if (!name) return
  emit('add', name, quantity.value)
  quantity.value = 1
  clear()
  showSuggestions.value = false
}

function pick(food: FoodSuggestion) {
  query.value = food.name
  showSuggestions.value = false
}
</script>

<template>
  <form class="add-form" @submit.prevent="submit">
    <div class="field">
      <input
        v-model="query"
        type="text"
        placeholder="Search foods… (e.g. milk)"
        aria-label="Item name"
        autocomplete="off"
        @focus="showSuggestions = true"
        @blur="showSuggestions = false"
      />

      <!-- Live results from OpenFoodFacts. Shown once the query is 2+ chars. -->
      <ul v-if="showSuggestions && query.trim().length >= 2" class="suggestions">
        <li v-if="loading" class="suggestion suggestion--muted">Searching…</li>
        <li v-else-if="error" class="suggestion suggestion--muted">{{ error }}</li>
        <li v-else-if="results.length === 0" class="suggestion suggestion--muted">No matches</li>

        <!-- @mousedown.prevent keeps the input focused so the click registers
             before the input's @blur can hide this list. -->
        <li
          v-for="food in results"
          :key="food.id"
          class="suggestion"
          @mousedown.prevent="pick(food)"
        >
          <img v-if="food.imageUrl" :src="food.imageUrl" alt="" class="thumb" />
          <span class="suggestion__name">{{ food.name }}</span>
          <span v-if="food.brand" class="suggestion__brand">{{ food.brand }}</span>
        </li>
      </ul>
    </div>

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
.field {
  position: relative; /* anchor for the absolutely-positioned dropdown */
  flex: 1;
}
.field input {
  width: 100%;
}
.add-form input {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font: inherit;
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

/* --- suggestions dropdown --- */
.suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 10;
  margin: 0;
  padding: 0.25rem;
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  max-height: 320px;
  overflow-y: auto;
}
.suggestion {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
}
.suggestion:hover {
  background: var(--bg);
}
.suggestion--muted {
  color: var(--muted);
  cursor: default;
}
.suggestion--muted:hover {
  background: transparent;
}
.thumb {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 6px;
  background: var(--bg);
}
.suggestion__name {
  flex: 1;
}
.suggestion__brand {
  color: var(--muted);
  font-size: 0.8rem;
}
</style>
