<template>
  <div class="aspect-card hero-card">
    <div class="hero-meta">
      <span v-if="direction" class="tag direction-tag">{{ direction }}</span>
      <span v-if="experience" class="tag experience-tag">{{ experience }}</span>
    </div>
    <img :src="image" :alt="name" class="hero-image" loading="lazy" />
    <div :class="['hero-overlay', getRandomHumanClass(uuid)]">
      <div class="name">{{ name }}</div>
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<script>
// ============================================================
//  ИМПОРТЫ
// ============================================================
import { computed } from 'vue'
import { useData } from 'vitepress'

// ============================================================
//  КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL
const randomClassCache = new Map()

// ============================================================
//  УТИЛИТЫ
// ============================================================

/**
 * Обработка пути к изображению
 */
const processImage = (imagePath, type, uuid) => {
  if (!imagePath) {
    return uuid ? `${baseUrl}images/${type}/${uuid}.webp` : `${baseUrl}placeholder-${type}.svg`
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
 * Преобразование опыта в уровень
 */
const getExperienceLevel = (experienceRaw) => {
  if (!experienceRaw) return 'Нет опыта'
  
  const exp = experienceRaw.toLowerCase()

  // Проверяем ключевые слова
  if (exp.includes('эксперт')) return 'Эксперт'
  if (exp.includes('опытный')) return 'Опытный'
  if (exp.includes('начинающий')) return 'Начинающий'

  // Проверяем годы
  const yearMatch = exp.match(/(\d+)\s*(год|лет|года)/)
  if (yearMatch) {
    const years = parseInt(yearMatch[1])
    if (years <= 1) return 'Начинающий'
    if (years <= 3) return 'Опытный'
    return 'Эксперт'
  }

  // Проверяем месяцы
  const monthMatch = exp.match(/(\d+)\s*(месяц|мес)/)
  if (monthMatch) {
    const months = parseInt(monthMatch[1])
    if (months < 12) return 'Начинающий'
    return 'Опытный'
  }

  return experienceRaw || 'Нет опыта'
}

// ============================================================
//  КОМПОНЕНТ
// ============================================================
export default {
  name: 'CardHumanHero',

  props: {
    petType: {
      type: String,
      required: false,
      default: 'dogs',
    }
  },

  setup(props) {
    // ============================================================
    //  ДАННЫЕ
    // ============================================================
    const { frontmatter } = useData()
    
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
    const direction = computed(() => fm.value?.direction || '')
    const experience = computed(() => getExperienceLevel(fm.value?.experience))
    
    /**
     * Обработка изображения (консистентно с ListPets)
     */
    const image = computed(() => {
      return processImage(fm.value?.image, props.petType, uuid.value)
    })

    // ============================================================
    //  РАНДОМНЫЕ ЦВЕТА (ВНУТРИ SETUP)
    // ============================================================
    let previousColor = 0
    const getRandomHumanClass = (uuid) => {
      if (!uuid) return 'rand-01'
      if (randomClassCache.has(uuid)) {
        return randomClassCache.get(uuid)
      }
      let num
      do {
        num = Math.floor(Math.random() * 30) + 1
      } while (num === previousColor)
      previousColor = num
      const formattedNum = num.toString().padStart(2, '0')
      const className = `rand-${formattedNum}`
      randomClassCache.set(uuid, className)
      return className
    }

    // ============================================================
    //  ВОЗВРАТ
    // ============================================================
    return {
      // Данные человека
      uuid,
      name,
      description,
      direction,
      experience,
      image,
      
      // Методы
      getRandomHumanClass,
      
      // Константы
      baseUrl,
    }
  }
}
</script>