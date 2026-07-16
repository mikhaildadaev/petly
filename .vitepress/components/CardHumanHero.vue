<template>
  <div class="aspect-card hero-card">
    <div class="hero-meta">
      <span v-if="human.directionDisplay" class="tag direction-tag">{{ human.directionDisplay }}</span>
      <span v-if="human.experienceDisplay" class="tag experience-tag">{{ human.experienceDisplay }}</span>
    </div>
    <img :src="human.image" class="hero-image" loading="lazy" />
    <div :class="['hero-overlay', getRandomHumanClass(human.uuid)]">
      <div class="name">{{ human.nameDisplay }}</div>
      <p>{{ human.descriptionDisplay }}</p>
    </div>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { computed, inject } from 'vue'
import { useData } from 'vitepress'
import { getTranslate, getDirection, getExperience } from '../composables/i18n'

// ============================================================
//  2. КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL
const randomClassCache = new Map()

// ============================================================
//  3. УТИЛИТЫ
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

// ============================================================
//  4. КОМПОНЕНТ
// ============================================================
export default {
  name: 'CardHumanHero',

  props: {
    humanType: {
      type: String,
      required: false,
      default: 'volunteers',
    }
  },

  setup(props) {
    // ============================================================
    //  4.1. ЯЗЫК И ПЕРЕВОДЫ
    // ============================================================
    const lang = inject('lang', 'ru')
    const translate = (category, key) => getTranslate(lang.value, category, key)

    // ============================================================
    //  4.2. ДАННЫЕ (FRONTMATTER)
    // ============================================================
    const { frontmatter } = useData()
    
    // ============================================================
    //  4.3. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    /**
     * Безопасное получение frontmatter
     */
    const fm = computed(() => {
      if (!frontmatter) return {}
      const data = frontmatter.value || frontmatter || {}
      return data
    })

    const human = computed(() => {
      const data = fm.value || {}
      const currentLang = lang.value
      
      return {
        uuid: data.uuid || '',
        nameDisplay: data.title || '',
        descriptionDisplay: data.description || '',
        directionDisplay: getDirection(currentLang, data.direction),
        experienceDisplay: getExperience(currentLang, data.experience),
        image: processImage(data.image, props.humanType, data.uuid || ''),
      }
    })

    // ============================================================
    //  4.4. РАНДОМНЫЕ ЦВЕТА
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
    //  4.5. ВОЗВРАТ
    // ============================================================
    return {
      // Данные
      human,
      
      // Язык
      lang,
      translate,
      
      // Методы
      getRandomHumanClass,
      
      // Константы
      baseUrl,
    }
  },
}
</script>