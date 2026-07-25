export const pageImages = {
  '/': {
    src: '/assets/webp/main.webp',
    width: 320,
    float: 'center'
  },
  
  '/about/contact': {
    src: '/assets/webp/contact.webp',
    width: 320,
    float: 'left'
  },
  '/about/mission': {
    src: '/assets/webp/mission.webp',
    width: 320,
    float: 'right'
  },
  '/about/tech': {
    src: '/assets/webp/tech.webp',
    width: 320,
    float: 'center'
  },

  '/chance/favorites': {
    src: '/assets/webp/favorites.webp',
    width: 320,
    float: 'center'
  },

  '/dobrology/join': {
    src: '/assets/webp/join.webp',
    width: 320,
    float: 'left'
  },
  '/dobrology/support': {
    src: '/assets/webp/support.webp',
    width: 320,
    float: 'right'
  },

  '/humans/volunteers': {
    src: '/assets/webp/volunteers.webp',
    width: 320,
    float: 'center'
  },

  '/organizations/shelters': {
    src: '/assets/webp/shelters.webp',
    width: 320,
    float: 'center'
  },

  '/pets/cats': {
    src: '/assets/webp/cats.webp',
    width: 320,
    float: 'left'
  },
  '/pets/dogs': {
    src: '/assets/webp/dogs.webp',
    width: 320,
    float: 'right'
  },
  
  '/recommendations/go': {
    src: '/assets/webp/go.webp',
    width: 320,
    float: 'center'
  },
  '/recommendations/health': {
    src: '/assets/webp/health.webp',
    width: 320,
    float: 'left'
  },
  '/recommendations/trouble': {
    src: '/assets/webp/trouble.webp',
    width: 320,
    float: 'right'
  },
  '/recommendations/welfare': {
    src: '/assets/webp/welfare.webp',
    width: 320,
    float: 'center'
  },
  
  default: {
    src: '/assets/webp/default.webp',
    width: 320,
    float: 'center'
  }
}

export function useStylePage(path) {
  const cleanPath = path.replace(/^\/petly/, '').replace(/\/$/, '')
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