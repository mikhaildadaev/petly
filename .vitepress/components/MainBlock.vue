<template>
  <section v-if="items && items.length" class="main-block">
    <div class="list">
      <div v-for="(item, index) in items" :key="index" class="item">
        <h1 class="title">{{ item.name }}</h1>
        <p class="description">{{ item.description }}</p>
        <a v-if="item.link" :href="item.link" class="link">Подробнее →</a>
        <img v-if="item.img" :src="item.img" :alt="item.name" class="image" loading="lazy"/>
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