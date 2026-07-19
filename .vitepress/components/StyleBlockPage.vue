<template>
  <div class="style-block-page" @click="closeAllTooltips">
    <div v-for="(block, blockIndex) in filteredBlocks" :key="blockIndex" class="block-section">
      <div v-if="block.type === 'cubes'" :class="`block-type-${type}`">
        <div class="block-title">{{ block.name }}</div>
        <div class="block-grid">
          <div v-for="(item, itemIndex) in block.list" :key="itemIndex" class="block-item">
            <div class="block-item-image">
              <img :src="item.image" loading="lazy" />
            </div>
            <div class="block-item-content">
              <p>{{ item.point }}</p>
              <span v-if="item.info" class="info-trigger" @click.stop="toggleTooltip(`${blockIndex}-${itemIndex}`)" aria-label="Подробнее">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </span>
              <div v-show="activeTooltip === `${blockIndex}-${itemIndex}`" class="tooltip" @click.stop>{{ item.info }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="block.type === 'social'" :class="`block-type-${type}`">
        <div class="background">
          <div class="block-title">{{ block.name }}</div>
        </div>
        <div class="block-grid">
          <div class="block-item">
            <div class="block-item-content">
              <p>{{ block.description }}</p>
              <a v-for="(item, itemIndex) in block.list" :href="item.url" :key="itemIndex" class="block-item-link">{{ item.link }}</a>
            </div>
          </div>
          <div class="block-item">
            <img :src="block.image" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useData } from 'vitepress'
import { useUrlMedia } from '../utils/useUrlMedia'

const props = defineProps({
  type: {
    type: String,
    default: 'default'
  }
})
const { frontmatter } = useData()
const activeTooltip = ref(null)
const filteredBlocks = computed(() => {
  const rawBlocks = frontmatter.value?.blocks || []
  const matchedBlocks = rawBlocks.filter(block => block.type === props.type)
  return matchedBlocks.map(block => ({
    ...block,
    image: block.image ? useUrlMedia(block.image, 'support', '', 'image') : '',
    list: block.list?.map(item => ({
      ...item,
      image: item.image ? useUrlMedia(item.image, 'support', '', 'image') : ''
    })) || []
  }))
})
const toggleTooltip = (id) => {
  if (activeTooltip.value === id) {
    activeTooltip.value = null
  } else {
    activeTooltip.value = id
  }
}
const closeAllTooltips = () => {
  activeTooltip.value = null
}
const handleGlobalClick = (event) => {
  const target = event.target
  if (!target.closest('.info-trigger') && !target.closest('.tooltip')) {
    activeTooltip.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleGlobalClick)
})
</script>