<template>
  <section v-if="items && items.length" class="main-carousel">
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
      goToSlide,
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
    const goNextLooped = () => {
      if (items.value.length <= 1) return
      if (isLastSlide.value) {
        scrollToSlide(0)
      } else {
        nextSlide()
      }
    }
    const goPrevLooped = () => {
      if (items.value.length <= 1) return
      if (isFirstSlide.value) {
        scrollToSlide(totalSlides.value - 1)
      } else {
        prevSlide()
      }
    }
    let timer = null
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
    const onNextClick = () => {
      goNextLooped()
      resetTimer()
    }
    const onPrevClick = () => {
      goPrevLooped()
      resetTimer()
    }
    const onDotClick = (index) => {
      goToSlide(index)
      resetTimer()
    }
    const onTouchStart = (e) => {
      resetTimer()
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
    })
    onUnmounted(() => {
      stopTimer()
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
      goToSlide,
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