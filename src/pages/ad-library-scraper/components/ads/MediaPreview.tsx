import { useState } from 'react'
import { Play } from 'lucide-react'
import { getYouTubeThumbnail } from '../../lib/media'

function toYouTubeEmbedUrl(url: string): string {
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`
  if (url.includes('/embed/')) return url
  return url
}

interface MediaPreviewProps {
  contentUrl: string
  thumbnailUrl?: string | null
  previewOnly?: boolean
}

function VideoThumbnail({ src, className }: { src: string; className?: string }) {
  const [imgError, setImgError] = useState(false)
  return (
    <div className={`overflow-hidden ${className ?? ''}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-900" />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <div className="bg-white/90 rounded-full p-3 shadow-md">
          <Play className="h-6 w-6 text-gray-800 fill-gray-800" />
        </div>
      </div>
    </div>
  )
}

export function MediaPreview({ contentUrl, thumbnailUrl, previewOnly = false }: MediaPreviewProps) {
  const [imgError, setImgError] = useState(false)
  const objectFit = previewOnly ? 'object-cover' : 'object-contain'

  if (!contentUrl) {
    return (
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-muted text-muted-foreground text-sm">
        미리보기 없음
      </div>
    )
  }

  // Video (mp4 etc)
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(contentUrl)) {
    if (previewOnly) {
      return <VideoThumbnail src={thumbnailUrl || ''} className="absolute inset-0 w-full h-full" />
    }
    return (
      <div className="relative w-full h-full overflow-hidden">
        <video
          src={contentUrl}
          poster={thumbnailUrl || undefined}
          controls
          muted
          className={`absolute inset-0 w-full h-full ${objectFit}`}
        />
      </div>
    )
  }

  // YouTube iframe
  if (contentUrl.includes('youtube.com') || contentUrl.includes('youtu.be')) {
    if (previewOnly) {
      return <VideoThumbnail src={thumbnailUrl || getYouTubeThumbnail(contentUrl) || ''} className="absolute inset-0 w-full h-full" />
    }
    return (
      <div className="relative w-full h-full overflow-hidden">
        <iframe
          src={toYouTubeEmbedUrl(contentUrl)}
          title="Ad video"
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  // sadbundle iframe (Google HTML ads)
  if (contentUrl.includes('sadbundle') || contentUrl.includes('/index.html')) {
    if (previewOnly) {
      return (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900">
          <Play className="h-8 w-8 text-white/40" />
        </div>
      )
    }
    return (
      <div className="relative w-full h-full overflow-hidden">
        <iframe
          src={contentUrl}
          title="Ad creative"
          sandbox="allow-scripts"
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }

  // Image
  if (imgError) {
    return (
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-muted text-muted-foreground text-sm">
        미리보기 없음
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={contentUrl}
        alt="Ad creative"
        className={`absolute inset-0 w-full h-full ${objectFit}`}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    </div>
  )
}
