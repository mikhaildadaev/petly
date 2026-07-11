<template>
  <div v-if="humans && humans.length > 0" class="grid-list">
    <div v-if="!isMobile" class="grid-cards">
      <a v-for="humans in humans" :key="humans.uuid" :href="`${baseUrl}ru/${humanType}/${humans.slug}`" class="aspect-list grid-card">
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
            <a :href="`${baseUrl}ru/${humanType}/${humans.slug}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
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
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'

const MOBILE_BREAKPOINT = 736
const baseUrl = import.meta.env.BASE_URL
const perPage = 0

// === ГЛОБАЛЬНЫЙ КЭШ ДЛЯ ЦВЕТОВ ===
const randomClassCache = new Map()

export default {
  props: {
    humanUUIDs: {
      type: Array,
      default: () => []
    },
    humanType: {
      type: String,
      required: true,
      default: 'volunteers'
    }
  },
  setup(props) {
    // Все переменные ОБЪЯВЛЯЕМ ВНУТРИ setup()
    const allHumans = ref([])
    const isLoading = ref(true)
    const isMobile = ref(false)

    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
        if (isMobile.value !== newIsMobile) {
          isMobile.value = newIsMobile
        }
      }
    }

    // === РАНДОМНЫЕ ЦВЕТА ===
    const getRandomVolunteerClass = (uuid) => {
      if (!uuid) {
        console.warn('UUID отсутствует!')
        return 'rand-01'
      }
      
      if (randomClassCache.has(uuid)) {
        return randomClassCache.get(uuid)
      }
      
      const num = Math.floor(Math.random() * 30) + 1
      const formattedNum = num.toString().padStart(2, '0')
      const className = `rand-${formattedNum}`
      
      randomClassCache.set(uuid, className)
      return className
    }

    // === КАРУСЕЛЬ ===
    const carouselRef = ref(null)
    const currentIndex = ref(0)

    // === ФИЛЬТРАЦИЯ ===
    const humans = computed(() => {
      if (isLoading.value) return []
      if (!allHumans.value || allHumans.value.length === 0) return []
      if (!props.humanUUIDs || props.humanUUIDs.length === 0) return []
      
      return allHumans.value.filter(v => 
        v.uuid && props.humanUUIDs.includes(v.uuid)
      )
    })

    // === ЗАГРУЗКА ДАННЫХ ===
    onMounted(async () => {
      checkMobile()
      
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      
      try {
        const modules = import.meta.glob('/ru/*/*.md')
        
        // Фильтруем по humanType
        const filteredModules = Object.entries(modules).filter(([path]) => {
          return path.includes(`/ru/${props.humanType}/`) && !path.endsWith(`${props.humanType}_index.md`)
        })
        
        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const slug = path.replace(`/ru/${props.humanType}/`, '').replace('.md', '')
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            
            return {
              slug,
              uuid: fm.uuid || slug,
              name: fm.title || slug.charAt(0).toUpperCase() + slug.slice(1),
              description: fm.description || '',
              experience: fm.experience || '',
              direction: fm.direction || '',
              image: fm.image || `/placeholder-${props.humanType}.svg`
            }
          })
        )
        allHumans.value = loaded
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
      }

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
    })

    // === ЛОГИКА КАРУСЕЛИ ===
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

    // === ОБРАБОТЧИКИ СОБЫТИЙ СВАЙПА ===
    const touchStartX = ref(0);
    const touchStartY = ref(0);
    const touchEndX = ref(0);
    const touchEndY = ref(0);
    const isSwiping = ref(false);

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartX.value = touch.clientX;
      touchStartY.value = touch.clientY;
      isSwiping.value = true;
    };

    const handleTouchMove = (e) => {
      if (!isSwiping.value) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.value;
      const deltaY = touch.clientY - touchStartY.value;
      
      // Если вертикальное движение больше - прокручиваем страницу
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        isSwiping.value = false;
        return;
      }
      
      e.preventDefault();
    };

    const handleTouchEnd = (e) => {
      if (!isSwiping.value) return;
      isSwiping.value = false;

      const touch = e.changedTouches[0];
      touchEndX.value = touch.clientX;
      touchEndY.value = touch.clientY;
      
      const diffX = touchStartX.value - touchEndX.value;
      const minSwipeDistance = 50;

      if (diffX > minSwipeDistance) {
        nextSlide();
      } else if (diffX < -minSwipeDistance) {
        prevSlide();
      }

      touchStartX.value = 0;
      touchStartY.value = 0;
      touchEndX.value = 0;
      touchEndY.value = 0;
    };

    // === RESIZE ===
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

    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
      }
    })

    // === ВОЗВРАЩАЕМ ВСЕ НУЖНЫЕ ПЕРЕМЕННЫЕ ===
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
      humanType: props.humanType,
      getRandomVolunteerClass,
      baseUrl,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,
    }
  }
}
</script>