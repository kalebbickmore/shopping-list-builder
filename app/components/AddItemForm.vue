<script setup lang="ts">
import { ref } from 'vue'
import type { FoodSuggestion } from '~/types'

const emit = defineEmits<{
  add: [name: string, quantity: number]
}>()

// useFoodSearch() is auto-imported from app/composables — no import needed.
const { query, results, loading, error, clear } = useFoodSearch()
const quantity = ref(1)
const open = ref(false)

function submit() {
  const name = query.value.trim()
  if (!name) return
  emit('add', name, quantity.value)
  quantity.value = 1
  clear()
  open.value = false
}

function pick(food: FoodSuggestion) {
  query.value = food.name
  open.value = false
}
</script>

<template>
  <form
    class="flex gap-2"
    @submit.prevent="submit"
  >
    <div class="relative flex-1">
      <UInput
        v-model="query"
        placeholder="Search foods… (e.g. milk)"
        icon="i-lucide-search"
        :loading="loading"
        autocomplete="off"
        class="w-full"
        @focus="open = true"
        @blur="open = false"
      />

      <!-- Live suggestions from our /api/foods server route -->
      <div
        v-if="open && query.trim().length >= 2"
        class="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-default bg-default shadow-lg"
      >
        <p
          v-if="loading"
          class="px-3 py-2 text-sm text-muted"
        >
          Searching…
        </p>
        <p
          v-else-if="error"
          class="px-3 py-2 text-sm text-error"
        >
          {{ error }}
        </p>
        <p
          v-else-if="results.length === 0"
          class="px-3 py-2 text-sm text-muted"
        >
          No matches
        </p>

        <ul
          v-else
          class="max-h-72 overflow-y-auto"
        >
          <!-- @mousedown.prevent keeps the input focused so the click registers
               before @blur closes the menu. -->
          <li
            v-for="food in results"
            :key="food.id"
            class="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-elevated"
            @mousedown.prevent="pick(food)"
          >
            <UAvatar
              :src="food.imageUrl ?? undefined"
              icon="i-lucide-shopping-basket"
              size="sm"
            />
            <span class="flex-1 truncate text-sm text-highlighted">{{ food.name }}</span>
            <span
              v-if="food.brand"
              class="truncate text-xs text-muted"
            >{{ food.brand }}</span>
          </li>
        </ul>
      </div>
    </div>

    <UInput
      v-model.number="quantity"
      type="number"
      :min="1"
      class="w-20"
      aria-label="Quantity"
    />
    <UButton
      type="submit"
      icon="i-lucide-plus"
      label="Add"
    />
  </form>
</template>
