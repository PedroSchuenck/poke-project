import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const POKEAPI_LIST_LIMIT = Number.parseInt(process.env.POKEAPI_LIST_LIMIT ?? '2000', 10)
const FETCH_CONCURRENCY = clampNumber(Number.parseInt(process.env.POKEDEX_FETCH_CONCURRENCY ?? '35', 10), 5, 80)
const CACHE_TTL_HOURS = clampNumber(Number.parseInt(process.env.POKEDEX_CACHE_TTL_HOURS ?? '24', 10), 1, 168)
const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CACHE_FILE_PATH = path.join(__dirname, '.cache', 'pokedex-cache.json')

const REGION_RANGES = [
  { start: 1, end: 151, region: 'kanto', generation: 1 },
  { start: 152, end: 251, region: 'johto', generation: 2 },
  { start: 252, end: 386, region: 'hoenn', generation: 3 },
  { start: 387, end: 493, region: 'sinnoh', generation: 4 },
  { start: 494, end: 649, region: 'unova', generation: 5 },
  { start: 650, end: 721, region: 'kalos', generation: 6 },
  { start: 722, end: 809, region: 'alola', generation: 7 },
  { start: 810, end: 905, region: 'galar', generation: 8 },
  { start: 906, end: 1025, region: 'paldea', generation: 9 },
]

const SORTABLE_FIELDS = new Set([
  'number',
  'name',
  'height',
  'weight',
  'baseExperience',
  'total',
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
])

function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(max, value))
}

function splitList(value) {
  if (!value) return []
  return String(value)
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

function parseInteger(value, fallback) {
  const number = Number.parseInt(value, 10)
  return Number.isNaN(number) ? fallback : number
}

function capitalize(word) {
  if (!word) return ''
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function formatPokemonName(name) {
  return name
    .split('-')
    .map(capitalize)
    .join(' ')
}

function regionInfoByNumber(number) {
  for (const range of REGION_RANGES) {
    if (number >= range.start && number <= range.end) {
      return {
        region: range.region,
        generation: range.generation,
      }
    }
  }

  return {
    region: 'unknown',
    generation: null,
  }
}

function normalizeStatBlock(stats) {
  const values = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  }

  for (const stat of stats ?? []) {
    if (!stat?.stat?.name) continue
    if (stat.stat.name === 'hp') values.hp = stat.base_stat
    if (stat.stat.name === 'attack') values.attack = stat.base_stat
    if (stat.stat.name === 'defense') values.defense = stat.base_stat
    if (stat.stat.name === 'special-attack') values.specialAttack = stat.base_stat
    if (stat.stat.name === 'special-defense') values.specialDefense = stat.base_stat
    if (stat.stat.name === 'speed') values.speed = stat.base_stat
  }

  values.total =
    values.hp +
    values.attack +
    values.defense +
    values.specialAttack +
    values.specialDefense +
    values.speed

  return values
}

async function fetchJson(url, attempt = 1) {
  const response = await fetch(url)

  if (!response.ok) {
    if (attempt < 3) {
      const delay = 250 * attempt
      await new Promise((resolve) => setTimeout(resolve, delay))
      return fetchJson(url, attempt + 1)
    }
    throw new Error(`Falha no fetch ${response.status} para ${url}`)
  }

  return response.json()
}

async function fetchInBatches(items, batchSize, mapper) {
  const results = []

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        try {
          return await mapper(item)
        } catch {
          return null
        }
      }),
    )
    results.push(...batchResults)
  }

  return results
}

export class PokedexService {
  constructor() {
    this.dataset = null
    this.loadingPromise = null
  }

  async getDataset({ forceRefresh = false } = {}) {
    if (!forceRefresh && this.dataset) return this.dataset

    if (!forceRefresh && this.loadingPromise) {
      return this.loadingPromise
    }

    this.loadingPromise = this.loadDataset({ forceRefresh })
      .then((dataset) => {
        this.dataset = dataset
        this.loadingPromise = null
        return dataset
      })
      .catch((error) => {
        this.loadingPromise = null
        throw error
      })

    return this.loadingPromise
  }

