interface ImagePreviewProps {
  url: string
  fileName: string
}

export default function ImagePreview({ url, fileName }: ImagePreviewProps) {
  return (
    <div className="flex items-center justify-center p-4 bg-black/5 rounded-lg min-h-64">
      <img
        src={url}
        alt={fileName}
        className="max-w-full max-h-[60vh] object-contain rounded"
      />
    </div>
  )
}
