---
layout: home
main:
  - type: 'general'
    list:
      - name: 'Mission'
        description: 'Wir glauben, dass jedes Tier ein Zuhause verdient.'
        img: '/assets/webp/page_mission.webp'
        link: '/de/about/mission'
      - name: 'Kontakte'
        description: 'Nehmen Sie Kontakt mit uns auf – wenn Sie helfen, mitmachen oder einfach eine Frage stellen möchten.'
        img: '/assets/webp/page_contacts.webp'
        link: '/de/about/contacts'
      - name: 'Technologien'
        description: 'Wir bauen Brücken aus einfacher Wärme, damit jede Pfote ihr Zuhause findet.'
        img: '/assets/webp/page_tech.webp'
        link: '/de/about/tech'
  - type: 'favorites'
    list:
      - name: 'Favoriten'
        description: 'Haustiere, die Ihr Herz erobert haben, deren Fotos Sie mehrmals überprüfen. Diejenigen, die du bereits mental als deine bezeichnet hast.'
        img: '/assets/webp/page_favorites.webp'
        link: '/de/pets/favorites'
  - type: 'join'
    list:
      - name: 'Mitmachen'
        description: 'Schenke deine Fürsorge denen, die warten – werde Teil unserer Freiwilligenbewegung.'
        img: '/assets/webp/page_join.webp'
        link: '/de/dobrology/join'
  - type: 'support'
    list:
      - name: 'Unterstützen'
        description: 'Futter, Medikamente, Körbchen und Spielzeug – jeder Gegenstand hilft den Tieren, ein besseres Leben zu führen.'
        img: '/assets/webp/page_support.webp'
        link: '/de/dobrology/support'
---

<MainCarusel :type="'general'"/>
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>
<ItemsRandom :type="'pets'" :item-type="'cats'"/>
<MainBlock :type="'favorites'"/>
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>
<MainBlock :type="'support'"/>
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>
<MainBlock :type="'join'"/>