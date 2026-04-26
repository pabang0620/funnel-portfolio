import { useState } from 'react'

function ResultsTable({ results }) {
  const [expandedRows, setExpandedRows] = useState({})

  const toggleRow = (filename) => {
    setExpandedRows(prev => ({
      ...prev,
      [filename]: !prev[filename]
    }))
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <i className="fas fa-check-circle" style={{ color: '#16a34a' }}></i>
      case 'duplicate':
        return <i className="fas fa-exclamation-circle" style={{ color: '#ea580c' }}></i>
      case 'failed':
        return <i className="fas fa-times-circle" style={{ color: '#dc2626' }}></i>
      case 'skipped':
        return <i className="fas fa-skip" style={{ color: '#6b7280' }}></i>
      default:
        return <i className="fas fa-question-circle" style={{ color: '#6b7280' }}></i>
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'success':
        return '✓ 성공'
      case 'duplicate':
        return '⚠ 중복'
      case 'failed':
        return '✗ 실패'
      case 'skipped':
        return '⊘ 건너뜀'
      default:
        return status
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--muted)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
          fontWeight: '600',
          fontSize: '0.9rem',
          color: 'var(--foreground)'
        }}
      >
        업로드 결과 ({results.length}개 파일)
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {results.map((result, index) => (
          <div key={index} style={{ borderBottom: '1px solid var(--border)' }}>
            {/* 행 헤더 */}
            <div
              style={{
                padding: '0.75rem 1rem',
                display: 'grid',
                gridTemplateColumns: '2rem 1fr 6rem',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: 'var(--card)',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onClick={() => toggleRow(result.filename)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--card)'
              }}
            >
              {/* 상태 아이콘 */}
              <div style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                {getStatusIcon(result.status)}
              </div>

              {/* 파일명 */}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--foreground)' }}>
                  {result.filename}
                </div>
                {result.match_status && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                    {result.brand_name} / {result.consultant_name}
                  </div>
                )}
              </div>

              {/* 상태 배지 */}
              <div
                style={{
                  textAlign: 'right',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  color: result.status === 'success' ? '#16a34a' : '#ea580c'
                }}
              >
                {getStatusLabel(result.status)}
              </div>
            </div>

            {/* 상세 정보 (확장) */}
            {expandedRows[result.filename] && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--muted)',
                  borderTop: '1px solid var(--border)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem'
                }}
              >
                {/* 기본 정보 */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                    기본 정보
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--muted-foreground)' }}>상태:</span>
                      <span style={{ marginLeft: '0.5rem', color: 'var(--foreground)', fontWeight: '500' }}>
                        {getStatusLabel(result.status)}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted-foreground)' }}>매칭:</span>
                      <span style={{ marginLeft: '0.5rem', color: 'var(--foreground)', fontWeight: '500' }}>
                        {result.match_status}
                      </span>
                    </div>
                    {result.message && (
                      <div>
                        <span style={{ color: 'var(--muted-foreground)' }}>메시지:</span>
                        <span style={{ marginLeft: '0.5rem', color: 'var(--foreground)' }}>
                          {result.message}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 저장 정보 */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                    저장 정보
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    {result.brand_name && (
                      <div>
                        <span style={{ color: 'var(--muted-foreground)' }}>브랜드:</span>
                        <span style={{ marginLeft: '0.5rem', color: 'var(--foreground)', fontWeight: '500' }}>
                          {result.brand_name}
                        </span>
                      </div>
                    )}
                    {result.consultant_name && (
                      <div>
                        <span style={{ color: 'var(--muted-foreground)' }}>상담원:</span>
                        <span style={{ marginLeft: '0.5rem', color: 'var(--foreground)', fontWeight: '500' }}>
                          {result.consultant_name}
                        </span>
                      </div>
                    )}
                    {result.calling_date && (
                      <div>
                        <span style={{ color: 'var(--muted-foreground)' }}>날짜:</span>
                        <span style={{ marginLeft: '0.5rem', color: 'var(--foreground)', fontWeight: '500' }}>
                          {result.calling_date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 저장 경로 */}
                {result.s3_path && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                      저장 경로 (S3)
                    </div>
                    <div
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'var(--card)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      <code style={{ flex: 1, wordBreak: 'break-all', color: 'var(--foreground)' }}>
                        {result.s3_path}
                      </code>
                      <button
                        onClick={() => copyToClipboard(result.s3_path)}
                        style={{
                          padding: '0.4rem 0.6rem',
                          backgroundColor: 'var(--accent)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--accent)'
                          e.target.style.transform = 'scale(1.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'var(--accent)'
                          e.target.style.transform = 'scale(1)'
                        }}
                        title="클립보드로 복사"
                      >
                        <i className="fas fa-copy"></i> 복사
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 통계 */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--card)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '2rem',
          fontSize: '0.85rem'
        }}
      >
        <div>
          <span style={{ color: 'var(--muted-foreground)' }}>성공: </span>
          <span style={{ color: '#16a34a', fontWeight: '600' }}>
            {results.filter(r => r.status === 'success').length}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--muted-foreground)' }}>실패: </span>
          <span style={{ color: '#dc2626', fontWeight: '600' }}>
            {results.filter(r => r.status === 'failed').length}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--muted-foreground)' }}>건너뜀: </span>
          <span style={{ color: '#6b7280', fontWeight: '600' }}>
            {results.filter(r => r.status === 'skipped').length}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ResultsTable
