---
layout: home
main:
  - type: 'general'
    list:
      - name: 'Überschrift 1'
        description: 'Die Beschreibung 1'
        img: 'Bild 1'
        link: 'Der Link 1'
      - name: 'Überschrift 2'
        description: 'Die Beschreibung 2'
        img: 'Bild 2'
        link: 'Der Link 2'
  - type: 'join'
    list:
      - name: 'Mitmachen'
        description: 'Schenke deine Fürsorge denen, die warten – werde Teil unserer Freiwilligenbewegung.'
        img: '/assets/webp/page_join.webp'
        link: '/de/dobrology/join'
  - type: 'support'
    list:
      - name: 'Unterstützen'
        description: 'Futter, Medikamente, Körbchen und Spielzeug – jeder Gegenstand hilft den Tieren, ein besseres Leben zu führen'
        img: '/assets/webp/page_support.webp'
        link: '/de/dobrology/support'
---

<MainSlider :type="'general'"/>

## Hunde
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Katzen
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Tierheime
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>

<MainBlock :type="'support'"/>

## Freiwillige
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

<MainBlock :type="'join'"/>