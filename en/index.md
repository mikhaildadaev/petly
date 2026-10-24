---
layout: home
main:
  - type: 'general'
    list:
      - name: 'Mission'
        description: 'We believe that every pet deserves a home, and every person can become part of a good deed.'
        img: '/assets/webp/page_mission.webp'
        link: '/en/about/mission'
      - name: 'Contacts'
        description: 'Contact us — if you want to help, join us, or just ask a question.'
        img: '/assets/webp/page_contacts.webp'
        link: '/en/about/contacts'
      - name: 'Technologies'
        description: 'We build bridges out of simple warmth, so every paw can find its home.'
        img: '/assets/webp/page_tech.webp'
        link: '/en/about/tech'
  - type: 'favorites'
    list:
      - name: 'Favorites'
        description: 'Pets that have won your heart, whose photos you rewatch several times. Those whom you have already mentally named as your own.'
        img: '/assets/webp/page_favorites.webp'
        link: '/en/pets/favorites'
  - type: 'join'
    list:
      - name: 'Join us'
        description: 'Share your care with those who are waiting — become part of our volunteer movement.'
        img: '/assets/webp/page_join.webp'
        link: '/en/dobrology/join'
  - type: 'support'
    list:
      - name: 'Support'
        description: 'Food, medicine, beds and toys — every item helps animals live better.'
        img: '/assets/webp/page_support.webp'
        link: '/en/dobrology/support'
---

<MainCarusel :type="'general'"/>
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>
<ItemsRandom :type="'pets'" :item-type="'cats'"/>
<MainBlock :type="'favorites'"/>
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>
<MainBlock :type="'support'"/>
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>
<MainBlock :type="'join'"/>