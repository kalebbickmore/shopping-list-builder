import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Item } from '@/types/item'

// Where we persist the list in the browser. (Temporary — replaced by a real
// backend in a later step. For now it just survives page refreshes.)
const STORAGE_KEY = 'shopping-list-items'

function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Item[]) : []
  } catch {
    // Corrupt/missing data shouldn't crash the app — start fresh.
    return []
  }
}

// A "setup store": the function body looks exactly like a component's <script setup>.
// - ref()      -> reactive STATE
// - computed() -> GETTERS (derived state)
// - functions  -> ACTIONS (the only things that mutate state)
export const useShoppingListStore = defineStore('shoppingList', () => {
  // --- state ---
  const items = ref<Item[]>(loadItems())

  // --- getters (auto-recalculate when items change) ---
  const totalCount = computed(() => items.value.length)
  const remainingCount = computed(() => items.value.filter((i) => !i.done).length)

  // --- actions ---
  function addItem(name: string, quantity = 1) {
    const trimmed = name.trim()
    if (!trimmed) return // ignore empty input
    items.value.push({
      id: crypto.randomUUID(), // browser-native unique id
      name: trimmed,
      quantity,
      done: false,
    })
  }

  function removeItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function toggleDone(id: string) {
    const item = items.value.find((i) => i.id === id)
    if (item) item.done = !item.done
  }

  function clearDone() {
    items.value = items.value.filter((i) => !i.done)
  }

  // Persistence: re-run whenever `items` changes. `deep: true` watches changes
  // INSIDE the array (like toggling an item's `done`), not just replacement.
  watch(
    items,
    (current) => localStorage.setItem(STORAGE_KEY, JSON.stringify(current)),
    { deep: true },
  )

  // Whatever we return becomes the store's public API.
  return { items, totalCount, remainingCount, addItem, removeItem, toggleDone, clearDone }
})
