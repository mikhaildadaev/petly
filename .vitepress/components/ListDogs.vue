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
    <div class="dogs-grid">
      <a 
        v-for="dog in paginatedDogs" 
        :key="dog.slug" 
        :href="`${baseUrl}ru/dogs/${dog.slug}`" 
        target="_blank" 
        rel="noopener noreferrer"
        class="dog-card"
      >
        <img :src="dog.image" :alt="dog.name" loading="lazy" />
        <div class="dog-card-body">
          <h3>{{ dog.name }}</h3>
          <div class="dog-meta">
            <!-- Возраст - синий -->
            <span v-if="dog.age" class="tag age-tag">{{ dog.age }}</span>
            <!-- Пол - розовый/голубой -->
            <span v-if="dog.gender" class="tag gender-tag">{{ dog.gender }}</span>
            <!-- Размер - зеленый -->
            <span v-if="dog.size" class="tag size-tag">{{ dog.size }}</span>
            <!-- Дополнительные теги - оранжевые -->
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
.dogs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

/* Стили для карточек */
.dog-card {
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
.dog-card::after {
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

.dog-card:hover::after {
  opacity: 1;
  transform: translateX(4px);
}

.dark .dog-card::after {
  background: rgba(37, 37, 37, 0.9);
}

.dark .dog-card {
  background: #252525;
  border-color: #3a3530;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dog-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
}

.dark .dog-card:hover {
  box-shadow: 0 16px 40px rgba(230, 126, 34, 0.15);
  border-color: #e67e22;
}

.dog-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.4s;
}

.dog-card:hover img {
  transform: scale(1.04);
}

.dog-card-body {
  padding: 1.5rem;
}

.dog-card-body h3 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.dog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
}

/* ===== ОБЩИЙ СТИЛЬ ДЛЯ ВСЕХ ТЕГОВ ===== */
.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* ===== ЦВЕТОВАЯ ДИФФЕРЕНЦИАЦИЯ ТЕГОВ ===== */

/* Возраст - синий (как опыт у волонтеров) */
.age-tag {
  background: rgba(52, 152, 219, 0.15);
  color: #2980b9;
}

.dark .age-tag {
  background: rgba(52, 152, 219, 0.25);
  color: #5dade2;
}

/* Пол - розовый для девочек, голубой для мальчиков */
.gender-tag {
  background: rgba(231, 76, 60, 0.12);
  color: #e74c3c;
}

/* Альтернативный подход через динамические классы в шаблоне 
   Но проще использовать разные цвета для девочек и мальчиков */
.dog-meta .gender-tag[data-gender="Мальчик"] {
  background: rgba(52, 73, 94, 0.15);
  color: #2c3e50;
}

.dark .dog-meta .gender-tag[data-gender="Мальчик"] {
  background: rgba(52, 73, 94, 0.25);
  color: #5d6d7e;
}

/* Размер - зеленый (как направление у волонтеров) */
.size-tag {
  background: rgba(46, 204, 113, 0.15);
  color: #27ae60;
}

.dark .size-tag {
  background: rgba(46, 204, 113, 0.25);
  color: #58d68d;
}

/* Дополнительные теги - оранжевые (как у волонтеров) */
.extra-tag {
  background: rgba(230, 126, 34, 0.12);
  color: #e67e22;
}

.dark .extra-tag {
  background: rgba(230, 126, 34, 0.2);
  color: #f39c12;
}

/* Специальный цвет для тега "Мальчик" */
.gender-tag:not(:empty) {
  background: rgba(52, 73, 94, 0.15);
  color: #2c3e50;
}

/* Если в теге "Девочка" - розовый */
.gender-tag:not(:empty) {
  background: rgba(231, 76, 60, 0.12);
  color: #e74c3c;
}

/* Но нужно различать по содержимому, используем атрибут */
.dog-meta .gender-tag {
  background: rgba(231, 76, 60, 0.12);
  color: #e74c3c;
}

.dog-card-body p {
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
  
  .dogs-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .dog-card img {
    height: 200px;
  }
  
  .dog-card-body {
    padding: 1rem;
  }
  
  .dog-card-body h3 {
    font-size: 1.3rem;
  }
  
  .dog-card::after {
    top: 8px;
    right: 12px;
    font-size: 16px;
    padding: 2px 6px;
  }
}

@media (max-width: 480px) {
  .dog-card-body p {
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