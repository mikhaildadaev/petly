---
layout: home
hero:
  text: "В ДОБРОЛОГИЯХ"
  subtext: "- ты"
  actions:
    - theme: brand
      text: Посмотреть кошек
      link: /ru/pets/cats
    - theme: brand
      text: Посмотреть собак
      link: /ru/pets/dogs
features:
  - icon: 🐕
    title: Познакомься
    details: У каждой собаки своя история — узнай её, и ты уже не сможешь остаться равнодушным.
  - icon: 🤝
    title: Подружись
    details: Приходи на прогулку. Посиди рядом. Дай себя обнюхать. Доверие строится шаг за шагом.
  - icon: 💛
    title: Помоги делом
    details: Корм, лекарства, тёплые руки. Даже час твоего времени может изменить чью-то жизнь.
  - icon: 🏠
    title: Забери домой
    details: Стань для кого-то целым миром. Это проще, чем кажется — и важнее, чем что-либо ещё.
---


## Cats

<RandomPets type="cats" :count="8"/>

## Dogs

<RandomPets type="dogs" :count="8"/>

## Volunteers

<RandomHumans type="volunteers" :count="8"/>