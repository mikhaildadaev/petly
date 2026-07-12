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
    <img :src="image" :alt="name" class="hero-image" loading="lazy" @error="handleImageError"/>
    <div class="hero-overlay glass">
      <div class="name">{{ name }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  petType: {
    type: String,
    required: false,
    default: 'dogs'
  }
})

const { frontmatter } = useData()

// === БЕЗОПАСНОЕ ПОЛУЧЕНИЕ FRONTMATTER ===
const fm = computed(() => {
  if (!frontmatter) return {}
  const data = frontmatter.value || frontmatter || {}
  return data
})

const name = computed(() => fm.value?.title || 'Безымянный друг')
const gender = computed(() => fm.value?.gender || '')
const age = computed(() => fm.value?.age || '')
const size = computed(() => fm.value?.size || '')
const image = computed(() => fm.value?.image || '/placeholder-dog.svg')
const uuid = computed(() => fm.value?.uuid || '')

// === ИЗБРАННОЕ ===
const STORAGE_KEY = 'pets_favorites'
const isFavorite = ref(false)
const isInitialized = ref(false)

// Загрузка избранных из localStorage
const loadFavorites = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Ошибка загрузки избранного:', error)
    return []
  }
}

// Сохранение избранных в localStorage
const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  } catch (error) {
    console.error('Ошибка сохранения избранного:', error)
  }
}

// Проверка, добавлен ли текущий питомец в избранное
const checkIsFavorite = () => {
  if (!uuid.value) {
    console.log('UUID отсутствует')
    return false
  }
  
  try {
    const favorites = loadFavorites()
    const result = favorites.includes(uuid.value)
    console.log(`Проверка UUID ${uuid.value}: ${result}`) // ← Отладка
    return result
  } catch (error) {
    console.error('Ошибка проверки избранного:', error)
    return false
  }
}

// Переключение избранного
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
      console.log(`Удален из избранного: ${uuid.value}`)
    } else {
      favorites.push(uuid.value)
      isFavorite.value = true
      console.log(`Добавлен в избранное: ${uuid.value}`)
    }
    
    saveFavorites(favorites)
  } catch (error) {
    console.error('Ошибка переключения избранного:', error)
  }
}

// === ИНИЦИАЛИЗАЦИЯ ===
// 1. При монтировании компонента
onMounted(() => {
  console.log('Компонент смонтирован, UUID:', uuid.value)
  
  // Ждем, пока UUID загрузится
  nextTick(() => {
    const favStatus = checkIsFavorite()
    isFavorite.value = favStatus
    isInitialized.value = true
    console.log('Инициализация завершена, isFavorite:', favStatus)
  })
})

// 2. Следим за изменением UUID
watch(uuid, (newUuid, oldUuid) => {
  console.log('UUID изменился:', oldUuid, '→', newUuid)
  
  if (newUuid) {
    // Небольшая задержка для уверенности, что все данные загружены
    setTimeout(() => {
      const favStatus = checkIsFavorite()
      isFavorite.value = favStatus
      console.log('Обновлен isFavorite:', favStatus)
    }, 50)
  }
}, { immediate: true })

// 3. Дополнительная проверка при изменении frontmatter
watch(fm, (newFm) => {
  if (newFm?.uuid) {
    console.log('Frontmatter обновлен, UUID:', newFm.uuid)
    const favStatus = checkIsFavorite()
    isFavorite.value = favStatus
  }
}, { deep: true })

// Обработчик ошибки загрузки изображения
const handleImageError = (e) => {
  e.target.src = '/placeholder-dog.svg'
  e.target.alt = 'Изображение временно недоступно'
}
</script>