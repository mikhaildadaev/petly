<template>
  <div>
    <div class="gallery-media">
      <div  v-for="(item, index) in mediaItems" :key="index"  class="gallery-item" :style="{ '--delay': index * 0.05 + 's' }" @click="openFullslider(index)">
        <img  v-if="item.type === 'image'" :src="item.src" :alt="'Медиа ' + (index + 1)" loading="lazy" />
        <div v-else class="video-preview">
          <video  :src="item.src"  muted  playsinline @mouseenter="playVideo" @mouseleave="pauseVideo" ref="videoPreviewRefs" />
        </div>
      </div>
    </div>
    <div v-if="fullsliderOpen" class="fullslider" @touchstart="handleTouchStart" @touchmove.prevent="handleTouchMove" @touchend="handleTouchEnd">
      <button class="fullslider-close" @click.stop="closeFullslider" aria-label="Закрыть">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <button v-if="mediaItems.length > 1" class="fullslider-prev" @click.stop="prevImage" aria-label="Предыдущее">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button v-if="mediaItems.length > 1" class="fullslider-next" @click.stop="nextImage" aria-label="Следующее">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <div class="fullslider-content" @click.stop>
        <img v-if="currentMedia.type === 'image'" :src="currentMedia.src" :alt="'Медиа ' + (currentIndex + 1)" />
        <video v-else :src="currentMedia.src" controls autoplay playsinline class="fullslider-video"ref="fullsliderVideoRef"/>
      </div>
      <div class="fullslider-footer" @click.stop>
  <div class="fullslider-dots">
    <span v-for="(_, index) in mediaItems" :key="index" class="dot" :class="{ active: index === currentIndex }"  @click.stop="goToImage(index)" />
  </div>
</div>
    </div>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

// ============================================================
//  2. КОМПОНЕНТ
// ============================================================
export default {
  name: 'GalleryMedia',

  props: {
    photos: {
      type: Array,
      default: () => [],
      description: 'Массив URL изображений'
    },
    videos: {
      type: Array,
      default: () => [],
      description: 'Массив URL видео'
    }
  },

  setup(props) {
    // ============================================================
    //  2.1. СОСТОЯНИЕ
    // ============================================================
    const fullsliderOpen = ref(false)
    const currentIndex = ref(0)
    const fullsliderVideoRef = ref(null)

    // --- Свайп ---
    const touchStartX = ref(0)
    const touchStartY = ref(0)
    const isSwiping = ref(false)

    // ============================================================
    //  2.2. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    /**
     * Объединенный список медиа (фото + видео в порядке чередования)
     */
    const mediaItems = computed(() => {
      const items = []
      const maxLength = Math.max(props.photos.length, props.videos.length)
      
      for (let i = 0; i < maxLength; i++) {
        if (i < props.photos.length) {
          items.push({ type: 'image', src: props.photos[i] })
        }
        if (i < props.videos.length) {
          items.push({ type: 'video', src: props.videos[i] })
        }
      }
      
      return items
    })

    /**
     * Текущий медиа-элемент
     */
    const currentMedia = computed(() => {
      return mediaItems.value[currentIndex.value] || { type: 'image', src: '' }
    })

    /**
     * Проверка, есть ли медиа
     */
    const hasMedia = computed(() => mediaItems.value.length > 0)

    // ============================================================
    //  2.3. МЕТОДЫ
    // ============================================================

    /**
     * Открыть лайтбокс
     */
    const openFullslider = (index) => {
      if (!hasMedia.value) return
      currentIndex.value = index
      fullsliderOpen.value = true
      document.body.style.overflow = 'hidden'
    }

    /**
     * Закрыть лайтбокс
     */
    const closeFullslider = () => {
      fullsliderOpen.value = false
      document.body.style.overflow = ''
      if (fullsliderVideoRef.value) {
        fullsliderVideoRef.value.pause()
      }
    }

    /**
     * Следующее медиа
     */
    const nextImage = () => {
      currentIndex.value = (currentIndex.value + 1) % mediaItems.value.length
    }

    /**
     * Предыдущее медиа
     */
    const prevImage = () => {
      currentIndex.value = (currentIndex.value - 1 + mediaItems.value.length) % mediaItems.value.length
    }

    /**
     * Перейти к конкретному медиа
     */
    const goToImage = (index) => {
      currentIndex.value = index
    }

    /**
     * Воспроизвести видео (превью)
     */
    const playVideo = (e) => {
      const video = e.target
      video.play().catch(() => {})
    }

    /**
     * Остановить видео (превью)
     */
    const pauseVideo = (e) => {
      const video = e.target
      video.pause()
      video.currentTime = 0
    }

    /**
     * Остановка видео при смене слайда
     */
    const stopCurrentVideo = () => {
      if (fullsliderVideoRef.value) {
        fullsliderVideoRef.value.pause()
        fullsliderVideoRef.value.currentTime = 0
      }
    }

    /**
     * Воспроизведение видео при смене слайда
     */
    const playCurrentVideo = () => {
      if (fullsliderVideoRef.value && currentMedia.value.type === 'video') {
        setTimeout(() => {
          fullsliderVideoRef.value?.play().catch(() => {})
        }, 100)
      }
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

      // Если вертикальное движение больше — не мешаем скроллу
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
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
        nextImage() // Свайп влево → следующий
      } else if (deltaX > minSwipeDistance) {
        prevImage() // Свайп вправо → предыдущий
      }

      touchStartX.value = 0
      touchStartY.value = 0
    }

    // --- Клавиатура ---
    const handleKeydown = (e) => {
      if (!fullsliderOpen.value) return

      switch (e.key) {
        case 'Escape':
          closeFullslider()
          break
        case 'ArrowRight':
          nextImage()
          break
        case 'ArrowLeft':
          prevImage()
          break
      }
    }

    // ============================================================
    //  2.4. WATCHERS
    // ============================================================

    /**
     * Перезапускаем видео при смене слайда
     */
    watch(currentIndex, () => {
      stopCurrentVideo()
      playCurrentVideo()
    })

    // ============================================================
    //  2.5. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(() => {
      window.addEventListener('keydown', handleKeydown)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    })

    // ============================================================
    //  2.6. ВОЗВРАТ
    // ============================================================
    return {
      // Состояние
      fullsliderOpen,
      currentIndex,
      fullsliderVideoRef,

      // Вычисляемые
      mediaItems,
      currentMedia,
      hasMedia,

      // Методы управления
      openFullslider,
      closeFullslider,
      nextImage,
      prevImage,
      goToImage,

      // Видео
      playVideo,
      pauseVideo,

      // События
      handleKeydown,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    }
  }
}
</script>