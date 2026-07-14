<template>
  <div v-if="humans && humans.length > 0" class="grid-list">
    <div v-if="!isMobile" class="grid-cards">
      <a v-for="humans in humans" :key="humans.uuid" :href="`${baseUrl}ru/${humanType}/${humans.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
        <div class="grid-meta">
          <span v-if="humans.direction" class="tag direction-tag">{{ humans.direction }}</span>
          <span v-if="humans.experience" class="tag experience-tag">{{ humans.experience }}</span>
        </div>
        <img :src="humans.image" :alt="humans.name" loading="lazy" />
        <div :class="['grid-card-body', getRandomVolunteerClass(humans.uuid)]">
          <div class="name">{{ humans.name }}</div>
          <p>{{ humans.description }}</p>
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
          <div v-for="(humans, index) in humans" :key="humans.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}ru/${humanType}/${humans.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
              <div class="grid-meta">
                <span v-if="humans.direction" class="tag direction-tag">{{ humans.direction }}</span>
                <span v-if="humans.experience" class="tag experience-tag">{{ humans.experience }}</span>
              </div>
              <img :src="humans.image" :alt="humans.name" loading="lazy" />
              <div :class="['grid-card-body', getRandomVolunteerClass(humans.uuid)]">
                <div class="name">{{ humans.name }}</div>
                <p>{{ humans.description }}</p>
              </div>
            </a>
          </div>
        </div>
        <button class="carousel-btn next" @click="nextSlide" :disabled="currentIndex >= (humans ? humans.length - 1 : 0)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
  <div v-else-if="humans && humans.length === 0" class="no-humans">
    <p>Нет назначенных опекунов</p>
  </div>
</template>

<script>
// ============================================================
//  ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'

// ============================================================
//  КОНСТАНТЫ
// ============================================================
const MOBILE_BREAKPOINT = 736
const baseUrl = import.meta.env.BASE_URL
const perPage = 0
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
 * Определение категории опыта
 */
const getExperienceCategory = (expValue) => {
  if (!expValue) return 'Нет опыта'
  if (expValue.includes('лет') || expValue.includes('год')) {
    const match = expValue.match(/(\d+)/)
    if (match) {
      const num = parseInt(match[1])
      if (num <= 1) return 'Начинающий'
      if (num <= 3) return 'Опытный'
      return 'Эксперт'
    }
  }
  if (expValue.includes('месяц')) {
    const match = expValue.match(/(\d+)/)
    if (match) {
      const num = parseInt(match[1])
      return num < 12 ? 'Начинающий' : 'Опытный'
    }
  }
  const lower = expValue.toLowerCase()
  if (lower.includes('начин')) return 'Начинающий'
  if (lower.includes('опыт')) return 'Опытный'
  if (lower.includes('эксперт')) return 'Эксперт'

  return expValue || 'Нет опыта'
}

// ============================================================
//  КОМПОНЕНТ
// ============================================================
export default {
  name: 'ListGuardians',

  props: {
    humanUUIDs: {
      type: Array,
      default: () => [],
      description: 'Массив UUID людей для отображения'
    },
    humanType: {
      type: String,
      required: true,
      default: 'volunteers',
      description: 'Тип людей (volunteers, staff, и т.д.)'
    }
  },

  setup(props) {
    // ============================================================
    //  СОСТОЯНИЕ
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
    //  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
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
    //  ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const humans = computed(() => {
      if (isLoading.value) return []
      if (!allHumans.value || allHumans.value.length === 0) return []
      if (!props.humanUUIDs || props.humanUUIDs.length === 0) return []

      return allHumans.value.filter(v =>
        v.uuid && props.humanUUIDs.includes(v.uuid)
      )
    })

    // ============================================================
    //  МЕТОДЫ
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
      if (!carouselRef.value || !humans.value || humans.value.length === 0) return
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
      if (!humans.value || humans.value.length === 0) return
      if (currentIndex.value < humans.value.length - 1) {
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
    //  RESIZE
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
    //  ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(async () => {
      checkMobile()

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }

      try {
        const modules = import.meta.glob('/ru/*/*.md')

        const filteredModules = Object.entries(modules).filter(([path]) => {
          return path.includes(`/ru/${props.humanType}/`) && !path.endsWith(`${props.humanType}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/ru/${props.humanType}/`, '').replace('.md', '')

            return {
              uuid: uuid,
              name: fm.title || '',
              description: fm.description || '',
              experience: getExperienceCategory(fm.experience),
              direction: fm.direction || '',
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
    //  ВОЗВРАТ
    // ============================================================
    return {
      humans,
      isLoading,
      isMobile,
      carouselRef,
      currentIndex,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,
      humanType: props.humanType,
      getRandomVolunteerClass,
      baseUrl,
    }
  },
}
</script>