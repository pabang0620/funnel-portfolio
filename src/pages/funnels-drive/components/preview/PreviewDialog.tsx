import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import ImagePreview from './ImagePreview'
import VideoPreview from './VideoPreview'
import { FileText, File, Download } from 'lucide-react'
import type { FileItem } from '../../types'

interface PreviewDialogProps {
  file: FileItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PreviewDialog({ file, open, onOpenChange }: PreviewDialogProps) {
  if (!file) return null

  const mimeType = file.mime_type ?? ''
  const url = file.preview_url ?? null
  const isLoading = false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{file.file_name}</DialogTitle>
        </DialogHeader>
        {isLoading && <Skeleton className="h-64 w-full rounded-lg" />}
        {!isLoading && url && mimeType.startsWith('image/') && (
          <ImagePreview url={url} fileName={file.file_name} />
        )}
        {!isLoading && url && mimeType.startsWith('video/') && (
          <VideoPreview url={url} fileName={file.file_name} />
        )}
        {!isLoading && url && mimeType === 'application/pdf' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <FileText className="w-16 h-16 text-red-500" />
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
              PDF 열기
            </a>
          </div>
        )}
        {!isLoading && !url && (
          <div className="flex flex-col items-center gap-4 py-8">
            <File className="w-16 h-16 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">미리보기를 지원하지 않는 파일 형식입니다.</p>
            <p className="text-xs text-muted-foreground">{file.file_name}</p>
          </div>
        )}
        {url && (mimeType.startsWith('image/') || mimeType.startsWith('video/') || mimeType === 'application/pdf') && (
          <div className="flex justify-end pt-2 border-t">
            <a href={url} download={file.file_name} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                다운로드
              </Button>
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
