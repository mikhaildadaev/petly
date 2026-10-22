---
layout: home
main:
  - type: 'general'
    list:
      - name: 'Миссия'
        description: 'Мы верим, что каждый питомец заслуживает дом, а каждый человек может стать частью доброго дела.'
        img: '/assets/webp/page_mission.webp'
        link: '/ru/about/mission'
      - name: 'Контакты'
        description: 'Свяжитесь с нами — если хотите помочь, присоединиться или просто задать вопрос.'
        img: '/assets/webp/page_contacts.webp'
        link: '/ru/about/contacts'
  - type: 'favorites'
    list:
      - name: 'Любимцы'
        description: 'Питомцы, что покорили ваше сердце, чьи фотографии вы пересматриваете по несколько раз. Те, кого вы уже мысленно назвали своим.'
        img: '/assets/webp/page_favorites.webp'
        link: '/ru/pets/favorites'
  - type: 'join'
    list:
      - name: 'Присоединиться'
        description: 'Подари свою заботу тем, кто ждёт — стань частью нашего волонтерского движения.'
        img: '/assets/webp/page_join.webp'
        link: '/ru/dobrology/join'
  - type: 'support'
    list:
      - name: 'Поддержать'
        description: 'Корм, лекарства, лежанки и игрушки — каждая вещь помогает животным жить лучше.'
        img: '/assets/webp/page_support.webp'
        link: '/ru/dobrology/support'
---

<MainCarusel :type="'general'"/>
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>
<ItemsRandom :type="'pets'" :item-type="'cats'"/>
<MainBlock :type="'favorites'"/>
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>
<MainBlock :type="'support'"/>
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>
<MainBlock :type="'join'"/>