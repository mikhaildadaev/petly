<template>
  <div class="aspect-card hero-card">
    <div class="hero-meta">
      <label v-if="organization.formatDisplay" class="tag format-tag">{{ organization.formatDisplay }}</label>
    </div>
    <img :src="organization.image" class="hero-image" loading="lazy" />
    <div :class="['hero-overlay', useRandomClass(organization.uuid)]">
      <div class="name">{{ organization.nameDisplay }}</div>
      <p>{{ organization.descriptionDisplay }}</p>
    </div>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, watch, nextTick, inject } from 'vue'
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
  name: 'CardOrganizationHero',

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
    const organization = computed(() => {
      const data = fm.value || {}
      const uuid = data.uuid || ''
      
      return {
        uuid,
        nameDisplay: data.title || '',
        descriptionDisplay: data.description || '',
        formatDisplay: data.format ? useTranslate(lang.value, 'format', data.format) : '',
        image: useUrlMedia(data.image, props.type, uuid, 'image'),
        type: props.type,
      }
    })

    // ============================================================
    //  3.5. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(() => {
      nextTick(() => {
        if (organization.value.uuid) {
          isFavorite.value = checkIsFavorite(organization.value.uuid)
        }
      })
    })

    // ============================================================
    //  3.6. WATCHERS
    // ============================================================

    watch(() => organization.value.uuid, (newUuid) => {
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
      organization,
      
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