<template>
  <div>
    <!-- Фильтры -->
    <div class="filters">
      <select v-model="filterGender" class="filter-select">
        <option value="">Все гендеры</option>
        <option value="Девочка">Девочки</option>
        <option value="Мальчик">Мальчики</option>
      </select>
      <select v-model="filterAge" class="filter-select">
        <option value="">Все возрасты</option>
        <option value="щенок">Щенки (до 1 года)</option>
        <option value="молодая">Молодые (1–3 года)</option>
        <option value="взрослая">Взрослые (3+ лет)</option>
      </select>
      <select v-model="filterSize" class="filter-select">
        <option value="">Все размеры</option>
        <option value="Маленькая">Маленькие</option>
        <option value="Средняя">Средние</option>
        <option value="Крупная">Крупные</option>
      </select>
      
      <!-- Кнопка сброса -->
      <button v-if="isFilterActive" @click="resetFilters" class="btn-reset" title="Сбросить все фильтры">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
        Сбросить
      </button>
    </div>

    <!-- Сетка -->
    <div class="grid-cards">
      <a v-for="dog in paginatedDogs" :key="dog.slug" :href="`${baseUrl}ru/dogs/${dog.slug}`" target="_blank" rel="noopener noreferrer" class="grid-card">
        <img :src="dog.image" :alt="dog.name" loading="lazy" />
        <div class="grid-card-body">
          <h3>{{ dog.name }}</h3>
          <div class="grid-meta">
            <span v-if="dog.age" class="tag age-tag">{{ dog.age }}</span>
            <span v-if="dog.gender" class="tag gender-tag">{{ dog.gender }}</span>
            <span v-if="dog.size" class="tag size-tag">{{ dog.size }}</span>
            <span v-for="tag in dog.tags" :key="tag" class="tag extra-tag">{{ tag }}</span>
          </div>
          <p>{{ dog.description }}</p>
        </div>
      </a>
    </div>

    <!-- Результаты фильтрации -->
    <div v-if="filteredDogs.length === 0 && !isLoading" class="no-results">
      <p>😕 По вашему запросу ничего не найдено</p>
      <button @click="resetFilters" class="btn-reset-link">Показать всех собак</button>
    </div>

    <!-- Кнопка «Загрузить ещё» -->
    <div v-if="filteredDogs.length > visibleCount" class="load-more">
      <button @click="loadMore" class="btn-load">Загрузить ещё ({{ remaining }})</button>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'

const baseUrl = import.meta.env.BASE_URL
const modules = import.meta.glob('/ru/dogs/*.md')

const perPage = 8

export default {
  setup() {
    const allDogs = ref([])
    const visibleCount = ref(perPage)
    const isLoading = ref(true)

    // Фильтры
    const filterAge = ref('')
    const filterGender = ref('')
    const filterSize = ref('')

    // Проверка, активен ли хотя бы один фильтр
    const isFilterActive = computed(() => {
      return filterAge.value !== '' || filterGender.value !== '' || filterSize.value !== ''
    })

    // Сброс всех фильтров
    const resetFilters = () => {
      filterAge.value = ''
      filterGender.value = ''
      filterSize.value = ''
    }

    // Загружаем данные при монтировании
    onMounted(async () => {
      try {
        const loaded = await Promise.all(
          Object.entries(modules)
            .filter(([path]) => !path.endsWith('dogs_index.md'))
            .map(async ([path, loader]) => {
              const mod = await loader()
              const slug = path.replace('/ru/dogs/', '').replace('.md', '')
              const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
              return {
                slug,
                name: fm.title || slug.charAt(0).toUpperCase() + slug.slice(1),
                description: fm.description || '',
                age: fm.age || '',
                gender: fm.gender || '',
                size: fm.size || '',
                tags: fm.tags || [],
                image: fm.image || '/placeholder-dog.svg'
              }
            })
        )
        allDogs.value = loaded
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
      }
    })

    // Вычисляем возрастную категорию для фильтрации
    const getAgeCategory = (ageStr) => {
      if (!ageStr) return ''
      const match = ageStr.match(/(\d+)/)
      if (!match) return ''
      const num = parseInt(match[1])
      if (ageStr.includes('месяц') || num < 1) return 'щенок'
      if (num <= 3) return 'молодая'
      return 'взрослая'
    }

    // Фильтрованные собаки
    const filteredDogs = computed(() => {
      return allDogs.value.filter(dog => {
        if (filterAge.value && getAgeCategory(dog.age) !== filterAge.value) return false
        if (filterGender.value && dog.gender !== filterGender.value) return false
        if (filterSize.value && dog.size !== filterSize.value) return false
        return true
      })
    })

    // Пагинированные
    const paginatedDogs = computed(() => {
      return filteredDogs.value.slice(0, visibleCount.value)
    })

    const remaining = computed(() => {
      return filteredDogs.value.length - visibleCount.value
    })

    const loadMore = () => {
      visibleCount.value += perPage
    }

    // Сброс пагинации при изменении фильтров через watch
    watch([filterAge, filterGender, filterSize], () => {
      visibleCount.value = perPage
    })

    return {
      paginatedDogs,
      filteredDogs,
      filterAge,
      filterGender,
      filterSize,
      isFilterActive,
      resetFilters,
      visibleCount,
      remaining,
      loadMore,
      baseUrl,
      isLoading
    }
  }
}
</script>