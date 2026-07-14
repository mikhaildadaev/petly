<template>
  <div class="aspect-card hero-card">
    <div class="hero-meta">
      <span v-if="gender" class="tag gender-tag" :data-gender="gender">{{ gender }}</span>
      <span v-if="age" class="tag age-tag">{{ age }}</span>
      <span v-if="size" class="tag size-tag">{{ size }}</span>
    </div>
    <img :src="image" :alt="name" class="hero-image" loading="lazy" />
    <div :class="['hero-overlay', getRandomPetClass(uuid)]">
      <div class="name">{{ name }}</div>
      <button v-if="uuid" class="favorite-btn" :class="{ 'is-favorite': isFavorite }" @click.stop="toggleFavorite" aria-label="Добавить в избранное" title="Добавить в избранное">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<script>
// ============================================================
//  ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'

// ============================================================
//  КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL
const STORAGE_KEY = 'pets_favorites'
const randomClassCache = new Map()

// ============================================================
//  УТИЛИТЫ
// ============================================================

/**
 * Обработка пути к изображению
 * @param {string} imagePath - путь из frontmatter
 * @param {string} type - тип (dogs, cats, и т.д.)
 * @param {string} uuid - UUID сущности
 * @returns {string} - полный URL изображения
 */
const processImage = (imagePath, type, uuid) => {
  // 1. Если изображение не указано — формируем по UUID
  if (!imagePath) {
    return uuid ? `${baseUrl}images/${type}/${uuid}.webp` : `${baseUrl}placeholder-${type}.svg`
  }

  // 2. Если полный URL — оставляем как есть
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // 3. Если путь с / — добавляем baseUrl
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath.slice(1)}`
  }

  // 4. Относительный путь
  return imagePath
}

/**
 * Загрузка избранных из localStorage
 * @returns {Array} - массив UUID избранных питомцев
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
 * @param {Array} favorites - массив UUID
 */
const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch (error) {
    console.error('Ошибка сохранения избранного:', error)
  }
}

// ============================================================
//  КОМПОНЕНТ
// ============================================================
export default {
  name: 'CardPetHero',

  props: {
    petType: {
      type: String,
      required: false,
      default: 'dogs',
      description: 'Тип питомца (dogs, cats, и т.д.)'
    }
  },

  setup(props) {
    // ============================================================
    //  ДАННЫЕ
    // ============================================================
    const { frontmatter } = useData()
    
    // ============================================================
    //  СОСТОЯНИЕ
    // ============================================================
    const isFavorite = ref(false)
    const isInitialized = ref(false)

    // ============================================================
    //  ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    /**
     * Безопасное получение frontmatter
     */
    const fm = computed(() => {
      if (!frontmatter) return {}
      const data = frontmatter.value || frontmatter || {}
      return data
    })

    const uuid = computed(() => fm.value?.uuid || '')
    const name = computed(() => fm.value?.title || 'Безымянный друг')
    const description = computed(() => fm.value?.description || '')
    const gender = computed(() => fm.value?.gender || '')
    const age = computed(() => fm.value?.age || '')
    const size = computed(() => fm.value?.size || '')
    const tags = computed(() => fm.value?.tags || [])
    
    /**
     * Обработка изображения (консистентно с ListPets)
     */
    const image = computed(() => {
      return processImage(fm.value?.image, props.petType, uuid.value)
    })

    // ============================================================
    //  МЕТОДЫ
    // ============================================================

    /**
     * Проверка, добавлен ли питомец в избранное
     * @returns {boolean}
     */
    const checkIsFavorite = () => {
      if (!uuid.value) return false
      
      try {
        const favorites = loadFavorites()
        return favorites.includes(uuid.value)
      } catch (error) {
        console.error('Ошибка проверки избранного:', error)
        return false
      }
    }

    /**
     * Переключение состояния избранного
     */
    const toggleFavorite = (e) => {
      if (e) e.stopPropagation()
      if (!uuid.value) {
        console.warn('UUID отсутствует, невозможно добавить в избранное')
        return
      }
      
      try {
        const favorites = loadFavorites()
        const index = favorites.indexOf(uuid.value)
        
        if (index > -1) {
          favorites.splice(index, 1)
          isFavorite.value = false
        } else {
          favorites.push(uuid.value)
          isFavorite.value = true
        }
        
        saveFavorites(favorites)
      } catch (error) {
        console.error('Ошибка переключения избранного:', error)
      }
    }

    const getRandomPetClass = (uuid) => {
      if (randomClassCache.has(uuid)) {
        return randomClassCache.get(uuid)
      }
      const num = Math.floor(Math.random() * 30) + 1
      const formattedNum = num.toString().padStart(2, '0')
      const className = `rand-${formattedNum}`
      randomClassCache.set(uuid, className)
      return className
    }

    // ============================================================
    //  ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(() => {
      nextTick(() => {
        isFavorite.value = checkIsFavorite()
        isInitialized.value = true
      })
    })

    // ============================================================
    //  WATCHERS
    // ============================================================

    watch(uuid, (newUuid) => {
      if (newUuid) {
        setTimeout(() => {
          isFavorite.value = checkIsFavorite()
        }, 50)
      }
    }, { immediate: true })

    watch(fm, (newFm) => {
      if (newFm?.uuid) {
        isFavorite.value = checkIsFavorite()
      }
    }, { deep: true })

    // ============================================================
    //  ВОЗВРАТ
    // ============================================================
    return {
      // Данные питомца
      uuid,
      name,
      description,
      gender,
      age,
      size,
      tags,
      image,
      
      // Состояние избранного
      isFavorite,
      isInitialized,
      
      // Методы
      getRandomPetClass,
      toggleFavorite,
      
      // Константы
      baseUrl
    }
  }
}
</script>