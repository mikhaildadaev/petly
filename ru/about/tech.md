---
title: 'Технологии'
description: 'Мы строим мосты из простого тепла, чтоб каждая лапа свой дом обрела'
blocks:
  - type: 'intro'
    title: '«Мы строим мосты из простого тепла, чтоб каждая лапа свой дом обрела.»'
  - type: 'chips'
    title: '... Инфраструктура'
    list:
      - name: 'GitHub'
        image: '/assets/svg/tech_github.svg'
        description: 'Хранение кода, CI/CD через GitHub Actions и бесплатный хостинг на GitHub Pages'
        link: 'https://github.com/'
      - name: 'Cloudinary'
        image: '/assets/svg/tech_cloudinary.svg'
        description: 'Облачное хранилище для аудио/видео записей и изображений с доставкой контента'
        link: 'https://cloudinary.com/'
  - type: 'cubes'
    title: '... Фронтенд'
    list:
      - name: 'Vue 3 & VitePress'
        image: '/assets/svg/tech_vue.svg'
        info: 'Фреймворк для интерфейсов и движок для статических сайтов — экосистема от команды Vue'
      - name: 'JavaScript & TypeScript'
        image: '/assets/svg/tech_ts.svg'
        info: 'Современный JavaScript с поддержкой TypeScript для типобезопасности'
      - name: 'Cascading Style Sheets'
        image: '/assets/svg/tech_css3.svg'
        info: 'Гибкая система стилей с адаптацией под светлую и тёмную тему'
      - name: 'Scalable Vector Graphics'
        image: '/assets/svg/tech_svg.svg'
        info: 'Векторные иконки, которые не теряют качество при масштабировании'
      - name: 'Google Fonts'
        image: '/assets/svg/tech_googlefonts.svg'
        info: 'Шрифты Caveat и Days One для уютной атмосферы'
  - type: 'rects'
    title: '... Лицензия'
    list:
      - name: 'Apache License 2.0'
        description: 'Проект распространяется под лицензией Apache License 2.0. Код открыт и вы можете использовать его в своих проектах'
        link: 'https://www.apache.org/licenses/LICENSE-2.0'
---

# Технологии
<BlockStyle :type="'intro'"/>
<BlockStyle :type="'chips'"/>
<BlockStyle :type="'cubes'"/>
<BlockStyle :type="'rects'"/>

<PageStyle/>