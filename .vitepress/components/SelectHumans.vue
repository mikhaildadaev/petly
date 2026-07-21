<template>
  <div v-if="selectHumans && selectHumans.length > 0" class="grid-list">
    <div v-if="!isMobile" class="cards-grid">
      <a v-for="human in selectHumans" :key="human.uuid" :href="`${baseUrl}${lang}/humans/${human.type}/${human.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list card">
        <div class="meta">
          <label v-if="human.directionDisplay" class="tag direction-tag">{{ human.directionDisplay }}</label>
          <label v-if="human.experienceDisplay" class="tag experience-tag">{{ human.experienceDisplay }}</label>
        </div>
        <img :src="human.image" loading="lazy" />
        <div :class="['content', useRandomClass(human.uuid)]">
          <h1 class="title">{{ human.nameDisplay }}</h1>
          <p class="description">{{ human.descriptionDisplay }}</p>
        </div>
      </a>
    </div>
    <div v-else class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel prev" @click="prevSlide" :disabled="currentIndex === 0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>      
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(human, index) in selectHumans" :key="human.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}${lang}/humans/${human.type}/${human.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list card">
              <div class="meta">
                <label v-if="human.directionDisplay" class="tag direction-tag">{{ human.directionDisplay }}</label>
                <label v-if="human.experienceDisplay" class="tag experience-tag">{{ human.experienceDisplay }}</label>
              </div>
              <img :src="human.image" loading="lazy" />
              <div :class="['content', useRandomClass(human.uuid)]">
                <h1 class="title">{{ human.nameDisplay }}</h1>
                <p class="description">{{ human.descriptionDisplay }}</p>
              </div>
            </a>
          </div>
        </div>
        <button class="carousel next" @click="nextSlide" :disabled="currentIndex >= (selectHumans ? selectHumans.length - 1 : 0)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
  <div v-else-if="selectHumans && selectHumans.length === 0" class="no-results">
    <p>{{ translate('ui', 'Нет назначенных волонтеров') }}</p>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, onUnmounted, nextTick, inject, watch } from 'vue'
import { useRandomColor } from '../utils/useRandomColor'
import { useScrollCarusel } from '../utils/useScrollCarusel'
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
  name: 'SelectHumans',

  props: {
    uuids: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      required: true,
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
    //  3.2. СОСТОЯНИЕ
    // ============================================================
    const allHumans = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)

    // ============================================================
    //  3.3. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const selectHumans = computed(() => {
      if (isLoading.value) return []
      if (!allHumans.value || allHumans.value.length === 0) return []
      if (!props.uuids || props.uuids.length === 0) return []

      return allHumans.value.filter(v =>
        v.uuid && props.uuids.includes(v.uuid)
      )
    })

    // ============================================================
    //  3.3. ПОДКЛЮЧЕНИЕ КОМПОЗАБЛОВ
    // ============================================================

    // --- Рандомные цвета ---
    const { useRandomClass } = useRandomColor()

    // --- Скролл и карусель ---
    const carouselRef = ref(null)
    const {
      isMobile,
      currentIndex,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      resetToFirstSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,
    } = useScrollCarusel({
      containerRef: carouselRef,
      items: selectHumans,
    })

    // ============================================================
    //  3.5. RESIZE
    // ============================================================
    let resizeTimeout = null

    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        // checkMobile уже есть в useScrollCarusel
        resizeTimeout = null
      }, 100)
    }

    // ============================================================
    //  3.6. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    // --- Загрузка данных ---
    const loadData = async () => {
      try {
        let modules
        switch (lang.value) {
          case 'en':
            modules = import.meta.glob('/en/humans/*/*.md')
            break
          case 'de':
            modules = import.meta.glob('/de/humans/*/*.md')
            break
          default:
            modules = import.meta.glob('/ru/humans/*/*.md')
        }
        const filteredModules = Object.entries(modules).filter(([path]) => {
          return path.includes(`/${lang.value}/humans/${props.type}/`) && !path.endsWith(`${props.type}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/${lang.value}/humans/${props.type}/`, '').replace('.md', '')

            return {
              uuid: uuid,
              nameDisplay: fm.title || '',
              descriptionDisplay: fm.description || '',
              experienceDisplay: useExperience(lang.value, fm.experience),
              directionDisplay: useDirection(lang.value, fm.direction),
              image: useUrlMedia(fm.image, 'image'),
              type: props.type,
            }
          })
        )

        allHumans.value = loaded
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      }
    }

    // --- Монтирование ---
    onMounted(async () => {
      isClient.value = true

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }

      isLoading.value = true
      await loadData()
      isLoading.value = false
    })

    // --- Следим за изменением языка ---
    watch(lang, async () => {
      isLoading.value = true
      await loadData()
      resetToFirstSlide()
      isLoading.value = false
    })

    // --- Unmount ---
    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
      }
    })

    // ============================================================
    //  3.7. ВОЗВРАТ
    // ============================================================
    return {
      // Данные
      selectHumans,
      
      // Язык
      lang,
      translate,
      
      // Состояние
      isLoading,
      isMobile,
      
      // Карусель
      carouselRef,
      currentIndex,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      resetToFirstSlide,
      
      // Свайп
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,
      
      // Прочее
      useRandomClass,
      baseUrl,
    }
  },
}
</script>