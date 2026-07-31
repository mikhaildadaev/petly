<template>
  <section>
    <div class="gallery-media">
      <div v-for="(item, index) in mediaItems" :key="index" class="item" :style="{ '--delay': index * 0.05 + 's' }" @click="openFullScreen(index)">
        <img v-if="item.type === 'image'" :src="item.src" loading="lazy" />
        <div v-else-if="item.type === 'video'" class="video-preview">
          <video :src="item.src" muted playsinline @mouseenter="playVideo" @mouseleave="pauseVideo" ref="videoPreviewRefs" />
        </div>
        <div v-else-if="item.type === 'audio'" class="audio-preview">
          <div class="audio-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    <div v-if="fullScreenOpen" class="slider-fullscreen" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
      <div class="dots">
        <span v-for="(_, index) in mediaItems" :key="index" class="dot" :class="{ active: index === currentIndex }" @click.stop="goToMedia(index)" />
      </div>
      <div class="content">
        <img v-if="currentMedia.type === 'image'" :src="currentMedia.src" />
        <video v-else-if="currentMedia.type === 'video'" :src="currentMedia.src" controls autoplay muted playsinline class="video" ref="fullScreenVideoRef"/>
        <audio v-else-if="currentMedia.type === 'audio'" :src="currentMedia.src" controls class="audio" ref="fullScreenAudioRef"/>
      </div>
      <button class="fullscreen close" @click.stop="closeFullScreen"></button>
      <button v-if="mediaItems.length > 1" class="fullscreen prev" @click.stop="prevMedia"></button>
      <button v-if="mediaItems.length > 1" class="fullscreen next" @click.stop="nextMedia"></button>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useData } from 'vitepress'
import { useScrollGallery } from '../utils/useScrollGallery'
import { useUrlMedia } from '../utils/useUrlMedia'

const baseUrl = import.meta.env.BASE_URL

export default {
  name: 'GalleryMedia',
  props: {
    audios: {
      type: Array,
      default: () => [],
    },
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
    const fullScreenOpen = ref(false)
    const fullScreenAudioRef = ref(null)
    const fullScreenVideoRef = ref(null)
    const mediaItems = ref([])
    const updateMediaItems = () => {
      const items = []
      const audios = props.audios || []
      const photos = props.photos || []
      const videos = props.videos || []
      const maxLength = Math.max( audios.length, photos.length, videos.length)
      
      for (let i = 0; i < maxLength; i++) {
        if (i < photos.length) items.push({ type: 'image', src: useUrlMedia(photos[i], 'image') })
        if (i < videos.length) items.push({ type: 'video', src: useUrlMedia(videos[i], 'video') })
        if (i < audios.length) items.push({ type: 'audio', src: useUrlMedia(audios[i], 'audio') })
      }
      
      mediaItems.value = items
    }
    const {
      currentIndex,
      goTo,
      next,
      prev,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleKeydown,
    } = useScrollGallery({
      items: mediaItems,
      initialIndex: 0,
    })
    const currentMedia = computed(() => {
      return mediaItems.value[currentIndex.value] || { type: 'image', src: '' }
    })
    const hasMedia = computed(() => {
      const audios = props.audios || []
      const photos = props.photos || []
      const videos = props.videos || []
      return audios.length > 0 || photos.length > 0 || videos.length > 0
    })
    const openFullScreen = (index) => {
      if (!hasMedia.value) return
      goTo(index)
      fullScreenOpen.value = true
      document.body.style.overflow = 'hidden'
    }
    const closeFullScreen = () => {
      fullScreenOpen.value = false
      document.body.style.overflow = ''
      if (fullScreenAudioRef.value) {
        fullScreenAudioRef.value.pause()
      }
      if (fullScreenVideoRef.value) {
        fullScreenVideoRef.value.pause()
      }
    }
    const nextMedia = () => next()
    const prevMedia = () => prev()
    const goToMedia = (index) => goTo(index)
    const playAudio = () => {
      if (fullScreenAudioRef.value) {
        fullScreenAudioRef.value.play().catch(() => {})
      }
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
      if (fullScreenVideoRef.value) {
        fullScreenVideoRef.value.pause()
        fullScreenVideoRef.value.currentTime = 0
      }
    }
    const playCurrentVideo = () => {
      if (fullScreenVideoRef.value && currentMedia.value.type === 'video') {
        setTimeout(() => {
          fullScreenVideoRef.value?.play().catch(() => {})
        }, 100)
      }
    }
    watch(currentIndex, () => {
      stopCurrentVideo()
      playCurrentVideo()
      setTimeout(() => {
        if (currentMedia.value.type === 'audio') {
          playAudio()
        }
      }, 300)
    })
    onMounted(() => {
      updateMediaItems()
      window.addEventListener('keydown', handleKeydown)
    })
    watch(() => [props.audios, props.photos, props.videos], updateMediaItems, { 
      deep: true,
      immediate: true 
    })
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    })
    return {
      baseUrl,
      fullScreenOpen,
      currentIndex,
      fullScreenAudioRef,
      fullScreenVideoRef,
      mediaItems,
      currentMedia,
      hasMedia,
      openFullScreen,
      closeFullScreen,
      nextMedia,
      prevMedia,
      goToMedia,
      playAudio,
      playVideo,
      pauseVideo,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    }
  }
}
</script>