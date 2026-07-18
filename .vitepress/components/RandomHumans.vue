<template>
  <div v-if="randomHumans.length > 0" class="carousel-cards">
    <div class="carousel-wrapper">
      <button class="carousel-btn prev" @click="prevSlide" :disabled="currentIndex === 0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <div v-for="(human, index) in randomHumans" :key="human.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
          <a :href="`${baseUrl}${lang}/humans/${human.humanType}/${human.uuid}`" class="aspect-list grid-card">
            <div class="grid-meta">
              <span v-if="human.directionDisplay" class="tag direction-tag">{{ human.directionDisplay }}</span>
              <span v-if="human.experienceDisplay" class="tag experience-tag">{{ human.experienceDisplay }}</span>
            </div>
            <img :src="human.image" loading="lazy" />
            <div :class="['grid-card-body', useRandomClass(human.uuid)]">
              <div class="name">{{ human.nameDisplay }}</div>
              <p>{{ human.descriptionDisplay }}</p>
            </div>
          </a>
        </div>
        <div class="carousel-slide load-more-slide" :class="{ center: currentIndex === randomHumans.length }">
          <div class="load-more" @click="goToLink">
            <div class="load-more-content">
              <div class="load-more-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </div>
              <span class="load-more-text">{{ translate('ui', 'Перейти в раздел') }}</span>
            </div>
          </div>
        </div>
      </div>
      <button class="carousel-btn next" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  </div>
  <div v-else-if="randomHumans && randomHumans.length === 0" class="no-results">
    <p>{{ translate('ui', 'Нет результатов') }}</p>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { ref, computed, onMounted, watch, onUnmounted, inject } from 'vue'
import { useRandomColor } from '../composables/useRandomColor'
import { useScroll } from '../composables/useScroll'
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

/**
 * Перемешивание массива (алгоритм Фишера-Йетса)
 */
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ============================================================
//  4. КОМПОНЕНТ
// ============================================================
export default {
  name: 'RandomHumans',

  props: {
    humanType: {
      type: String,
      default: 'all',
    },
    count: {
      type: Number,
      default: 8,
    }
  },

  setup(props) {
    // ============================================================
    //  4.1. ЯЗЫК И ПЕРЕВОДЫ
    // ============================================================
    const lang = inject('lang', 'ru')
    const translate = (category, key) => useTranslate(lang.value, category, key)

    // ============================================================
    //  4.2. СОСТОЯНИЕ
    // ============================================================
    const randomHumans = ref([])
    const isLoading = ref(true)

    // ============================================================
    //  4.3. ВЫЧИСЛЯЕМЫЕ
    // ============================================================

    const linkUrl = computed(() => {
      const langPath = lang.value || 'ru'
      return `${baseUrl}${langPath}/humans/${props.humanType}`
    })

    // ============================================================
    //  4.4. ПОДКЛЮЧЕНИЕ КОМПОЗАБЛОВ
    // ============================================================

    // --- Рандомные цвета ---
    const { useRandomClass } = useRandomColor()

    // --- Дополнительный слайд "Перейти в раздел" ---
    const hasMoreItems = ref(true)

    // --- Скролл и карусель ---
    const carouselRef = ref(null)
    const {
      currentIndex,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    } = useScroll({
      containerRef: carouselRef,
      items: randomHumans,
      hasMoreItems: hasMoreItems,
    })

    const carouselTotalSlides = computed(() => {
      return randomHumans.value.length + 1
    })

    // ============================================================
    //  4.5. МЕТОДЫ
    // ============================================================

    // --- Переход на страницу всех волонтёров ---
    const goToLink = () => {
      window.location.href = linkUrl.value
    }

    // ============================================================
    //  4.6. RESIZE
    // ============================================================
    let resizeTimeout = null

    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        resizeTimeout = null
      }, 100)
    }

    // ============================================================
    //  4.7. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(async () => {
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
          return path.includes(`/${lang.value}/humans/${props.humanType}/`) && !path.endsWith(`${props.humanType}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/${lang.value}/humans/${props.humanType}/`, '').replace('.md', '')

            return {
              uuid,
              nameDisplay: fm.title || '',
              descriptionDisplay: fm.description || '',
              directionDisplay: useDirection(lang.value, fm.direction),
              experienceDisplay: useExperience(lang.value, fm.experience),
              image: processImage(fm.image, props.humanType, uuid),
              humanType: props.humanType,
            }
          })
        )

        // Перемешиваем и берём нужное количество
        const shuffled = shuffleArray(loaded)
        randomHumans.value = shuffled.slice(0, props.count)

        // Сбрасываем индекс после загрузки
        currentIndex.value = 0
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
      }
    })

    // --- Следим за изменением языка ---
    watch(lang, async () => {
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
          return path.includes(`/${lang.value}/humans/${props.humanType}/`) && !path.endsWith(`${props.humanType}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/${lang.value}/humans/${props.humanType}/`, '').replace('.md', '')

            return {
              uuid,
              nameDisplay: fm.title || '',
              descriptionDisplay: fm.description || '',
              directionDisplay: useDirection(lang.value, fm.direction),
              experienceDisplay: useExperience(lang.value, fm.experience),
              image: processImage(fm.image, props.humanType, uuid),
              humanType: props.humanType,
            }
          })
        )

        const shuffled = shuffleArray(loaded)
        randomHumans.value = shuffled.slice(0, props.count)
        currentIndex.value = 0
      } catch (error) {
        console.error('Ошибка загрузки данных при смене языка:', error)
      }
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
    //  4.8. ВОЗВРАТ
    // ============================================================
    return {
      // Данные
      randomHumans,
      
      // Язык
      lang,
      translate,

      // Состояние
      isLoading,
      
      // Карусель
      carouselRef,
      currentIndex,
      carouselTotalSlides,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      
      // Свайп
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      
      // Прочее
      baseUrl,
      linkUrl,
      goToLink,
      useRandomClass,
    }
  },
}
</script>