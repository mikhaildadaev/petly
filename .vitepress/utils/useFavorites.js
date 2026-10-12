import { ref, computed } from 'vue'
const STORAGE_KEY = 'pets_favorites'
const favorites = ref(
  typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    : []
)
const persist = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
  }
}
const addFavorite = (uuid) => {
  if (!uuid || favorites.value.includes(uuid)) return
  favorites.value = [...favorites.value, uuid]
  persist()
}
const removeFavorite = (uuid) => {
  favorites.value = favorites.value.filter(id => id !== uuid)
  persist()
}
const toggleFavorite = (uuid) => {
  if (!uuid) return
  if (favorites.value.includes(uuid)) removeFavorite(uuid)
  else addFavorite(uuid)
}
const clearFavorites = () => {
  favorites.value = []
  persist()
}
export function useFavoritesList() {
  const isFavorite = (uuid) => favorites.value.includes(uuid)
  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
  }
}
export function useFavorite(uuidRef) {
  const isFavorite = computed(() =>
    uuidRef?.value ? favorites.value.includes(uuidRef.value) : false
  )
  const toggle = () => {
    if (uuidRef?.value) toggleFavorite(uuidRef.value)
  }
  return {
    favorites,
    isFavorite,
    toggle,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      try {
        favorites.value = JSON.parse(e.newValue || '[]')
      } catch {
        favorites.value = []
      }
    }
  })
}