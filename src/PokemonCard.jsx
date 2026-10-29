export default function PokemonCard({ pokemon, isFavorite, onToggleFavorite }) {
  const { id, name, type, hp, attack } = pokemon;
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  return (
    <article className="card">
      <button
        className="fav"
        onClick={() => onToggleFavorite(id)}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? "★" : "☆"}
      </button>
      <img src={sprite} alt={name} width="96" height="96" />
      <h2>{name}</h2>
      <span className="badge" data-type={type}>{type}</span>
      <p>HP {hp} · Attack {attack}</p>
    </article>
  );
}