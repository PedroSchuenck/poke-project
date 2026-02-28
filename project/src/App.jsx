import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownUp,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Filter,
  Search,
  SlidersHorizontal,
  Shield,
  Swords,
  Zap,
} from 'lucide-react'
import heroImage from './assets/img/bg-poke.jpeg'

const TYPE_THEME = {
  normal: { base: '#c85f5f', deep: '#351010' },
  fire: { base: '#ff4d4d', deep: '#540909' },
  water: { base: '#6f9eff', deep: '#121f46' },
  electric: { base: '#fcbf49', deep: '#4e2500' },
  grass: { base: '#7bc96f', deep: '#17331a' },
  ice: { base: '#79d8ff', deep: '#103249' },
  fighting: { base: '#f37272', deep: '#4a1111' },
  poison: { base: '#b37cd8', deep: '#351249' },
  ground: { base: '#d9a66c', deep: '#4b2d11' },
  flying: { base: '#9fb7ff', deep: '#1f2f59' },
  psychic: { base: '#ff6f91', deep: '#561327' },
  bug: { base: '#9db856', deep: '#2f3a10' },
  rock: { base: '#c8a85c', deep: '#403010' },
  ghost: { base: '#9d7dca', deep: '#2a183f' },
  dragon: { base: '#8176ff', deep: '#20186a' },
  dark: { base: '#8b6f6f', deep: '#1b1111' },
  steel: { base: '#b7c2d8', deep: '#27344d' },
  fairy: { base: '#f7a4c7', deep: '#4e1f35' },
}

const SORT_OPTIONS = [
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

const ORDER_OPTIONS = [
  { value: 'asc', label: 'Crescente' },
  { value: 'desc', label: 'Decrescente' },
]

const LIMIT_OPTIONS = [12, 24, 48, 96]

const GENERATION_OPTIONS = [
  { value: '1', label: 'Gen 1 (Kanto)' },
  { value: '2', label: 'Gen 2 (Johto)' },
  { value: '3', label: 'Gen 3 (Hoenn)' },
  { value: '4', label: 'Gen 4 (Sinnoh)' },
  { value: '5', label: 'Gen 5 (Unova)' },
  { value: '6', label: 'Gen 6 (Kalos)' },
  { value: '7', label: 'Gen 7 (Alola)' },
  { value: '8', label: 'Gen 8 (Galar)' },
  { value: '9', label: 'Gen 9 (Paldea)' },
]

function formatName(value) {
  return value
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ')
}

function statPercent(value, max = 255) {
  return Math.min(100, Math.round((value / max) * 100))
}

function getTypeTheme(type) {
  return TYPE_THEME[type] ?? { base: '#ef4444', deep: '#2f1212' }
}

function getCardVars(types) {
  const first = getTypeTheme(types?.[0])
  const second = getTypeTheme(types?.[1] ?? types?.[0])

  return {
    '--card-accent': first.base,
    '--card-gradient': `linear-gradient(148deg, ${first.deep} 0%, #0a0909 48%, ${second.deep} 100%)`,
    '--card-glow': `radial-gradient(circle at 85% -5%, ${first.base}99 0%, transparent 55%)`,
    '--stat-gradient': `linear-gradient(90deg, ${first.base}, ${second.base})`,
  }
}

function StatPill({ label, value, icon }) {
  return (
    <div className='stat-pill'>
      <span>
        {icon}
        {label}
      </span>
      <strong>{value}</strong>
      <div className='stat-track'>
        <div className='stat-fill' style={{ width: `${statPercent(value)}%` }} />
      </div>
    </div>
  )
}

function PokemonCard({ pokemon, onOpen }) {
  const cardVars = getCardVars(pokemon.types)

  return (
    <article
      className='pokemon-card'
      style={cardVars}
      onClick={() => onOpen(pokemon)}
      role='button'
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(pokemon)
        }
      }}
      aria-label={`Ver detalhes de ${pokemon.displayName}`}
    >
      <header className='pokemon-card-header'>
        <p className='pokemon-number'>#{String(pokemon.number).padStart(4, '0')}</p>
        <p className='pokemon-region'>{pokemon.region}</p>
      </header>

      <img
        src={pokemon.image ?? ''}
        alt={pokemon.displayName}
        className='pokemon-image'
        loading='lazy'
      />

      <h3>{pokemon.displayName}</h3>

      <div className='type-row'>
        {pokemon.types.map((type) => {
          const theme = getTypeTheme(type)
          return (
            <span
              key={`${pokemon.number}-${type}`}
              className='type-badge'
              style={{ backgroundColor: theme.base, borderColor: theme.base }}
            >
              {formatName(type)}
            </span>
          )
        })}
      </div>

      <footer className='pokemon-card-footer'>
        <span>Total: {pokemon.stats.total}</span>
        <span>Clique para detalhes</span>
      </footer>
    </article>
  )
}

