import { ref, onMounted, watch } from 'vue'

const STORAGE_KEY = 'pets_favorites'

export function useFavorites(uuid = null) {
  const favorites = ref([])
  const isFavorite = ref(false)
  const isInitialized = ref(false)
  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error)
      return []
    }
  }
  const saveFavorites = (favoritesList) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesList))
    } catch (error) {
      console.error('Ошибка сохранения избранного:', error)
    }
  }
  const checkIsFavorite = (itemUuid) => {
    if (!itemUuid) return false
    try {
      const stored = loadFavorites()
      return stored.includes(itemUuid)
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
      if (itemUuid === uuid?.value) {
        isFavorite.value = newState
      }
      return newState
    } catch (error) {
      console.error('Ошибка переключения избранного:', error)
      return false
    }
  }
  const getFavoriteUUIDs = () => {
    return loadFavorites()
  }
  const clearFavorites = () => {
    saveFavorites([])
    favorites.value = []
    isFavorite.value = false
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
    // Состояние
    favorites,
    isFavorite,
    isInitialized,
    
    // Методы
    loadFavorites,
    saveFavorites,
    checkIsFavorite,
    toggleFavorite,
    getFavoriteUUIDs,
    clearFavorites,
  }
}