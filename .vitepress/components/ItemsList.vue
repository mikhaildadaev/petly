<template>
  <section v-if="config && config.fields" :id="`${itemType}`" class="list-items">
    <div v-if="hasFilters && config.filters" class="filters-compact hide-scrollbar">
      <div v-for="(filterConfig, filterName) in config.filters" :key="filterName" class="filter-group">
        <div class="filter-chips">
          <button v-for="option in getFilterOptions(filterName)" :key="option.value" class="chip" :class="[{ active: filters[filterName]?.[option.value] }, `${filterName}_${option.icon}`]" @click="toggleFilter(filterName, option.value)" :title="option.label"/>
        </div>
        <label class="filter-label">{{ translate('filter', filterConfig.label) }}</label>
      </div>
      <button v-if="!areAllActive" class="reset" @click="resetFilters" :title="translate('ui', 'Сбросить фильтры')">{{ translate('ui', 'Сбросить фильтры') }}</button>
    </div>
    <div class="cards-carousel">
      <div class="wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="isFirstSlide"></button>
        <div class="track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-if="hasPrevItems" class="slide" :class="{ center: currentIndex === 0 }">
            <div class="aspect-card load-more prev-load" @click="carouselLoadPrev">
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
          <div v-for="(item, index) in paginatedItems" :key="item.uuid" :id="item.uuid" class="slide" :class="{ center: (index + offsetPrev) === currentIndex }">
            <div class="aspect-card card">
              <div class="meta">
                <template v-for="displayField in config.fields.display" :key="displayField">
                  <label v-if="item && item[displayField]" :class="`tag ${displayField.replace('Display', '')}-tag`">{{ item[displayField] }}</label>
                </template>
              </div>
              <button v-if="type === 'pets' && item.uuid" class="like favorite" :class="{ 'is-favorite': mounted && isFavorite(item.uuid) }" @click.stop="toggleFavorite(item.uuid)" :title="translate('ui', 'Добавить в избранное')"></button>
              <a :href="getItemLink(item)" @click="handleNavigate($event, item, 'carousel')" rel="noopener noreferrer" class="card-link">
                <picture>
                  <img :src="item.imageVertical" loading="lazy" />
                </picture>
                <div :class="['content', useRandomClass(item.uuid)]">
                  <h3 class="title">{{ item.nameDisplay }}</h3>
                  <p class="description">{{ item.descriptionDisplay }}</p>
                </div>
              </a>
            </div>
          </div>
          <div v-if="hasNextItems" class="slide" :class="{ center: currentIndex === (paginatedItems.length + offsetPrev) }">
            <div class="aspect-card load-more" @click="carouselLoadNext">
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
    <div v-if="filteredItems.length === 0 && !isLoading" class="no-results">
      <p>{{ translate('ui', 'Ничего не найдено') }}</p>
    </div>
  </section>
</template>

<script>
import { computed, ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'
import { useConfigItem } from '../utils/useConfigItem'
import { useFavoritesList } from '../utils/useFavorites'
import { useNavigation, saveContext, scrollToElement } from '../utils/useNavigation'
import { usePagination } from '../utils/usePagination'
import { useRandomColor } from '../utils/useRandomColor'
import { useScrollCarusel } from '../utils/useScrollCarusel'
import { useTranslate } from '../utils/useTranslate'
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
    const isRestoring = ref(false)
    const filters = reactive({})
    const { isFavorite, toggleFavorite } = useFavoritesList()
    if (config.filters) {
      Object.keys(config.filters).forEach(filterName => {
        filters[filterName] = {}
        config.filters[filterName].keys.forEach(key => {
          filters[filterName][key] = true
        })
      })
    }
    const hasFilters = computed(() => config.filters && Object.keys(config.filters).length > 0)
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
      setWindowByID,
    } = usePagination(filteredItems, { perPage: 8 })
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
    function handleNavigate(event, item, format) {
      saveContext(item.uuid, format, {
        visibleCount: visibleCount.value,
        filters: JSON.parse(JSON.stringify(filters)),
        lang: lang.value,
        type: props.type,
        itemType: props.itemType,
      })
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
    }
    const resetFilters = () => {
      Object.keys(filters).forEach(group => {
        Object.keys(filters[group]).forEach(key => {
          filters[group][key] = true
        })
      })
      resetPagination()
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
    const { restore } = useNavigation({
      onRestore: async (ctx) => {
        try {
          isRestoring.value = true
          if (ctx.filters) {
            Object.keys(ctx.filters).forEach(group => {
              if (filters[group]) {
                Object.assign(filters[group], ctx.filters[group])
              }
            })
          }
          await nextTick()
          if (!filteredItems.value || filteredItems.value.length === 0) {
            return
          }
          const indexInWindow = setWindowByID(ctx.id, filteredItems.value)
          if (indexInWindow === null) {
            return
          }
          await nextTick()
          if (ctx.type === 'carousel') {
            scrollToSlide(indexInWindow + offsetPrev.value)
          } else {
            scrollToElement(ctx.id)
          }
        } catch (error) {
          console.error('❌ Ошибка:', error)
        } finally {
          isRestoring.value = false
        }
      }
    })
    onMounted(async () => {
      mounted.value = true 
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      await loadItems()
      if (paginatedItems.value.length > 0) {
        resetToFirstSlide()
      }
      await nextTick()
      restore()
    })
    watch(lang, async () => {
      await loadItems()
      resetPagination()
      await nextTick()
      resetToFirstSlide()
    })
    watch(() => filters, async () => {
        if (isRestoring.value) return
        resetPagination()
        await nextTick()
        resetToFirstSlide()
      },
      { deep: true }
    )
    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) clearTimeout(resizeTimeout)
      }
    })
    return {
      config,
      mounted,
      filters,
      isFavorite,
      toggleFavorite,
      hasFilters,
      filteredItems,
      paginatedItems,
      isLoading,
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
      carouselLoadNext: loadNext,
      carouselLoadPrev: loadPrev,
      offsetPrev,
      totalSlides,
      isLoadingNext,
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
      handleNavigate,
      useRandomClass,
      getItemLink,
    }
  }
}
</script>