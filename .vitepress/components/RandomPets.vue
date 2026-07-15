<template>
  <div v-if="randomPets.length > 0" class="carousel-cards">
    <div class="carousel-wrapper">
      <button class="carousel-btn prev" @click="prevSlide" :disabled="currentIndex === 0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <div v-for="(pet, index) in randomPets" :key="pet.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
          <a :href="`${baseUrl}${pet.petType}/${pet.uuid}`" class="grid-card">
            <div class="grid-meta">
              <span v-if="pet.gender" class="tag gender-tag" :data-gender="pet.gender">{{ pet.gender }}</span>
              <span v-if="pet.age" class="tag age-tag">{{ pet.age }}</span>
              <span v-if="pet.size" class="tag size-tag">{{ pet.size }}</span>
            </div>
            <img :src="pet.image" :alt="pet.name" loading="lazy" />
            <div :class="['grid-card-body', getRandomClass(pet.uuid)]">
              <div class="name">{{ pet.name }}</div>
              <p>{{ pet.description }}</p>
            </div>
          </a>
        </div>
        <div class="carousel-slide" :class="{ center: currentIndex === randomPets.length }">
          <a :href="linkUrl" class="grid-card link-card">
            <div class="link-card-content">
              <div class="link-icon">{{ linkIcon }}</div>
              <div class="link-text">{{ linkText }}</div>
              <div class="link-arrow">→</div>
            </div>
          </a>
        </div>
      </div>
      <button class="carousel-btn next" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
// ============================================================
//  ИМПОРТЫ
// ============================================================
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ============================================================
//  КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL
const randomClassCache = new Map()
let previousColor = 0

// ============================================================
//  УТИЛИТЫ
// ============================================================

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

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const getRandomClass = (uuid) => {
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
//  КОМПОНЕНТ
// ============================================================
export default {
  name: 'RandomPets',

  props: {
    petType: {
      type: String,
      default: 'all',
      description: 'Тип питомца (dogs, cats, all)'
    },
    count: {
      type: Number,
      default: 8,
      description: 'Количество карточек'
    },
    linkUrl: {
      type: String,
      default: '/ru/pets',
      description: 'Ссылка на раздел'
    },
    linkText: {
      type: String,
      default: 'Все питомцы',
      description: 'Текст на карточке-ссылке'
    },
    linkIcon: {
      type: String,
      default: '🐾',
      description: 'Иконка на карточке-ссылке'
    }
  },

  setup(props) {
    const randomPets = ref([])
    const isLoading = ref(true)

    // Карусель
    const carouselRef = ref(null)
    const currentIndex = ref(0)

    // Свайп
    const touchStartX = ref(0)
    const touchStartY = ref(0)
    const isSwiping = ref(false)

    const carouselTotalSlides = computed(() => {
      return randomPets.value.length + 1 // +1 за карточку-ссылку
    })

    // --- Карусель ---
    const scrollToSlide = (index) => {
      if (!carouselRef.value) return
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
      if (currentIndex.value < carouselTotalSlides.value - 1) {
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

    // --- Свайп ---
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
      const deltaX = touch.clientX - touchStartX.value
      const minSwipeDistance = 50
      if (deltaX < -minSwipeDistance) {
        nextSlide()
      } else if (deltaX > minSwipeDistance) {
        prevSlide()
      }
      touchStartX.value = 0
      touchStartY.value = 0
    }

    // --- Загрузка данных ---
    onMounted(async () => {
  try {
    // 1. Загружаем модули так же, как в ListPets
    const allModules = import.meta.glob('/ru/*/*.md')
    const filteredModules = Object.entries(allModules).filter(([path]) => {
      // Фильтруем по petType, как в рабочем компоненте
      return path.includes(`/ru/${props.petType}/`) && !path.endsWith(`${props.petType}_index.md`)
    })

    const loaded = await Promise.all(
      filteredModules.map(async ([path, loader]) => {
        const mod = await loader()
        const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
        const uuid = fm.uuid || path.replace(`/ru/${props.petType}/`, '').replace('.md', '')

        return {
          uuid,
          name: fm.title || '',
          description: fm.description || '',
          gender: fm.gender || '',
          age: fm.age || '',
          size: fm.size || '',
          tags: fm.tags || [],
          image: processImage(fm.image, props.petType, uuid),
          petType: props.petType,
        }
      })
    )

    // Перемешиваем и берем нужное количество
    const shuffled = shuffleArray(loaded)
    randomPets.value = shuffled.slice(0, props.count)

    // Сбрасываем индекс после загрузки
    currentIndex.value = 0
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  } finally {
    isLoading.value = false
  }
})

    return {
      randomPets,
      isLoading,
      baseUrl,
      getRandomClass,
      carouselRef,
      currentIndex,
      carouselTotalSlides,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      linkUrl: props.linkUrl,
      linkText: props.linkText,
      linkIcon: props.linkIcon,
    }
  },
}
</script>

<style scoped>
/* ============================================================
   КАРУСЕЛЬ
   ============================================================ */

/* --- Карточка-ссылка --- */
.link-card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg-soft);
  border: 2px dashed var(--vp-c-border);
  min-height: 280px;
  text-decoration: none;
  transition: all 0.3s ease;
}
.link-card:hover {
  border-color: var(--vp-c-brand);
  transform: scale(1.02);
  background: var(--vp-c-bg);
}
.link-card-content {
  text-align: center;
  padding: 20px;
}
.link-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.link-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text);
  margin-bottom: 8px;
}
.link-arrow {
  font-size: 32px;
  color: var(--vp-c-brand);
  animation: arrowMove 1.5s ease-in-out infinite;
}

</style>