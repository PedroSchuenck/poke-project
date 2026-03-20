export const SORT_OPTIONS = [
    { value: 'number', label: 'Numero' },
    { value: 'name', label: 'Nome' },
    { value: 'total', label: 'Total de Stats' },
    { value: 'hp', label: 'HP' },
    { value: 'attack', label: 'Ataque' },
    { value: 'defense', label: 'Defesa' },
    { value: 'speed', label: 'Velocidade' },
    { value: 'weight', label: 'Peso' },
    { value: 'height', label: 'Altura' },
]

export const ORDER_OPTIONS = [
    { value: 'asc', label: 'Crescente' },
    { value: 'desc', label: 'Decrescente' },
]

export const LIMIT_OPTIONS = [10, 25, 50, 80, 100]

export const REGION_OPTIONS = [
    { region: 'kanto', generation: 1 },
    { region: 'johto', generation: 2 },
    { region: 'hoenn', generation: 3 },
    { region: 'sinnoh', generation: 4 },
    { region: 'unova', generation: 5 },
    { region: 'kalos', generation: 6 },
    { region: 'alola', generation: 7 },
    { region: 'galar', generation: 8 },
    { region: 'paldea', generation: 9 },
]

export async function loadFilters() {
    try {
        const [typesResponse, regionsResponse] = await Promise.all([fetch('/api/types'), fetch('/api/regions')])

        if (!typesResponse.ok || !regionsResponse.ok) {
            throw new Error('Nao foi possivel carregar filtros da API.')
        }

        const typesPayload = await typesResponse.json()
        const regionsPayload = await regionsResponse.json()

        return {
            types: typesPayload.items ?? [], 
            regions: regionsPayload.items ?? []
        }
    } catch (fetchError) {
        throw fetchError
    }
}