/** Poké Ball sprite: shown wherever a Pokémon has no image of its own, and used as the logo. */
export const POKEMON_PLACEHOLDER_IMAGE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

export interface TypeTagStyle {
  background: string;
  color: string;
}

const LIGHT_TEXT = '#ffffff';
const DARK_TEXT = '#1c1917';

/** Classic Pokémon type colors; each text color keeps a WCAG AA contrast ratio (>= 4.5:1). */
export const TYPE_TAG_STYLES: Record<string, TypeTagStyle> = {
  Normal: { background: '#a8a77a', color: DARK_TEXT },
  Fire: { background: '#ee8130', color: DARK_TEXT },
  Water: { background: '#6390f0', color: DARK_TEXT },
  Electric: { background: '#f7d02c', color: DARK_TEXT },
  Grass: { background: '#7ac74c', color: DARK_TEXT },
  Ice: { background: '#96d9d6', color: DARK_TEXT },
  Fighting: { background: '#c22e28', color: LIGHT_TEXT },
  Poison: { background: '#a33ea1', color: LIGHT_TEXT },
  Ground: { background: '#e2bf65', color: DARK_TEXT },
  Flying: { background: '#a98ff3', color: DARK_TEXT },
  Psychic: { background: '#f95587', color: DARK_TEXT },
  Bug: { background: '#a6b91a', color: DARK_TEXT },
  Rock: { background: '#b6a136', color: DARK_TEXT },
  Ghost: { background: '#735797', color: LIGHT_TEXT },
  Dragon: { background: '#6f35fc', color: LIGHT_TEXT },
  Dark: { background: '#705746', color: LIGHT_TEXT },
  Steel: { background: '#b7b7ce', color: DARK_TEXT },
  Fairy: { background: '#d685ad', color: DARK_TEXT },
};
