import { useState, useEffect } from 'react'

function BulkPathEditModal({
  isOpen,
  onClose,
  onApply,
  selectedCount,
  availableBrands,
  availableConsultants
}) {
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedConsultant, setSelectedConsultant] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setSelectedBrand('')
      setSelectedConsultant('')
      setSelectedDate('')
    }
  }, [isOpen])

  const handleApply = () => {
    if (!selectedBrand || !selectedConsultant || !selectedDate) {
      alert('모든 항목을 선택해주세요')
      return
    }
    onApply(selectedBrand, selectedConsultant, selectedDate)
  }

  if (!isOpen) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        minWidth: '500px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h3 style={{
          marginTop: 0,
          marginBottom: '1.5rem',
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'var(--foreground)'
        }}>
          선택한 {selectedCount}개 파일의 경로 일괄 변경
        </h3>

        <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem'}}>
          {/* 브랜드 선택 */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--foreground)'
            }}>
              브랜드 <span style={{color: '#ef4444'}}>*</span>
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                color: 'var(--foreground)',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="">선택하세요</option>
              {availableBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* 상담원 선택 */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--foreground)'
            }}>
              상담원 <span style={{color: '#ef4444'}}>*</span>
            </label>
            <select
              value={selectedConsultant}
              onChange={(e) => setSelectedConsultant(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                color: 'var(--foreground)',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="">선택하세요</option>
              {availableConsultants.map(consultant => (
                <option key={consultant} value={consultant}>{consultant}</option>
              ))}
            </select>
          </div>

          {/* 날짜 선택 */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: 'var(--foreground)'
            }}>
              상담 날짜 <span style={{color: '#ef4444'}}>*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                color: 'var(--foreground)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* 경로 미리보기 */}
          {selectedBrand && selectedConsultant && selectedDate && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              padding: '1rem',
              borderRadius: '6px'
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: '#16a34a',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                미리보기:
              </div>
              <code style={{
                fontSize: '0.85rem',
                color: '#166534',
                wordBreak: 'break-all'
              }}>
                {selectedBrand}/{selectedConsultant}/{selectedDate}/filename.mp3
              </code>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--secondary)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e5e7eb'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--secondary)'
            }}
          >
            취소
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedBrand || !selectedConsultant || !selectedDate}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: selectedBrand && selectedConsultant && selectedDate ? 'var(--primary)' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: selectedBrand && selectedConsultant && selectedDate ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (selectedBrand && selectedConsultant && selectedDate) {
                e.target.style.transform = 'scale(1.05)'
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)'
            }}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  )
}

export default BulkPathEditModal
