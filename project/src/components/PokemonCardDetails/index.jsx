import { Shield, Swords, X, Zap } from "lucide-react"
import { getTypeTheme, TYPE_THEME } from "../../styles/type-theme"
import { StatPill } from "../StatPill"
import { Activity, useMemo } from "react"
import { formatName } from "../../utils/nameFormatter"


export function PokemonCardDetails({ selectedPokemon, setSelectedPokemon, getCardVars }) {
    const ALL_TYPES = Object.keys(TYPE_THEME)
    const TYPE_CHART = {
        normal: { rock: 0.5, ghost: 0, steel: 0.5 },
        fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
        water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
        electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
        grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
        ice: { fire: 0.5, water: 0.5, grass: 2, ground: 2, flying: 2, dragon: 2, steel: 0.5, ice: 0.5 },
        fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
        poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
        ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
        flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
        psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
        bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
        rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
        ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
        dragon: { dragon: 2, steel: 0.5, fairy: 0 },
        dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
        steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, fairy: 2, steel: 0.5 },
        fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
    }

    function multiplierLabel(value) {
        if (Number.isInteger(value)) return `x${value}`
        return `x${value.toFixed(2)}`
    }

    function getAttackMultiplier(attackerType, defenderTypes) {
        return defenderTypes.reduce(
            (accumulator, defenderType) => accumulator * (TYPE_CHART[attackerType]?.[defenderType] ?? 1),
            1,
        )
    }

    function getDefensiveWeaknesses(pokemonTypes) {
      return ALL_TYPES.map((attackType) => ({
        type: attackType,
        multiplier: getAttackMultiplier(attackType, pokemonTypes),
      }))
        .filter((entry) => entry.multiplier > 1)
        .sort((a, b) => b.multiplier - a.multiplier)
    }
    
    function getOffensiveAdvantages(pokemonTypes) {
      return ALL_TYPES.map((defenderType) => ({
        type: defenderType,
        multiplier: Math.max(...pokemonTypes.map((attackType) => getAttackMultiplier(attackType, [defenderType]))),
      }))
        .filter((entry) => entry.multiplier > 1)
        .sort((a, b) => b.multiplier - a.multiplier)
    }

    const weaknesses = useMemo(
        () => (selectedPokemon ? getDefensiveWeaknesses(selectedPokemon.types) : []),
        [selectedPokemon],
    )
    const offensiveAdvantages = useMemo(
        () => (selectedPokemon ? getOffensiveAdvantages(selectedPokemon.types) : []),
        [selectedPokemon],
    )

    return(
        <div className='modal-overlay' onClick={() => setSelectedPokemon(null)}>
            <div className='pokemon-modal' style={getCardVars(selectedPokemon.types)} onClick={(event) => event.stopPropagation()}>
            <button className='modal-close' onClick={() => setSelectedPokemon(null)} aria-label='Fechar detalhes'>
                <X size={18} />
            </button>
            <div className='modal-head'>
                <img src={selectedPokemon.image ?? ''} alt={selectedPokemon.displayName} />
                <div>
                <h2>
                    {selectedPokemon.displayName} <small>#{String(selectedPokemon.number).padStart(4, '0')}</small>
                </h2>
                <p>
                    {selectedPokemon.region} - Geracao {selectedPokemon.generation ?? '-'}
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

            <div className='modal-subtitle'>
                <Activity size={15} />
                <span>Distribuicao de stats</span>
            </div>

            <div className='stat-grid'>
                <StatPill label='HP' value={selectedPokemon.stats.hp} icon={<Shield size={13} />} />
                <StatPill label='ATK' value={selectedPokemon.stats.attack} icon={<Swords size={13} />} />
                <StatPill label='DEF' value={selectedPokemon.stats.defense} icon={<Shield size={13} />} />
                <StatPill label='SPD' value={selectedPokemon.stats.speed} icon={<Zap size={13} />} />
            </div>

            <section className='effect-grid'>
                <div className='effect-box weak'>
                <h4>Fraquezas</h4>
                <div className='effect-list'>
                    {weaknesses.length > 0 ? (
                    weaknesses.slice(0, 8).map((entry) => (
                        <span key={`weak-${entry.type}`} className='effect-pill'>
                        {formatName(entry.type)} {multiplierLabel(entry.multiplier)}
                        </span>
                    ))
                    ) : (
                    <span className='effect-empty'>Sem fraquezas relevantes.</span>
                    )}
                </div>
                </div>

                <div className='effect-box strong'>
                <h4>Vantagens</h4>
                <div className='effect-list'>
                    {offensiveAdvantages.length > 0 ? (
                    offensiveAdvantages.slice(0, 8).map((entry) => (
                        <span key={`adv-${entry.type}`} className='effect-pill'>
                        {formatName(entry.type)} {multiplierLabel(entry.multiplier)}
                        </span>
                    ))
                    ) : (
                    <span className='effect-empty'>Sem vantagens marcantes.</span>
                    )}
                </div>
                </div>
            </section>

            <div className='detail-meta'>
                <span>Total: {selectedPokemon.stats.total}</span>
                <span>Altura: {selectedPokemon.height.toFixed(1)} m</span>
                <span>Peso: {selectedPokemon.weight.toFixed(1)} kg</span>
                <span>Base EXP: {selectedPokemon.baseExperience ?? '-'}</span>
            </div>
            </div>
        </div>
    )
}