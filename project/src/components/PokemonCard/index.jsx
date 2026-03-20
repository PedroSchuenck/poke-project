import { getTypeTheme } from "../../styles/type-theme";
import { formatName } from "../../utils/nameFormatter";

export function PokemonCard({ pokemon, onOpen, getCardVars }) {
  const cardVars = getCardVars(pokemon.types);
  return (
    <article
      className="pokemon-card"
      style={cardVars}
      onClick={() => onOpen(pokemon)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(pokemon);
        }
      }}
      aria-label={`Ver detalhes de ${pokemon.displayName}`}
    >
      <header className="pokemon-card-header">
        <p className="pokemon-number">
          #{String(pokemon.number).padStart(4, "0")}
        </p>
        <p className="pokemon-region">{pokemon.region}</p>
      </header>
      <img
        src={pokemon.image ?? ""}
        alt={pokemon.displayName}
        className="pokemon-image"
        loading="lazy"
      />
      <h3>{pokemon.displayName}</h3>
      <div className="type-row">
        {pokemon.types.map((type) => {
          const theme = getTypeTheme(type);
          return (
            <span
              key={`${pokemon.number}-${type}`}
              className="type-badge"
              style={{ backgroundColor: theme.base, borderColor: theme.base }}
            >
              {formatName(type)}
            </span>
          );
        })}
      </div>
      <footer className="pokemon-card-footer">
        <span>Clique para detalhes</span>
      </footer>
    </article>
  );
}
