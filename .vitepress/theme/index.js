import DefaultTheme from 'vitepress/theme'
import CardDog from '../components/CardDog.vue'
import CardVolunteer from '../components/CardVolunteer.vue'
import GalleryPhoto from '../components/GalleryPhoto.vue'
import ListDogs from '../components/ListDogs.vue'
import ListGuardians from '../components/ListGuardians.vue'
import ListVolunteers from '../components/ListVolunteers.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CardDog', CardDog)
    app.component('CardVolunteer', CardVolunteer)
    app.component('GalleryPhoto', GalleryPhoto)
    app.component('ListDogs', ListDogs)
    app.component('ListGuardians', ListGuardians)
    app.component('ListVolunteers', ListVolunteers)
  }
}