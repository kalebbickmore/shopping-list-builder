// A single shopping-list entry.
// Defining the shape once here lets TypeScript check every place that touches an Item.
export interface Item {
  id: string
  name: string
  quantity: number
  done: boolean
}
