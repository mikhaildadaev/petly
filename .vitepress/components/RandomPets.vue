<template>
  <div v-if="randomPets.length > 0" class="random-pets">
    <div class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" @click="prevSlide" :disabled="currentIndex === 0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <!-- Карточки питомцев -->
          <div
            v-for="(pet, index) in randomPets"
            :key="pet.uuid"
            class="carousel-slide"
            :class="{ center: index === currentIndex }"
          >
            <a :href="`${baseUrl}${pet.petType}/${pet.slug}`" class="grid-card">
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

          <!-- Последняя карточка — "Перейти в раздел" -->
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
      
      <div class="carousel-indicators">
        <span
          v-for="(_, index) in carouselTotalSlides"
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
        />
      </div>
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
        // Извлекаем slug из пути
        const slug = path.replace(`/ru/${props.petType}/`, '').replace('.md', '')
        const uuid = fm.uuid || slug

        return {
          uuid,
          name: fm.title || slug.charAt(0).toUpperCase() + slug.slice(1),
          description: fm.description || '',
          gender: fm.gender || '',
          age: fm.age || '',
          size: fm.size || '',
          tags: fm.tags || [],
          image: processImage(fm.image, props.petType, uuid),
          petType: props.petType, // Добавляем для ссылок
          slug: slug,             // Добавляем для ссылок
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
.random-pets {
  margin: 24px 0;
}

.carousel-container {
  width: 100%;
  margin: 0;
}

.carousel-wrapper {
  margin: 0 -24px;
  width: calc(100% + 48px);
  position: relative;
  display: flex;
  align-items: center;
}

.carousel-track {
  display: flex;
  gap: 14px;
  overflow: hidden;
  padding: 14px 0;
  scrollbar-width: none;
  flex: 1;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.carousel-slide {
  flex: 0 0 calc(100% - 48px);
  scroll-snap-align: center;
  transition: all 0.5s ease;
  min-height: 280px;
}

.carousel-slide.center {
  z-index: 2;
}

.carousel-slide:not(.center) {
  opacity: 0.6;
  transform: scale(0.95);
}

.carousel-slide:first-child {
  margin-left: 24px;
}

.carousel-slide:last-child {
  margin-right: 24px;
}

/* --- Карточка питомца --- */
.grid-card {
  display: block;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: var(--vp-c-text);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 100%;
}

.grid-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.grid-meta {
  display: flex;
  gap: 6px;
  padding: 10px 16px 0;
  flex-wrap: wrap;
}

.tag {
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  background: var(--vp-c-bg);
  color: var(--vp-c-text);
}

.gender-tag[data-gender="Девочка"] {
  background: rgba(252, 228, 236, 0.95);
  color: #c62828;
}

.gender-tag[data-gender="Мальчик"] {
  background: rgba(227, 242, 253, 0.95);
  color: #0d47a1;
}

.grid-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.grid-card-body {
  padding: 12px 16px 16px;
}

.grid-card-body .name {
  font-family: var(--font-handwritten, 'Caveat', cursive);
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 4px;
}

.grid-card-body p {
  font-size: 0.85em;
  color: var(--vp-c-text-light);
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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

@keyframes arrowMove {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(8px); }
}

/* --- Кнопки карусели --- */
.carousel-btn {
  position: absolute;
  top: 0;
  width: 40px;
  height: 100%;
  cursor: pointer;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
}

.carousel-btn.prev {
  left: 0;
}

.carousel-btn.next {
  right: 0;
}

.carousel-btn svg {
  color: var(--vp-c-text);
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.carousel-btn:hover svg {
  opacity: 1;
}

.carousel-btn:disabled {
  opacity: 0.2;
  cursor: default;
}

/* --- Индикаторы --- */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-text-light);
  opacity: 0.3;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  opacity: 1;
  background: var(--vp-c-brand);
}

/* --- Рандомные цвета --- */
.rand-01 { background: rgba(239, 83, 80, 0.85); }
.rand-02 { background: rgba(236, 64, 122, 0.85); }
.rand-03 { background: rgba(171, 71, 188, 0.85); }
.rand-04 { background: rgba(126, 87, 194, 0.85); }
.rand-05 { background: rgba(92, 107, 192, 0.85); }
.rand-06 { background: rgba(66, 165, 245, 0.85); }
.rand-07 { background: rgba(38, 198, 218, 0.85); }
.rand-08 { background: rgba(38, 166, 154, 0.85); }
.rand-09 { background: rgba(102, 187, 106, 0.85); }
.rand-10 { background: rgba(212, 225, 87, 0.85); }
.rand-11 { background: rgba(255, 238, 88, 0.85); }
.rand-12 { background: rgba(255, 202, 40, 0.85); }
.rand-13 { background: rgba(255, 167, 38, 0.85); }
.rand-14 { background: rgba(255, 112, 67, 0.85); }
.rand-15 { background: rgba(141, 110, 99, 0.85); }
.rand-16 { background: rgba(189, 189, 189, 0.85); }
.rand-17 { background: rgba(120, 144, 156, 0.85); }
.rand-18 { background: rgba(26, 26, 46, 0.85); }
.rand-19 { background: rgba(22, 33, 62, 0.85); }
.rand-20 { background: rgba(45, 27, 105, 0.85); }
.rand-21 { background: rgba(245, 230, 211, 0.85); }
.rand-22 { background: rgba(232, 240, 254, 0.85); }
.rand-23 { background: rgba(255, 107, 107, 0.85); }
.rand-24 { background: rgba(112, 193, 179, 0.85); }
.rand-25 { background: rgba(179, 157, 219, 0.85); }
.rand-26 { background: rgba(255, 216, 177, 0.85); }
.rand-27 { background: rgba(135, 206, 235, 0.85); }
.rand-28 { background: rgba(255, 183, 197, 0.85); }
.rand-29 { background: rgba(255, 215, 0, 0.85); }
.rand-30 { background: rgba(205, 127, 50, 0.85); }

/* ============================================================
   АДАПТИВНОСТЬ
   ============================================================ */
@media (max-width: 768px) {
  .carousel-slide {
    flex: 0 0 80%;
  }
  
  .carousel-slide:first-child {
    margin-left: 10%;
  }
  
  .carousel-slide:last-child {
    margin-right: 10%;
  }
  
  .grid-card img {
    height: 120px;
  }
  
  .link-card {
    min-height: 220px;
  }
}

@media (max-width: 480px) {
  .carousel-slide {
    flex: 0 0 75%;
  }
  
  .carousel-slide:first-child {
    margin-left: 12.5%;
  }
  
  .carousel-slide:last-child {
    margin-right: 12.5%;
  }
  
  .grid-card img {
    height: 100px;
  }
  
  .grid-card-body {
    padding: 8px 10px 12px;
  }
  
  .grid-card-body .name {
    font-size: 1em;
  }
  
  .link-card {
    min-height: 180px;
  }
  
  .link-icon {
    font-size: 36px;
  }
  
  .link-text {
    font-size: 16px;
  }
}
</style>