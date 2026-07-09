<template>
  <div>
    <!-- Фильтры -->
    <div class="filters">
      <select v-model="filterExperience" class="filter-select">
        <option value="">Все уровни</option>
        <option value="Начинающий">Начинающий (до 1 года)</option>
        <option value="Опытный">Опытный (1–3 года)</option>
        <option value="Эксперт">Эксперт (3+ лет)</option>
      </select>
      <select v-model="filterDirection" class="filter-select">
        <option value="">Все направления</option>
        <option value="Выгул">Выгул</option>
        <option value="Социализация">Социализация</option>
        <option value="Лечение">Лечение</option>
        <option value="Передержка">Передержка</option>
        <option value="Фото/Видео">Фото/Видео</option>
        <option value="Реклама">Реклама</option>
        <option value="SMM">SMM</option>
        <option value="Дизайн">Дизайн</option>
        <option value="Юридическая помощь">Юридическая помощь</option>
        <option value="Ветеринария">Ветеринария</option>
        <option value="Фандрайзинг">Фандрайзинг</option>
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
      <a v-for="volunteer in paginatedVolunteers" :key="volunteer.slug" :href="`${baseUrl}ru/volunteers/${volunteer.slug}`" target="_blank" rel="noopener noreferrer" class="grid-card">
        <div class="grid-meta">
          <span v-if="volunteer.experience" class="tag experience-tag">{{ volunteer.experience }}</span>
          <span v-if="volunteer.experienceYears" class="tag extra-tag">{{ volunteer.experienceYears }}</span>
          <span v-if="volunteer.direction" class="tag direction-tag">{{ volunteer.direction }}</span>
        </div>
        <img :src="volunteer.image" :alt="volunteer.name" loading="lazy" />
        <div class="grid-card-body">
          <h3>{{ volunteer.name }}</h3>
          <p>{{ volunteer.description }}</p>
        </div>
      </a>
    </div>

    <!-- Результаты фильтрации -->
    <div v-if="filteredVolunteers.length === 0 && !isLoading" class="no-results">
      <p>😕 По вашему запросу ничего не найдено</p>
      <button @click="resetFilters" class="btn-reset-link">Показать всех волонтеров</button>
    </div>

    <!-- Кнопка «Загрузить ещё» -->
    <div v-if="filteredVolunteers.length > visibleCount" class="load-more">
      <button @click="loadMore" class="btn-load">Загрузить ещё ({{ remaining }})</button>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'

const baseUrl = import.meta.env.BASE_URL
const modules = import.meta.glob('/ru/volunteers/*.md')

const perPage = 8

export default {
  setup() {
    const allVolunteers = ref([])
    const visibleCount = ref(perPage)
    const isLoading = ref(true)

    // Фильтры
    const filterExperience = ref('')
    const filterDirection = ref('')

    // Проверка, активен ли хотя бы один фильтр
    const isFilterActive = computed(() => {
      return filterExperience.value !== '' || filterDirection.value !== ''
    })

    // Сброс всех фильтров
    const resetFilters = () => {
      filterExperience.value = ''
      filterDirection.value = ''
    }

    // Загружаем данные при монтировании
    onMounted(async () => {
      try {
        const loaded = await Promise.all(
          Object.entries(modules)
            .filter(([path]) => !path.endsWith('volunteers_index.md'))
            .map(async ([path, loader]) => {
              const mod = await loader()
              const slug = path.replace('/ru/volunteers/', '').replace('.md', '')
              const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
              
              // Определяем категорию опыта
              let experienceCategory = ''
              const expValue = fm.experience || ''
              
              // Если опыт указан в годах
              if (expValue.includes('лет') || expValue.includes('год')) {
                const match = expValue.match(/(\d+)/)
                if (match) {
                  const num = parseInt(match[1])
                  if (num <= 1) experienceCategory = 'Начинающий'
                  else if (num <= 3) experienceCategory = 'Опытный'
                  else experienceCategory = 'Эксперт'
                }
              } 
              // Если опыт указан в месяцах
              else if (expValue.includes('месяц')) {
                const match = expValue.match(/(\d+)/)
                if (match) {
                  const num = parseInt(match[1])
                  experienceCategory = num < 12 ? 'Начинающий' : 'Опытный'
                }
              }
              // Если нет числового значения, но есть текст
              else if (expValue) {
                if (expValue.toLowerCase().includes('начин')) experienceCategory = 'Начинающий'
                else if (expValue.toLowerCase().includes('опыт')) experienceCategory = 'Опытный'
                else if (expValue.toLowerCase().includes('эксперт')) experienceCategory = 'Эксперт'
              }

              // Обработка направления (может содержать несколько через / или ,)
              let directionValue = fm.direction || ''
              // Если есть несколько направлений через / или , или и то и другое
              if (directionValue.includes('/') || directionValue.includes(',')) {
                // Заменяем запятые на / для единообразия и разбиваем
                const parts = directionValue.replace(/,/g, '/').split('/')
                // Оставляем только уникальные значения
                const uniqueDirections = [...new Set(parts.map(d => d.trim()))]
                directionValue = uniqueDirections.join(' / ')
              }

              return {
                slug,
                name: fm.title || slug.charAt(0).toUpperCase() + slug.slice(1),
                description: fm.description || '',
                experience: experienceCategory || fm.experience || 'Нет опыта',
                experienceYears: fm.experience || '',
                direction: directionValue,
                directionRaw: fm.direction || '', // Сохраняем оригинал для поиска
                tags: fm.tags || [],
                image: fm.image || '/placeholder-volunteer.svg'
              }
            })
        )
        allVolunteers.value = loaded
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
      }
    })

    // Фильтрованные волонтеры
    const filteredVolunteers = computed(() => {
      return allVolunteers.value.filter(volunteer => {
        // Фильтр по опыту
        if (filterExperience.value && volunteer.experience !== filterExperience.value) return false
        
        // Фильтр по направлению (поддержка нескольких значений)
        if (filterDirection.value) {
          // Проверяем, содержит ли строка направления выбранное значение
          // Ищем в original строке (может быть "Социализация / Лечение")
          const directionStr = volunteer.directionRaw || volunteer.direction || ''
          // Разбиваем на массив и проверяем
          const directions = directionStr.replace(/,/g, '/').split('/').map(d => d.trim())
          if (!directions.includes(filterDirection.value)) {
            return false
          }
        }
        
        return true
      })
    })

    // Пагинированные
    const paginatedVolunteers = computed(() => {
      return filteredVolunteers.value.slice(0, visibleCount.value)
    })

    const remaining = computed(() => {
      return filteredVolunteers.value.length - visibleCount.value
    })

    const loadMore = () => {
      visibleCount.value += perPage
    }

    // Сброс пагинации при изменении фильтров через watch
    watch([filterExperience, filterDirection], () => {
      visibleCount.value = perPage
    })

    return {
      paginatedVolunteers,
      filteredVolunteers,
      filterExperience,
      filterDirection,
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