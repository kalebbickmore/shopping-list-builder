// --- Service layer: the ONLY place that knows how to talk to the food API. ---
// Components/composables import these functions instead of calling fetch directly.
// Benefits: one place to change the endpoint, shape messy responses into clean
// types, and an easy seam to mock in tests.

export interface FoodSuggestion {
  id: string
  name: string
  brand: string
  imageUrl: string | null
}

// OpenFoodFacts: free, keyless, CORS-enabled. Perfect for a static site.
const ENDPOINT = 'https://world.openfoodfacts.org/cgi/search.pl'

// The raw shape OpenFoodFacts returns (only the bits we asked for via `fields`).
interface OffProduct {
  code?: string
  product_name?: string
  brands?: string
  image_small_url?: string
}
interface OffResponse {
  products?: OffProduct[]
}

export async function searchFoods(query: string, signal?: AbortSignal): Promise<FoodSuggestion[]> {
  // URLSearchParams safely encodes the query string.
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '8',
    fields: 'code,product_name,brands,image_small_url', // ask for less = faster
  })

  // `signal` lets the caller CANCEL this request if it becomes stale.
  const res = await fetch(`${ENDPOINT}?${params.toString()}`, { signal })
  if (!res.ok) throw new Error(`Food API responded ${res.status}`)

  const data = (await res.json()) as OffResponse

  // Reshape the messy API data into our clean FoodSuggestion type, and drop
  // entries with no usable name.
  return (data.products ?? [])
    .map((p) => ({
      id: p.code && p.code.length > 0 ? p.code : crypto.randomUUID(),
      name: (p.product_name ?? '').trim(),
      brand: (p.brands ?? '').split(',')[0]?.trim() ?? '',
      imageUrl: p.image_small_url ?? null,
    }))
    .filter((food) => food.name.length > 0)
}
