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

  // Unique list of stores already in use, for quick-pick suggestions.
  const stores = computed(() =>
    [...new Set(items.value.map(i => i.store.trim()).filter(s => s.length > 0))].sort()
  )

  // The heart of the feature: group items by store. Items with no store fall
  // under 'Unassigned', which we always sort last. Returns an array of
  // { store, items } so the template can render one section per store.
  const groupedItems = computed(() => {
    const groups = new Map<string, Item[]>()
    for (const item of items.value) {
      const key = item.store.trim() || 'Unassigned'
      const bucket = groups.get(key) ?? []
      bucket.push(item)
      groups.set(key, bucket)
    }
    return [...groups.entries()]
      .sort(([a], [b]) => {
        if (a === 'Unassigned') return 1
        if (b === 'Unassigned') return -1
        return a.localeCompare(b)
      })
      .map(([store, list]) => ({ store, items: list }))
  })

  // Normalize a store name so similar spellings collapse into ONE group.
  // We trim, collapse inner whitespace, and — if an existing item already uses a
  // case-insensitive match — reuse that exact spelling (so 'costco', 'Costco',
  // 'COSTCO' all become whatever was entered first).
  function canonicalStore(input: string): string {
    const cleaned = input.trim().replace(/\s+/g, ' ')
    if (!cleaned) return ''
    const key = cleaned.toLowerCase()
    const existing = items.value.find(i => i.store.toLowerCase() === key)
    return existing ? existing.store : cleaned
  }

  // --- actions ---
  function addItem(name: string, quantity = 1, store = '') {
    const trimmed = name.trim()
    if (!trimmed) return
    const canonStore = canonicalStore(store)

    // If the same item (same name + same store) is already on the list, just
    // add to its quantity instead of creating a duplicate row. Re-adding also
    // un-checks it, since you evidently still need it.
    const existing = items.value.find(
      i => i.name.toLowerCase() === trimmed.toLowerCase() && i.store === canonStore
    )
    if (existing) {
      existing.quantity += quantity
      existing.done = false
      return
    }

    items.value.push({
      id: crypto.randomUUID(),
      name: trimmed,
      quantity,
      done: false,
      store: canonStore
    })
  }

  function setStore(id: string, store: string) {
    const item = items.value.find(i => i.id === id)
    if (item) item.store = canonicalStore(store)
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

  return {
    items,
    totalCount,
    remainingCount,
    stores,
    groupedItems,
    addItem,
    removeItem,
    toggleDone,
    clearDone,
    setStore
  }
})
