import { ref, onMounted, watch } from 'vue'

const STORAGE_KEY = 'pets_favorites'

export function useFavorites(uuid = null) {
  const favorites = ref([])
  const isFavorite = ref(false)
  const isInitialized = ref(false)

  /**
   * Загрузка избранных из localStorage
   * @returns {Array} - массив UUID
   */
  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error)
      return []
    }
  }

  /**
   * Сохранение избранных в localStorage
   * @param {Array} favoritesList - массив UUID
   */
  const saveFavorites = (favoritesList) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesList))
    } catch (error) {
      console.error('Ошибка сохранения избранного:', error)
    }
  }

  /**
   * Проверка, добавлен ли элемент в избранное
   * @param {string} itemUuid - UUID элемента
   * @returns {boolean}
   */
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

  /**
   * Переключение состояния избранного
   * @param {string} itemUuid - UUID элемента
   * @param {Event} e - событие (для остановки propagation)
   * @returns {boolean} - новое состояние
   */
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

  /**
   * Получить список UUID избранных элементов
   * @returns {Array}
   */
  const getFavoriteUUIDs = () => {
    return loadFavorites()
  }

  /**
   * Очистить все избранное
   */
  const clearFavorites = () => {
    saveFavorites([])
    favorites.value = []
    isFavorite.value = false
  }

  // Если передан uuid, инициализируем isFavorite
  onMounted(() => {
    if (uuid?.value) {
      isFavorite.value = checkIsFavorite(uuid.value)
      isInitialized.value = true
    }
  })

  // Следим за изменением uuid
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