import { useState } from 'react'

function DuplicateCheckModal({
  duplicateFiles,
  onOverwrite,
  onCancel,
  onRename
}) {
  const [selectedAction, setSelectedAction] = useState(null)

  if (!duplicateFiles || duplicateFiles.length === 0) {
    return null
  }

  const handleApply = () => {
    if (selectedAction === 'overwrite') {
      onOverwrite()
    } else if (selectedAction === 'cancel') {
      onCancel()
    } else if (selectedAction === 'rename') {
      onRename()
    }
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
        backgroundColor: 'var(--card)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        maxWidth: '600px',
        maxHeight: '70vh',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        overflow: 'auto'
      }}>
        <div>
          <h2 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.2rem',
            fontWeight: '600',
            color: 'var(--foreground)'
          }}>
            ⚠️ 중복된 파일 발견
          </h2>
          <p style={{
            margin: '0 0 1rem 0',
            fontSize: '0.9rem',
            color: 'var(--muted-foreground)'
          }}>
            S3에 이미 존재하는 {duplicateFiles.length}개의 파일이 있습니다.
            어떻게 처리할까요?
          </p>
        </div>

        {/* 중복 파일 목록 */}
        <div style={{
          backgroundColor: 'var(--muted)',
          borderRadius: '8px',
          padding: '1rem',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
            color: 'var(--foreground)'
          }}>
            중복 파일 목록:
          </div>
          {duplicateFiles.map((file, idx) => (
            <div key={idx} style={{
              fontSize: '0.8rem',
              color: 'var(--foreground)',
              padding: '0.5rem',
              borderBottom: idx < duplicateFiles.length - 1 ? '1px solid var(--border)' : 'none'
            }}>
              • {file.filename}
            </div>
          ))}
        </div>

        {/* 선택 옵션 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {[
            {
              value: 'overwrite',
              label: '🔄 덮어쓰기',
              desc: '기존 파일을 새 파일로 교체'
            },
            {
              value: 'rename',
              label: '📝 파일명 변경',
              desc: '파일명에 _복사본 추가'
            },
            {
              value: 'cancel',
              label: '❌ 취소',
              desc: '업로드 중단'
            }
          ].map(option => (
            <label key={option.value} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '0.75rem',
              borderRadius: '6px',
              border: selectedAction === option.value ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: selectedAction === option.value ? 'var(--muted)' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                value={option.value}
                checked={selectedAction === option.value}
                onChange={(e) => setSelectedAction(e.target.value)}
                style={{ cursor: 'pointer', marginTop: '0.2rem' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--foreground)' }}>
                  {option.label}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                  {option.desc}
                </span>
              </div>
            </label>
          ))}
        </div>

        {/* 버튼 */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => onCancel()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--secondary)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            뒤로
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedAction}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: selectedAction ? 'var(--primary)' : 'var(--muted)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: selectedAction ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}

export default DuplicateCheckModal
