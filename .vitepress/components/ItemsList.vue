<template>
  <div v-if="config && config.fields" class="list-items">
    <div v-if="hasFilters && config.filters" class="filters-compact hide-scrollbar">
      <div v-for="(filterConfig, filterName) in config.filters" :key="filterName" class="filter-group">
        <div class="filter-chips">
          <button v-for="option in getFilterOptions(filterName)" :key="option.value" class="chip" :class="[{ active: filters[filterName]?.[option.value] }, option.icon]" @click="toggleFilter(filterName, option.value)" :title="option.label"/>
        </div>
        <label class="filter-label">{{ translate('filter', filterConfig.label) }}</label>
      </div>
      <button v-if="!areAllActive" class="reset" @click="resetFilters" :title="translate('ui', 'Сбросить')">
        {{ translate('ui', 'Сбросить') }}
      </button>
    </div>
    <div v-if="!isMobile" class="cards-grid">
      <a v-for="item in paginatedItems" :key="item.uuid" :href="getItemLink(item)" target="_blank" rel="noopener noreferrer" class="aspect-list card">
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
      <div v-if="hasMoreItems" class="load-more" @click="loadMore">
        <div class="content">
          <div class="icon"></div>
          <div class="text">{{ translate('ui', 'Загрузить ещё') }}</div>
          <div class="count">{{ remaining }} {{ translate('ui', 'осталось') }}</div>
          <div class="progress">
            <div class="bar" :style="{ width: `${(visibleCount / filteredItems.length) * 100}%` }"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="cards-carousel">
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
                  <div class="bar" :style="{ width: `${(visibleCount / filteredItems.length) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel next" :class="{ none: isLastSlide }" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1"></button>
      </div>
    </div>
    <div v-if="filteredItems.length === 0 && !isLoading" class="no-results">
      <p>{{ translate('ui', 'Ничего не найдено') }}</p>
    </div>
  </div>
</template>

<script>
import { computed, ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'
import { useConfigItem } from '../utils/useConfigItem'
import { usePagination } from '../utils/usePagination'
import { useRandomColor } from '../utils/useRandomColor'
import { useScrollCarusel } from '../utils/useScrollCarusel'
import { useTranslate, useAge, useAgePetCategory, useDirection, useExperience } from '../utils/useTranslate'
import { useUrlMedia } from '../utils/useUrlMedia'

const baseUrl = import.meta.env.BASE_URL

export default {
  name: 'ItemsList',
  props: {
    type: { type: String, required: true },
    itemType: { type: String, required: true }
  },
  setup(props) {
    const { lang } = useData()
    const translate = (category, key) => useTranslate(lang.value, category, key)
    const config = useConfigItem[props.type]
    const allItems = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)
    const filters = reactive({})
    if (config.filters) {
      Object.keys(config.filters).forEach(filterName => {
        filters[filterName] = {}
        config.filters[filterName].keys.forEach(key => {
          filters[filterName][key] = true
        })
      })
    }
    const hasFilters = computed(() => config.filters && Object.keys(config.filters).length > 0)
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
    const filteredItems = computed(() => {
      return allItems.value.filter(item => {
        if (!config.filters) return true
        let isValid = true
        Object.keys(config.filters).forEach(filterName => {
          if (filterName === 'direction') {
            const directionStr = item.direction || ''
            const directions = directionStr.replace(/,/g, '/').split('/').map(d => d.trim())
            const hasActiveDirection = directions.some(d => filters.direction[d] === true)
            if (!hasActiveDirection) isValid = false
          } else {
            const filterValue = item[filterName]
            if (!filters[filterName]?.[filterValue]) {
              isValid = false
            }
          }
        })
        return isValid
      })
    })
    const {
      paginatedItems,
      remaining,
      hasMoreItems,
      loadMore: originalLoadMore,
      isLoadingMore,
      resetPagination,
      visibleCount,
    } = usePagination(filteredItems, { perPage: 8 })
    const loadMore = async () => {
      const currentPosition = currentIndex.value
      await originalLoadMore()
      await nextTick()
      if (paginatedItems.value.length > 0) {
        goToSlide(currentPosition)
      }
    }
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
      hasMoreItems: hasMoreItems,
    })
    const carouselTotalSlides = computed(() => {
      return paginatedItems.value.length + (hasMoreItems.value ? 1 : 0)
    })
    const isFirstSlide = computed(() => currentIndex.value === 0)
    const isLastSlide = computed(() => currentIndex.value >= carouselTotalSlides.value - 1)
    const { useRandomClass } = useRandomColor()
    const getItemLink = (item) => {
      const basePath = config.linkPath(item)
      return `${baseUrl}${lang.value}${basePath}${props.itemType}/${item.uuid}`
    }
    const getFilterOptions = (filterName) => {
      const filterConfig = config.filters[filterName]
      return filterConfig.keys.map(key => ({
        value: key,
        label: translate(filterName, key),
        icon: config.icons?.[filterName]?.[key] || ''
      }))
    }
    const toggleFilter = (group, value) => {
      filters[group][value] = !filters[group][value]
      resetPagination()
      resetToFirstSlide()
    }
    const resetFilters = () => {
      Object.keys(filters).forEach(group => {
        Object.keys(filters[group]).forEach(key => {
          filters[group][key] = true
        })
      })
      resetPagination()
      resetToFirstSlide()
    }
    const areAllActive = computed(() => {
      if (!config.filters) return true
      let allActive = true
      Object.keys(config.filters).forEach(filterName => {
        const filter = filters[filterName]
        if (filter) {
          const allTrue = Object.values(filter).every(v => v === true)
          if (!allTrue) allActive = false
        }
      })
      return allActive
    })
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
      isClient.value = true
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      await loadItems()
    })
    watch(lang, async () => {
      await loadItems()
      resetToFirstSlide()
    })
    watch(
      () => filters,
      () => {
        resetPagination()
        resetToFirstSlide()
      },
      { deep: true }
    )
    watch(
      () => paginatedItems.value,
      (newVal) => {
        if (isClient.value && isMobile.value && newVal.length) {
          const maxIndex = carouselTotalSlides.value - 1
          if (currentIndex.value > maxIndex) resetToFirstSlide()
        }
      },
      { deep: true }
    )
    watch(isMobile, (newVal) => {
      if (isClient.value && newVal && paginatedItems.value.length) {
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
      filters,
      hasFilters,
      filteredItems,
      paginatedItems,
      isLoading,
      isMobile,
      carouselRef,
      currentIndex,
      carouselTotalSlides,
      isFirstSlide,
      isLastSlide,
      remaining,
      hasMoreItems,
      loadMore,
      isLoadingMore,
      resetPagination,
      visibleCount,
      getFilterOptions,
      toggleFilter,
      resetFilters,
      areAllActive,
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