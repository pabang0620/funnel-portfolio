import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import { validateFilename } from '../../lib/fileParser'
import { extractRecordingTime, extractUsername } from '../../utils/fileParser'

/**
 * MultiFileInput Component - 파일 복수 선택 + 파일 정보 표시
 * 
 * @param {Object} props
 * @param {Array} props.selectedFiles - 선택된 파일 배열
 * @param {function} props.onFilesSelect - 파일 선택 시 호출되는 콜백 함수
 * @param {function} props.onFileRemove - 파일 제거 시 호출되는 콜백 함수
 */
function MultiFileInput({ selectedFiles, onFilesSelect, onFileRemove }) {
  const [isDragging, setIsDragging] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const fileInputRef = useRef(null)
  
  const ITEMS_PER_PAGE = 5
  const MAX_FILES = 10

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFileSelection(droppedFiles)
  }

  const handleFileInputChange = (e) => {
    const inputFiles = Array.from(e.target.files)
    handleFileSelection(inputFiles)
  }

  const handleFileSelection = (files) => {
    // 최대 파일 개수 체크
    if (selectedFiles.length + files.length > MAX_FILES) {
      alert(`최대 ${MAX_FILES}개 파일까지만 선택할 수 있습니다. (현재: ${selectedFiles.length}개)`)
      return
    }

    const validFiles = []
    const errors = []

    files.forEach(file => {
      // 파일 크기 검증 (100MB 제한)
      if (file.size > 100 * 1024 * 1024) {
        errors.push(`${file.name}: 파일 크기가 100MB를 초과합니다.`)
        return
      }

      // 파일 확장자 검증
      const ext = file.name.split('.').pop()?.toLowerCase()
      const validExtensions = ['mp3', 'wav', 'm4a', 'xlsx', 'xls', 'csv', 'zip', 'gz', 'tar']

      // tar.gz 처리
      if (file.name.toLowerCase().endsWith('.tar.gz')) {
        validExtensions.push('tar.gz')
      }

      if (!validExtensions.includes(ext) && !file.name.toLowerCase().endsWith('.tar.gz')) {
        errors.push(`${file.name}: 지원하지 않는 파일 형식입니다. (MP3, WAV, M4A, XLSX, XLS, CSV, ZIP, GZ, TAR.GZ 지원)`)
        return
      }

      // 음성 파일만 파일명 패턴 검증
      if (['mp3', 'wav', 'm4a'].includes(ext)) {
        const validation = validateFilename(file.name)
        if (!validation.valid) {
          errors.push(`${file.name}: ${validation.reason}`)
          return
        }
      }

      // 음성 파일만 정보 추출
      const username = ['mp3', 'wav', 'm4a'].includes(ext) ? extractUsername(file.name) : ''
      const timeInfo = ['mp3', 'wav', 'm4a'].includes(ext) ? extractRecordingTime(file.name) : ''

      validFiles.push({
        file,
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        username,
        timeInfo,
        errors: []
      })
    })

    if (errors.length > 0) {
      alert('파일 검증 오류:\n' + errors.join('\n'))
    }

    if (validFiles.length > 0) {
      onFilesSelect(validFiles)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* 드래그 앤 드롭 영역 */}
      <div 
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{
          border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: isDragging ? 'var(--primary-light)' : 'var(--muted)',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.target.style.borderColor = 'var(--primary)'
            e.target.style.backgroundColor = 'var(--card)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.backgroundColor = 'var(--muted)'
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".mp3,.wav,.m4a,.xlsx,.xls,.csv,.zip,.gz,.tar"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            fontSize: '2.5rem',
            color: isDragging ? 'var(--primary)' : 'var(--muted-foreground)',
            transition: 'color 0.3s ease'
          }}>
            <i className={`fas ${isDragging ? 'fa-file-import' : 'fa-cloud-upload-alt'}`}></i>
          </div>
          <div style={{ 
            fontSize: '1.1rem', 
            fontWeight: '600',
            color: isDragging ? 'var(--primary)' : 'var(--foreground)'
          }}>
            {isDragging ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 선택'}
          </div>
          <div style={{ 
            fontSize: '0.9rem',
            color: 'var(--muted-foreground)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <i className="fas fa-info-circle"></i>
            지원 파일 형식: MP3, WAV, M4A, Excel(XLSX, XLS, CSV), 압축(ZIP, GZ, TAR, TAR.GZ) | 최대 크기: 100MB | 복수 선택 가능
          </div>
        </div>
      </div>

      {/* 선택된 파일 목록 */}
      {selectedFiles && selectedFiles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--foreground)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <i className="fas fa-file" style={{ color: 'var(--accent)' }}></i>
              선택된 파일 ({selectedFiles.length}개)
            </h4>
            
            <button
              onClick={() => {
                selectedFiles.forEach(file => onFileRemove(file.id))
                setCurrentPage(1)
              }}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--destructive)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
                e.target.style.boxShadow = '0 2px 8px rgba(239,68,68,0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <i className="fas fa-trash-alt"></i>
              전체 삭제
            </button>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem'
          }}>
            {selectedFiles
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map((fileItem) => (
              <div key={fileItem.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ 
                    fontWeight: '500', 
                    color: 'var(--foreground)', 
                    fontSize: '0.9rem',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {fileItem.name}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem',
                    color: 'var(--muted-foreground)',
                    fontWeight: '500',
                    marginLeft: '1rem'
                  }}>
                    {formatFileSize(fileItem.size)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    onFileRemove(fileItem.id)
                    // 현재 페이지가 비게 되면 이전 페이지로
                    const totalPages = Math.ceil((selectedFiles.length - 1) / ITEMS_PER_PAGE)
                    if (currentPage > totalPages && totalPages > 0) {
                      setCurrentPage(totalPages)
                    }
                  }}
                  style={{
                    marginLeft: '0.75rem',
                    padding: '0.5rem',
                    backgroundColor: 'var(--destructive)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)'
                    e.target.style.boxShadow = '0 2px 8px rgba(244,67,54,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
          
          {/* 페이지네이션 */}
          {selectedFiles.length > ITEMS_PER_PAGE && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1rem'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem',
                  backgroundColor: currentPage === 1 ? 'var(--muted)' : 'var(--primary)',
                  color: currentPage === 1 ? 'var(--muted-foreground)' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <span style={{
                fontSize: '0.85rem',
                color: 'var(--foreground)',
                fontWeight: '500'
              }}>
                {currentPage} / {Math.ceil(selectedFiles.length / ITEMS_PER_PAGE)}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => 
                  Math.min(Math.ceil(selectedFiles.length / ITEMS_PER_PAGE), prev + 1)
                )}
                disabled={currentPage === Math.ceil(selectedFiles.length / ITEMS_PER_PAGE)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: currentPage === Math.ceil(selectedFiles.length / ITEMS_PER_PAGE) ? 'var(--muted)' : 'var(--primary)',
                  color: currentPage === Math.ceil(selectedFiles.length / ITEMS_PER_PAGE) ? 'var(--muted-foreground)' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === Math.ceil(selectedFiles.length / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

MultiFileInput.propTypes = {
  selectedFiles: PropTypes.array.isRequired,
  onFilesSelect: PropTypes.func.isRequired,
  onFileRemove: PropTypes.func.isRequired
}

export default MultiFileInput