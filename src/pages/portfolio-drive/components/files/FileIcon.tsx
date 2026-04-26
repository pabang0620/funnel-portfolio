import { FileText, File, Video } from 'lucide-react'

interface FileIconProps {
  mimeType: string | null
  previewUrl?: string | null
  className?: string
  size?: number
}

export default function FileIcon({
  mimeType,
  previewUrl,
  className = '',
  size = 40,
}: FileIconProps) {
  if (!mimeType) {
    return <File className={className} style={{ width: size, height: size, color: '#6b7280' }} />
  }

  if (mimeType.startsWith('image/')) {
    if (previewUrl) {
      return (
        <img
          src={previewUrl}
          alt=""
          className={`object-cover rounded ${className}`}
          style={{ width: size, height: size }}
        />
      )
    }
    return <File className={className} style={{ width: size, height: size, color: '#10b981' }} />
  }

  if (mimeType.startsWith('video/')) {
    return <Video className={className} style={{ width: size, height: size, color: '#6366f1' }} />
  }

  if (mimeType === 'application/pdf') {
    return <FileText className={className} style={{ width: size, height: size, color: '#ef4444' }} />
  }

  return <File className={className} style={{ width: size, height: size, color: '#6b7280' }} />
}
