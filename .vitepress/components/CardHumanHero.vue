<template>
  <div class="aspect-card hero-card">
    <div class="hero-meta">
      <span v-if="human.directionDisplay" class="tag direction-tag">{{ human.directionDisplay }}</span>
      <span v-if="human.experienceDisplay" class="tag experience-tag">{{ human.experienceDisplay }}</span>
    </div>
    <img :src="human.image" class="hero-image" loading="lazy" />
    <div :class="['hero-overlay', useRandomClass(human.uuid)]">
      <div class="name">{{ human.nameDisplay }}</div>
      <p>{{ human.descriptionDisplay }}</p>
    </div>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, watch, nextTick, inject } from 'vue'
import { useData } from 'vitepress'
import { useFavorites } from '../composables/useFavorites'
import { useRandomColor } from '../composables/useRandomColor'
import { useTranslate, useDirection, useExperience } from '../composables/useTranslate'

// ============================================================
//  2. КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL

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
      description: 'Тип человека (volunteers, staff, и т.д.)'
    }
  },

  setup(props) {
    // ============================================================
    //  4.1. ЯЗЫК И ПЕРЕВОДЫ
    // ============================================================
    const lang = inject('lang', 'ru')
    const translate = (category, key) => useTranslate(lang.value, category, key)

    // ============================================================
    //  4.2. ДАННЫЕ (FRONTMATTER)
    // ============================================================
    const { frontmatter } = useData()
    
    // ============================================================
    //  4.3. COMPOSABLES
    // ============================================================
    const { useRandomClass } = useRandomColor()
    const { isFavorite, toggleFavorite, checkIsFavorite } = useFavorites()

    // ============================================================
    //  4.4. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    /**
     * Безопасное получение frontmatter
     */
    const fm = computed(() => {
      if (!frontmatter) return {}
      const data = frontmatter.value || frontmatter || {}
      return data
    })

    /**
     * Данные человека с переводами
     */
    const human = computed(() => {
      const data = fm.value || {}
      const uuid = data.uuid || ''
      
      return {
        uuid,
        nameDisplay: data.title || '',
        descriptionDisplay: data.description || '',
        directionDisplay: data.direction ? useDirection(lang.value, data.direction) : '',
        experienceDisplay: data.experience ? useExperience(lang.value, data.experience) : '',
        image: processImage(data.image, props.humanType, uuid),
      }
    })

    // ============================================================
    //  4.5. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(() => {
      nextTick(() => {
        if (human.value.uuid) {
          isFavorite.value = checkIsFavorite(human.value.uuid)
        }
      })
    })

    // ============================================================
    //  4.6. WATCHERS
    // ============================================================

    watch(() => human.value.uuid, (newUuid) => {
      if (newUuid) {
        setTimeout(() => {
          isFavorite.value = checkIsFavorite(newUuid)
        }, 50)
      }
    }, { immediate: true })

    watch(fm, (newFm) => {
      if (newFm?.uuid) {
        isFavorite.value = checkIsFavorite(newFm.uuid)
      }
    }, { deep: true })

    // ============================================================
    //  4.7. ВОЗВРАТ
    // ============================================================
    return {
      // Данные
      human,
      
      // Состояние
      isFavorite,
      
      // Методы
      useRandomClass,
      toggleFavorite,
      translate,
      
      // Константы
      baseUrl,
    }
  },
}
</script>