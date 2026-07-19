<template>
  <div v-for="(block, blockIndex) in blocks" :key="blockIndex" class="block-section" :class="`block-type-${type}`">
    <h2 class="block-title">{{ block.name }}</h2>
    <div class="block-grid">
      <div v-for="(item, itemIndex) in block.list" :key="itemIndex" class="block-item">
        <div class="block-item-image">
          <img :src="item.image" loading="lazy" :alt="item.description" />
        </div>
        <div class="block-item-content">
          <p>{{ item.description }}</p>
          <div v-if="item.info" class="info">
            <span class="info-trigger" @mouseenter="showTooltip(itemIndex)" @mouseleave="hideTooltip" @click="toggleTooltip(itemIndex)" aria-label="Подробнее">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </span>
            <div v-show="activeTooltip === itemIndex" class="tooltip" @mouseenter="showTooltip(itemIndex)" @mouseleave="hideTooltip">{{ item.info }}</div>
          </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import { useUrlMedia } from '../utils/useUrlMedia'

const props = defineProps({
  type: {
    type: String,
    default: '01'
  }
})

const { frontmatter } = useData()
const activeTooltip = ref(null)
let tooltipTimeout = null
const blocks = computed(() => {
  const rawBlocks = frontmatter.value?.blocks || []
  
  return rawBlocks.map(block => ({
    ...block,
    list: block.list?.map(item => ({
      ...item,
      image: item.image ? useUrlMedia(item.image, 'support', '', 'image') : ''
    })) || []
  }))
})
const showTooltip = (index) => {
  clearTimeout(tooltipTimeout)
  activeTooltip.value = index
}
const hideTooltip = () => {
  tooltipTimeout = setTimeout(() => {
    activeTooltip.value = null
  }, 200)
}
const toggleTooltip = (index) => {
  if (activeTooltip.value === index) {
    activeTooltip.value = null
  } else {
    activeTooltip.value = index
  }
}
</script>
