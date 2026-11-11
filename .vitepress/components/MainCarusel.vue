<template>
  <section v-if="items && items.length" :id="`${type}`" class="main-carousel">
    <div class="wrapper">
      <button v-if="items.length > 1" class="carousel prev" :class="{ none: isFirstSlide }" @click="onPrevClick" :disabled="isFirstSlide"></button>
      <div class="track" ref="carouselRef" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
        <div v-for="(item, index) in items" :key="index" class="slide" :class="{ center: index === currentIndex }">
          <div class="main-item">
            <img v-if="item.img" :src="item.img" :alt="item.name" class="image" loading="lazy"/>
            <div class="text">
              <h1 class="name">{{ item.name }}</h1>
              <p class="description">{{ item.description }}</p>
              <a v-if="item.link" :href="item.link" class="link">{{ translate('ui', 'Подробнее') }} →</a>
            </div>
          </div>
        </div>
      </div>
      <button v-if="items.length > 1" class="carousel next" :class="{ none: isLastSlide }" @click="onNextClick" :disabled="isLastSlide"></button>
    </div>
    <div v-if="items.length > 1" class="dots">
      <button v-for="(item, index) in items" :key="index" class="dot" :class="{ active: index === currentIndex }" @click="onDotClick(index)"/>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress'
import { useTranslate } from '../utils/useTranslate'
import { useScrollCarusel } from '../utils/useScrollCarusel'

export default {
  name: 'MainCarusel',
  props: {
    type: { type: String, required: true },
    interval: { type: Number, default: 5000 }
  },
  setup(props) {
    const { lang, frontmatter } = useData()
    const translate = (category, key) => useTranslate(lang.value, category, key)
    const items = computed(() => {
      const mainArray = frontmatter.value?.main || []
      const block = mainArray.find(item => item.type === props.type)
      return block ? block.list : []
    })
    const carouselRef = ref(null)
    const {
      currentIndex,
      scrollToSlide,
      nextSlide,
      prevSlide,
      resetToFirstSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      totalSlides,
      offsetPrev,
    } = useScrollCarusel({
      containerRef: carouselRef,
      items: items,
      hasNextItems: ref(false),
      hasPrevItems: ref(false),
    })
    const isFirstSlide = computed(() => currentIndex.value === 0)
    const isLastSlide = computed(
      () => currentIndex.value >= totalSlides.value - 1
    )
    let timer = null
    let scrollDebounce = null
    let isProgrammaticScroll = false
    const startTimer = () => {
      stopTimer()
      if (items.value.length <= 1) return
      timer = setInterval(() => {
        goNextLooped()
      }, props.interval)
    }
    const stopTimer = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }
    const resetTimer = () => {
      stopTimer()
      startTimer()
    }
    const onScroll = () => {
      if (isProgrammaticScroll) return
      
      stopTimer()
      if (scrollDebounce) clearTimeout(scrollDebounce)
      scrollDebounce = setTimeout(() => {
        startTimer()
      }, 300)
    }
    const goNextLooped = () => {
      if (items.value.length <= 1) return
      isProgrammaticScroll = true
      if (isLastSlide.value) {
        scrollToSlide(0)
      } else {
        nextSlide()
      }
      setTimeout(() => { isProgrammaticScroll = false }, 500)
    }
    const goPrevLooped = () => {
      if (items.value.length <= 1) return
      isProgrammaticScroll = true
      if (isFirstSlide.value) {
        scrollToSlide(totalSlides.value - 1)
      } else {
        prevSlide()
      }
      setTimeout(() => { isProgrammaticScroll = false }, 500)
    }
    const onNextClick = () => {
      goNextLooped()
      resetTimer()
    }
    const onPrevClick = () => {
      goPrevLooped()
      resetTimer()
    }
    const onDotClick = (index) => {
      isProgrammaticScroll = true
      scrollToSlide(index)
      setTimeout(() => { isProgrammaticScroll = false }, 500)
      resetTimer()
    }
    const onTouchStart = (e) => {
      stopTimer()
      handleTouchStart(e)
    }
    const onTouchMove = (e) => {
      handleTouchMove(e)
    }
    const onTouchEnd = (e) => {
      handleTouchEnd(e)
      resetTimer()
    }
    onMounted(() => {
      startTimer()
      requestAnimationFrame(() => {
        if (items.value.length > 0) resetToFirstSlide()
      })
      if (carouselRef.value) {
        carouselRef.value.addEventListener('scroll', onScroll, { passive: true })
      }
    })
    onUnmounted(() => {
      stopTimer()
      if (scrollDebounce) clearTimeout(scrollDebounce)
      if (carouselRef.value) {
        carouselRef.value.removeEventListener('scroll', onScroll)
      }
    })
    return {
      items,
      carouselRef,
      currentIndex,
      isFirstSlide,
      isLastSlide,
      totalSlides,
      offsetPrev,
      scrollToSlide,
      nextSlide,
      prevSlide,
      resetToFirstSlide,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onNextClick,
      onPrevClick,
      onDotClick,
      translate,
    }
  }
}
</script>