import { useState } from 'react'
import { toast } from 'sonner'

function DuplicateHandler({ duplicates, onResolve }) {
  const [selectedActions, setSelectedActions] = useState({})

  // 파일별 처리 방식 선택
  const handleAction = (filename, action) => {
    setSelectedActions(prev => ({
      ...prev,
      [filename]: action
    }))
  }

  // 전체 파일에 같은 처리 방식 적용
  const handleSelectAll = (action) => {
    const newSelectedActions = {}
    duplicates.forEach(duplicate => {
      newSelectedActions[duplicate.filename] = action
    })
    setSelectedActions(newSelectedActions)
  }

  // 중복 파일 처리 완료
  const handleResolve = async () => {
    if (Object.keys(selectedActions).length !== duplicates.length) {
      toast.error('모든 중복 파일에 대해 처리 방식을 선택해주세요.')
      return
    }

    // 선택된 처리 방식 적용
    for (const [filename, action] of Object.entries(selectedActions)) {
      await onResolve(filename, action)
    }

    toast.success('중복 파일 처리가 완료되었습니다!')
  }

  return (
    <div
      style={{
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #fcd34d',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: '600',
          color: '#92400e'
        }}
      >
        <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.2rem' }}></i>
        <span>중복 파일 확인 필요 ({duplicates.length}개)</span>
      </div>

      {/* 설명 */}
      <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350f' }}>
        다음 파일들은 이미 업로드된 파일입니다. 각 파일에 대해 처리 방식을 선택해주세요.
      </p>

      {/* 전체 선택 버튼 */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button
          onClick={() => handleSelectAll('skip')}
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#e5e7eb'
            e.target.style.borderColor = '#9ca3af'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f3f4f6'
            e.target.style.borderColor = '#d1d5db'
          }}
        >
          모두 건너뛰기
        </button>
        <button
          onClick={() => handleSelectAll('overwrite')}
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fecaca'
            e.target.style.borderColor = '#fca5a5'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f3f4f6'
            e.target.style.borderColor = '#d1d5db'
          }}
        >
          모두 덮어쓰기
        </button>
      </div>

      {/* 중복 파일 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {duplicates.map((duplicate, index) => (
          <div
            key={index}
            style={{
              padding: '0.75rem',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #fcd34d',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            {/* 파일 정보 */}
            <div>
              <div style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                {duplicate.filename}
              </div>
              {duplicate.existing_s3_path && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--muted-foreground)',
                    marginTop: '0.25rem',
                    fontFamily: 'monospace'
                  }}
                >
                  기존: {duplicate.existing_s3_path}
                </div>
              )}
            </div>

            {/* 처리 방식 버튼 */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['skip', 'overwrite'].map(action => (
                <button
                  key={action}
                  onClick={() => handleAction(duplicate.filename, action)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    backgroundColor:
                      selectedActions[duplicate.filename] === action
                        ? action === 'skip'
                          ? '#e5e7eb'
                          : '#fca5a5'
                        : '#f3f4f6',
                    color:
                      selectedActions[duplicate.filename] === action
                        ? action === 'skip'
                          ? '#374151'
                          : '#7f1d1d'
                        : '#6b7280',
                    border:
                      selectedActions[duplicate.filename] === action
                        ? `2px solid ${action === 'skip' ? '#9ca3af' : '#fca5a5'}`
                        : '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedActions[duplicate.filename] !== action) {
                      e.target.style.backgroundColor = '#f9fafb'
                      e.target.style.borderColor = '#d1d5db'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedActions[duplicate.filename] !== action) {
                      e.target.style.backgroundColor = '#f3f4f6'
                      e.target.style.borderColor = '#d1d5db'
                    }
                  }}
                >
                  {action === 'skip' ? (
                    <>
                      <i className="fas fa-ban"></i> 건너뛰기
                    </>
                  ) : (
                    <>
                      <i className="fas fa-redo"></i> 덮어쓰기
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 처리 완료 버튼 */}
      <button
        onClick={handleResolve}
        disabled={Object.keys(selectedActions).length !== duplicates.length}
        style={{
          padding: '0.75rem 1rem',
          backgroundColor:
            Object.keys(selectedActions).length === duplicates.length ? '#fbbf24' : '#fde68a',
          color: '#92400e',
          border: 'none',
          borderRadius: '6px',
          cursor:
            Object.keys(selectedActions).length === duplicates.length ? 'pointer' : 'not-allowed',
          fontSize: '0.9rem',
          fontWeight: '600',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
        onMouseEnter={(e) => {
          if (Object.keys(selectedActions).length === duplicates.length) {
            e.target.style.backgroundColor = '#f59e0b'
          }
        }}
        onMouseLeave={(e) => {
          if (Object.keys(selectedActions).length === duplicates.length) {
            e.target.style.backgroundColor = '#fbbf24'
          }
        }}
      >
        <i className="fas fa-check"></i>
        처리 완료
      </button>

      {/* 진행 상황 */}
      <div style={{ fontSize: '0.8rem', color: '#92400e', textAlign: 'center' }}>
        {Object.keys(selectedActions).length}/{duplicates.length} 선택 완료
      </div>
    </div>
  )
}

export default DuplicateHandler
