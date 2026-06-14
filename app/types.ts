// A single shopping-list entry.
export interface Item {
  id: string
  name: string
  quantity: number
  done: boolean
  store: string // which store to buy it from ('' = unassigned)
}

// A food suggestion returned by our /api/foods server route.
export interface FoodSuggestion {
  id: string
  name: string
  brand: string
  imageUrl: string | null
}
