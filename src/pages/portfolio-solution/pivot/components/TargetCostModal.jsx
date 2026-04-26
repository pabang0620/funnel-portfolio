import React, { useState, useEffect, useMemo } from 'react'
import { X, Search } from 'lucide-react'

// 데모용 병원 목록 (더미 데이터에서 실제 사용되는 병원명)
const DEMO_HOSPITALS = [
  { hospital_name_id: 1, hospital_name: '강남미래의원', target_db_cost: 45000 },
  { hospital_name_id: 2, hospital_name: '서초힐링병원', target_db_cost: 40000 },
  { hospital_name_id: 3, hospital_name: '노원바른병원', target_db_cost: 35000 },
  { hospital_name_id: 4, hospital_name: '분당정형외과', target_db_cost: 50000 },
]

function TargetCostModal({ isOpen, onClose, onSave }) {
  const [targets, setTargets] = useState([])
  const [originalTargets, setOriginalTargets] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmData, setConfirmData] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setError('')
    setSearchQuery('')
    // 데모: 더미 데이터로 즉시 로드
    const mapped = DEMO_HOSPITALS.map(t => ({
      hospital_name_id: t.hospital_name_id,
      hospital_name: t.hospital_name,
      target_db_cost: t.target_db_cost ?? '',
    }))
    setTargets(mapped)
    setOriginalTargets(mapped.map(t => ({ ...t })))
    setLoading(false)
  }, [isOpen])

  const filteredTargets = useMemo(() => {
    if (!searchQuery.trim()) return targets
    const q = searchQuery.trim().toLowerCase()
    return targets.filter(t => t.hospital_name.toLowerCase().includes(q))
  }, [targets, searchQuery])

  function handleChange(hospitalNameId, value) {
    setTargets(prev =>
      prev.map(t =>
        t.hospital_name_id === hospitalNameId
          ? { ...t, target_db_cost: value === '' ? '' : Number(value) }
          : t
      )
    )
  }

  function getChangedTargets() {
    const origMap = new Map(originalTargets.map(t => [t.hospital_name_id, t.target_db_cost]))
    return targets.filter(t => {
      const orig = origMap.get(t.hospital_name_id)
      const origVal = orig === '' || orig == null ? '' : String(orig)
      const newVal = t.target_db_cost === '' || t.target_db_cost == null ? '' : String(t.target_db_cost)
      return origVal !== newVal
    })
  }

  function handleSaveClick() {
    const changed = getChangedTargets()
    if (changed.length === 0) {
      onClose()
      return
    }
    const origMap = new Map(originalTargets.map(o => [o.hospital_name_id, o.target_db_cost]))
    const lines = changed.map(t => {
      const orig = origMap.get(t.hospital_name_id)
      const origStr = orig === '' || orig == null ? '미설정' : `${Number(orig).toLocaleString()}원`
      const newStr = t.target_db_cost === '' || t.target_db_cost == null ? '미설정' : `${Number(t.target_db_cost).toLocaleString()}원`
      return { hospital_name: t.hospital_name, from: origStr, to: newStr }
    })
    setConfirmData({ changed, lines })
  }

  async function handleConfirmSave() {
    const { changed } = confirmData
    setConfirmData(null)
    setSaving(true)
    setError('')
    try {
      // 데모: 메모리 상태에만 반영
      setOriginalTargets(targets.map(t => ({ ...t })))
      if (onSave) {
        const costMap = {}
        for (const t of targets) {
          if (t.target_db_cost !== '' && t.target_db_cost != null) {
            costMap[t.hospital_name] = Number(t.target_db_cost)
          }
        }
        onSave(costMap)
      }
      onClose()
    } catch (err) {
      setError('저장 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="ppm-overlay" onClick={onClose}>
      <div className="ppm-modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh' }}>
        <div className="ppm-header">
          <span className="ppm-title">병원별 목표 DB단가</span>
          <button type="button" className="ppm-close-btn" onClick={onClose} aria-label="모달 닫기"><X size={16} /></button>
        </div>

        {error && <div className="ppm-error">{error}</div>}

        <div style={{ padding: '8px 16px 0', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 8 }}>
            <Search size={14} style={{ color: '#a0aec0', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="병원명 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, padding: '4px 0' }}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={12} style={{ color: '#a0aec0' }} />
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: '0 16px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div className="ppm-loading">불러오는 중...</div>
          ) : filteredTargets.length === 0 ? (
            <div className="ppm-empty">{searchQuery ? '검색 결과가 없습니다' : '등록된 병원이 없습니다'}</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '8px 4px', color: '#718096' }}>병원명</th>
                  <th style={{ textAlign: 'right', padding: '8px 4px', color: '#718096', width: 140 }}>목표 DB단가 (원)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.map(t => (
                  <tr key={t.hospital_name_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 4px' }}>{t.hospital_name}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={t.target_db_cost === '' ? '' : Number(t.target_db_cost).toLocaleString()}
                        onChange={e => {
                          const raw = e.target.value.replace(/[^0-9]/g, '')
                          handleChange(t.hospital_name_id, raw === '' ? '' : raw)
                        }}
                        placeholder="미설정"
                        style={{
                          width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0',
                          borderRadius: 4, textAlign: 'right', fontSize: 13,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} className="ppm-save-btn" style={{ background: '#e2e8f0', color: '#4a5568' }}>
            취소
          </button>
          <button type="button" onClick={handleSaveClick} disabled={saving} className="ppm-save-btn">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* 변경사항 확인 커스텀 confirm */}
      {confirmData && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setConfirmData(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 12, width: 420, maxWidth: '90vw', maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
          >
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1a202c' }}>변경사항 확인</span>
            </div>
            <div style={{ padding: '12px 20px', overflowY: 'auto', flex: 1 }}>
              <p style={{ fontSize: 13, color: '#718096', marginBottom: 12 }}>
                {confirmData.lines.length}건의 변경사항이 있습니다.
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '6px 4px', color: '#718096' }}>병원명</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px', color: '#718096' }}>변경 전</th>
                    <th style={{ textAlign: 'center', padding: '6px 4px', color: '#a0aec0', width: 24 }}></th>
                    <th style={{ textAlign: 'right', padding: '6px 4px', color: '#718096' }}>변경 후</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmData.lines.map((line, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: 500 }}>{line.hospital_name}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', color: '#a0aec0' }}>{line.from}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'center', color: '#a0aec0' }}>→</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', color: '#2d3748', fontWeight: 600 }}>{line.to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => setConfirmData(null)}
                className="ppm-save-btn"
                style={{ background: '#e2e8f0', color: '#4a5568' }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="ppm-save-btn"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TargetCostModal