  async loadDataset({ forceRefresh = false }) {
    if (!forceRefresh) {
      const cached = await this.readDiskCache()
      if (cached) return cached
    }

    const listPayload = await fetchJson(
      `https://pokeapi.co/api/v2/pokemon?offset=0&limit=${POKEAPI_LIST_LIMIT}`,
    )
    const pokemonUrls = (listPayload.results ?? []).map((entry) => entry.url).filter(Boolean)

    const rawPokemon = await fetchInBatches(pokemonUrls, FETCH_CONCURRENCY, async (url) => {
      const data = await fetchJson(url)

      if (!data?.is_default) return null
      if (typeof data.id !== 'number' || data.id <= 0) return null

      const regionInfo = regionInfoByNumber(data.id)
      const stats = normalizeStatBlock(data.stats)
      const types = (data.types ?? [])
        .sort((a, b) => (a?.slot ?? 0) - (b?.slot ?? 0))
        .map((entry) => entry?.type?.name)
        .filter(Boolean)

      return {
        id: data.id,
        number: data.id,
        name: data.name,
        displayName: formatPokemonName(data.name),
        types,
        stats,
        region: regionInfo.region,
        generation: regionInfo.generation,
        image:
          data?.sprites?.other?.['official-artwork']?.front_default ||
          data?.sprites?.other?.home?.front_default ||
          data?.sprites?.front_default ||
          null,
        height: (data.height ?? 0) / 10,
        weight: (data.weight ?? 0) / 10,
        baseExperience: data.base_experience ?? null,
      }
    })

    const pokemon = rawPokemon
      .filter(Boolean)
      .sort((a, b) => a.number - b.number)
      .filter((item, index, array) => index === array.findIndex((candidate) => candidate.number === item.number))

    const typeCounts = {}
    const regionCounts = {}

    for (const item of pokemon) {
      regionCounts[item.region] = (regionCounts[item.region] ?? 0) + 1
      for (const type of item.types) {
        typeCounts[type] = (typeCounts[type] ?? 0) + 1
      }
    }

    const dataset = {
      fetchedAt: new Date().toISOString(),
      source: 'https://pokeapi.co/',
      totalPokemon: pokemon.length,
      pokemon,
      types: Object.keys(typeCounts).sort(),
      typeCounts,
      regionCounts,
    }

    await this.writeDiskCache(dataset)
    return dataset
  }

  async readDiskCache() {
    try {
      const content = await readFile(CACHE_FILE_PATH, 'utf8')
      const parsed = JSON.parse(content)
      if (!parsed?.fetchedAt || !Array.isArray(parsed?.pokemon)) return null

      const age = Date.now() - new Date(parsed.fetchedAt).getTime()
      if (age > CACHE_TTL_MS) return null
      return parsed
    } catch {
      return null
    }
  }

