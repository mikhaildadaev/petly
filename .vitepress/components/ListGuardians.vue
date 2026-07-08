<template>
  <div v-if="guardians.length > 0" class="guardians-list">
    <div class="guardians-grid">
      <a
        v-for="guardian in guardians"
        :key="guardian.uuid"
        :href="`${baseUrl}ru/volunteers/${guardian.slug}`"
        class="guardian-card"
      >
        <img :src="guardian.image" :alt="guardian.name" loading="lazy" />
        <div class="guardian-card-body">
          <h3>{{ guardian.name }}</h3>
          <p>{{ guardian.description }}</p>
          <div class="guardian-meta">
            <span v-if="guardian.experience" class="tag">{{ guardian.experience }}</span>
            <span v-if="guardian.direction" class="tag">{{ guardian.direction }}</span>
          </div>
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

<style scoped>
.guardians-list {
  margin: 2rem 0;
}

.guardians-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.guardian-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid var(--vp-c-border);
}

.guardian-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.guardian-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.guardian-card-body {
  padding: 1rem;
}

.guardian-card-body h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.guardian-card-body p {
  font-size: 0.9rem;
  color: var(--vp-c-text-light);
  line-height: 1.5;
  margin: 0 0 0.5rem;
}

.guardian-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tag {
  display: inline-block;
  background: rgba(230, 126, 34, 0.12);
  color: #e67e22;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>