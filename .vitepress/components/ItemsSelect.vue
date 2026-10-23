<template>
  <section v-if="config && config.fields && (isLoading || filteredItems.length > 0)" class="select-items">
    <div class="cards-carousel">
      <div class="carousel-wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="isFirstSlide"></button>
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-if="hasPrevItems" class="carousel-slide" :class="{ center: currentIndex === 0 }">
            <div class="aspect-card load-more prev-load" @click="loadPrev">
              <div class="content">
                <div class="icon prev-icon"></div>
                <div class="text">{{ translate('ui', 'Загрузить предыдущие') }}</div>
                <div class="count">{{ prevCount }} {{ translate('ui', 'осталось') }}</div>
                <div class="progress">
                  <div class="bar" :style="{ width: `${(windowStart / filteredItems.length) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-for="(item, index) in paginatedItems" :key="item.uuid" class="carousel-slide" :class="{ center: (index + offsetPrev) === currentIndex }">
            <div class="aspect-card card">
              <div class="meta">
                <template v-for="displayField in config.fields.display" :key="displayField">
                  <label v-if="item && item[displayField]" :class="`tag ${displayField.replace('Display', '')}-tag`">{{ item[displayField] }}</label>
                </template>
              </div>
              <button v-if="type === 'pets' && item.uuid" class="like favorite" :class="{ 'is-favorite': mounted && isFavorite(item.uuid) }" @click.stop="toggleFavorite(item.uuid)" :title="translate('ui', 'Добавить в избранное')"></button>
              <a :href="getItemLink(item)" rel="noopener noreferrer" class="card-link">
                <picture>
                  <img :src="item.imageVertical" loading="lazy" />
                </picture>
                <div :class="['content', useRandomClass(item.uuid)]">
                  <h1 class="title">{{ item.nameDisplay }}</h1>
                  <p class="description">{{ item.descriptionDisplay }}</p>
                </div>
              </a>
            </div>
          </div>
          <div v-if="hasNextItems" class="carousel-slide" :class="{ center: currentIndex === (paginatedItems.length + offsetPrev) }">
            <div class="aspect-card load-more" @click="loadNext">
              <div class="content">
                <div class="icon"></div>
                <div class="text">{{ translate('ui', 'Загрузить следующие') }}</div>
                <div class="count">{{ remaining }} {{ translate('ui', 'осталось') }}</div>
                <div class="progress">
                  <div class="bar" :style="{ width: `${((windowStart + windowSize) / filteredItems.length) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel next" :class="{ none: isLastSlide }" @click="nextSlide" :disabled="isLastSlide"></button>
      </div>
    </div>
  </section>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'
import { useConfigItem } from '../utils/useConfigItem'
import { useFavoritesList } from '../utils/useFavorites'
import { usePagination } from '../utils/usePagination'
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
    const { favorites, isFavorite, toggleFavorite } = useFavoritesList()
    const displayUUIDs = computed(() => {
      if (props.uuids && props.uuids.length > 0) {
        return props.uuids
      }
      return favorites.value
    })
    const filteredItems = computed(() => {
      if (isLoading.value) return []
      if (!allItems.value || allItems.value.length === 0) return []
      const uuids = displayUUIDs.value
      if (!uuids || uuids.length === 0) return []
      return allItems.value.filter(item => item.uuid && uuids.includes(item.uuid))
    })
    const mounted = ref(false) 
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
    const {
      paginatedItems,
      remaining,
      hasNextItems,
      hasPrevItems,
      prevCount,
      windowStart,
      windowSize,
      loadNext: originalLoadNext,
      loadPrev: originalLoadPrev,
      isLoadingNext,
      resetPagination,
      visibleCount,
    } = usePagination(filteredItems, { perPage: 8 })
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
      loadNext,
      loadPrev,
      totalSlides,
      offsetPrev,
    } = useScrollCarusel({
      containerRef: carouselRef,
      items: paginatedItems,
      hasNextItems: hasNextItems,
      loadNextFn: originalLoadNext,
      hasPrevItems: hasPrevItems,
      loadPrevFn: originalLoadPrev,
    })
    const isFirstSlide = computed(
      () => currentIndex.value === 0 && !hasPrevItems.value
    )
    const isLastSlide = computed(
      () => currentIndex.value >= totalSlides.value - 1
    )
    const { useRandomClass } = useRandomColor()
    const getItemLink = (item) => {
      const basePath = config.linkPath(item)
      return `${baseUrl}${lang.value}${basePath}${props.itemType}/${item.uuid}`
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
        allItems.value = []
      } finally {
        isLoading.value = false
      }
    }
    let resizeTimeout = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => { resizeTimeout = null }, 100)
    }
    onMounted(async () => {
      mounted.value = true 
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      await loadItems()
      if (paginatedItems.value.length > 0) {
        resetToFirstSlide()
      }
    })
    watch(lang, async () => {
      await loadItems()
      await nextTick()
      resetToFirstSlide()
    })
    watch(
      () => filteredItems.value.length,
      async () => {
        await nextTick()
        resetToFirstSlide()
      },
      { deep: true }
    )
    watch(isMobile, async (newVal) => {
      if (mounted.value && newVal && paginatedItems.value.length) {
        await nextTick()
        resetToFirstSlide()
      }
    })
    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) clearTimeout(resizeTimeout)
      }
    })
    return {
      config,
      mounted,
      isFavorite,
      toggleFavorite,
      filteredItems,
      paginatedItems,
      isLoading,
      isMobile,
      carouselRef,
      currentIndex,
      isFirstSlide,
      isLastSlide,
      remaining,
      hasNextItems,
      hasPrevItems,
      prevCount,
      windowStart,
      windowSize,
      loadNext,
      loadPrev,
      offsetPrev,
      totalSlides,
      isLoadingNext,
      resetPagination,
      visibleCount,
      translate,
      lang,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      resetToFirstSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      useRandomClass,
      getItemLink,
    }
  }
}
</script>