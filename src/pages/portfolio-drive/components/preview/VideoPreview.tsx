interface VideoPreviewProps {
  url: string
  fileName: string
}

export default function VideoPreview({ url, fileName }: VideoPreviewProps) {
  return (
    <div className="w-full bg-black rounded-lg flex items-center justify-center">
      <video
        src={url}
        controls
        className="w-full max-h-[75vh] object-contain rounded"
      >
        <track kind="captions" />
        {fileName} 재생을 지원하지 않는 브라우저입니다.
      </video>
    </div>
  )
}
