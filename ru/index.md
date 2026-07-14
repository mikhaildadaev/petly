---
#layout: home
hero:
  text: "В ДОБРОЛОГИЯХ"
  subtext: "- ты"
  image:
    src: https://yandex.ru/youngcon/static/images/2026/tech/list/search_active.webp
    alt: Собака из приюта
  actions:
    - theme: brand
      text: Посмотреть собак
      link: /ru/dogs
    - theme: alt
      text: Стать волонтёром
      link: /ru/volunteers
features:
  - icon: 🐕
    title: Познакомься
    details: У каждой собаки своя история — узнай её, и ты уже не сможешь остаться равнодушным.
  - icon: 🤝
    title: Подружись
    details: Приходи на прогулку. Посиди рядом. Дай себя обнюхать. Доверие строится шаг за шагом.
  - icon: 🏠
    title: Забери домой
    details: Стань для кого-то целым миром. Это проще, чем кажется — и важнее, чем что-либо ещё.
  - icon: 💛
    title: Помоги делом
    details: Корм, лекарства, тёплые руки. Даже час твоего времени может изменить чью-то жизнь.
---

## Собаки

<RandomPets 
  pet-type="dogs" 
  :count="8" 
  link-url="/ru/dogs" 
  link-text="Все собаки" 
  link-icon="🐕"
/>