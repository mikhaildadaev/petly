export const pageImages = {
  
  '/': {
    src: '/assets/webp/page_main.webp',
    width: 312,
    float: 'center'
  },
  
  '/about/contacts': {
    src: '/assets/webp/page_contacts.webp',
    width: 312,
    float: 'center'
  },
  '/about/mission': {
    src: '/assets/webp/page_mission.webp',
    width: 312,
    float: 'center'
  },
  '/about/tech': {
    src: '/assets/webp/page_tech.webp',
    width: 312,
    float: 'center'
  },

  '/dobrology/join': {
    src: '/assets/webp/page_join.webp',
    width: 312,
    float: 'center'
  },
  '/dobrology/support': {
    src: '/assets/webp/page_support.webp',
    width: 312,
    float: 'center'
  },

  '/humans/volunteers': {
    src: '/assets/webp/page_volunteers.webp',
    width: 312,
    float: 'center'
  },

  '/organizations/shelters': {
    src: '/assets/webp/page_shelters.webp',
    width: 312,
    float: 'center'
  },

  '/pets/cats': {
    src: '/assets/webp/page_cats.webp',
    width: 312,
    float: 'center'
  },
  '/pets/dogs': {
    src: '/assets/webp/page_dogs.webp',
    width: 312,
    float: 'center'
  },
  '/pets/favorites': {
    src: '/assets/webp/page_favorites.webp',
    width: 312,
    float: 'center'
  },
  
  '/recommendations/go': {
    src: '/assets/webp/page_go.webp',
    width: 312,
    float: 'center'
  },
  '/recommendations/health': {
    src: '/assets/webp/page_health.webp',
    width: 312,
    float: 'center'
  },
  '/recommendations/protection': {
    src: '/assets/webp/page_protection.webp',
    width: 312,
    float: 'center'
  },
  '/recommendations/trouble': {
    src: '/assets/webp/page_trouble.webp',
    width: 312,
    float: 'center'
  },
  
  default: {
    src: '/assets/webp/page_default.webp',
    width: 312,
    float: 'center'
  }
  
}

export function usePageStyle(path) {
  const cleanPath = path.replace(/\/$/, '')
  if (!cleanPath || cleanPath === '/') {
    return pageImages['/']
  }
  if (pageImages[cleanPath]) {
    return pageImages[cleanPath]
  }
  const matchingKey = Object.keys(pageImages).find(key => 
    key !== 'default' && cleanPath.startsWith(key)
  )
  if (matchingKey) {
    return pageImages[matchingKey]
  }
  return pageImages.default
}