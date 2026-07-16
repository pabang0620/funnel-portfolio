import { useCallback } from 'react'
import { toast } from 'sonner'
import { mockFiles } from '../../../data/file-hub/mockService'

interface UseFileUploadOptions {
  folderId: string | null
  onSuccess?: () => void
}

export function useFileUpload({ folderId, onSuccess }: UseFileUploadOptions) {
  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!folderId) {
        toast.error('업로드할 폴더를 선택하세요.')
        return
      }

      for (const file of files) {
        try {
          mockFiles.uploadFile(file, folderId)
          toast.success(`"${file.name}" 업로드 완료`)
        } catch {
          toast.error(`"${file.name}" 업로드 실패`)
        }
      }

      onSuccess?.()
    },
    [folderId, onSuccess],
  )

  return { uploadFiles }
}
