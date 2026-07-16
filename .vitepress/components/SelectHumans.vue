<template>
  <div v-if="selectHumans && selectHumans.length > 0" class="grid-list">
    <div v-if="!isMobile" class="grid-cards">
      <a v-for="human in selectHumans" :key="human.uuid" :href="`${baseUrl}${lang}/humans/${humanType}/${human.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
        <div class="grid-meta">
          <span v-if="human.directionDisplay" class="tag direction-tag">{{ human.directionDisplay }}</span>
          <span v-if="human.experienceDisplay" class="tag experience-tag">{{ human.experienceDisplay }}</span>
        </div>
        <img :src="human.image" loading="lazy" />
        <div :class="['grid-card-body', getRandomVolunteerClass(human.uuid)]">
          <div class="name">{{ human.nameDisplay }}</div>
          <p>{{ human.descriptionDisplay }}</p>
        </div>
      </a>
    </div>
    <div v-else class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" @click="prevSlide" :disabled="currentIndex === 0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>      
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(human, index) in selectHumans" :key="human.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}${lang}/humans/${humanType}/${human.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
              <div class="grid-meta">
                <span v-if="human.directionDisplay" class="tag direction-tag">{{ human.directionDisplay }}</span>
                <span v-if="human.experienceDisplay" class="tag experience-tag">{{ human.experienceDisplay }}</span>
              </div>
              <img :src="human.image" loading="lazy" />
              <div :class="['grid-card-body', getRandomVolunteerClass(human.uuid)]">
                <div class="name">{{ human.nameDisplay }}</div>
                <p>{{ human.descriptionDisplay }}</p>
              </div>
            </a>
          </div>
        </div>
        <button class="carousel-btn next" @click="nextSlide" :disabled="currentIndex >= (selectHumans ? selectHumans.length - 1 : 0)">
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
import { computed, ref, onMounted, onUnmounted, nextTick, inject } from 'vue'
import { getTranslate, getDirection, getExperience } from '../composables/i18n'

// ============================================================
//  2. КОНСТАНТЫ
// ============================================================
const MOBILE_BREAKPOINT = 735
const baseUrl = import.meta.env.BASE_URL
const perPage = 0
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
  name: 'SelectHumans',

  props: {
    humanUUIDs: {
      type: Array,
      default: () => [],
    },
    humanType: {
      type: String,
      required: true,
      default: 'volunteers'
    }
  },

  setup(props) {
    // ============================================================
    //  4.1. ЯЗЫК И ПЕРЕВОДЫ
    // ============================================================
    const lang = inject('lang', 'ru')
    const translate = (category, key) => getTranslate(lang.value, category, key)

    // ============================================================
    //  4.2. СОСТОЯНИЕ
    // ============================================================
    const allHumans = ref([])
    const isLoading = ref(true)
    const isMobile = ref(false)

    // Карусель
    const carouselRef = ref(null)
    const currentIndex = ref(0)

    // Свайп
    const touchStartX = ref(0)
    const touchStartY = ref(0)
    const touchEndX = ref(0)
    const touchEndY = ref(0)
    const isSwiping = ref(false)

    // ============================================================
    //  4.3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================================

    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
        if (isMobile.value !== newIsMobile) {
          isMobile.value = newIsMobile
        }
      }
    }

    // ============================================================
    //  4.4. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const selectHumans = computed(() => {
      if (isLoading.value) return []
      if (!allHumans.value || allHumans.value.length === 0) return []
      if (!props.humanUUIDs || props.humanUUIDs.length === 0) return []

      return allHumans.value.filter(v =>
        v.uuid && props.humanUUIDs.includes(v.uuid)
      )
    })

    // ============================================================
    //  4.5. МЕТОДЫ
    // ============================================================

    // --- Рандомные цвета ---
    let previousColor = 0
    const getRandomVolunteerClass = (uuid) => {
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

    // --- Карусель ---
    const scrollToSlide = (index) => {
      if (!carouselRef.value || !selectHumans.value || selectHumans.value.length === 0) return
      const container = carouselRef.value
      const slides = container.querySelectorAll('.carousel-slide')
      if (!slides.length || index < 0 || index >= slides.length) return

      const slide = slides[index]
      const containerWidth = container.offsetWidth
      const slideWidth = slide.offsetWidth
      const scrollPosition = slide.offsetLeft - (containerWidth - slideWidth) / 2

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      })

      currentIndex.value = index
    }

    const nextSlide = () => {
      if (!selectHumans.value || selectHumans.value.length === 0) return
      if (currentIndex.value < selectHumans.value.length - 1) {
        scrollToSlide(currentIndex.value + 1)
      }
    }

    const prevSlide = () => {
      if (currentIndex.value > 0) {
        scrollToSlide(currentIndex.value - 1)
      }
    }

    const goToSlide = (index) => {
      scrollToSlide(index)
    }

    // --- Обработчики свайпа ---
    const handleTouchStart = (e) => {
      const touch = e.touches[0]
      touchStartX.value = touch.clientX
      touchStartY.value = touch.clientY
      isSwiping.value = true
    }

    const handleTouchMove = (e) => {
      if (!isSwiping.value) return
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartX.value
      const deltaY = touch.clientY - touchStartY.value
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        isSwiping.value = false
        return
      }
      e.preventDefault()
    }

    const handleTouchEnd = (e) => {
      if (!isSwiping.value) return
      isSwiping.value = false
      const touch = e.changedTouches[0]
      touchEndX.value = touch.clientX
      touchEndY.value = touch.clientY
      const diffX = touchStartX.value - touchEndX.value
      const minSwipeDistance = 50
      if (diffX > minSwipeDistance) {
        nextSlide()
      } else if (diffX < -minSwipeDistance) {
        prevSlide()
      }
      touchStartX.value = 0
      touchStartY.value = 0
      touchEndX.value = 0
      touchEndY.value = 0
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
        checkMobile()
        resizeTimeout = null
      }, 100)
    }

    // ============================================================
    //  4.7. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(async () => {
      checkMobile()

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }

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
              uuid: uuid,
              nameDisplay: fm.title || '',
              descriptionDisplay: fm.description || '',
              experienceDisplay: getExperience(lang.value, fm.experience),
              directionDisplay: getDirection(lang.value, fm.direction),
              image: processImage(fm.image, props.humanType, uuid),
            }
          })
        )

        allHumans.value = loaded
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
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
      
      // Свайп
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,
      
      // Прочее
      humanType: props.humanType,
      getRandomVolunteerClass,
      baseUrl,
    }
  },
}
</script>