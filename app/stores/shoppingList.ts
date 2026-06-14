// In Nuxt these imports are auto-imported (you can omit them), but we keep them
// explicit so it's obvious where each API comes from while you're learning.
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Item } from '~/types'

const STORAGE_KEY = 'shopping-list-items'

function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Item[]) : []
  } catch {
    return []
  }
}

export const useShoppingListStore = defineStore('shoppingList', () => {
  // --- state ---
  // Start empty. On the SERVER (during SSR) there is no localStorage, so we must
  // NOT touch it here or the render crashes. import.meta.client is true only in
  // the browser, where we hydrate the saved list.
  const items = ref<Item[]>([])
  if (import.meta.client) {
    items.value = loadItems()
  }

  // --- getters ---
  const totalCount = computed(() => items.value.length)
  const remainingCount = computed(() => items.value.filter(i => !i.done).length)

  // --- actions ---
  function addItem(name: string, quantity = 1) {
    const trimmed = name.trim()
    if (!trimmed) return
    items.value.push({
      id: crypto.randomUUID(),
      name: trimmed,
      quantity,
      done: false
    })
  }

  function removeItem(id: string) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function toggleDone(id: string) {
    const item = items.value.find(i => i.id === id)
    if (item) item.done = !item.done
  }

  function clearDone() {
    items.value = items.value.filter(i => !i.done)
  }

  // Persist on change — but only in the browser.
  watch(
    items,
    (current) => {
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
      }
    },
    { deep: true }
  )

  return { items, totalCount, remainingCount, addItem, removeItem, toggleDone, clearDone }
})
