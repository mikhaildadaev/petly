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
    <div v-if="fullsliderOpen" class="fullslider" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
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
//  ИМПОРТЫ
// ============================================================
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

// ============================================================
//  КОМПОНЕНТ
// ============================================================
export default {
  name: 'GalleryMedia',

  props: {
    photos: {
      type: Array,
      default: () => [],
    },
    videos: {
      type: Array,
      default: () => [],
    }
  },

  setup(props) {
    // ============================================================
    //  СОСТОЯНИЕ
    // ============================================================
    const fullsliderOpen = ref(false)
    const currentIndex = ref(0)
    const fullsliderVideoRef = ref(null)

    // --- Свайп ---
    const touchStartX = ref(0)
    const touchStartY = ref(0)
    const isSwiping = ref(false)

    // ============================================================
    //  ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

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

    const currentMedia = computed(() => {
      return mediaItems.value[currentIndex.value] || { type: 'image', src: '' }
    })

    const hasMedia = computed(() => mediaItems.value.length > 0)

    // ============================================================
    //  МЕТОДЫ
    // ============================================================

    const openFullslider = (index) => {
      if (!hasMedia.value) return
      currentIndex.value = index
      fullsliderOpen.value = true
      document.body.style.overflow = 'hidden'
    }

    const closeFullslider = () => {
      fullsliderOpen.value = false
      document.body.style.overflow = ''
      if (fullsliderVideoRef.value) {
        fullsliderVideoRef.value.pause()
      }
    }

    const nextImage = () => {
      currentIndex.value = (currentIndex.value + 1) % mediaItems.value.length
    }

    const prevImage = () => {
      currentIndex.value = (currentIndex.value - 1 + mediaItems.value.length) % mediaItems.value.length
    }

    const goToImage = (index) => {
      currentIndex.value = index
    }

    const playVideo = (e) => {
      const video = e.target
      video.play().catch(() => {})
    }

    const pauseVideo = (e) => {
      const video = e.target
      video.pause()
      video.currentTime = 0
    }

    const stopCurrentVideo = () => {
      if (fullsliderVideoRef.value) {
        fullsliderVideoRef.value.pause()
        fullsliderVideoRef.value.currentTime = 0
      }
    }

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
    //  WATCHERS
    // ============================================================

    watch(currentIndex, () => {
      stopCurrentVideo()
      playCurrentVideo()
    })

    // ============================================================
    //  ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(() => {
      window.addEventListener('keydown', handleKeydown)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    })

    // ============================================================
    //  ВОЗВРАТ
    // ============================================================
    return {
      fullsliderOpen,
      currentIndex,
      fullsliderVideoRef,
      mediaItems,
      currentMedia,
      hasMedia,
      openFullslider,
      closeFullslider,
      nextImage,
      prevImage,
      goToImage,
      playVideo,
      pauseVideo,
      handleKeydown,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    }
  }
}
</script>