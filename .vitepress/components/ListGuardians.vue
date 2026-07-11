<template>
  <div v-if="!isMobile" class="grid-cards">
    <a v-for="guardian in guardians" :key="guardian.uuid" :href="`${baseUrl}ru/volunteers/${guardian.slug}`" class="aspect-list grid-card">
      <div class="grid-meta">
        <span v-if="guardian.direction" class="tag direction-tag">{{ guardian.direction }}</span>
        <span v-if="guardian.experience" class="tag experience-tag">{{ guardian.experience }}</span>
      </div>
      <img :src="guardian.image" :alt="guardian.name" loading="lazy" />
      <div :class="['grid-card-body', getRandomVolunteerClass(guardian.uuid)]">
        <div class="name">{{ guardian.name }}</div>
        <p>{{ guardian.description }}</p>
      </div>
    </a>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const props = defineProps({
  guardianUuids: {
    type: Array,
    default: () => []
  }
})

const baseUrl = import.meta.env.BASE_URL
const allVolunteers = ref([])
const isLoading = ref(true)

const getRandomVolunteerClass = (uuid) => {

  // Генерируем случайное число от 1 до 30
  const num = Math.floor(Math.random() * 30) + 1
  // Добавляем ведущий ноль (01, 02, ..., 30)
  const formattedNum = num.toString().padStart(2, '0')
  const className = `rand-${formattedNum}`
  
  return className
}

// Загрузка данных напрямую в компоненте
onMounted(async () => {
  try {
    // Динамически получаем все md файлы волонтеров
    const modules = import.meta.glob('/ru/volunteers/*.md')
    
    const loaded = await Promise.all(
      Object.entries(modules)
        .filter(([path]) => !path.endsWith('volunteers_index.md'))
        .map(async ([path, loader]) => {
          const mod = await loader()
          const slug = path.replace('/ru/volunteers/', '').replace('.md', '')
          const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
          
          return {
            slug,
            uuid: fm.uuid || '',
            name: fm.title || slug.charAt(0).toUpperCase() + slug.slice(1),
            description: fm.description || '',
            experience: fm.experience || '',
            direction: fm.direction || '',
            image: fm.image || '/placeholder-volunteer.svg'
          }
        })
    )
    allVolunteers.value = loaded
  } catch (error) {
    console.error('Ошибка загрузки данных волонтеров:', error)
  } finally {
    isLoading.value = false
  }
})

// Фильтруем волонтеров по UUID
const guardians = computed(() => {
  if (!props.guardianUuids || props.guardianUuids.length === 0) {
    return []
  }
  
  return allVolunteers.value.filter(v => 
    props.guardianUuids.includes(v.uuid)
  )
})
</script>