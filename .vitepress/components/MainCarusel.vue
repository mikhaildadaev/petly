<template>
  <section v-if="items && items.length" class="main-carusel">
    <div class="track" :style="{ '--current-index': currentIndex }">
      <div v-for="(item, index) in items" :key="index" class="slide" :class="{ 'active': index === currentIndex }">
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
    <div v-if="items.length > 1" class="dots">
      <button v-for="(item, index) in items" :key="index" class="dot" :class="{ active: index === currentIndex }" @click="goToSlide(index)"/>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress'
import { useTranslate } from '../utils/useTranslate'

export default {
  name: 'MainCarusel',
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