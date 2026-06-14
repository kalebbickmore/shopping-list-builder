// SERVER ROUTE — runs on the server (Node/Vercel function), never in the browser.
// File path maps to a URL: server/api/foods.get.ts  ->  GET /api/foods
//
// THIS is the "protected API". The browser calls OUR endpoint (/api/foods); we
// call the third-party API from here. A secret key would be read from
// useRuntimeConfig() below and would never reach the client. (Bonus: this also
// sidesteps CORS and lets us cache/transform responses.)

interface OffProduct {
  code?: string
  product_name?: string
  brands?: string
  image_small_url?: string
}
interface OffResponse {
  products?: OffProduct[]
}

export default defineEventHandler(async (event) => {
  // Read the secret key on the SERVER only. OpenFoodFacts doesn't need one, but
  // this is exactly the line where you'd use a real key for a paid API.
  const { foodApiKey } = useRuntimeConfig(event)

  // Parse ?q= from the request URL.
  const { q } = getQuery(event)
  const term = typeof q === 'string' ? q.trim() : ''
  if (term.length < 2) {
    return [] // nothing to search yet
  }

  try {
    // $fetch is the server-side HTTP client. If a key were required:
    //   headers: { Authorization: `Bearer ${foodApiKey}` }
    const data = await $fetch<OffResponse>('https://world.openfoodfacts.org/cgi/search.pl', {
      query: {
        search_terms: term,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 8,
        // sort by popularity so well-known products surface first...
        sort_by: 'popularity_key',
        // ...and restrict to US-sold products so brands are recognizable.
        tagtype_0: 'countries',
        tag_contains_0: 'contains',
        tag_0: 'united-states',
        fields: 'code,product_name,brands,image_small_url'
      },
      headers: foodApiKey ? { Authorization: `Bearer ${foodApiKey}` } : undefined
    })

    // Reshape the messy upstream data into a clean payload for the client,
    // dropping nameless entries and de-duplicating by name + brand.
    const seen = new Set<string>()
    return (data.products ?? [])
      .map(product => ({
        id: product.code && product.code.length > 0 ? product.code : crypto.randomUUID(),
        name: (product.product_name ?? '').trim(),
        brand: (product.brands ?? '').split(',')[0]?.trim() ?? '',
        imageUrl: product.image_small_url ?? null
      }))
      .filter((food) => {
        if (food.name.length === 0) return false
        const key = `${food.name.toLowerCase()}|${food.brand.toLowerCase()}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  } catch {
    // Translate upstream failures into a proper HTTP error for our client.
    throw createError({ statusCode: 502, statusMessage: 'Food provider unavailable' })
  }
})
