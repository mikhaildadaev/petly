<template>
  <section v-if="items && items.length" class="main-slider-container">
    <div class="slider-track">
      <div v-for="(item, index) in items" :key="index" class="slider-slide" :class="{ 'active': index === currentIndex }">
        <div class="main-block">
          <img v-if="item.img" :src="item.img" :alt="item.name" class="image" loading="lazy"/>
          <div class="text">
            <h1 class="name">{{ item.name }}</h1>
            <p class="description">{{ item.description }}</p>
            <a v-if="item.link" :href="item.link" class="link">{{ translate('ui', 'Подробнее') }} →</a>
          </div>
        </div>
      </div>
    </div>
    <div v-if="items.length > 1" class="slider-dots">
      <button v-for="(item, index) in items" :key="index" class="dot" :class="{ active: index === currentIndex }" @click="goToSlide(index)"/>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress'
import { useTranslate } from '../utils/useTranslate'

export default {
  name: 'MainSlider',
  props: {
    type: { type: String, required: true },
    interval: { type: Number, default: 5000 }
  },
  setup(props) {
    const { lang, frontmatter } = useData()
    const translate = (category, key) => useTranslate(lang.value, category, key)
    const currentIndex = ref(0)
    let timer = null
    const items = computed(() => {
      const mainArray = frontmatter.value?.main || []
      const block = mainArray.find(item => item.type === props.type)
      return block ? block.list : []
    })
    const nextSlide = () => {
      if (items.value.length <= 1) return
      currentIndex.value = (currentIndex.value + 1) % items.value.length
    }
    const goToSlide = (index) => {
      currentIndex.value = index
      resetTimer()
    }
    const startTimer = () => {
      stopTimer()
      if (items.value.length > 1) {
        timer = setInterval(nextSlide, props.interval)
      }
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
    onMounted(() => {
      startTimer()
    })
    onUnmounted(() => {
      stopTimer()
    })
    return {
      items,
      currentIndex,
      goToSlide,
      translate
    }
  }
}
</script>

<style scoped>
.main-slider-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.slider-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
  transform: translateX(calc(-100% * v-bind(currentIndex)));
}
.slider-slide {
  flex: 0 0 100%;
  width: 100%;
  opacity: 0.7;
  transition: opacity 0.5s ease;
}
.slider-slide.active {
  opacity: 1;
}
.slider-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}
.dot.active {
  background: var(--vp-c-brand-1, #e67e22);
  width: 24px;
  border-radius: 5px;
}
.dot:hover {
  background: rgba(255, 255, 255, 0.8);
}
</style>