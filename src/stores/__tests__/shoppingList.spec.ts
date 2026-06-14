import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShoppingListStore } from '../shoppingList'
import type { Item } from '@/types/item'

// Indexing an array gives `Item | undefined` under strict TS. This helper
// asserts the item exists (failing the test loudly if not) and narrows the type.
function firstItem(items: Item[]): Item {
  const item = items[0]
  if (!item) throw new Error('expected at least one item')
  return item
}

describe('shopping list store', () => {
  beforeEach(() => {
    // Each test gets a fresh Pinia instance and a clean localStorage,
    // so tests don't leak state into one another.
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('starts empty', () => {
    const store = useShoppingListStore()
    expect(store.items).toHaveLength(0)
    expect(store.totalCount).toBe(0)
  })

  it('adds an item', () => {
    const store = useShoppingListStore()
    store.addItem('Milk', 2)
    expect(store.items).toHaveLength(1)
    expect(firstItem(store.items)).toMatchObject({ name: 'Milk', quantity: 2, done: false })
  })

  it('ignores blank names', () => {
    const store = useShoppingListStore()
    store.addItem('   ')
    expect(store.items).toHaveLength(0)
  })

  it('toggles done and tracks remaining count', () => {
    const store = useShoppingListStore()
    store.addItem('Eggs')
    const id = firstItem(store.items).id
    expect(store.remainingCount).toBe(1)
    store.toggleDone(id)
    expect(firstItem(store.items).done).toBe(true)
    expect(store.remainingCount).toBe(0)
  })

  it('removes an item and clears done ones', () => {
    const store = useShoppingListStore()
    store.addItem('Apples')
    store.addItem('Bread')
    store.removeItem(firstItem(store.items).id)
    expect(store.items).toHaveLength(1)

    store.toggleDone(firstItem(store.items).id)
    store.clearDone()
    expect(store.items).toHaveLength(0)
  })
})
