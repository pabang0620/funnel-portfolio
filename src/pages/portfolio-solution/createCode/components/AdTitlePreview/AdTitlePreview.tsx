import { useMemo, useEffect, useRef } from 'react'

interface AdTitlePreviewProps {
  adNumber: string
  mediaName: string
  notes: string
  creatorName: string
  regionName: string
  onTitleChange: (title: string) => void
}

const getTodayString = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

const AdTitlePreview = ({
  adNumber,
  mediaName,
  notes,
  creatorName,
  regionName,
  onTitleChange,
}: AdTitlePreviewProps) => {
  const title = useMemo(() => {
    const adNum =
      adNumber !== null && adNumber !== undefined && adNumber !== ''
        ? `[${adNumber}]`
        : ''
    const media = mediaName || ''
    if (!adNum || !media) return ''

    const prefix = `${adNum}${media}`
    const optionals: string[] = []
    if (notes) optionals.push(notes)
    if (creatorName) optionals.push(creatorName)
    if (regionName) optionals.push(regionName)
    const segments = [...optionals, getTodayString()]
    return `${prefix}_${segments.join('_')}`
  }, [adNumber, mediaName, notes, creatorName, regionName])

  const onTitleChangeRef = useRef(onTitleChange)
  useEffect(() => { onTitleChangeRef.current = onTitleChange })

  useEffect(() => {
    if (onTitleChangeRef.current) onTitleChangeRef.current(title)
  }, [title])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 0', fontSize: '13px', color: '#374151',
      borderTop: '1px solid #f3f4f6', marginTop: '12px',
    }}>
      <span style={{ fontWeight: 600, whiteSpace: 'nowrap', color: '#6b7280', minWidth: '60px' }}>광고제목</span>
      <span style={{
        color: title ? '#111827' : '#9ca3af',
        fontFamily: 'monospace',
        fontSize: '12px',
        wordBreak: 'break-all',
      }}>
        {title || '랜딩번호·매체 입력 시 자동생성'}
      </span>
    </div>
  )
}

export default AdTitlePreview
