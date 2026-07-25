<template>
  <div v-if="paginatedItems && paginatedItems.length > 0" class="cards-carousel">
    <div class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="currentIndex === 0"></button>
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(item, index) in paginatedItems" :key="item.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
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
          <div v-if="hasMoreItems" class="carousel-slide load-more-slide" :class="{ center: currentIndex === paginatedItems.length }">
            <div class="load-more" @click="loadMore">
              <div class="content">
                <div class="icon"></div>
                <div class="text">{{ translate('ui', 'Загрузить ещё') }}</div>
                <div class="count">{{ remaining }} {{ translate('ui', 'осталось') }}</div>
                <div class="progress">
                  <div class="bar" :style="{ width: `${(visibleCount / groupedItems.length) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel next" :class="{ none: isLastSlide }" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1"></button>
      </div>
    </div>
  </div>
  <div v-else-if="!isLoading && (!groupedItems || groupedItems.length === 0)" class="no-results">
    <p>{{ translate('ui', 'Нет результатов') }}</p>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'
import { useConfigItem } from '../utils/useConfigItem'
import { useRandomColor } from '../utils/useRandomColor'
import { useScrollCarusel } from '../utils/useScrollCarusel'
import { usePagination } from '../utils/usePagination'
import { useTranslate } from '../utils/useTranslate'
import { useUrlMedia } from '../utils/useUrlMedia'

const baseUrl = import.meta.env.BASE_URL

export default {
  name: 'GroupItems',
  props: {
    type: { type: String, required: true },
    itemType: { type: String, required: true },
    uuid: { type: String, required: true, default: '' }
  },
  setup(props) {
    const { lang } = useData()
    const translate = (category, key) => useTranslate(lang.value, category, key)
    const config = useConfigItem[props.type]

    const allItems = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)

    const groupedItems = computed(() => {
      if (isLoading.value) return []
      if (!allItems.value || allItems.value.length === 0) return []
      if (!props.uuid) return []

      const filtered = allItems.value.filter(item =>
        item.shelters && item.shelters.includes(props.uuid)
      )
      return filtered.reverse()
    })

    const {
      paginatedItems,
      remaining,
      hasMoreItems,
      loadMore: originalLoadMore,
      isLoadingMore,
      resetPagination,
      visibleCount,
    } = usePagination(groupedItems, { perPage: 8 })

    const loadMore = async () => {
      const currentPosition = currentIndex.value
      await originalLoadMore()
      await nextTick()
      if (paginatedItems.value.length > 0) {
        goToSlide(currentPosition)
      }
    }

    const { useRandomClass } = useRandomColor()
    const hasMoreItemsForCarousel = computed(() => hasMoreItems.value)

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
      items: paginatedItems,
      hasMoreItems: hasMoreItemsForCarousel,
    })

    const carouselTotalSlides = computed(() => {
      return paginatedItems.value.length + (hasMoreItems.value ? 1 : 0)
    })

    const isFirstSlide = computed(() => currentIndex.value === 0)
    const isLastSlide = computed(() => currentIndex.value >= carouselTotalSlides.value - 1)

    const getItemLink = (item) => {
      const basePath = config.linkPath(item)
      return `${baseUrl}${lang.value}${basePath}${props.itemType}/${item.uuid}`
    }

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
        imageVertical: useUrlMedia(item.imageVertical, 'image'),
        imageHorizontal: useUrlMedia(item.imageHorizontal, 'image'),
        type: props.itemType,
        shelters: item.shelters || [],
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
        resetPagination()
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
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

    watch(groupedItems, () => {
      resetPagination()
    }, { deep: true })

    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) clearTimeout(resizeTimeout)
      }
    })

    return {
      config,
      groupedItems,
      paginatedItems,
      lang,
      translate,
      isLoading,
      isMobile,
      visibleCount,
      remaining,
      hasMoreItems,
      loadMore,
      isLoadingMore,
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
      baseUrl,
    }
  }
}
</script>