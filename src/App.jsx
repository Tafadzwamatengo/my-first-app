import { useState } from "react";
import { pokemons } from "./pokemons";
import PokemonCard from "./PokemonCard";
import "./App.css";

const types = ["All", ...new Set(pokemons.map((p) => p.type))];

export default function App() {
  const [selectedType, setSelectedType] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id) ? current.filter((f) => f !== id) : [...current, id]
    );
  }

  const visible = pokemons.filter(
    (p) =>
      (selectedType === "All" || p.type === selectedType) &&
      (!favoritesOnly || favorites.includes(p.id))
  );

  return (
    <main>
      <h1>Pokémon Explorer</h1>

      <div className="filters">
        {types.map((t) => (
          <button
            key={t}
            className={t === selectedType ? "active" : ""}
            onClick={() => setSelectedType(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <label className="fav-toggle">
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={(e) => setFavoritesOnly(e.target.checked)}
        />
        Show favorites only ({favorites.length})
      </label>

      <p>{visible.length} Pokémon shown</p>

      <div className="grid">
        {visible.map((p) => (
          <PokemonCard
            key={p.id}
            pokemon={p}
            isFavorite={favorites.includes(p.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </main>
  );
}