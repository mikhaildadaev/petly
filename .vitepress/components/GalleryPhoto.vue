<template>
  <div>
    <div class="gallery-grid">
      <div
        v-for="(img, index) in images"
        :key="index"
        class="gallery-item"
        @click="openLightbox(index)"
      >
        <img :src="img" :alt="'Фото ' + (index + 1)" loading="lazy" />
      </div>
    </div>

    <!-- Лайтбокс -->
    <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
      <button class="lightbox-close" @click="closeLightbox">✕</button>
      <button class="lightbox-prev" @click="prevImage">‹</button>
      <img :src="images[currentIndex]" />
      <button class="lightbox-next" @click="nextImage">›</button>
      <div class="lightbox-counter">{{ currentIndex + 1 }} / {{ images.length }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    images: { type: Array, required: true }
  },
  data() {
    return { lightboxOpen: false, currentIndex: 0 }
  },
  methods: {
    openLightbox(i) { this.currentIndex = i; this.lightboxOpen = true },
    closeLightbox() { this.lightboxOpen = false },
    nextImage() { this.currentIndex = (this.currentIndex + 1) % this.images.length },
    prevImage() { this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length }
  }
}
</script>

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin: 1.5rem 0;
}
.gallery-item {
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border, #3a3530);
  transition: transform 0.2s;
}
.gallery-item:hover { transform: scale(1.03); }
.gallery-item img {
  width: 100%; height: 100%; object-fit: cover;
}
.lightbox {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.95); z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.lightbox img {
  max-width: 90vw; max-height: 85vh; object-fit: contain;
}
.lightbox-close {
  position: absolute; top: 20px; right: 30px;
  background: none; border: none; color: #fff;
  font-size: 2.5rem; cursor: pointer;
}
.lightbox-prev, .lightbox-next {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.1); border: none; color: #fff;
  font-size: 3rem; cursor: pointer; padding: 0.5rem 1rem;
}
.lightbox-prev { left: 20px; }
.lightbox-next { right: 20px; }
.lightbox-counter {
  position: absolute; bottom: 20px;
  color: rgba(255,255,255,0.7);
}
</style>