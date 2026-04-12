import { useState, useCallback } from 'react'
import { CloudUpload, X, Loader2 } from 'lucide-react'
import { mockUploadFile } from '@/data/ad-content-storage/mockService'

interface UploadDropzoneProps {
  currentPath?: string
  onUploadComplete?: (uploadedFiles: Array<{ id: string; name: string }>) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadDropzone({ currentPath, onUploadComplete }: UploadDropzoneProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})

  const addFiles = useCallback((newFiles: File[]) => {
    setPendingFiles(prev => {
      const filtered = newFiles.filter(
        f => !prev.some(p => p.name === f.name && p.size === f.size)
      )
      return [...prev, ...filtered]
    })
    for (const file of newFiles) {
      const url = URL.createObjectURL(file)
      setPreviewUrls(prev => ({ ...prev, [file.name + file.size]: url }))
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }, [addFiles])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    addFiles(files)
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setPendingFiles(prev => {
      const removed = prev[index]
      const key = removed.name + removed.size
      setPreviewUrls(prev => {
        const next = { ...prev }
        if (next[key]) {
          URL.revokeObjectURL(next[key])
          delete next[key]
        }
        return next
      })
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return
    setUploading(true)
    setProgress(0)
    const results: Array<{ id: string; name: string }> = []
    for (let i = 0; i < pendingFiles.length; i++) {
      const result = await mockUploadFile(pendingFiles[i], currentPath)
      results.push(result)
      setProgress(Math.round(((i + 1) / pendingFiles.length) * 100))
    }
    // cleanup preview URLs
    Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url))
    setUploading(false)
    setPendingFiles([])
    setPreviewUrls({})
    setProgress(0)
    onUploadComplete?.(results)
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setIsDragActive(true) }}
        onDragLeave={() => setIsDragActive(false)}
        className={[
          'flex flex-col items-center justify-center gap-4 p-10',
          'border-2 border-dashed rounded-lg transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80 bg-muted/30',
          uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        ].join(' ')}
      >
        <CloudUpload className="w-12 h-12 text-muted-foreground" />
        {uploading ? (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>업로드 중... {progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">파일을 드래그하거나 클릭하여 업로드</p>
              <p className="text-xs text-muted-foreground mt-1">이미지, 영상, ZIP 파일 지원</p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleInputChange}
                className="hidden"
                accept="image/*,video/*,.zip"
                disabled={uploading}
              />
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors">
                파일 선택
              </span>
            </label>
          </>
        )}
      </div>

      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">선택된 파일 ({pendingFiles.length}개)</h3>
            <button
              onClick={() => {
                Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url))
                setPendingFiles([])
                setPreviewUrls({})
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
              disabled={uploading}
            >
              전체 삭제
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pendingFiles.map((file, index) => {
              const previewKey = file.name + file.size
              const preview = previewUrls[previewKey]
              const isImage = file.type.startsWith('image/')
              return (
                <div key={previewKey} className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg border border-border">
                  {isImage && preview ? (
                    <img src={preview} alt={file.name} className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      <CloudUpload className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
          {!uploading && (
            <button
              onClick={handleUpload}
              className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md transition-colors"
            >
              {pendingFiles.length}개 파일 업로드
            </button>
          )}
        </div>
      )}
    </div>
  )
}
