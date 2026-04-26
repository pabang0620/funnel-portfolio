import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { useFileUpload } from '../../hooks/useFileUpload'
import { cn } from '../../lib/utils'

interface UploadDropzoneProps {
  folderId: string | null
  onUploadComplete: () => void
  children: React.ReactNode
}

export default function UploadDropzone({ folderId, onUploadComplete, children }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const { uploadFiles } = useFileUpload({ folderId, onSuccess: onUploadComplete })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false)
      uploadFiles(acceptedFiles)
    },
    [uploadFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    noClick: true,
    noKeyboard: true,
  })

  return (
    <div {...getRootProps()} className="relative flex-1 flex flex-col min-h-0">
      <input {...getInputProps()} />
      {children}
      {(isDragActive || isDragging) && (
        <div className={cn(
          'absolute inset-0 z-50 flex flex-col items-center justify-center',
          'bg-blue-50/90 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none',
        )}>
          <Upload className="w-12 h-12 text-blue-500 mb-3" />
          <p className="text-blue-700 font-semibold text-lg">이 폴더에 파일 업로드</p>
          <p className="text-blue-500 text-sm mt-1">파일을 여기에 드롭하세요</p>
        </div>
      )}
    </div>
  )
}
