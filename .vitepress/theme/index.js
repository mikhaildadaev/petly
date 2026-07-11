import DefaultTheme from 'vitepress/theme'
import CardPet from '../components/CardPet.vue'
import CardVolunteer from '../components/CardVolunteer.vue'
import GalleryPhoto from '../components/GalleryPhoto.vue'
import ListGuardians from '../components/ListGuardians.vue'
import ListPets from '../components/ListPets.vue'
import ListVolunteers from '../components/ListVolunteers.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CardPet', CardPet)
    app.component('CardVolunteer', CardVolunteer)
    app.component('GalleryPhoto', GalleryPhoto)
    app.component('ListGuardians', ListGuardians)
    app.component('ListPets', ListPets)
    app.component('ListVolunteers', ListVolunteers)
  }
}