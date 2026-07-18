const MEDIA_CONFIG = {
  audio: {
    folder: 'audios',
    extension: 'mp3',
    placeholder: 'placeholder-audio'
  },
  image: {
    folder: 'images',
    extension: 'webp',
    placeholder: 'placeholder-image'
  },
  photos: {
    folder: 'photos',
    extension: 'webp',
    placeholder: 'placeholder-photos'
  },
  video: {
    folder: 'videos',
    extension: 'mp4',
    placeholder: 'placeholder-video'
  }
}
export const useUrlMedia = (mediaPath, type, uuid, format = 'image') => {
  const baseUrl = import.meta.env.BASE_URL
  const config = MEDIA_CONFIG[format] || MEDIA_CONFIG.image
  if (!mediaPath) {
    return `${baseUrl}${config.folder}/${type}/${uuid}.${config.extension}`
  }
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath
  }
  if (mediaPath.startsWith('/')) {
    return `${baseUrl}${mediaPath.slice(1)}`
  }
  return mediaPath
}
export const getPlaceholder = (format = 'image') => {
  const baseUrl = import.meta.env.BASE_URL
  const config = MEDIA_CONFIG[format] || MEDIA_CONFIG.image
  return `${baseUrl}${config.folder}/${config.placeholder}.svg`
}