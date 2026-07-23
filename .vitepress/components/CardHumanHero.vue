<template>
  <div class="aspect-card hero-card">
    <div class="hero-meta">
      <label v-if="human.directionDisplay" class="tag direction-tag">{{ human.directionDisplay }}</label>
      <label v-if="human.experienceDisplay" class="tag experience-tag">{{ human.experienceDisplay }}</label>
    </div>
    <img :src="human.imageHorizontal" class="hero-image" loading="lazy" />
    <div :class="['hero-overlay', useRandomClass(human.uuid)]">
      <h1 class="title">{{ human.nameDisplay }}</h1>
      <p class="description">{{ human.descriptionDisplay }}</p>
    </div>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'
import { useFavorites } from '../utils/useFavorites'
import { useRandomColor } from '../utils/useRandomColor'
import { useTranslate, useDirection, useExperience } from '../utils/useTranslate'
import { useUrlMedia } from '../utils/useUrlMedia'

// ============================================================
//  2. КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL

// ============================================================
//  3. КОМПОНЕНТ
// ============================================================
export default {
  name: 'CardHumanHero',

  props: {
    type: {
      type: String,
      required: false,
      default: 'volunteers'
    }
  },

  setup(props) {
    // ============================================================
    //  3.1. ЯЗЫК И ПЕРЕВОДЫ
    // ============================================================
    const lang = inject('lang', 'ru')
    const translate = (category, key) => useTranslate(lang.value, category, key)

    // ============================================================
    //  3.2. ДАННЫЕ (FRONTMATTER)
    // ============================================================
    const { frontmatter } = useData()
    
    // ============================================================
    //  3.3. COMPOSABLES
    // ============================================================
    const { useRandomClass } = useRandomColor()
    const { isFavorite, toggleFavorite, checkIsFavorite } = useFavorites()

    // ============================================================
    //  3.3. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
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

      const images = data.image || []
      const imageHorizontal = getImageFromArray(images, 'horizontal')

      const filter = data.filter || []
      const direction = getFilterValue(filter, 'direction')
      const experience = getFilterValue(filter, 'experience')
      
      return {
        uuid,
        nameDisplay: data.title || '',
        descriptionDisplay: data.description || '',
        directionDisplay: direction ? useDirection(lang.value, direction) : '',
        experienceDisplay: experience ? useExperience(lang.value, experience) : '',
        imageHorizontal: useUrlMedia(imageHorizontal, 'image'),
        type: props.type,
      }
    })

    // ============================================================
    //  3.4. ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ
    // ============================================================

    /**
     * Извлекает значение из массива filter по ключу
     */
    const getFilterValue = (filter, key) => {
      if (!filter || !Array.isArray(filter)) return ''
      const found = filter.find(f => f[key] !== undefined)
      return found ? found[key] : ''
    }

    /**
     * Извлекает изображение из массива image по типу
     */
    const getImageFromArray = (images, type) => {
      if (!images || !Array.isArray(images)) return ''
      const found = images.find(img => img[type])
      return found ? found[type] : ''
    }

    // ============================================================
    //  3.5. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(() => {
      nextTick(() => {
        if (human.value.uuid) {
          isFavorite.value = checkIsFavorite(human.value.uuid)
        }
      })
    })

    // ============================================================
    //  3.6. WATCHERS
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
    //  3.7. ВОЗВРАТ
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