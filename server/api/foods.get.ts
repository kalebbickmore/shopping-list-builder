// SERVER ROUTE — runs on the server (Node/Vercel function), never in the browser.
// File path maps to a URL: server/api/foods.get.ts  ->  GET /api/foods
//
// THIS is the "protected API". The browser calls OUR endpoint (/api/foods); we
// call the third-party API from here. A secret key would be read from
// useRuntimeConfig() below and would never reach the client. (Bonus: this also
// sidesteps CORS and lets us shape/transform responses.)
//
// We use OpenFoodFacts' "suggest" endpoint on the INGREDIENTS taxonomy, which
// returns GENERIC food names (e.g. milk -> "milk", "cream", "milk powder") with
// no brands — instead of branded products.

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
    // Returns a plain array of generic ingredient strings.
    const suggestions = await $fetch<string[]>('https://world.openfoodfacts.org/cgi/suggest.pl', {
      query: {
        tagtype: 'ingredients',
        lc: 'en',
        term
      },
      // If a key were required: headers: { Authorization: `Bearer ${foodApiKey}` }
      headers: foodApiKey ? { Authorization: `Bearer ${foodApiKey}` } : undefined
    })

    // The suggest endpoint isn't relevance-sorted, so rank ourselves:
    // exact match > "starts with the word" > starts-with > contains.
    const t = term.toLowerCase()
    const rank = (name: string): number => {
      const n = name.toLowerCase()
      if (n === t) return 0
      if (n.startsWith(`${t} `)) return 1
      if (n.startsWith(t)) return 2
      return 3
    }

    const seen = new Set<string>()
    return (suggestions ?? [])
      .map(name => name.trim())
      .filter((name) => {
        const key = name.toLowerCase()
        // Keep only items that actually contain the term (drops loosely-related
        // synonyms like "E270"/"Cream" for a "milk" search), de-duplicated.
        if (name.length === 0 || !key.includes(t)) return false
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => rank(a) - rank(b) || a.length - b.length || a.localeCompare(b))
      .slice(0, 8)
      .map(name => ({
        id: name,
        // Capitalize for display: "peanut butter" -> "Peanut butter".
        name: name.charAt(0).toUpperCase() + name.slice(1),
        brand: '', // generic items have no brand
        imageUrl: null // ...and no product image; the UI shows a basket icon
      }))
  } catch {
    // Translate upstream failures into a proper HTTP error for our client.
    throw createError({ statusCode: 502, statusMessage: 'Food provider unavailable' })
  }
})
