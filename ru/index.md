---
layout: home
main:
  - type: 'general'
    list:
      - name: 'Заголовок 1'
        description: 'Описание 1'
        img: 'Изображение 1'
        link: 'Ссылка 1'
      - name: 'Заголовок 2'
        description: 'Описание 2'
        img: 'Изображение 2'
        link: 'Ссылка 2'
  - type: 'join'
    list:
      - name: 'Присоединиться'
        description: 'Подари свою заботу тем, кто ждёт — стань частью нашего волонтерского движения'
        img: '/assets/webp/page_join.webp'
        link: '/ru/dobrology/join'
  - type: 'support'
    list:
      - name: 'Поддержать'
        description: 'Корм, лекарства, лежанки и игрушки — каждая вещь помогает животным жить лучше'
        img: '/assets/webp/page_support.webp'
        link: '/ru/dobrology/support'
---

<MainSlider :type="'general'"/>
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>
<ItemsRandom :type="'pets'" :item-type="'cats'"/>
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>
<MainBlock :type="'support'"/>
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>
<MainBlock :type="'join'"/>