<template>
  <div class="aspect-card hero-card">
    <div class="hero-meta">
      <span v-if="pet.genderDisplay" class="tag gender-tag" :data-gender="pet.gender">{{ pet.genderDisplay }}</span>
      <span v-if="pet.ageDisplay" class="tag age-tag">{{ pet.ageDisplay }}</span>
      <span v-if="pet.sizeDisplay" class="tag size-tag">{{ pet.sizeDisplay }}</span>
    </div>
    <img :src="pet.image" class="hero-image" loading="lazy" />
    <div :class="['hero-overlay', useRandomClass(pet.uuid)]">
      <div class="name">{{ pet.nameDisplay }}</div>
      <button v-if="pet.uuid" class="favorite-btn" :class="{ 'is-favorite': isFavorite }" @click.stop="toggleFavorite(pet.uuid)" :title="translate('ui', 'Добавить в избранное')">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 3.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <p>{{ pet.descriptionDisplay }}</p>
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
import { useTranslate, useAge, useAgePetCategory } from '../utils/useTranslate'
import { useUrlMedia } from '../utils/useUrlMedia'

// ============================================================
//  2. КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL

// ============================================================
//  3. КОМПОНЕНТ
// ============================================================
export default {
  name: 'CardPetHero',

  props: {
    type: {
      type: String,
      required: false,
      default: 'dogs'
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
     * Данные питомца с переводами
     */
    const pet = computed(() => {
      const data = fm.value || {}
      const uuid = data.uuid || ''
      
      return {
        uuid,
        nameDisplay: data.title || '',
        descriptionDisplay: data.description || '',
        gender: data.gender || '',
        genderDisplay: data.gender ? useTranslate(lang.value, 'gender', data.gender) : '',
        age: data.age ? useAgePetCategory(data.age) : '',
        ageDisplay: data.age ? useAge(lang.value, data.age) : '',
        size: data.size || '',
        sizeDisplay: data.size ? useTranslate(lang.value, 'size', data.size) : '',
        image: useUrlMedia(data.image, props.type, uuid, 'image'),
        type: props.type,
      }
    })

    // ============================================================
    //  3.5. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(() => {
      nextTick(() => {
        if (pet.value.uuid) {
          isFavorite.value = checkIsFavorite(pet.value.uuid)
        }
      })
    })

    // ============================================================
    //  3.6. WATCHERS
    // ============================================================

    watch(() => pet.value.uuid, (newUuid) => {
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
      pet,
      
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