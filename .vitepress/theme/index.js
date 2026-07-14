import DefaultTheme from 'vitepress/theme'
import CardHumanHero from '../components/CardHumanHero.vue'
import CardPetHero from '../components/CardPetHero.vue'
import GalleryMedia from '../components/GalleryMedia.vue'
import ListHumans from '../components/ListHumans.vue'
import ListPets from '../components/ListPets.vue'
import RandomPets from '../components/RandomPets.vue'
import SelectHumans from '../components/SelectHumans.vue'
import SelectPets from '../components/SelectPets.vue'
import StyleImagePage from '../components/StyleImagePage.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CardHumanHero', CardHumanHero)
    app.component('CardPetHero', CardPetHero)
    app.component('GalleryMedia', GalleryMedia)
    app.component('ListHumans', ListHumans)
    app.component('ListPets', ListPets)
    app.component('RandomPets', RandomPets)
    app.component('SelectHumans', SelectHumans)
    app.component('SelectPets', SelectPets)
    app.component('StyleImagePage', StyleImagePage)
  }
}