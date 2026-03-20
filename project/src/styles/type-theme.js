export const TYPE_THEME = {
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

export function getTypeTheme(type) {
  return TYPE_THEME[type] ?? { base: '#ef4444', deep: '#2f1212' }
}