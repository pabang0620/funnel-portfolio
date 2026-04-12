import { useState, useEffect, useMemo } from 'react'
import { Music, FileText, Folder } from 'lucide-react'
import BulkPathEditModal from './BulkPathEditModal'

function PreviewTable({ previewResults, onConfirm, onCancel, onBulkEdit, selectedIndices, setSelectedIndices }) {
  const [modifiedResults, setModifiedResults] = useState([])
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)

  useEffect(() => {
    if (previewResults) {
      setModifiedResults([...previewResults])
      setSelectedIndices(new Set())
    }
  }, [previewResults])

  const availableBrands = useMemo(() => {
    const brands = new Set(
      modifiedResults
        .map(r => r.brand_name)
        .filter(brand => brand)
    )
    return Array.from(brands).sort()
  }, [modifiedResults])

  const availableConsultants = useMemo(() => {
    const consultants = new Set(
      modifiedResults
        .map(r => r.consultant_name)
        .filter(consultant => consultant)
    )
    return Array.from(consultants).sort()
  }, [modifiedResults])

  const toggleSelectAll = () => {
    if (selectedIndices.size === modifiedResults.length) {
      setSelectedIndices(new Set())
    } else {
      const newSet = new Set(modifiedResults.map((_, idx) => idx))
      setSelectedIndices(newSet)
    }
  }

  const toggleSelect = (index) => {
    const newSet = new Set(selectedIndices)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setSelectedIndices(newSet)
  }

  const applyBulkPathChange = (brand, consultant, date) => {
    const newResults = [...modifiedResults]

    selectedIndices.forEach(index => {
      const result = newResults[index]
      newResults[index] = {
        ...result,
        s3_path_korean: `${brand}/${consultant}/${date}/${result.filename}`
      }
    })

    setModifiedResults(newResults)
    setShowBulkEditModal(false)
  }

  const getMatchStatusLabel = (status) => {
    const statusMap = {
      'matched_single': '✅ 완벽 매칭',
      'matched_by_date': '✅ 날짜 매칭',
      'matched_by_time': '✅ 시간 매칭',
      'matched_first_record': '⚠️ 첫 기록 선택',
      'unmatched': '❌ 미매칭',
      'unmatched_date_mismatch': '⚠️ 날짜 불일치',
      'error': '❌ 에러'
    }
    return statusMap[status] || status
  }

  const getMatchStatusColor = (status) => {
    switch (status) {
      case 'matched_single':
      case 'matched_by_date':
        return '#16a34a'
      case 'matched_first_record':
      case 'unmatched_date_mismatch':
        return '#ea580c'
      case 'unmatched':
      case 'error':
        return '#dc2626'
      default:
        return '#6b7280'
    }
  }

  const getMatchStatusBackgroundColor = (status) => {
    switch (status) {
      case 'matched_single':
        return '#fdfffb'  // 더 옅은 녹색
      case 'matched_by_date':
        return '#fffaf7'  // 더 옅은 주황
      case 'matched_by_time':
        return '#fffaf6'  // 더 옅은 주황
      case 'matched_first_record':
        return '#fffaf6'  // 더 옅은 주황
      case 'unmatched_date_mismatch':
        return '#fffaf6'  // 더 옅은 주황
      case 'unmatched':
      case 'error':
        return '#fffbfb'  // 더 옅은 빨강
      default:
        return 'white'
    }
  }

  const getMatchStatusLabelKr = (status) => {
    const statusMap = {
      'matched_single': '완벽 매칭',
      'matched_by_date': '날짜 매칭',
      'matched_by_time': '시간 매칭',
      'matched_first_record': '첫 기록',
      'unmatched': '미매칭',
      'unmatched_date_mismatch': '날짜 불일치',
      'error': '에러'
    }
    return statusMap[status] || status
  }

  const getMatchStatusTooltip = (status) => {
    const tooltipMap = {
      'matched_single': 'Excel에 전화번호 1개 기록만 있음',
      'matched_by_date': 'Excel에 여러 기록 중 파일명 날짜와 일치하는 기록 선택',
      'matched_by_time': 'Excel에 여러 기록 중 파일명 시간과 가장 가까운 기록 선택',
      'matched_first_record': 'Excel에 여러 기록 중 첫 번째 기록 선택',
      'unmatched_date_mismatch': 'Excel에 전화번호는 있지만 날짜 불일치',
      'unmatched': 'Excel에 전화번호 없음 또는 매칭 불가'
    }
    return tooltipMap[status] || ''
  }

  const formatFileDate = (dateStr) => {
    if (!dateStr) return '-'
    if (dateStr.length === 8) {
      return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
    }
    return dateStr
  }

  const getDisplayPath = (result) => {
    const path = result.s3_path_korean || result.s3_path || '-'
    if (path === '-') return path
    const lastSlashIndex = path.lastIndexOf('/')
    return lastSlashIndex > -1 ? path.substring(0, lastSlashIndex) : path
  }

  if (!previewResults) {
    return (
      <div style={{
        backgroundColor: 'var(--muted)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--muted-foreground)'
      }}>
        로딩 중...
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'var(--muted)',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '70vh',
      position: 'relative'
    }}>
      {/* 테이블 */}
      <div style={{
        flex: 1,
        overflowY: 'auto'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.85rem'
        }}>
          <thead style={{
            backgroundColor: '#f3f4f6',
            borderBottom: '2px solid var(--border)',
            position: 'sticky',
            top: 0
          }}>
            <tr>
              <th style={{
                width: '50px',
                padding: '0.75rem 0.5rem',
                textAlign: 'center',
                backgroundColor: '#eff6ff',
                borderRight: '1px solid var(--border)'
              }}>
                <input
                  type="checkbox"
                  checked={selectedIndices.size === modifiedResults.length && modifiedResults.length > 0}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = selectedIndices.size > 0 && selectedIndices.size < modifiedResults.length
                    }
                  }}
                  onChange={toggleSelectAll}
                  style={{cursor: 'pointer'}}
                />
              </th>
              <th style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#1e3a8a',
                borderRight: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Music size={16} strokeWidth={2.5} />
                  파일명
                </div>
              </th>
              <th style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#1e3a8a',
                borderRight: '1px solid var(--border)',
                width: '120px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Music size={16} strokeWidth={2.5} />
                  전화번호
                </div>
              </th>
              <th style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#1e3a8a',
                borderRight: '1px solid var(--border)',
                width: '140px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Music size={16} strokeWidth={2.5} />
                  날짜
                </div>
              </th>
              <th style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#166534',
                borderRight: '1px solid var(--border)',
                width: '120px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} strokeWidth={2.5} />
                  브랜드
                </div>
              </th>
              <th style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#166534',
                borderRight: '1px solid var(--border)',
                width: '120px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} strokeWidth={2.5} />
                  상담원
                </div>
              </th>
              <th style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#166534',
                borderRight: '1px solid var(--border)',
                width: '140px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} strokeWidth={2.5} />
                  상담 날짜
                </div>
              </th>
              <th style={{
                padding: '0.3rem 1rem',
                textAlign: 'left',
                fontWeight: '600',
                color: '#111827'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Folder size={16} strokeWidth={2.5} />
                  저장 경로
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {modifiedResults.map((result, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: selectedIndices.has(index) ? '#e0f2fe' : getMatchStatusBackgroundColor(result.match_status),
                  borderLeft: `4px solid ${getMatchStatusColor(result.match_status)}`
                }}
                onMouseEnter={(e) => {
                  if (!selectedIndices.has(index)) {
                    e.currentTarget.style.opacity = '0.7'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedIndices.has(index)) {
                    e.currentTarget.style.opacity = '1'
                  }
                }}
              >
                <td style={{
                  width: '50px',
                  padding: '0.75rem 0.5rem',
                  textAlign: 'center',
                  borderRight: '1px solid var(--border)'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedIndices.has(index)}
                    onChange={() => toggleSelect(index)}
                    style={{cursor: 'pointer'}}
                  />
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  borderRight: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontWeight: '500',
                  maxWidth: '250px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} data-match-status={result.match_status} title={result.filename}>
                  {result.filename}
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  borderRight: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }}>
                  {result.phone || '-'}
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  borderRight: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }}>
                  {formatFileDate(result.file_date)}
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  borderRight: '1px solid var(--border)',
                  color: 'var(--foreground)'
                }}>
                  {result.brand_name || '-'}
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  borderRight: '1px solid var(--border)',
                  color: 'var(--foreground)'
                }}>
                  {result.consultant_name || '-'}
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  borderRight: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }}>
                  {result.calling_date || '-'}
                </td>
                <td style={{
                  padding: '0.75rem 1rem',
                  color: 'var(--foreground)',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  maxWidth: '160px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} title={getDisplayPath(result)}>
                  {getDisplayPath(result)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 일괄 경로 수정 모달 */}
      <BulkPathEditModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        onApply={applyBulkPathChange}
        selectedCount={selectedIndices.size}
        availableBrands={availableBrands}
        availableConsultants={availableConsultants}
      />
    </div>
  )
}

export default PreviewTable
