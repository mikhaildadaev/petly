<template>
  <div class="aspect-card hero-card">
    <div class="hero-meta">
      <span v-if="gender" class="tag gender-tag" :data-gender="gender">{{ gender }}</span>
      <span v-if="age" class="tag age-tag">{{ age }}</span>
      <span v-if="size" class="tag size-tag">{{ size }}</span>
    </div>
    <button class="favorite-btn" :class="{ 'is-favorite': isFavorite }" @click.stop="toggleFavorite" aria-label="Добавить в избранное" title="Добавить в избранное">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
    <img :src="image" :alt="name" class="hero-image" loading="lazy" />
    <div class="hero-overlay glass">
      <div class="name">{{ name }}</div>
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

// ============================================================
//  УТИЛИТЫ
// ============================================================

/**
 * Обработка пути к изображению
 */
const processImage = (imagePath, type, uuid) => {
  if (!imagePath) {
    return uuid ? `${baseUrl}photos/${type}/${uuid}.webp` : `${baseUrl}placeholder-${type}.svg`
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath.slice(1)}`
  }
  return imagePath
}

/**
 * Загрузка избранных из localStorage
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
    // --- Данные ---
    const { frontmatter } = useData()
    
    // --- Состояние ---
    const isFavorite = ref(false)
    const isInitialized = ref(false)

    // --- Вычисляемые свойства ---
    const fm = computed(() => {
      if (!frontmatter) return {}
      const data = frontmatter.value || frontmatter || {}
      return data
    })

    const name = computed(() => fm.value?.title || 'Безымянный друг')
    const gender = computed(() => fm.value?.gender || '')
    const age = computed(() => fm.value?.age || '')
    const size = computed(() => fm.value?.size || '')
    const uuid = computed(() => fm.value?.uuid || '')

    const image = computed(() => {
      return processImage(fm.value?.image, props.petType, uuid.value)
    })

    // --- Методы ---
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

    // --- Жизненный цикл ---
    onMounted(() => {
      nextTick(() => {
        isFavorite.value = checkIsFavorite()
        isInitialized.value = true
      })
    })

    // --- Watchers ---
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

    // --- Возврат ---
    return {
      name,
      gender,
      age,
      size,
      uuid,
      image,
      isFavorite,
      isInitialized,
      toggleFavorite,
      baseUrl,
    }
  }
}
</script>