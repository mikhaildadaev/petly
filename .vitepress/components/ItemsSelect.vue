<template>
  <div v-if="selectedItems && selectedItems.length > 0" class="cards-carousel">
    <div class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="currentIndex === 0"></button>
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(item, index) in selectedItems" :key="item.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
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
        </div>
        <button class="carousel next" :class="{ none: isLastSlide }" @click="nextSlide" :disabled="currentIndex >= (selectedItems ? selectedItems.length - 1 : 0)"></button>
      </div>
    </div>
  </div>
  <div v-else-if="selectedItems && selectedItems.length === 0" class="no-results">
    <p>{{ translate('ui', 'Ничего не найдено') }}</p>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useData } from 'vitepress'
import { useConfigItem } from '../utils/useConfigItem'
import { useRandomColor } from '../utils/useRandomColor'
import { useScrollCarusel } from '../utils/useScrollCarusel'
import { useTranslate } from '../utils/useTranslate'
import { useUrlMedia } from '../utils/useUrlMedia'

const baseUrl = import.meta.env.BASE_URL

export default {
  name: 'ItemsSelect',
  props: {
    type: { type: String, required: true },
    itemType: { type: String, required: true },
    uuids: { type: Array, default: () => [] }
  },
  setup(props) {
    const { lang } = useData()
    const translate = (category, key) => useTranslate(lang.value, category, key)
    const config = useConfigItem[props.type]
    const allItems = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)
    const selectedItems = computed(() => {
      if (isLoading.value) return []
      if (!allItems.value || allItems.value.length === 0) return []
      if (!props.uuids || props.uuids.length === 0) return []
      return allItems.value.filter(item => item.uuid && props.uuids.includes(item.uuid))
    })
    const { useRandomClass } = useRandomColor()
    const hasMoreItems = computed(() => false)
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
      items: selectedItems,
      hasMoreItems: hasMoreItems,
    })
    const getItemLink = (item) => {
      const basePath = config.linkPath(item)
      return `${baseUrl}${lang.value}${basePath}${props.itemType}/${item.uuid}`
    }
    const carouselTotalSlides = computed(() => {
      return selectedItems.value.length + (hasMoreItems.value ? 1 : 0)
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
          allItems.value = []
          isLoading.value = false
          return
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        allItems.value = data.map(item => transformItem(item))
      } catch (error) {
        allItems.value = []
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
      resetToFirstSlide()
    })
    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) clearTimeout(resizeTimeout)
      }
    })
    return {
      config,
      selectedItems,
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
    }
  }
}
</script>