<template>
  <div class="aspect-card hero-card">
    <div class="hero-meta">
      <span v-if="direction" class="tag direction-tag">{{ direction }}</span>
      <span v-if="experience" class="tag experience-tag">{{ experience }}</span>
    </div>
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
import { computed } from 'vue'
import { useData } from 'vitepress'

// ============================================================
//  КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL

// ============================================================
//  УТИЛИТЫ
// ============================================================

/**
 * Обработка пути к изображению
 * @param {string} imagePath - путь из frontmatter
 * @param {string} type - тип (dogs, cats, volunteers и т.д.)
 * @param {string} uuid - UUID сущности
 * @returns {string} - полный URL изображения
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

// ============================================================
//  УТИЛИТЫ
// ============================================================

/**
 * Преобразование опыта в уровень
 * @param {string} experienceRaw - строка с опытом
 * @returns {string} - уровень (Начинающий, Опытный, Эксперт)
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
      description: 'Тип питомца (dogs, cats, volunteers и т.д.)'
    }
  },

  setup(props) {
    // --- Данные ---
    const { frontmatter } = useData()
    
    // --- Вычисляемые свойства ---
    const fm = computed(() => frontmatter?.value || frontmatter || {})
    
    const name = computed(() => fm.value?.title || 'Безымянный друг')
    const direction = computed(() => fm.value?.direction || '')
    const experience = computed(() => getExperienceLevel(fm.value?.experience))
    const uuid = computed(() => fm.value?.uuid || '')
    
    const image = computed(() => processImage(
      fm.value?.image, 
      props.petType, 
      uuid.value
    ))

    // --- Возврат ---
    return {
      name,
      direction,
      experience,
      image,
      baseUrl,
    }
  }
}
</script>