  async writeDiskCache(dataset) {
    try {
      await mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true })
      await writeFile(CACHE_FILE_PATH, JSON.stringify(dataset), 'utf8')
    } catch {
      // Cache em disco e opcional; ignoramos falhas para nao quebrar a API.
    }
  }

  async getTypes() {
    const dataset = await this.getDataset()
    return dataset.types.map((type) => ({
      type,
      count: dataset.typeCounts[type] ?? 0,
    }))
  }

  async getRegions() {
    const dataset = await this.getDataset()
    return Object.keys(dataset.regionCounts)
      .sort()
      .map((region) => ({
        region,
        count: dataset.regionCounts[region] ?? 0,
      }))
  }

  async getSummary() {
    const dataset = await this.getDataset()
    return {
      totalPokemon: dataset.totalPokemon,
      fetchedAt: dataset.fetchedAt,
      source: dataset.source,
      cacheTtlHours: CACHE_TTL_HOURS,
    }
  }

  async getPokemonByNameOrNumber(identifier) {
    const dataset = await this.getDataset()
    const normalized = String(identifier).trim().toLowerCase()
    const numeric = Number.parseInt(normalized, 10)

    return (
      dataset.pokemon.find((pokemon) => pokemon.name === normalized) ||
      dataset.pokemon.find((pokemon) => pokemon.number === numeric) ||
      null
    )
  }

  async queryPokemon(query = {}) {
    const dataset = await this.getDataset()
    const selectedTypes = splitList(query.type || query.types)
    const selectedRegions = splitList(query.region)
    const selectedGenerations = splitList(query.generation).map((item) => parseInteger(item, null)).filter(Boolean)
    const searchValue = String(query.q ?? '').trim().toLowerCase()

    const minTotal = parseInteger(query.minTotal, null)
    const maxTotal = parseInteger(query.maxTotal, null)
    const minHp = parseInteger(query.minHp, null)
    const maxHp = parseInteger(query.maxHp, null)
    const minAttack = parseInteger(query.minAttack, null)
    const maxAttack = parseInteger(query.maxAttack, null)
    const minDefense = parseInteger(query.minDefense, null)
    const maxDefense = parseInteger(query.maxDefense, null)
    const minSpeed = parseInteger(query.minSpeed, null)
    const maxSpeed = parseInteger(query.maxSpeed, null)

    const sortBy = SORTABLE_FIELDS.has(query.sortBy) ? query.sortBy : 'number'
    const order = String(query.order).toLowerCase() === 'desc' ? 'desc' : 'asc'
    const page = Math.max(1, parseInteger(query.page, 1))
    const limit = clampNumber(parseInteger(query.limit, 24), 1, 120)

    let filtered = dataset.pokemon.filter((pokemon) => {
      if (selectedTypes.length > 0 && !selectedTypes.every((type) => pokemon.types.includes(type))) return false
      if (selectedRegions.length > 0 && !selectedRegions.includes(pokemon.region)) return false
      if (selectedGenerations.length > 0 && !selectedGenerations.includes(pokemon.generation)) return false

      if (searchValue) {
        const matchesName = pokemon.name.includes(searchValue) || pokemon.displayName.toLowerCase().includes(searchValue)
        const matchesNumber = String(pokemon.number) === searchValue || `#${pokemon.number}` === searchValue
        if (!matchesName && !matchesNumber) return false
      }

      if (minTotal !== null && pokemon.stats.total < minTotal) return false
      if (maxTotal !== null && pokemon.stats.total > maxTotal) return false
      if (minHp !== null && pokemon.stats.hp < minHp) return false
      if (maxHp !== null && pokemon.stats.hp > maxHp) return false
      if (minAttack !== null && pokemon.stats.attack < minAttack) return false
      if (maxAttack !== null && pokemon.stats.attack > maxAttack) return false
      if (minDefense !== null && pokemon.stats.defense < minDefense) return false
      if (maxDefense !== null && pokemon.stats.defense > maxDefense) return false
      if (minSpeed !== null && pokemon.stats.speed < minSpeed) return false
      if (maxSpeed !== null && pokemon.stats.speed > maxSpeed) return false

      return true
    })

    filtered = filtered.sort((a, b) => {
      let first
      let second

      if (sortBy === 'name') {
        first = a.displayName.toLowerCase()
        second = b.displayName.toLowerCase()
      } else if (sortBy in a.stats) {
        first = a.stats[sortBy]
        second = b.stats[sortBy]
      } else {
        first = a[sortBy]
        second = b[sortBy]
      }

      if (typeof first === 'string' && typeof second === 'string') {
        const stringResult = first.localeCompare(second)
        return order === 'desc' ? -stringResult : stringResult
      }

      const numericResult = Number(first) - Number(second)
      return order === 'desc' ? -numericResult : numericResult
    })

    const totalFiltered = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalFiltered / limit))
    const safePage = Math.min(page, totalPages)
    const offset = (safePage - 1) * limit
    const items = filtered.slice(offset, offset + limit)

    return {
      items,
      meta: {
        page: safePage,
        limit,
        totalItems: totalFiltered,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrevious: safePage > 1,
      },
      filters: {
        query: searchValue,
        type: selectedTypes,
        region: selectedRegions,
        generation: selectedGenerations,
      },
      sort: {
        sortBy,
        order,
      },
      dataset: {
        totalPokemon: dataset.totalPokemon,
        fetchedAt: dataset.fetchedAt,
        source: dataset.source,
      },
    }
  }
}

export function createPokedexService() {
  return new PokedexService()
}
