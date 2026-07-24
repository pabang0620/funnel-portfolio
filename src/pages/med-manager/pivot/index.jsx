import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, FolderOpen, Trash2, X, RefreshCw, Star, Target, BookOpen } from 'lucide-react'

import usePivotEngine from './hooks/usePivotEngine'
import PivotFieldConfig from './components/PivotFieldConfig'
import PivotFilterBar from './components/PivotFilterBar'
import PivotTable from './components/PivotTable'
import TargetCostModal from './components/TargetCostModal'

import './pivot.css'

// 데모용 로그인 유저 (항상 관리자)
const loginUser = { role: 1, name: '관리자', hospital_name_id: null }

// 데모용 프리셋 (로컬 스토리지 기반)
function getStoredPresets() {
  try { return JSON.parse(localStorage.getItem('demoPivotPresets') || '[]') }
  catch { return [] }
}
function saveStoredPresets(presets) {
  localStorage.setItem('demoPivotPresets', JSON.stringify(presets))
}

// ---------------------------------------------------------------------------
// 프리셋 모달
// ---------------------------------------------------------------------------
function PresetModal({ isOpen, onClose, currentConfig, onApply }) {
  const [presets, setPresets] = useState([])
  const [presetName, setPresetName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pivotFavorites') || '[]') }
    catch { return [] }
  })

  function handleToggleFavorite(presetId) {
    setFavorites(prev => {
      const next = prev.includes(presetId) ? prev.filter(id => id !== presetId) : [...prev, presetId]
      localStorage.setItem('pivotFavorites', JSON.stringify(next))
      return next
    })
  }

  useEffect(() => {
    if (!isOpen) return
    setPresets(getStoredPresets())
  }, [isOpen])

  function handleSave() {
    if (!presetName.trim()) {
      setError('프리셋 이름을 입력하세요')
      return
    }
    setSaving(true)
    setError('')
    const newPreset = {
      id: String(Date.now()),
      name: presetName.trim(),
      row_fields: currentConfig.rowFields,
      col_fields: currentConfig.colFields,
      value_fields: currentConfig.valueFields,
    }
    const updated = [...getStoredPresets(), newPreset]
    saveStoredPresets(updated)
    setPresets(updated)
    setPresetName('')
    setSaving(false)
  }

  function handleDelete(id) {
    const updated = getStoredPresets().filter(p => p.id !== id)
    saveStoredPresets(updated)
    setPresets(updated)
  }

  if (!isOpen) return null

  return (
    <div className="ppm-overlay" onClick={onClose}>
      <div className="ppm-modal" onClick={e => e.stopPropagation()}>
        <div className="ppm-header">
          <span className="ppm-title">피봇 프리셋</span>
          <button type="button" className="ppm-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {error && <div className="ppm-error">{error}</div>}

        <div className="ppm-save-section">
          <div className="ppm-save-label">현재 구성 저장</div>
          <div className="ppm-save-row">
            <input
              type="text"
              className="ppm-name-input"
              placeholder="프리셋 이름..."
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <button
              type="button"
              className="ppm-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>

        <div className="ppm-list-section">
          <div className="ppm-list-label">저장된 프리셋</div>
          {presets.length === 0 ? (
            <div className="ppm-empty">No saved presets</div>
          ) : (
            <ul className="ppm-list">
              {[...presets].sort((a, b) => {
                const aFav = favorites.includes(a.id) ? 0 : 1
                const bFav = favorites.includes(b.id) ? 0 : 1
                return aFav - bFav
              }).map(preset => (
                <li key={preset.id} className="ppm-item">
                  <div className="ppm-item-info">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(preset.id) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginRight: 4, display: 'flex' }}
                    >
                      <Star size={14} fill={favorites.includes(preset.id) ? '#f59e0b' : 'none'} stroke={favorites.includes(preset.id) ? '#f59e0b' : '#a0aec0'} />
                    </button>
                    <span className="ppm-item-name">{preset.name}</span>
                    <span className="ppm-item-meta">
                      행: {(preset.row_fields || []).join(', ') || '없음'} &middot;
                      열: {(preset.col_fields || []).join(', ') || '없음'} &middot;
                      값: {(preset.value_fields || []).length}개
                    </span>
                  </div>
                  <div className="ppm-item-actions">
                    <button
                      type="button"
                      className="ppm-apply-btn"
                      onClick={() => onApply(preset)}
                    >
                      적용
                    </button>
                    <button
                      type="button"
                      className="ppm-delete-btn"
                      onClick={() => handleDelete(preset.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 계산식 모달
// ---------------------------------------------------------------------------
const FORMULA_ROWS = [
  ['CPC', '광고비 ÷ 클릭수'],
  ['CTR', '클릭수 ÷ 노출수 × 100 (%)'],
  ['CVR', 'DB수량(중복포함) ÷ 클릭수 × 100 (%)'],
  ['DB단가(유효)', '광고비 ÷ DB수량(유효)'],
  ['DB단가(중복)', '광고비 ÷ DB수량(중복포함)'],
  ['예약률', '예약수 ÷ DB수량(유효) × 100 (%)'],
  ['약속이행률', '약속내원 ÷ 약속예약 × 100 (%)'],
  ['DB당 내원율', '내원수 ÷ DB수량(유효) × 100 (%)'],
  ['DB당 결제율', '상담동의수 ÷ DB수량(유효) × 100 (%)'],
  ['상담동의율', '상담동의수 ÷ 내원수 × 100 (%)'],
  ['ROAS', '결제금액 ÷ 광고비 × 100 (%)'],
  ['예약당 단가', '광고비 ÷ 예약수'],
  ['내원당 단가', '광고비 ÷ 내원수'],
  ['무효비율', '무효DB수량 ÷ DB수량(유효) × 100 (%)'],
  ['중복비율', '중복수량 ÷ DB수량(중복포함) × 100 (%)'],
]

const SOURCE_ROWS = [
  ['DB수량(유효)', 'data_status = 1 인 고객'],
  ['DB수량(중복포함)', 'data_status IN (0, 1) 인 고객'],
  ['중복수량', 'data_status = 0 인 고객'],
  ['무효DB수량', "call_history = '무효디비'"],
  ['예약수', "call_history IN ('예약', '재예약')"],
  ['내원수', "visit_status IN ('결제', '상담')"],
  ['상담동의수', "visit_status = '결제'"],
  ['결제금액', "visit_status = '결제' 인 고객의 total_payment 합계"],
  ['약속내원', '예약/재예약이고 예약일 < 현재 AND visit_status IN (\'결제\',\'상담\')'],
  ['약속예약', '예약/재예약이고 예약일 < 현재'],
  ['광고비', 'ad_spending 테이블 기준 (인입일과 동일 기간)'],
  ['노출수/클릭수/매체비', 'Google·Meta·TikTok API 수집 데이터'],
]

const NOTES = [
  '분모가 0이면 결과를 \'-\'로 표시합니다.',
  '합계 행: 각 원천 지표를 먼저 합산한 후 공식을 1회 적용합니다 (개별 행 평균이 아님).',
  'DB 인입일(customer_db.date) 기준 — 메인보고서의 방문일 기준과 다릅니다.',
  '광고비: 선택 기간 내 ad_spending 전체 합계이며 URL코드별로 배분됩니다.',
  '미분류 항목: 광고 플랫폼 데이터와 매핑되지 않은 채널(홈페이지·오프라인·당근마켓 등) 또는 디지털 외 채널입니다.',
  '메인보고서와의 차이: 날짜 기준, data_status 필터 범위, 집계 단위(URL코드 vs 고객 ID)가 다르므로 수치가 일치하지 않는 것이 정상입니다.',
]

function FormulaModal({ isOpen, onClose }) {
  if (!isOpen) return null
  return (
    <div className="ppm-overlay" onClick={onClose}>
      <div className="fm-modal" onClick={e => e.stopPropagation()}>
        <div className="ppm-header">
          <span className="ppm-title">계산식 및 특이사항</span>
          <button type="button" className="ppm-close-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="fm-body">
          <div className="fm-section-title">계산 지표</div>
          <table className="fm-table">
            <thead>
              <tr>
                <th className="fm-th">지표명</th>
                <th className="fm-th">계산식</th>
              </tr>
            </thead>
            <tbody>
              {FORMULA_ROWS.map(([name, formula]) => (
                <tr key={name} className="fm-tr">
                  <td className="fm-td fm-td--name">{name}</td>
                  <td className="fm-td">{formula}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="fm-section-title" style={{ marginTop: 20 }}>원천 지표 정의</div>
          <table className="fm-table">
            <thead>
              <tr>
                <th className="fm-th">지표명</th>
                <th className="fm-th">정의</th>
              </tr>
            </thead>
            <tbody>
              {SOURCE_ROWS.map(([name, def]) => (
                <tr key={name} className="fm-tr">
                  <td className="fm-td fm-td--name">{name}</td>
                  <td className="fm-td">{def}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="fm-section-title" style={{ marginTop: 20 }}>특이사항</div>
          <ul className="fm-notes">
            {NOTES.map((note, i) => (
              <li key={i} className="fm-note-item">{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// 메인 페이지
// ---------------------------------------------------------------------------
function PivotPage() {
  // ---------------------------------------------------------------------------
  // 원천 데이터
  // ---------------------------------------------------------------------------
  const [rawRows, setRawRows] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearched, setIsSearched] = useState(false)
  const [todayImpressionsMap, setTodayImpressionsMap] = useState({})

  // ---------------------------------------------------------------------------
  // 피봇 구성
  // ---------------------------------------------------------------------------
  const [rowFields, setRowFields] = useState(['hospital_name', 'platform', 'campaign_name', 'ad_group_name', 'ad_title'])
  const [colFields, setColFields] = useState([])
  const [valueFields, setValueFields] = useState([
    'impressions',
    'clicks',
    'ad_spend',
    'db_valid',
    'cpc',
    'cvr',
  ])

  const [excludeZero, setExcludeZero] = useState(false)
  const [showUnmapped, setShowUnmapped] = useState(true)

  // ---------------------------------------------------------------------------
  // 열 가시성 / 순서
  // ---------------------------------------------------------------------------
  const [visibleColKeys, setVisibleColKeys] = useState(null)
  const [orderedColKeys, setOrderedColKeys] = useState(null)

  // ---------------------------------------------------------------------------
  // UI 상태
  // ---------------------------------------------------------------------------
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false)
  const [isTargetCostModalOpen, setIsTargetCostModalOpen] = useState(false)
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const syncHandlerRef = useRef(null)

  // ---------------------------------------------------------------------------
  // 목표단가: 데모 초기값
  // ---------------------------------------------------------------------------
  const [targetCosts, setTargetCosts] = useState({
    '강남미래의원': 45000,
    '서초힐링병원': 40000,
    '노원바른병원': 35000,
    '분당정형외과': 50000,
  })

  // ---------------------------------------------------------------------------
  // 운영상태 / 판단결과 계산 (enrichedRows)
  // ---------------------------------------------------------------------------
  const enrichedRows = useMemo(() => {
    let rows = rawRows

    // 운영상태 계산
    rows = rows.map(row => ({
      ...row,
      operation_status: row.ad_title
        ? ((todayImpressionsMap[row.ad_title] || 0) >= 1 ? 'ON' : 'OFF')
        : '미확인',
    }))

    // 판단결과 계산
    rows = rows.map(row => {
      const todayImpressions = (todayImpressionsMap[row.ad_title] || 0)
      const targetCost = targetCosts[row.hospital_name]
      const adSpend = row.ad_spend || 0
      const ref7d = row.ref_last7d_db_cost_total
      const ref3d = row.ref_last3d_db_cost_total

      let judgment_result
      if (todayImpressions === 0) {
        judgment_result = '이미 OFF'
      } else if (!targetCost || adSpend < targetCost || ref7d == null || ref3d == null) {
        judgment_result = '테스트중'
      } else if (ref7d > targetCost && ref3d > targetCost) {
        judgment_result = 'OFF 필요'
      } else if (ref7d > targetCost && ref3d <= targetCost) {
        judgment_result = '회복중'
      } else if (ref7d <= targetCost && ref3d > targetCost) {
        judgment_result = '하락세'
      } else {
        judgment_result = '증액'
      }

      return { ...row, judgment_result }
    })

    return rows
  }, [rawRows, todayImpressionsMap, targetCosts])

  // ---------------------------------------------------------------------------
  // 광고제목별 시안링크 맵
  // ---------------------------------------------------------------------------
  const sourceLinkMap = useMemo(() => {
    const map = {}
    for (const row of enrichedRows) {
      if (row.ad_title && row.source_link && !map[row.ad_title]) {
        map[row.ad_title] = row.source_link
      }
    }
    return map
  }, [enrichedRows])

  // ---------------------------------------------------------------------------
  // excludeZero / showUnmapped 필터 적용
  // ---------------------------------------------------------------------------
  const filteredRows = enrichedRows
    .filter(r => excludeZero ? !(r.db_valid === 0 && r.ad_spend === 0) : true)
    .filter(r => showUnmapped ? true : r.campaign_name != null)

  // ---------------------------------------------------------------------------
  // 피봇 엔진
  // ---------------------------------------------------------------------------
  const { tree, totals, colKeys } = usePivotEngine({
    rawRows: filteredRows,
    rowFields,
    colFields,
    valueFields,
  })

  // colKeys 변경 시 visibleColKeys / orderedColKeys 초기화
  useEffect(() => {
    setVisibleColKeys(null)
    setOrderedColKeys(null)
  }, [colFields])

  useEffect(() => {
    if (colKeys && colKeys.length > 0) {
      setVisibleColKeys(prev => prev === null ? new Set(colKeys) : prev)
      setOrderedColKeys(prev => prev === null ? [...colKeys] : prev)
    }
  }, [colKeys])

  // ---------------------------------------------------------------------------
  // 데이터 로드 콜백 (PivotFilterBar → here)
  // ---------------------------------------------------------------------------
  function handleDataLoaded(rows, todayMap = {}) {
    setRawRows(rows)
    setTodayImpressionsMap(todayMap)
    setIsSearched(true)
  }

  // ---------------------------------------------------------------------------
  // 프리셋 적용
  // ---------------------------------------------------------------------------
  function handlePresetApply(preset) {
    setRowFields(preset.row_fields || ['hospital_name'])
    setColFields(preset.col_fields || [])
    setValueFields(preset.value_fields || ['impressions', 'clicks', 'ad_spend', 'db_valid', 'cpc', 'cvr'])
    setIsPresetModalOpen(false)
  }

  // ---------------------------------------------------------------------------
  // 렌더
  // ---------------------------------------------------------------------------
  return (
    <div className="pivot-page">
      {/* 타이틀 바 */}
      <div className="titleBox">
        <p style={{ color: '#979797', fontSize: '14px', fontWeight: 400 }}>피봇 분석</p>
        <div className="pivot-title-actions">
          <button
            type="button"
            className="pivot-btn"
            onClick={() => {
              if (window.confirm('최신 광고 데이터를 동기화합니다.\n※ 약 10~15분이 소요될 수 있습니다. 진행하시겠습니까?')) {
                syncHandlerRef.current && syncHandlerRef.current()
              }
            }}
            disabled={isLoading || isSyncing}
            title="광고 데이터 동기화"
          >
            <RefreshCw size={14} style={{ marginRight: 4 }} />
            {isSyncing ? '동기화 중...' : '최신화'}
          </button>
          <button
            type="button"
            className="pivot-btn"
            onClick={() => setIsPresetModalOpen(true)}
            title="프리셋 불러오기/저장"
          >
            <FolderOpen size={14} style={{ marginRight: 4 }} />
            프리셋
          </button>
          <button
            type="button"
            className="pivot-btn"
            onClick={() => setIsTargetCostModalOpen(true)}
            title="병원별 목표 DB단가 설정"
          >
            <Target size={14} style={{ marginRight: 4 }} />
            목표단가
          </button>
          <button
            type="button"
            className="pivot-btn"
            onClick={() => setIsFormulaModalOpen(true)}
            title="계산식 및 특이사항"
          >
            <BookOpen size={14} style={{ marginRight: 4 }} />
            계산식
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div className="pivot-body">
        {/* 왼쪽: 필터 + 테이블 */}
        <div className="pivot-main-panel">
          {/* 필터 바 */}
          <div className="pivot-filter-area">
            <PivotFilterBar
              onDataLoaded={handleDataLoaded}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              isSyncing={isSyncing}
              setIsSyncing={setIsSyncing}
              onSyncReady={fn => { syncHandlerRef.current = fn }}
              onSyncComplete={() => {}}
            />

            {/* excludeZero 체크박스 */}
            <label className="pivot-exclude-zero-label">
              <input
                type="checkbox"
                checked={excludeZero}
                onChange={e => setExcludeZero(e.target.checked)}
                className="pivot-checkbox-input"
              />
              DB수량·광고비 0 제외
            </label>
            <label className="pivot-exclude-zero-label" title="캠페인 이름이 없는 경우 미매핑으로 분류됩니다.&#10;Google/Meta/TikTok 외 채널(홈페이지, 오프라인 등)이 해당됩니다.">
              <input
                type="checkbox"
                checked={showUnmapped}
                onChange={e => setShowUnmapped(e.target.checked)}
                className="pivot-checkbox-input"
              />
              미매핑 포함
            </label>
          </div>

          {/* 테이블 영역 */}
          <div className="pivot-content">
            {!isSearched && !isLoading ? (
              <div className="pivot-empty-state">
                <span className="pivot-empty-state-icon">📊</span>
                <span>날짜를 선택하고 검색하세요</span>
              </div>
            ) : (
              <PivotTable
                tree={tree}
                totals={totals}
                colKeys={colKeys}
                rowFields={rowFields}
                colFields={colFields}
                valueFields={valueFields}
                loading={isLoading}
                visibleColKeys={visibleColKeys}
                orderedColKeys={orderedColKeys}
                targetCosts={targetCosts}
                sourceLinkMap={sourceLinkMap}
              />
            )}
          </div>
        </div>

        {/* 오른쪽 필드 구성 패널 (토글) */}
        {!isPanelOpen && (
          <button
            type="button"
            className="pivot-panel-reopen-tab"
            onClick={() => setIsPanelOpen(true)}
            title="피봇 컨트롤러 열기"
          >
            <ChevronLeft size={14} />
          </button>
        )}
        <div className={`pivot-right-panel${isPanelOpen ? ' pivot-right-panel--open' : ''}`}>
          <div className="pivot-right-panel-inner">
            <div className="pivot-right-panel-header">
              <span className="pivot-right-panel-title">피봇 컨트롤러</span>
              <button
                type="button"
                className="pivot-right-panel-close"
                onClick={() => setIsPanelOpen(false)}
                title="패널 닫기"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="pivot-right-panel-body">
              <PivotFieldConfig
                rowFields={rowFields}
                colFields={colFields}
                valueFields={valueFields}
                onRowFieldsChange={setRowFields}
                onColFieldsChange={setColFields}
                onValueFieldsChange={setValueFields}
                colKeys={colKeys}
                visibleColKeys={visibleColKeys}
                onVisibleColKeysChange={setVisibleColKeys}
                orderedColKeys={orderedColKeys}
                onOrderedColKeysChange={setOrderedColKeys}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 프리셋 모달 */}
      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        currentConfig={{ rowFields, colFields, valueFields }}
        onApply={handlePresetApply}
      />

      {/* 목표 DB단가 모달 */}
      <TargetCostModal
        isOpen={isTargetCostModalOpen}
        onClose={() => setIsTargetCostModalOpen(false)}
        onSave={setTargetCosts}
      />

      {/* 계산식 모달 */}
      <FormulaModal isOpen={isFormulaModalOpen} onClose={() => setIsFormulaModalOpen(false)} />
    </div>
  )
}

export default PivotPage
