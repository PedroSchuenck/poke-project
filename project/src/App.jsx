import { useEffect, useState } from 'react'
import heroImage from './assets/img/bg-poke.jpeg'
import { PokemonCard } from './components/PokemonCard'
import { getTypeTheme } from './styles/type-theme'
import { loadPokemon } from './api/services/pokemonService'
import { PokemonCardDetails } from './components/PokemonCardDetails'
import { FilterSection } from './components/FilterSection'
import { SearchInput } from './components/SearchInput'
import { PaginationContainer } from './components/PaginationContainer'

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

function App() {
  const [searchValue, setSearchValue] = useState('')

  const [filters, setFilters] = useState({
    type: 'all',
    origin: 'all',
    sortBy: 'number',
    order: 'asc',
    limit: 25,
    page: 1,
  })

  const [loading, setLoading] = useState(true)
  const [response, setResponse] = useState({})
  const [error, setError] = useState('')
  const [selectedPokemon, setSelectedPokemon] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => (current.page === 1 ? current : { ...current, page: 1 }))
    }, 260)
    return () => clearTimeout(timer)
  }, [searchValue])

  useEffect(() => {
    setLoading(true)

    loadPokemon(filters, searchValue).then((response) => {
      setResponse(response)
    }).catch((fetchError) => {
      setError(fetchError.message)
    }).finally(() => {
      setLoading(false)
    })
    
  }, [filters, searchValue])

  function updateFilter(key, value) {
      setFilters((current) => ({
      ...current,
      [key]: key === 'limit' ? Number(value) : value,
      page: key === 'page' ? value : 1,
      }))
  }

  useEffect(() => {
    function onEscape(event) {
      if (event.key === 'Escape') setSelectedPokemon(null)
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [])

  useEffect(() => {
    document.body.style.overflow = selectedPokemon ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedPokemon])

  return (
    <main className='app-shell'>
      <PaginationContainer response={response} updateFilter={updateFilter} loading={loading} filters={filters}>
        
        <header className='hero-banner' style={{ backgroundImage: `url(${heroImage})` }}>
          <div className='hero-overlay' />
          <div className='hero-content'>
            <h1 className='logo-title'>
              Poke<span>Dex</span>
            </h1>
            <p className='hero-description'>Explore, filtre e descubra Pokemon de todas as regioes.</p>
            <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} />
          </div>
        </header>

        <FilterSection filters={filters} updateFilter={updateFilter} />
        
        {error ? <p className='feedback error'>{error}</p> : null}
        {loading ? <p className='feedback loading'>Carregando dados da Pokedex...</p> : null}

        {!loading && !error ? (
          <section className='results-grid'>
            {response.items.length === 0 ? (
              <p className='feedback'>Nenhum Pokemon encontrado para esses filtros.</p>
            ) : (
              response.items.map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} onOpen={setSelectedPokemon} getCardVars={getCardVars} />
              ))
            )}
          </section>
        ) : null}

      </PaginationContainer>

      <p className='site-credit'>Desenvolvido por: Bernardo Cavalheiro, Pedro Schuenck, Roberto Alaluna.</p>

      {selectedPokemon && <PokemonCardDetails selectedPokemon={selectedPokemon} setSelectedPokemon={setSelectedPokemon} getCardVars={getCardVars} />}
    </main>
  )
}

export default App