import { ref, onMounted, watch } from 'vue'

const STORAGE_KEY = 'pets_favorites'
let cachedFavorites = null

export function useFavorites(uuid = null) {
  const favorites = ref([])
  const isFavorite = ref(false)
  const isInitialized = ref(false)
  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const data = stored ? JSON.parse(stored) : []
      cachedFavorites = data
      return data
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error)
      cachedFavorites = []
      return []
    }
  }
  const saveFavorites = (favoritesList) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesList))
      cachedFavorites = favoritesList
    } catch (error) {
      console.error('Ошибка сохранения избранного:', error)
    }
  }
  const checkIsFavorite = (itemUuid) => {
    if (!itemUuid) return false
    try {
      const list = cachedFavorites !== null ? cachedFavorites : loadFavorites()
      return list.includes(itemUuid)
    } catch (error) {
      console.error('Ошибка проверки избранного:', error)
      return false
    }
  }
  const toggleFavorite = (itemUuid, e = null) => {
    if (e) e.stopPropagation()
    if (!itemUuid) {
      console.warn('UUID отсутствует, невозможно добавить в избранное')
      return false
    }
    try {
      const stored = loadFavorites()
      const index = stored.indexOf(itemUuid)
      let newState
      if (index > -1) {
        stored.splice(index, 1)
        newState = false
      } else {
        stored.push(itemUuid)
        newState = true
      }
      saveFavorites(stored)
      favorites.value = stored
      if (uuid?.value && itemUuid === uuid.value) {
        isFavorite.value = newState
      }
      return newState
    } catch (error) {
      console.error('Ошибка переключения избранного:', error)
      return false
    }
  }
  const addFavorite = (itemUuid) => {
    if (!itemUuid) return false
    const stored = loadFavorites()
    if (!stored.includes(itemUuid)) {
      stored.push(itemUuid)
      saveFavorites(stored)
      favorites.value = stored
      if (uuid?.value && itemUuid === uuid.value) {
        isFavorite.value = true
      }
      return true
    }
    return false
  }
  const removeFavorite = (itemUuid) => {
    if (!itemUuid) return false
    const stored = loadFavorites()
    const index = stored.indexOf(itemUuid)
    if (index > -1) {
      stored.splice(index, 1)
      saveFavorites(stored)
      favorites.value = stored
      if (uuid?.value && itemUuid === uuid.value) {
        isFavorite.value = false
      }
      return true
    }
    return false
  }
  const getFavorites = () => {
    if (cachedFavorites !== null) {
      return cachedFavorites
    }
    return loadFavorites()
  }
  const clearFavorites = () => {
    saveFavorites([])
    favorites.value = []
    isFavorite.value = false
    cachedFavorites = []
  }
  if (cachedFavorites === null && typeof window !== 'undefined') {
    loadFavorites()
  }
  onMounted(() => {
    if (uuid?.value) {
      isFavorite.value = checkIsFavorite(uuid.value)
      isInitialized.value = true
    }
  })
  if (uuid) {
    watch(uuid, (newUuid) => {
      if (newUuid) {
        setTimeout(() => {
          isFavorite.value = checkIsFavorite(newUuid)
          isInitialized.value = true
        }, 50)
      }
    }, { immediate: true })
  }
  return {
    favorites,
    isFavorite,
    isInitialized,
    loadFavorites,
    saveFavorites,
    checkIsFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    getFavorites,
    clearFavorites,
  }
}