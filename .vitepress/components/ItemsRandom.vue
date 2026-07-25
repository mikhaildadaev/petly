<template>
  <div v-if="randomItems.length > 0" class="cards-carousel">
    <div class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="currentIndex === 0"></button>
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(item, index) in randomItems" :key="item.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="getItemLink(item)" target="_blank" rel="noopener noreferrer" class="aspect-list card">
              <div class="meta">
                <template v-for="displayField in config.fields.display" :key="displayField">
                  <label v-if="item && item[displayField]" :class="`tag ${displayField.replace('Display', '')}-tag`">{{ item[displayField] }}</label>
                </template>
              </div>
              <img :src="item.imageVertical" loading="lazy" />
              <div :class="['content', useRandomClass(item.uuid)]">
                <h1 class="title">{{ item.nameDisplay }}</h1>
                <p class="description">{{ item.descriptionDisplay }}</p>
              </div>
            </a>
          </div>
          <div class="carousel-slide load-more-slide" :class="{ center: currentIndex === randomItems.length }">
            <div class="load-more" @click="goToLink">
              <div class="content">
                <div class="icon"></div>
                <div class="text">{{ translate('ui', 'Перейти в раздел') }}</div>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel next" :class="{ none: isLastSlide }" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1"></button>
      </div>
    </div>
  </div>
  <div v-else-if="randomItems && randomItems.length === 0" class="no-results">
    <p>{{ translate('ui', 'Нет результатов') }}</p>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useData } from 'vitepress'
import { useConfigItem } from '../utils/useConfigItem'
import { useRandomArray } from '../utils/useRandomArray'
import { useRandomColor } from '../utils/useRandomColor'
import { useScrollCarusel } from '../utils/useScrollCarusel'
import { useTranslate } from '../utils/useTranslate'
import { useUrlMedia } from '../utils/useUrlMedia'

const baseUrl = import.meta.env.BASE_URL

export default {
  name: 'ItemsRandom',
  props: {
    type: { type: String, required: true },
    itemType: { type: String, required: true },
    count: { type: Number, default: 8 }
  },
  setup(props) {
    const { lang } = useData()
    const translate = (category, key) => useTranslate(lang.value, category, key)
    const config = useConfigItem[props.type]
    const randomItems = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)
    const { useRandomClass } = useRandomColor()
    const hasMoreItems = computed(() => randomItems.value.length > 0)
    const carouselRef = ref(null)
    const {
      isMobile,
      currentIndex,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      resetToFirstSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,
    } = useScrollCarusel({
      containerRef: carouselRef,
      items: randomItems,
      hasMoreItems: hasMoreItems,
    })
    const goToLink = () => {
      window.location.href = `${baseUrl}${lang.value}/${config.name}/${props.itemType}`
    }
    const getItemLink = (item) => {
      const basePath = config.linkPath(item)
      return `${baseUrl}${lang.value}${basePath}${props.itemType}/${item.uuid}`
    }
    const carouselTotalSlides = computed(() => {
      return randomItems.value.length + (hasMoreItems.value ? 1 : 0)
    })
    const isFirstSlide = computed(() => currentIndex.value === 0)
    const isLastSlide = computed(() => currentIndex.value >= carouselTotalSlides.value - 1)
    let resizeTimeout = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => { resizeTimeout = null }, 100)
    }
    const transformItem = (item) => {
      const base = {
        uuid: item.uuid,
        nameDisplay: item.title || '',
        descriptionDisplay: item.description || '',
        covenantID: item.covenantID || '',
        imageHorizontal: useUrlMedia(item.imageHorizontal, 'image'),
        imageVertical: useUrlMedia(item.imageVertical, 'image'),
        type: props.itemType,
        ...(config.transform ? config.transform(item, lang.value, translate) : {})
      }
      return base
    }
    const loadItems = async () => {
      try {
        isLoading.value = true
        const fileName = config.dataFile(lang.value, props.itemType)
        const response = await fetch(`${baseUrl}data/${fileName}`)
        if (response.status === 404) {
          randomItems.value = []
          isLoading.value = false
          return
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        const loaded = data.map(item => transformItem(item))
        const shuffled = useRandomArray(loaded)
        randomItems.value = shuffled.slice(0, props.count)
        currentIndex.value = 0
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        randomItems.value = []
      } finally {
        isLoading.value = false
      }
    }
    onMounted(async () => {
      isClient.value = true
      if (typeof window !== 'undefined') window.addEventListener('resize', handleResize)
      await loadItems()
    })
    watch(lang, async () => {
      await loadItems()
    })
    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) clearTimeout(resizeTimeout)
      }
    })
    return {
      config,
      randomItems,
      lang,
      translate,
      isLoading,
      isMobile,
      carouselRef,
      currentIndex,
      carouselTotalSlides,
      isFirstSlide,
      isLastSlide,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      resetToFirstSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,
      useRandomClass,
      getItemLink,
      goToLink,
    }
  }
}
</script>