function App() {
  const [searchValue, setSearchValue] = useState('')
  const [types, setTypes] = useState([])
  const [regions, setRegions] = useState([])

  const [filters, setFilters] = useState({
    type: 'all',
    region: 'all',
    generation: 'all',
    sortBy: 'number',
    order: 'asc',
    limit: 24,
    page: 1,
  })

  const [response, setResponse] = useState({
    items: [],
    meta: null,
    dataset: null,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPokemon, setSelectedPokemon] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => (current.page === 1 ? current : { ...current, page: 1 }))
    }, 260)

    return () => clearTimeout(timer)
  }, [searchValue])

  useEffect(() => {
    let ignore = false

    async function loadFilters() {
      try {
        const [typesResponse, regionsResponse] = await Promise.all([
          fetch('/api/types'),
          fetch('/api/regions'),
        ])

        if (!typesResponse.ok || !regionsResponse.ok) {
          throw new Error('Nao foi possivel carregar filtros da API.')
        }

        const typesPayload = await typesResponse.json()
        const regionsPayload = await regionsResponse.json()

        if (ignore) return
        setTypes(typesPayload.items ?? [])
        setRegions(regionsPayload.items ?? [])
      } catch (fetchError) {
        if (ignore) return
        setError(fetchError.message)
      }
    }

    loadFilters()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false
    const controller = new AbortController()

    async function loadPokemon() {
      setLoading(true)
      setError('')

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
        if (filters.region !== 'all') query.set('region', filters.region)
        if (filters.generation !== 'all') query.set('generation', filters.generation)

        const result = await fetch(`/api/pokemon?${query.toString()}`, {
          signal: controller.signal,
        })

        if (!result.ok) {
          throw new Error('Erro ao carregar Pokemon da API.')
        }

        const payload = await result.json()
        if (ignore) return

        setResponse({
          items: payload.items ?? [],
          meta: payload.meta ?? null,
          dataset: payload.dataset ?? null,
        })
      } catch (fetchError) {
        if (fetchError.name === 'AbortError' || ignore) return
        setError(fetchError.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadPokemon()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [filters, searchValue])

  const summaryText = useMemo(() => {
    if (!response.meta) return 'Sem dados'
    return `${response.meta.totalItems} resultados`
  }, [response.meta])

  const hasPrevious = response.meta?.hasPrevious ?? false
  const hasNext = response.meta?.hasNext ?? false

  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? value : 1,
    }))
    setSelectedPokemon(null)
  }

  function openPokemonModal(pokemon) {
    setSelectedPokemon(pokemon)
  }

  function closePokemonModal() {
    setSelectedPokemon(null)
  }

  useEffect(() => {
    function onEscape(event) {
      if (event.key === 'Escape') closePokemonModal()
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [])

  return (
    <main className='app-shell'>
      <header className='hero-banner' style={{ backgroundImage: `url(${heroImage})` }}>
        <div className='hero-overlay' />
        <div className='hero-content'>
          <h1 className='logo-title'>
            Poke<span>Dex</span>
          </h1>
          <p className='hero-description'>Explore, filtre e descubra Pokemon de todas as regioes.</p>
          <div className='hero-meta'>
            <span>{summaryText}</span>
            <span>Total global: {response.dataset?.totalPokemon ?? '-'}</span>
          </div>

          <form className='hero-search' onSubmit={(event) => event.preventDefault()}>
            <Search size={18} />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder='Busque por nome, numero ou #id...'
            />
            <button type='submit'>Buscar</button>
          </form>
        </div>
      </header>

      <section className='control-panel modern-filters'>
        <label className='filter-chip'>
          <Filter size={14} />
          Tipo
          <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}>
            <option value='all'>Todos</option>
            {types.map((item) => (
              <option key={item.type} value={item.type}>
                {formatName(item.type)} ({item.count})
              </option>
            ))}
          </select>
        </label>

        <label className='filter-chip'>
          <SlidersHorizontal size={14} />
          Regiao
          <select
            value={filters.region}
            onChange={(event) => updateFilter('region', event.target.value)}
          >
            <option value='all'>Todas</option>
            {regions.map((item) => (
              <option key={item.region} value={item.region}>
                {formatName(item.region)} ({item.count})
              </option>
            ))}
          </select>
        </label>

        <label className='filter-chip'>
          <SlidersHorizontal size={14} />
          Geracao
          <select
            value={filters.generation}
            onChange={(event) => updateFilter('generation', event.target.value)}
          >
            <option value='all'>Todas</option>
            {GENERATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className='filter-chip'>
          <ArrowDownUp size={14} />
          Ordenar por
          <select
            value={filters.sortBy}
            onChange={(event) => updateFilter('sortBy', event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className='filter-chip'>
          <ChevronsUpDown size={14} />
          Ordem
          <select value={filters.order} onChange={(event) => updateFilter('order', event.target.value)}>
            {ORDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className='filter-chip'>
          Itens por pagina
          <select value={filters.limit} onChange={(event) => updateFilter('limit', Number(event.target.value))}>
            {LIMIT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error ? <p className='feedback error'>{error}</p> : null}
      {loading ? <p className='feedback loading'>Carregando dados da Pokedex...</p> : null}

      {!loading && !error ? (
        <section className='results-grid'>
          {response.items.length === 0 ? (
            <p className='feedback'>Nenhum Pokemon encontrado para esses filtros.</p>
          ) : (
            response.items.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                onOpen={openPokemonModal}
              />
            ))
          )}
        </section>
      ) : null}

      <footer className='pagination'>
        <button
          disabled={!hasPrevious || loading}
          onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <span>
          Pagina {response.meta?.page ?? 1} de {response.meta?.totalPages ?? 1}
        </span>

        <button disabled={!hasNext || loading} onClick={() => updateFilter('page', filters.page + 1)}>
          Proxima
          <ChevronRight size={16} />
        </button>
      </footer>

      {selectedPokemon ? (
        <div className='modal-overlay' onClick={closePokemonModal}>
          <div className='pokemon-modal' onClick={(event) => event.stopPropagation()}>
            <button className='modal-close' onClick={closePokemonModal} aria-label='Fechar detalhes'>
              <X size={18} />
            </button>

            <div className='modal-head'>
              <img src={selectedPokemon.image ?? ''} alt={selectedPokemon.displayName} />
              <div>
                <h2>
                  {selectedPokemon.displayName} <small>#{String(selectedPokemon.number).padStart(4, '0')}</small>
                </h2>
                <p>
                  {selectedPokemon.region} • Geração {selectedPokemon.generation ?? '-'}
                </p>
                <div className='type-row'>
                  {selectedPokemon.types.map((type) => {
                    const theme = getTypeTheme(type)
                    return (
                      <span
                        key={`modal-${selectedPokemon.id}-${type}`}
                        className='type-badge'
                        style={{ backgroundColor: theme.base, borderColor: theme.base }}
                      >
                        {formatName(type)}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className='stat-grid'>
              <StatPill label='HP' value={selectedPokemon.stats.hp} icon={<Shield size={13} />} />
              <StatPill label='ATK' value={selectedPokemon.stats.attack} icon={<Swords size={13} />} />
              <StatPill label='DEF' value={selectedPokemon.stats.defense} icon={<Shield size={13} />} />
              <StatPill label='SPD' value={selectedPokemon.stats.speed} icon={<Zap size={13} />} />
            </div>

            <div className='detail-meta'>
              <span>Total: {selectedPokemon.stats.total}</span>
              <span>Altura: {selectedPokemon.height.toFixed(1)} m</span>
              <span>Peso: {selectedPokemon.weight.toFixed(1)} kg</span>
              <span>Base EXP: {selectedPokemon.baseExperience ?? '-'}</span>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default App
