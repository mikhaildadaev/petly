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
      <button 
        v-if="isFilterActive" 
        @click="resetFilters" 
        class="btn-reset"
        title="Сбросить все фильтры"
      >
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
    <div class="volunteers-grid">
      <a 
        v-for="volunteer in paginatedVolunteers" 
        :key="volunteer.slug" 
        :href="`${baseUrl}ru/volunteers/${volunteer.slug}`" 
        target="_blank" 
        rel="noopener noreferrer"
        class="volunteer-card"
      >
        <img :src="volunteer.image" :alt="volunteer.name" loading="lazy" />
        <div class="volunteer-card-body">
          <h3>{{ volunteer.name }}</h3>
          <div class="volunteer-meta">
            <span v-if="volunteer.experience" class="tag experience-tag">{{ volunteer.experience }}</span>
            <span v-if="volunteer.experienceYears" class="tag">{{ volunteer.experienceYears }}</span>
            <span v-if="volunteer.direction" class="tag direction-tag">{{ volunteer.direction }}</span>
            <span v-for="tag in volunteer.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
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

<style scoped>
/* Фильтры */
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text);
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  flex: 0 1 auto;
  min-width: 140px;
}

.filter-select:hover {
  border-color: #e67e22;
}

.filter-select:focus {
  outline: none;
  border-color: #e67e22;
  box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.2);
}

.filter-select option:checked {
  background: #e67e22;
  color: white;
}

.dark .filter-select {
  background: #252525;
  border-color: #3a3530;
}

.dark .filter-select:hover {
  border-color: #e67e22;
}

/* Кнопка сброса */
.btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e67e22;
  background: transparent;
  color: #e67e22;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-reset:hover {
  background: #e67e22;
  color: white;
  transform: scale(1.02);
}

.btn-reset:active {
  transform: scale(0.95);
}

.btn-reset svg {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.btn-reset:hover svg {
  transform: rotate(30deg);
}

.dark .btn-reset {
  border-color: #e67e22;
  color: #e67e22;
}

.dark .btn-reset:hover {
  background: #e67e22;
  color: #fff;
}

/* Сетка */
.volunteers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

/* Стили для карточек */
.volunteer-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: var(--vp-c-bg-soft);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid var(--vp-c-border);
  position: relative;
}

/* Индикатор открытия в новой вкладке */
.volunteer-card::after {
  content: '↗';
  aspect-ratio: 1 / 1;
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 20px;
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
  color: #e67e22;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  pointer-events: none;
  z-index: 2;
}

.volunteer-card:hover::after {
  opacity: 1;
  transform: translateX(4px);
}

.dark .volunteer-card::after {
  background: rgba(37, 37, 37, 0.9);
}

.dark .volunteer-card {
  background: #252525;
  border-color: #3a3530;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.volunteer-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.dark .volunteer-card:hover {
  box-shadow: 0 16px 40px rgba(230, 126, 34, 0.15);
  border-color: #e67e22;
}

.volunteer-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.4s;
}

.volunteer-card:hover img {
  transform: scale(1.04);
}

.volunteer-card-body {
  padding: 1.5rem;
}

.volunteer-card-body h3 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.volunteer-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
}

.tag {
  display: inline-block;
  background: rgba(230, 126, 34, 0.12);
  color: #e67e22;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Специальные стили для тегов опыта */
.experience-tag {
  background: rgba(52, 152, 219, 0.15);
  color: #2980b9;
  font-weight: 700;
}

.dark .experience-tag {
  background: rgba(52, 152, 219, 0.25);
  color: #5dade2;
}

/* Стили для тегов направления */
.direction-tag {
  background: rgba(46, 204, 113, 0.15);
  color: #27ae60;
}

.dark .direction-tag {
  background: rgba(46, 204, 113, 0.25);
  color: #58d68d;
}

.volunteer-card-body p {
  color: var(--vp-c-text-light);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.2rem;
}

/* Сообщение "ничего не найдено" */
.no-results {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 14px;
  border: 1px solid var(--vp-c-border);
  margin: 2rem 0;
}

.no-results p {
  font-size: 1.2rem;
  color: var(--vp-c-text-light);
  margin-bottom: 1rem;
}

.btn-reset-link {
  padding: 0.6rem 1.5rem;
  background: #e67e22;
  color: white !important;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.btn-reset-link:hover {
  background: #f0a04b;
  transform: scale(1.02);
}

.btn-reset-link:active {
  transform: scale(0.98);
}

/* Кнопка «Загрузить ещё» */
.load-more {
  text-align: center;
  margin: 2rem 0;
}

.btn-load {
  padding: 0.8rem 2rem;
  background: transparent;
  border: 2px solid #e67e22;
  color: #e67e22;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.btn-load:hover {
  background: #e67e22;
  color: #fff;
  transform: scale(1.02);
}

.btn-load:active {
  transform: scale(0.98);
}

/* Состояние загрузки */
.loading-state {
  text-align: center;
  padding: 2rem;
  color: var(--vp-c-text-light);
}

/* Адаптивность */
@media (max-width: 768px) {
  .filters {
    gap: 0.75rem;
  }
  
  .filter-select {
    min-width: 120px;
    flex: 1 1 calc(50% - 0.75rem);
  }
  
  .btn-reset {
    flex: 0 1 auto;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 640px) {
  .filters {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-select {
    min-width: 100%;
    flex: 1 1 100%;
  }
  
  .btn-reset {
    width: 100%;
    justify-content: center;
    padding: 0.6rem;
  }
  
  .volunteers-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .volunteer-card img {
    height: 200px;
  }
  
  .volunteer-card-body {
    padding: 1rem;
  }
  
  .volunteer-card-body h3 {
    font-size: 1.3rem;
  }
  
  .volunteer-card::after {
    top: 8px;
    right: 12px;
    font-size: 16px;
    padding: 2px 6px;
  }
}

@media (max-width: 480px) {
  .volunteer-card-body p {
    font-size: 0.9rem;
  }
  
  .tag {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
  }
  
  .no-results {
    padding: 2rem 1rem;
  }
  
  .no-results p {
    font-size: 1rem;
  }
}
</style>