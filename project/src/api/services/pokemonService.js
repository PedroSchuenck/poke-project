export async function loadPokemon(filters, searchValue) {  
  try {
    const query = new URLSearchParams({
      page: String(filters.page),
      limit: String(filters.limit),
      sortBy: filters.sortBy,
      order: filters.order,
    })

    const normalizedSearch = searchValue.trim()
    
    if (normalizedSearch) query.set('q', normalizedSearch)
    if (filters.type !== 'all') query.set('type', filters.type)
    if (filters.origin !== 'all') {
      const [, originValue] = filters.origin.split(':')
      if (originValue) query.set('region', originValue)
    }
  
    const result = await fetch(`/api/pokemon?${query.toString()}`)
    
    if (!result.ok) throw new Error('Erro ao carregar Pokemon da API.')
    
    const payload = await result.json()
        
    return payload

  } catch (fetchError) {
    if (fetchError.name === 'AbortError' || ignore) return
    throw fetchError
  }
}