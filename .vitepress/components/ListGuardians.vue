<template>
  <div v-if="guardians.length > 0" class="grid-list">
    <div class="grid-cards">
      <a v-for="guardian in guardians" :key="guardian.uuid" :href="`${baseUrl}ru/volunteers/${guardian.slug}`" class="grid-card">
        <div class="grid-meta">
          <span v-if="guardian.experience" class="tag experience-tag">{{ guardian.experience }}</span>
          <span v-if="guardian.direction" class="tag direction-tag">{{ guardian.direction }}</span>
        </div>
        <img :src="guardian.image" :alt="guardian.name" loading="lazy" />
        <div class="grid-card-body">
          <h3>{{ guardian.name }}</h3>
          <p>{{ guardian.description }}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { data as volunteersData } from '../data/volunteers.data'

const props = defineProps({
  guardianUuids: {
    type: Array,
    default: () => []
  }
})

const baseUrl = import.meta.env.BASE_URL
const guardians = volunteersData.filter(v => 
  props.guardianUuids.includes(v.uuid)
)

</script>