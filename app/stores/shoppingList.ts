// In Nuxt these imports are auto-imported (you can omit them), but we keep them
// explicit so it's obvious where each API comes from while you're learning.
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Item } from '~/types'

const STORAGE_KEY = 'shopping-list-items'
const STORES_KEY = 'shopping-list-stores'

function loadItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Item[]) : []
  } catch {
    return []
  }
}

// Stores the user has created explicitly, even before any item lives in them.
function loadStores(): string[] {
  try {
    const raw = localStorage.getItem(STORES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export const useShoppingListStore = defineStore('shoppingList', () => {
  // --- state ---
  // Start empty on BOTH server and the first client render so the prerendered
  // HTML matches hydration exactly (no flash). We pull from localStorage only
  // after mount, via hydrate(), then flip `hydrated` to reveal the real list.
  const items = ref<Item[]>([])
  // Explicitly-created stores that may not have any items yet.
  const customStores = ref<string[]>([])
  // false until the browser has loaded saved data, the UI shows a skeleton
  // during this brief window instead of an empty-state flash.
  const hydrated = ref(false)

  function hydrate() {
    if (hydrated.value || !import.meta.client) return
    items.value = loadItems()
    customStores.value = loadStores()
    hydrated.value = true
  }

  // --- getters ---
  const totalCount = computed(() => items.value.length)
  const remainingCount = computed(() => items.value.filter(i => !i.done).length)
  // Everything bought, the cue for a little celebration moment.
  const allDone = computed(() => totalCount.value > 0 && remainingCount.value === 0)

  // Unique list of stores, both those in use by items AND those the user added
  // explicitly, for quick-pick suggestions.
  const stores = computed(() => {
    const used = items.value.map(i => i.store.trim()).filter(s => s.length > 0)
    return [...new Set([...used, ...customStores.value])].sort()
  })

  // The heart of the feature: group items by store. Items with no store fall
  // under 'Unassigned', which we always sort last. Empty stores the user created
  // still show up (as empty drop zones). Returns an array of { store, items } so
  // the template can render one section per store.
  const groupedItems = computed(() => {
    const groups = new Map<string, Item[]>()
    // Seed empty groups for every explicitly-added store so they render even
    // before anything is dropped into them.
    for (const store of customStores.value) {
      if (store) groups.set(store, [])
    }
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
  // We trim, collapse inner whitespace, and, if an existing item already uses a
  // case-insensitive match, reuse that exact spelling (so 'costco', 'Costco',
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

  // Set an item's quantity directly (inline stepper). Never drops below 1.
  function setQuantity(id: string, quantity: number) {
    const item = items.value.find(i => i.id === id)
    if (item) item.quantity = Math.max(1, Math.round(quantity) || 1)
  }

  // Create an empty store. Reuses canonical spelling and ignores duplicates so
  // the same store can't appear twice.
  function addStore(name: string) {
    const canon = canonicalStore(name)
    if (!canon) return
    const exists = stores.value.some(s => s.toLowerCase() === canon.toLowerCase())
    if (!exists) customStores.value.push(canon)
  }

  // Forget an explicitly-added store. Items already in it fall back to
  // Unassigned so nothing is silently lost.
  function removeStore(name: string) {
    customStores.value = customStores.value.filter(s => s !== name)
    for (const item of items.value) {
      if (item.store === name) item.store = ''
    }
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

  // Persist on change, but only in the browser, and never before hydrate() has
  // loaded the saved data. The `hydrated` guard prevents the initial empty state
  // from overwriting localStorage during the load window.
  watch(
    items,
    (current) => {
      if (import.meta.client && hydrated.value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
      }
    },
    { deep: true }
  )

  watch(
    customStores,
    (current) => {
      if (import.meta.client && hydrated.value) {
        localStorage.setItem(STORES_KEY, JSON.stringify(current))
      }
    },
    { deep: true }
  )

  return {
    items,
    hydrated,
    hydrate,
    totalCount,
    remainingCount,
    allDone,
    stores,
    groupedItems,
    addItem,
    removeItem,
    toggleDone,
    clearDone,
    setStore,
    setQuantity,
    addStore,
    removeStore
  }
})
