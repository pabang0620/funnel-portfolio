export interface MediaFileEntry {
  name: string
  path: string
  type: 'image' | 'video'
  blobUrl: string
  size: number
}

export function cleanupBlobUrls(entries: MediaFileEntry[]) {
  entries.forEach(entry => {
    URL.revokeObjectURL(entry.blobUrl)
  })
}

export function isZipFile(fileType: string, fileName: string): boolean {
  return (
    fileType === 'application/zip' ||
    fileType === 'application/x-zip-compressed' ||
    fileName.toLowerCase().endsWith('.zip')
  )
}
