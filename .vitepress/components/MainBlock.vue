<template>
  <section v-if="items && items.length" class="main-block">
    <div class="main-block-list">
      <div v-for="(item, index) in items" :key="index" class="main-block-item">
        <h3 class="title">{{ item.name }}</h3>
        <p class="description">{{ item.description }}</p>
        <a v-if="item.link" :href="item.link" class="link">Подробнее →</a>
      </div>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useData } from 'vitepress'

export default {
  name: 'MainBlock',
  props: {
    type: { type: String, required: true }
  },
  setup(props) {
    const { frontmatter } = useData()
    const items = computed(() => {
      const mainArray = frontmatter.value?.main || []
      const block = mainArray.find(item => item.type === props.type)
      return block ? block.list : []
    })
    return {
      items
    }
  }
}
</script>