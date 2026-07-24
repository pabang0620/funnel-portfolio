import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  memo,
  startTransition,
} from 'react'
import ReactDOM from 'react-dom'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  X,
  Filter,
  Plus,
  Save,
  Star,
  Trash2,
  ChevronsUpDown,
  Check,
  Maximize2,
  Minimize2,
  Paintbrush,
  Download,
  Eye,
} from 'lucide-react'
import { getField, FIELDS, getFieldTooltip } from '../lib/pivotFieldRegistry'
import { getConditionalBgColor } from '../conditional-format'
import { exportPivotToExcel } from '../lib/exportExcel'
import ConditionalFormatPanel from './ConditionalFormatPanel'

import './PivotTable.css'

// ---------------------------------------------------------------------------
// 상수
// ---------------------------------------------------------------------------
const LABEL_COLUMN_WIDTH = 320
const VALUE_COLUMN_WIDTH = 130
const MIN_LABEL_WIDTH = 100
const MIN_VALUE_WIDTH = 60
const DATE_TIME_FIELDS = new Set(['date'])
const GRAND_TOTAL_KEY = '(합계)'

const GROUP_LEVEL_COLORS = [
  { bg: 'rgba(243,244,246,0.5)', hover: 'rgba(243,244,246,0.9)' },
  { bg: 'rgba(249,250,251,0.5)', hover: 'rgba(249,250,251,0.9)' },
  { bg: 'rgba(255,255,255,0.5)', hover: 'rgba(255,255,255,0.9)' },
  { bg: '#fff', hover: '#f9fafb' },
]

const numberFormatter = new Intl.NumberFormat('ko-KR')

// ---------------------------------------------------------------------------
// 값 포맷팅
// ---------------------------------------------------------------------------
function formatValue(value, fieldKey) {
  if (value === null || value === undefined) return '-'
  const field = getField(fieldKey)
  const fmt = field ? field.format : 'number'
  switch (fmt) {
    case 'currency':
      return `${numberFormatter.format(Math.round(value))}원`
    case 'percent':
      return `${Number(value).toFixed(2)}%`
    case 'number':
      return numberFormatter.format(Math.round(value))
    case 'text':
    case 'date':
    default:
      return String(value)
  }
}

// 목표 DB단가 초과 여부 체크 → 빨간색 스타일 반환
function getTargetCostStyle(fieldKey, value, hospitalName, targetCosts) {
  if (!targetCosts || !hospitalName) return null
  if (fieldKey !== 'db_cost_valid' && fieldKey !== 'db_cost_total') return null
  if (value === null || value === undefined) return null
  const target = targetCosts[hospitalName]
  if (target == null) return null
  if (Number(value) >= target) return { color: '#ef4444', fontWeight: 600 }
  return null
}

function getFieldLabel(key) {
  const field = getField(key)
  return field ? field.label : key
}

function formatNumberWithCommas(value) {
  const cleaned = value.replace(/[^0-9.\-]/g, '')
  if (!cleaned || cleaned === '-') return cleaned
  const parts = cleaned.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

function stripCommas(value) {
  return value.replace(/,/g, '')
}

// ---------------------------------------------------------------------------
// col pivot용 metric key
// ---------------------------------------------------------------------------
function metricKey(vfField, colKey) {
  if (colKey !== undefined) return `${colKey}::${vfField}`
  return vfField
}

// ---------------------------------------------------------------------------
// 트리 평탄화 (med-manager 트리 구조에 맞게)
// ---------------------------------------------------------------------------
function flattenTree(nodes, expandedPaths, sortConfig, rowFields, currentLevel) {
  const result = []
  const currentField = rowFields[currentLevel]

  let orderedNodes
  if (currentField === 'date') {
    orderedNodes = [...nodes].sort((a, b) => a.key.localeCompare(b.key))
  } else if (sortConfig) {
    orderedNodes = sortNodes(nodes, sortConfig)
  } else {
    orderedNodes = nodes
  }

  for (const node of orderedNodes) {
    const hasChildren = node.children && node.children.length > 0
    const path = node._path
    const isExpanded = expandedPaths.has(path)

    if (hasChildren) {
      result.push({
        type: 'group',
        key: `group-${path}`,
        level: node.depth,
        label: node.key,
        metrics: nodeMetrics(node),
        hasChildren: true,
        isExpanded,
        path,
        _node: node,
      })

      if (isExpanded) {
        const children = flattenTree(node.children, expandedPaths, sortConfig, rowFields, currentLevel + 1)
        for (let i = 0; i < children.length; i++) result.push(children[i])
      }
    } else {
      result.push({
        type: 'leaf',
        key: `leaf-${path}`,
        level: node.depth,
        label: node.key,
        metrics: nodeMetrics(node),
        hasChildren: false,
        isExpanded: false,
        path,
        _node: node,
      })
    }
  }

  return result
}

// med-manager 트리 노드의 metrics: node.values[colKey]
// colKey 없을 때 (합계) 사용
function nodeMetrics(node) {
  // For access in table, expose as flat map: vfField -> value (using grand total)
  const vals = node.values || {}
  const totalVals = vals[GRAND_TOTAL_KEY] || {}
  return totalVals
}

// For col pivot: get value for specific colKey + vfField
function getNodeColMetric(node, colKey, vfField) {
  const vals = node.values || {}
  const colVals = vals[colKey] || {}
  const v = colVals[vfField]
  return v !== undefined ? v : null
}

function sortNodes(nodes, sortConfig) {
  return [...nodes].sort((a, b) => {
    if (sortConfig.field === '__label__') {
      const diff = a.key.localeCompare(b.key, 'ko')
      return sortConfig.direction === 'asc' ? diff : -diff
    }
    const aVals = a.values || {}
    const aTot = aVals[GRAND_TOTAL_KEY] || {}
    const bVals = b.values || {}
    const bTot = bVals[GRAND_TOTAL_KEY] || {}
    const aVal = aTot[sortConfig.field]
    const bVal = bTot[sortConfig.field]
    if (aVal === null && bVal === null) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    const diff = aVal - bVal
    return sortConfig.direction === 'asc' ? diff : -diff
  })
}

// Assign _path to nodes
function assignPaths(nodes, parentPath) {
  for (const node of nodes) {
    const path = parentPath ? `${parentPath}|${node.key}` : node.key
    node._path = path
    if (node.children && node.children.length > 0) {
      assignPaths(node.children, path)
    }
  }
}

function filterTree(nodes, query) {
  if (!query.trim()) return nodes
  const lower = query.toLowerCase()
  return nodes.reduce((acc, node) => {
    const labelMatch = node.key.toLowerCase().includes(lower)
    const filteredChildren = filterTree(node.children || [], query)
    if (labelMatch || filteredChildren.length > 0) {
      acc.push({ ...node, children: labelMatch ? node.children : filteredChildren })
    }
    return acc
  }, [])
}

function evaluateMetricFilter(metrics, filter) {
  const val = metrics[filter.field]
  if (val === null || val === undefined) return false
  const target = Number(filter.value)
  if (isNaN(target)) return true
  switch (filter.operator) {
    case '>=': return val >= target
    case '>': return val > target
    case '=': return val === target
    case '<': return val < target
    case '<=': return val <= target
    case '!=': return val !== target
    default: return true
  }
}

function evaluateRowFilter(node, filter, rowFields) {
  const pathParts = (node._path || '').split('|')
  const fieldIndex = rowFields.indexOf(filter.field)
  if (fieldIndex === -1 || fieldIndex >= pathParts.length) return true
  const nodeValue = pathParts[fieldIndex]
  const target = filter.value
  if (DATE_TIME_FIELDS.has(filter.field)) {
    switch (filter.operator) {
      case '=': return nodeValue === target
      case '!=': return nodeValue !== target
      case '>=': return nodeValue >= target
      case '>': return nodeValue > target
      case '<': return nodeValue < target
      case '<=': return nodeValue <= target
      default: return true
    }
  }
  switch (filter.operator) {
    case '=': return nodeValue === target
    case '!=': return nodeValue !== target
    default: return true
  }
}

function evaluateDimValueFilter(node, filter) {
  // dimension 타입이지만 rowFields에 없는 경우 (valueFields에 있는 경우)
  // node.values 에서 텍스트 값으로 비교
  const metrics = nodeMetrics(node)
  const val = metrics[filter.field]
  if (val === null || val === undefined) return false
  switch (filter.operator) {
    case '=': return String(val) === String(filter.value)
    case '!=': return String(val) !== String(filter.value)
    default: return true
  }
}

function evaluateSingleFilter(node, filter, rowFields) {
  if (filter.type === 'row') {
    const inRowFields = rowFields.includes(filter.field)
    if (!inRowFields && getField(filter.field)?.type === 'dimension') {
      return evaluateDimValueFilter(node, filter)
    }
    return evaluateRowFilter(node, filter, rowFields)
  }
  return evaluateMetricFilter(nodeMetrics(node), filter)
}

function applyFilters(nodes, andFilters, orGroups, rowFields) {
  const validAnd = andFilters.filter(f => f.field && f.value.trim())
  const validOr = orGroups.map(g => ({ ...g, filters: g.filters.filter(f => f.field && f.value.trim()) })).filter(g => g.filters.length > 0)
  if (validAnd.length === 0 && validOr.length === 0) return nodes

  return nodes.reduce((acc, node) => {
    if (node.children && node.children.length > 0) {
      const filteredChildren = applyFilters(node.children, andFilters, orGroups, rowFields)
      if (filteredChildren.length > 0) acc.push({ ...node, children: filteredChildren })
    } else {
      const andPass = validAnd.every(f => evaluateSingleFilter(node, f, rowFields))
      if (!andPass) return acc
      const orPass = validOr.length === 0 || validOr.every(g => g.filters.some(f => evaluateSingleFilter(node, f, rowFields)))
      if (orPass) acc.push(node)
    }
    return acc
  }, [])
}

function collectGroupPaths(nodes) {
  const paths = []
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      paths.push(node._path)
      const childPaths = collectGroupPaths(node.children)
      for (let i = 0; i < childPaths.length; i++) paths.push(childPaths[i])
    }
  }
  return paths
}

function collectLeafPaths(nodes) {
  const paths = []
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const childLeafs = collectLeafPaths(node.children)
      for (let i = 0; i < childLeafs.length; i++) paths.push(childLeafs[i])
    } else {
      paths.push(node._path)
    }
  }
  return paths
}

function collectChildLeafPaths(nodes, parentPath) {
  for (const node of nodes) {
    if (node._path === parentPath) {
      if (!node.children || node.children.length === 0) return [node._path]
      return collectLeafPaths(node.children)
    }
    if (node.children && node.children.length > 0) {
      const found = collectChildLeafPaths(node.children, parentPath)
      if (found !== null) return found
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// ResizeHandle
// ---------------------------------------------------------------------------
function ResizeHandle({ onResize }) {
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      const delta = e.clientX - startXRef.current
      startXRef.current = e.clientX
      onResize(delta)
    }

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]
      const delta = touch.clientX - startXRef.current
      startXRef.current = touch.clientX
      onResize(delta)
    }

    const handleEnd = () => {
      setIsDragging(false)
      document.body.classList.remove('select-none')
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
    document.addEventListener('touchcancel', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
      document.removeEventListener('touchcancel', handleEnd)
    }
  }, [isDragging, onResize])

  const handleMouseDown = (e) => {
    e.stopPropagation()
    e.preventDefault()
    startXRef.current = e.clientX
    setIsDragging(true)
    document.body.classList.add('select-none')
  }

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return
    e.stopPropagation()
    startXRef.current = e.touches[0].clientX
    setIsDragging(true)
    document.body.classList.add('select-none')
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 6,
        cursor: 'col-resize',
        zIndex: 20,
        background: isDragging ? '#4C61CC' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.background = '#e2e8f0' }}
      onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.background = 'transparent' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    />
  )
}

// ---------------------------------------------------------------------------
// LoadingSkeleton
// ---------------------------------------------------------------------------
function LoadingSkeleton({ columnCount }) {
  const rows = Array.from({ length: 8 })
  const cols = Array.from({ length: columnCount || 4 })

  return (
    <div className="pivot-skeleton-wrapper">
      <div className="pivot-skeleton-header">
        <div className="pivot-skeleton-cell" style={{ width: 200, marginRight: 12 }} />
        {cols.map((_, i) => (
          <div key={i} className="pivot-skeleton-cell" style={{ width: 120, marginRight: 8 }} />
        ))}
      </div>
      {rows.map((_, rowIdx) => (
        <div key={rowIdx} className="pivot-skeleton-row">
          <div className="pivot-skeleton-cell" style={{ width: 180, marginRight: 12 }} />
          {cols.map((_, colIdx) => (
            <div key={colIdx} className="pivot-skeleton-cell" style={{ width: 100, marginRight: 8 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ALL RAW KEYS for selected totals
// ---------------------------------------------------------------------------
const ALL_RAW_KEYS = FIELDS.filter(f => f.type === 'raw').map(f => f.key)
const ALL_DERIVED_FIELDS = FIELDS.filter(f => f.type === 'calculated')

// ---------------------------------------------------------------------------
// 시안 미리보기 모달
// ---------------------------------------------------------------------------
const getYouTubeEmbedUrl = (url) => {
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`
  const longMatch = url.match(/[?&]v=([^?&]+)/)
  if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`
  return null
}

const isVideoUrl = (url) => /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url)

const SourcePreviewModal = React.memo(({ sourceLink, onClose }) => {
  const [mediaSrc, setMediaSrc] = React.useState(null)
  const [mediaFailed, setMediaFailed] = React.useState(false)

  React.useEffect(() => {
    if (!sourceLink) return
    setMediaSrc(null)
    setMediaFailed(false)
    if (!sourceLink.includes('amazonaws.com')) { setMediaSrc(sourceLink); return }
    const token = localStorage.getItem('token')
    fetch(`/api/urlCode/presigned?url=${encodeURIComponent(sourceLink)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (data.success) setMediaSrc(data.data.presignedUrl); else setMediaFailed(true) })
      .catch(() => setMediaFailed(true))
  }, [sourceLink])

  return ReactDOM.createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: '12px', padding: '24px', display: 'flex', gap: '16px', maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', position: 'relative', minWidth: '200px', minHeight: '100px' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '8px', right: '12px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}
        >✕</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>시안</div>
          {mediaFailed ? (
            <a href={sourceLink} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563eb', wordBreak: 'break-all' }}>{sourceLink}</a>
          ) : mediaSrc ? (
            getYouTubeEmbedUrl(sourceLink) ? (
              <iframe
                src={getYouTubeEmbedUrl(sourceLink)}
                style={{ width: '400px', height: '225px', borderRadius: '8px', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="시안 영상"
              />
            ) : isVideoUrl(sourceLink) ? (
              <video src={mediaSrc} style={{ maxWidth: '400px', maxHeight: '70vh', height: 'auto', display: 'block', borderRadius: '8px' }} controls muted autoPlay loop playsInline />
            ) : (
              <img src={mediaSrc} onError={() => setMediaFailed(true)} alt="시안" style={{ maxWidth: '400px', maxHeight: '70vh', height: 'auto', display: 'block', borderRadius: '8px' }} />
            )
          ) : (
            <div style={{ width: '200px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: '8px' }}>로딩 중...</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
})

// ---------------------------------------------------------------------------
// 메인 컴포넌트
// ---------------------------------------------------------------------------
const PivotTable = memo(function PivotTable({
  tree,
  totals,
  rowFields,
  valueFields,
  loading,
  onCheckedPathsChange,
  colFields,
  colKeys,
  visibleColKeys,
  orderedColKeys,
  targetCosts,
  sourceLinkMap,
}) {
  const hasColPivot = (colKeys?.length ?? 0) > 1 // colKeys includes (합계), so >1 means real col pivot

  // Assign paths to tree nodes
  const treeWithPaths = useMemo(() => {
    if (!tree) return []
    const copy = JSON.parse(JSON.stringify(tree))
    assignPaths(copy, '')
    return copy
  }, [tree])

  const [expanded, setExpanded] = useState(new Set())
  const [isTableCollapsed, setIsTableCollapsed] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [checkedPaths, setCheckedPaths] = useState(new Set())
  const [andFilters, setAndFilters] = useState([])
  const [orGroups, setOrGroups] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [conditionalRules, setConditionalRules] = useState([])
  const [isFormatOpen, setIsFormatOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sortConfig, setSortConfig] = useState(null)
  const [previewSourceLink, setPreviewSourceLink] = useState(null)

  useEffect(() => {
    if (!isFullscreen) return
    const handler = (e) => { if (e.key === 'Escape') setIsFullscreen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFullscreen])
  const [columnWidths, setColumnWidths] = useState({})
  const expandedBeforeSearch = useRef(null)
  const scrollContainerRef = useRef(null)

  // colKeys without (합계)
  const filteredColKeys = useMemo(() => {
    if (!hasColPivot) return []
    const source = orderedColKeys && orderedColKeys.length > 0 ? orderedColKeys : (colKeys || [])
    return source.filter(ck => ck !== GRAND_TOTAL_KEY && (visibleColKeys == null || visibleColKeys.has(ck)))
  }, [orderedColKeys, colKeys, visibleColKeys, hasColPivot])

  useEffect(() => {
    setExpanded(new Set())
    setCheckedPaths(new Set())
  }, [treeWithPaths])

  const applySearch = useCallback((query) => {
    if (query) {
      if (expandedBeforeSearch.current === null) {
        setExpanded(prev => {
          expandedBeforeSearch.current = new Set(prev)
          return new Set(collectGroupPaths(treeWithPaths))
        })
      } else {
        setExpanded(new Set(collectGroupPaths(treeWithPaths)))
      }
    } else {
      if (expandedBeforeSearch.current !== null) {
        setExpanded(expandedBeforeSearch.current)
        expandedBeforeSearch.current = null
      }
    }
    setSearchQuery(query)
  }, [treeWithPaths])

  const getColumnWidth = useCallback((key, isLabel) => {
    if (key in columnWidths) return columnWidths[key]
    return isLabel ? LABEL_COLUMN_WIDTH : VALUE_COLUMN_WIDTH
  }, [columnWidths])

  const handleResize = useCallback((key, isLabel) => (delta) => {
    setColumnWidths(prev => {
      const currentWidth = prev[key] ?? (isLabel ? LABEL_COLUMN_WIDTH : VALUE_COLUMN_WIDTH)
      const minWidth = isLabel ? MIN_LABEL_WIDTH : MIN_VALUE_WIDTH
      const newWidth = Math.max(minWidth, currentWidth + delta)
      return { ...prev, [key]: newWidth }
    })
  }, [])

  const toggleGroup = useCallback((path) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const handleSort = useCallback((field) => {
    setSortConfig(prev => {
      if (prev === null || prev.field !== field) return { field, direction: 'asc' }
      if (prev.direction === 'asc') return { field, direction: 'desc' }
      return null
    })
  }, [])

  const searchedTree = useMemo(() => filterTree(treeWithPaths, searchQuery), [treeWithPaths, searchQuery])
  const filteredTree = useMemo(() => applyFilters(searchedTree, andFilters, orGroups, rowFields), [searchedTree, andFilters, orGroups, rowFields])

  // Row filter options for dropdowns
  const rowFieldOptions = useMemo(() => {
    const options = {}
    function collect(nodes, level) {
      const field = rowFields[level]
      if (!field) return
      for (const node of nodes) {
        if (!options[field]) options[field] = []
        if (!options[field].includes(node.key)) options[field].push(node.key)
        if (node.children && node.children.length > 0) collect(node.children, level + 1)
      }
    }
    collect(treeWithPaths, 0)
    for (const f of rowFields) {
      if (!options[f]) options[f] = []
      options[f].sort((a, b) => a.localeCompare(b, 'ko'))
    }
    // operation_status: ON/OFF/미확인 고정 옵션 보장
    if (rowFields.includes('operation_status')) {
      const fixed = ['ON', 'OFF', '미확인']
      if (!options['operation_status']) options['operation_status'] = []
      fixed.forEach(v => { if (!options['operation_status'].includes(v)) options['operation_status'].unshift(v) })
      options['operation_status'] = ['ON', 'OFF', '미확인', ...options['operation_status'].filter(v => !fixed.includes(v))]
    }
    return options
  }, [treeWithPaths, rowFields])

  const makeNewFilter = useCallback((overrides) => ({
    id: String(Date.now()) + Math.random(),
    type: 'metric',
    field: (valueFields && valueFields[0]) || 'ad_spend',
    operator: '>=',
    value: '',
    ...overrides,
  }), [valueFields])

  const addAndFilter = useCallback(() => setAndFilters(prev => [...prev, makeNewFilter()]), [makeNewFilter])
  const updateAndFilter = useCallback((id, updates) => setAndFilters(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f)), [])
  const removeAndFilter = useCallback((id) => setAndFilters(prev => prev.filter(f => f.id !== id)), [])
  const addOrGroup = useCallback(() => setOrGroups(prev => [...prev, { id: String(Date.now()) + Math.random(), filters: [makeNewFilter()] }]), [makeNewFilter])
  const removeOrGroup = useCallback((groupId) => setOrGroups(prev => prev.filter(g => g.id !== groupId)), [])
  const addOrGroupFilter = useCallback((groupId) => setOrGroups(prev => prev.map(g => g.id === groupId ? { ...g, filters: [...g.filters, makeNewFilter()] } : g)), [makeNewFilter])
  const updateOrGroupFilter = useCallback((groupId, filterId, updates) => setOrGroups(prev => prev.map(g => g.id === groupId ? { ...g, filters: g.filters.map(f => f.id === filterId ? { ...f, ...updates } : f) } : g)), [])
  const removeOrGroupFilter = useCallback((groupId, filterId) => setOrGroups(prev => prev.map(g => g.id === groupId ? { ...g, filters: g.filters.filter(f => f.id !== filterId) } : g).filter(g => g.filters.length > 0)), [])
  const clearFilters = useCallback(() => { setAndFilters([]); setOrGroups([]) }, [])

  const toggleCheck = useCallback((path) => {
    const leafPaths = collectChildLeafPaths(filteredTree, path)
    if (!leafPaths) return
    setCheckedPaths(prev => {
      const next = new Set(prev)
      const allChecked = leafPaths.every(p => prev.has(p))
      if (allChecked) leafPaths.forEach(p => next.delete(p))
      else leafPaths.forEach(p => next.add(p))
      startTransition(() => { onCheckedPathsChange?.(next) })
      return next
    })
  }, [filteredTree, onCheckedPathsChange])

  const flatRows = useMemo(() =>
    flattenTree(filteredTree, expanded, sortConfig, rowFields, 0),
    [filteredTree, expanded, sortConfig, rowFields]
  )

  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 40,
    overscan: 20,
  })

  // Check state map + selected totals
  const { checkStateMap, selectedTotals, selectedColTotals } = useMemo(() => {
    const map = new Map()
    if (checkedPaths.size === 0) return { checkStateMap: map, selectedTotals: null, selectedColTotals: null }

    const base = {}
    for (const k of ALL_RAW_KEYS) base[k] = 0

    const colBases = {}
    for (const ck of (colKeys || [])) {
      colBases[ck] = {}
      for (const k of ALL_RAW_KEYS) colBases[ck][k] = 0
    }

    let checkedLeafCount = 0

    function compute(nodes) {
      let total = 0, checked = 0
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          const child = compute(node.children)
          total += child.total; checked += child.checked
          if (child.checked === 0) map.set(node._path, 'unchecked')
          else if (child.checked === child.total) map.set(node._path, 'checked')
          else map.set(node._path, 'indeterminate')
        } else {
          total += 1
          const isChecked = checkedPaths.has(node._path)
          if (isChecked) {
            checked += 1; checkedLeafCount += 1
            const m = nodeMetrics(node)
            for (const k of ALL_RAW_KEYS) base[k] += Number(m[k] ?? 0)
            const nodeVals = node.values || {}
            for (const ck of (colKeys || [])) {
              const ckVals = nodeVals[ck] || {}
              for (const k of ALL_RAW_KEYS) colBases[ck][k] += Number(ckVals[k] ?? 0)
            }
          }
          map.set(node._path, isChecked ? 'checked' : 'unchecked')
        }
      }
      return { total, checked }
    }
    compute(filteredTree)

    let totalsResult = null
    let colTotalsResult = null
    if (checkedLeafCount > 0) {
      totalsResult = { ...base }
      for (const dm of ALL_DERIVED_FIELDS) {
        if (dm.deriveFn) totalsResult[dm.key] = dm.deriveFn(base)
      }
      colTotalsResult = {}
      for (const ck of (colKeys || [])) {
        colTotalsResult[ck] = { ...colBases[ck] }
        for (const dm of ALL_DERIVED_FIELDS) {
          if (dm.deriveFn) colTotalsResult[ck][dm.key] = dm.deriveFn(colBases[ck])
        }
      }
    }
    return { checkStateMap: map, selectedTotals: totalsResult, selectedColTotals: colTotalsResult }
  }, [filteredTree, checkedPaths, colKeys])

  const labelWidth = getColumnWidth('__label__', true)
  const valueColumnsPerGroup = valueFields.reduce((sum, vf) => sum + getColumnWidth(vf, false), 0)
  const showGrandTotalCol = visibleColKeys == null || visibleColKeys.has(GRAND_TOTAL_KEY)
  const colGroupCount = hasColPivot ? filteredColKeys.length + (showGrandTotalCol ? 1 : 0) : 1
  const totalWidth = labelWidth + valueColumnsPerGroup * colGroupCount

  if (loading) {
    return <LoadingSkeleton columnCount={valueFields.length || 4} />
  }

  if (!tree || tree.length === 0) {
    return <div className="pivot-empty">No data</div>
  }

  // dimension 타입 필드 고정 옵션 (행 필드에 없어도 값 선택 가능)
  const FIXED_DIM_OPTIONS = {
    operation_status: ['ON', 'OFF', '미확인'],
    judgment_result:  ['이미 OFF', '테스트중', 'OFF 필요', '회복중', '하락세', '증액'],
  }

  // Helper: render filter row
  function renderFilterRow(filter, updateFn, removeFn) {
    const rowFieldKeySet = new Set(rowFields)
    // dimension 타입 필드 여부: rowFields에 있거나 레지스트리상 dimension 타입이면 텍스트 필터
    const isDimField = (f) => rowFieldKeySet.has(f) || getField(f)?.type === 'dimension'
    return (
      <div key={filter.id} className="pivot-filter-row">
        <select
          value={filter.field}
          onChange={(e) => {
            const newField = e.target.value
            const isDim = isDimField(newField)
            updateFn(filter.id, { field: newField, type: isDim ? 'row' : 'metric', operator: isDim ? '=' : '>=', value: '' })
          }}
          className="pivot-filter-select"
          style={{ minWidth: 80 }}
        >
          <optgroup label="행 차원">
            {rowFields.map(rf => <option key={rf} value={rf}>{getFieldLabel(rf)}</option>)}
          </optgroup>
          <optgroup label="메트릭">
            {valueFields.filter(vf => getField(vf)?.type !== 'dimension').map(vf => (
              <option key={vf} value={vf}>{getFieldLabel(vf)}</option>
            ))}
          </optgroup>
          {valueFields.some(vf => getField(vf)?.type === 'dimension' && !rowFieldKeySet.has(vf)) && (
            <optgroup label="차원(값 필드)">
              {valueFields.filter(vf => getField(vf)?.type === 'dimension' && !rowFieldKeySet.has(vf)).map(vf => (
                <option key={vf} value={vf}>{getFieldLabel(vf)}</option>
              ))}
            </optgroup>
          )}
        </select>
        <select
          value={filter.operator}
          onChange={(e) => updateFn(filter.id, { operator: e.target.value })}
          className="pivot-filter-select"
          style={{ width: 52 }}
        >
          {isDimField(filter.field) && !DATE_TIME_FIELDS.has(filter.field) ? (
            <><option value="=">=</option><option value="!=">≠</option></>
          ) : (
            <><option value=">=">≥</option><option value=">">{">"}</option><option value="=">=</option><option value="<">{"<"}</option><option value="<=">≤</option><option value="!=">≠</option></>
          )}
        </select>
        {DATE_TIME_FIELDS.has(filter.field) ? (
          <input
            type="date"
            value={filter.value}
            onChange={(e) => updateFn(filter.id, { value: e.target.value })}
            className="pivot-filter-input"
            style={{ width: 130 }}
          />
        ) : isDimField(filter.field) ? (
          <select
            value={filter.value}
            onChange={(e) => updateFn(filter.id, { value: e.target.value })}
            className="pivot-filter-select"
            style={{ minWidth: 80 }}
          >
            <option value="">선택...</option>
            {(FIXED_DIM_OPTIONS[filter.field] || rowFieldOptions[filter.field] || []).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            inputMode="decimal"
            value={formatNumberWithCommas(filter.value)}
            onChange={(e) => {
              const raw = stripCommas(e.target.value)
              if (raw === '' || raw === '-' || /^-?\d*\.?\d*$/.test(raw)) updateFn(filter.id, { value: raw })
            }}
            placeholder="값"
            className="pivot-filter-input"
            style={{ width: 80 }}
          />
        )}
        <button type="button" onClick={() => removeFn(filter.id)} className="pivot-filter-remove-btn">
          <X size={13} />
        </button>
      </div>
    )
  }

  const rowFieldKeySet = new Set(rowFields)

  return (
    <>
      <div style={isFullscreen ? {
        position: 'fixed', inset: 0, zIndex: 50, backgroundColor: '#fff', display: 'flex', flexDirection: 'column',
      } : {
        border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column',
      }}>
        <div style={isFullscreen ? { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' } : { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Search */}
          <div className="pivot-table-search-bar">
            <button type="button" onClick={() => applySearch(searchInput)} className="pivot-table-search-icon">
              <Search size={16} />
            </button>
            <input
              type="text"
              placeholder="검색... (Enter)"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                if (e.target.value === '') applySearch('')
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') applySearch(searchInput) }}
            />
            {searchQuery && (
              <>
                <span className="pivot-table-search-count">{flatRows.length}건</span>
                <button type="button" onClick={() => { setSearchInput(''); applySearch('') }} className="pivot-table-search-clear">
                  <X size={13} />
                </button>
              </>
            )}
            {isFullscreen && (
              <span style={{ fontSize: 11, color: '#a0aec0', flexShrink: 0, userSelect: 'none' }}>
                ESC 키로 전체화면 종료
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                const allExpanded = new Set()
                const collectAllPaths = (nodes) => { for (const n of nodes) { if (n._path) allExpanded.add(n._path); if (n.children?.length) collectAllPaths(n.children) } }
                collectAllPaths(filteredTree)
                exportPivotToExcel(flattenTree(filteredTree, allExpanded, sortConfig, rowFields, 0), rowFields, valueFields, totals, hasColPivot, colKeys)
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
              title="엑셀 다운로드"
            >
              <Download size={14} style={{ color: '#718096' }} />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
              title={isFullscreen ? '전체화면 종료 (ESC)' : '전체화면'}
            >
              {isFullscreen
                ? <><Minimize2 size={14} style={{ color: '#718096' }} /><span style={{ fontSize: 12, color: '#718096' }}>종료</span></>
                : <Maximize2 size={14} style={{ color: '#718096' }} />
              }
            </button>
          </div>

          {/* Filter Panel */}
          <div className="pivot-filter-panel">
            <button
              type="button"
              onClick={() => setIsFilterOpen(v => !v)}
              className="pivot-filter-toggle"
            >
              <Filter size={13} />
              <span>{hasColPivot ? '행 필터' : '필터'}</span>
              {(() => {
                const count = andFilters.filter(f => f.field && f.value.trim()).length + orGroups.flatMap(g => g.filters).filter(f => f.field && f.value.trim()).length
                return count > 0 ? <span className="pivot-filter-badge">{count}</span> : null
              })()}
              {isFilterOpen ? <ChevronUp size={13} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={13} style={{ marginLeft: 'auto' }} />}
            </button>
            {isFilterOpen && (
              <div className="pivot-filter-body">
                {/* AND group */}
                <div className="pivot-filter-group">
                  <div className="pivot-filter-group-label">모두 만족 (AND)</div>
                  {andFilters.map((filter) => renderFilterRow(filter, updateAndFilter, removeAndFilter))}
                  <button type="button" onClick={addAndFilter} className="pivot-filter-add-btn">
                    <Plus size={11} /><span>조건 추가</span>
                  </button>
                </div>

                {/* OR groups */}
                {orGroups.map((group) => (
                  <div key={group.id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AND</span>
                    </div>
                    <div style={{ border: '1px solid #e9d8fd', borderRadius: 6, padding: 8, backgroundColor: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>하나 이상 만족 (OR)</span>
                        <button type="button" onClick={() => removeOrGroup(group.id)} className="pivot-filter-remove-btn">
                          <X size={13} />
                        </button>
                      </div>
                      {group.filters.map((filter) => renderFilterRow(
                        filter,
                        (id, updates) => updateOrGroupFilter(group.id, id, updates),
                        (id) => removeOrGroupFilter(group.id, id)
                      ))}
                      <button type="button" onClick={() => addOrGroupFilter(group.id)} className="pivot-filter-add-btn" style={{ color: '#7c3aed' }}>
                        <Plus size={11} /><span>조건 추가</span>
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pivot-filter-actions">
                  <button type="button" onClick={addOrGroup} style={{ fontSize: 12, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={12} /><span>OR 그룹 추가</span>
                  </button>
                  {(andFilters.length > 0 || orGroups.length > 0) && (
                    <button type="button" onClick={clearFilters} className="pivot-filter-clear-btn" style={{ marginLeft: 'auto' }}>
                      전체 초기화
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Conditional Format Panel */}
          <div style={{ borderBottom: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setIsFormatOpen(v => !v)}
              className="pivot-filter-toggle"
            >
              <Paintbrush size={13} />
              <span>조건부 서식</span>
              {conditionalRules.length > 0 && (
                <span className="pivot-filter-badge">{conditionalRules.length}</span>
              )}
              {isFormatOpen ? <ChevronUp size={13} style={{ marginLeft: 'auto' }} /> : <ChevronDown size={13} style={{ marginLeft: 'auto' }} />}
            </button>
            {isFormatOpen && (
              <ConditionalFormatPanel
                rules={conditionalRules}
                onRulesChange={setConditionalRules}
                valueFields={valueFields.map(vf => ({ field: vf }))}
              />
            )}
          </div>

          {/* Table */}
          <div
            ref={scrollContainerRef}
            style={{
              overflow: 'auto',
              flex: 1,
            }}
          >
            <div style={{ minWidth: totalWidth }}>
              {/* Header */}
              {hasColPivot ? (
                <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex' }}>
                  {/* Label col */}
                  <div
                    style={{
                      position: 'relative',
                      flexShrink: 0,
                      width: labelWidth,
                      padding: '0 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'left',
                      borderRight: '1px solid #e2e8f0',
                      userSelect: 'none',
                      backgroundColor: '#f0f5fa',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                      onClick={() => setIsTableCollapsed(v => !v)}
                    >
                      {isTableCollapsed
                        ? <ChevronRight size={13} style={{ color: '#718096' }} />
                        : <ChevronDown size={13} style={{ color: '#718096' }} />}
                      <input
                        type="checkbox"
                        style={{ width: 13, height: 13, accentColor: '#4C61CC', cursor: 'pointer', flexShrink: 0 }}
                        checked={checkedPaths.size > 0 && filteredTree.every(n => checkStateMap.get(n._path) === 'checked')}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = checkedPaths.size > 0 && filteredTree.some(n => {
                              const s = checkStateMap.get(n._path)
                              return s === 'indeterminate' || s === 'checked'
                            }) && !filteredTree.every(n => checkStateMap.get(n._path) === 'checked')
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => {
                          const allLeafs = collectLeafPaths(filteredTree)
                          const allChecked = allLeafs.every(p => checkedPaths.has(p))
                          if (allChecked) {
                            const empty = new Set()
                            setCheckedPaths(empty)
                            startTransition(() => { onCheckedPathsChange?.(empty) })
                          } else {
                            const all = new Set(allLeafs)
                            setCheckedPaths(all)
                            startTransition(() => { onCheckedPathsChange?.(all) })
                          }
                        }}
                      />
                      {getFieldLabel(rowFields[0] ?? '')}
                    </span>
                    <ResizeHandle onResize={handleResize('__label__', true)} />
                  </div>
                  {/* Right two-row header */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Row 1: col group labels */}
                    <div style={{ display: 'flex', backgroundColor: '#f0f5fa', borderBottom: '1px solid #e2e8f0' }}>
                      {filteredColKeys.map((ck, ckIdx) => (
                        <div
                          key={ck}
                          style={{
                            flexShrink: 0,
                            width: valueColumnsPerGroup,
                            padding: '8px 12px',
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            textAlign: 'center',
                            borderRight: '2px solid #e2e8f0',
                            borderTop: `3px solid ${['#4C61CC','#f59e0b','#10b981','#8b5cf6','#f43f5e'][ckIdx % 5]}`,
                            userSelect: 'none',
                          }}
                        >
                          {ck}
                        </div>
                      ))}
                      {showGrandTotalCol && (
                        <div style={{
                          flexShrink: 0, width: valueColumnsPerGroup, padding: '8px 12px',
                          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                          textAlign: 'center', borderTop: '3px solid #94a3b8', userSelect: 'none',
                        }}>
                          합계
                        </div>
                      )}
                    </div>
                    {/* Row 2: value sub-columns */}
                    <div style={{ display: 'flex', backgroundColor: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {[...filteredColKeys, ...(showGrandTotalCol ? [GRAND_TOTAL_KEY] : [])].map((ck) =>
                        valueFields.map((vf, vfIdx) => {
                          const width = getColumnWidth(vf, false)
                          const sortK = metricKey(vf, ck)
                          const isActive = sortConfig?.field === sortK
                          const isLast = vfIdx === valueFields.length - 1
                          return (
                            <div
                              key={`${ck}::${vf}`}
                              style={{
                                position: 'relative',
                                flexShrink: 0,
                                width,
                                padding: '6px 12px',
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                textAlign: 'right',
                                borderRight: isLast ? '2px solid #cbd5e0' : '1px solid #e2e8f0',
                                userSelect: 'none',
                                overflow: 'hidden',
                              }}
                            >
                              <span
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, cursor: 'pointer' }}
                                title={getFieldTooltip(vf)}
                                onClick={() => handleSort(sortK)}
                              >
                                {getFieldLabel(vf)}
                                {isActive ? (
                                  sortConfig.direction === 'asc'
                                    ? <ArrowUp size={13} />
                                    : <ArrowDown size={13} />
                                ) : (
                                  <ArrowUpDown size={13} style={{ color: '#a0aec0' }} />
                                )}
                              </span>
                              <ResizeHandle onResize={handleResize(vf, false)} />
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Single header row
                <div style={{
                  display: 'flex',
                  backgroundColor: '#f7fafc',
                  borderBottom: '1px solid #e2e8f0',
                  position: 'sticky',
                  top: 0,
                  zIndex: 20,
                }}>
                  <div
                    style={{
                      position: 'relative',
                      flexShrink: 0,
                      width: labelWidth,
                      padding: '10px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      textAlign: 'left',
                      borderRight: '1px solid #e2e8f0',
                      userSelect: 'none',
                      backgroundColor: '#f0f5fa',
                    }}
                  >
                    <span
                      style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                      onClick={() => setIsTableCollapsed(v => !v)}
                    >
                      {isTableCollapsed
                        ? <ChevronRight size={13} style={{ color: '#718096' }} />
                        : <ChevronDown size={13} style={{ color: '#718096' }} />}
                      <input
                        type="checkbox"
                        style={{ width: 13, height: 13, accentColor: '#4C61CC', cursor: 'pointer', flexShrink: 0 }}
                        checked={checkedPaths.size > 0 && filteredTree.every(n => checkStateMap.get(n._path) === 'checked')}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = checkedPaths.size > 0 && filteredTree.some(n => {
                              const s = checkStateMap.get(n._path)
                              return s === 'indeterminate' || s === 'checked'
                            }) && !filteredTree.every(n => checkStateMap.get(n._path) === 'checked')
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => {
                          const allLeafs = collectLeafPaths(filteredTree)
                          const allChecked = allLeafs.every(p => checkedPaths.has(p))
                          if (allChecked) {
                            const empty = new Set()
                            setCheckedPaths(empty)
                            startTransition(() => { onCheckedPathsChange?.(empty) })
                          } else {
                            const all = new Set(allLeafs)
                            setCheckedPaths(all)
                            startTransition(() => { onCheckedPathsChange?.(all) })
                          }
                        }}
                      />
                      {getFieldLabel(rowFields[0] ?? '')}
                    </span>
                    <ResizeHandle onResize={handleResize('__label__', true)} />
                  </div>
                  {valueFields.map((vf) => {
                    const width = getColumnWidth(vf, false)
                    const isActive = sortConfig?.field === vf
                    return (
                      <div
                        key={vf}
                        style={{
                          position: 'relative',
                          flexShrink: 0,
                          width,
                          padding: '10px 12px',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          textAlign: 'right',
                          borderRight: '1px solid #e2e8f0',
                          userSelect: 'none',
                          overflow: 'hidden',
                        }}
                      >
                        <span
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, cursor: 'pointer' }}
                          title={getFieldTooltip(vf)}
                          onClick={() => handleSort(vf)}
                        >
                          {getFieldLabel(vf)}
                          {isActive ? (
                            sortConfig.direction === 'asc'
                              ? <ArrowUp size={13} />
                              : <ArrowDown size={13} />
                          ) : (
                            <ArrowUpDown size={13} style={{ color: '#a0aec0' }} />
                          )}
                        </span>
                        <ResizeHandle onResize={handleResize(vf, false)} />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Body - virtualized */}
              {!isTableCollapsed && (
                <>
                  {searchQuery && flatRows.length === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', color: '#a0aec0', fontSize: 14 }}>
                      검색 결과 없음
                    </div>
                  )}
                  {flatRows.length > 0 && (
                    <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                      {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                        const row = flatRows[virtualItem.index]
                        const isGroup = row.type === 'group'
                        const isLeaf = row.type === 'leaf'
                        const levelColor = GROUP_LEVEL_COLORS[Math.min(row.level, GROUP_LEVEL_COLORS.length - 1)]

                        const rowStyle = {
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: virtualItem.size,
                          transform: `translateY(${virtualItem.start}px)`,
                          display: 'flex',
                          borderBottom: '1px solid rgba(226,232,240,0.5)',
                          alignItems: 'stretch',
                          cursor: isGroup ? 'pointer' : undefined,
                          fontWeight: isGroup ? 600 : undefined,
                          backgroundColor: isGroup ? levelColor.bg : '#fff',
                        }

                        return (
                          <div
                            key={row.key}
                            style={rowStyle}
                            onClick={isGroup && row.hasChildren ? () => toggleGroup(row.path) : undefined}
                            className={isGroup ? 'pivot-group-row' : isLeaf ? 'pivot-leaf-row' : ''}
                          >
                            {/* Label cell */}
                            <div
                              style={{
                                flexShrink: 0,
                                width: labelWidth,
                                paddingLeft: `${row.level * 24 + 12}px`,
                                paddingRight: 12,
                                fontSize: 13,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: '#fff',
                                position: 'sticky',
                                left: 0,
                                zIndex: 10,
                                borderRight: '2px solid #e2e8f0',
                              }}
                            >
                              {isGroup && row.hasChildren && (
                                row.isExpanded
                                  ? <ChevronDown size={14} style={{ color: '#718096', flexShrink: 0 }} />
                                  : <ChevronRight size={14} style={{ color: '#718096', flexShrink: 0 }} />
                              )}
                              <input
                                type="checkbox"
                                style={{ width: 13, height: 13, accentColor: '#4C61CC', cursor: 'pointer', flexShrink: 0 }}
                                checked={row.type === 'leaf' ? checkedPaths.has(row.path) : checkStateMap.get(row.path) === 'checked'}
                                ref={(el) => {
                                  if (el && row.type === 'group') {
                                    el.indeterminate = checkStateMap.get(row.path) === 'indeterminate'
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleCheck(row.path)}
                              />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}
                                title={row.label === '(미분류)' ? '구글/메타/틱톡 외 채널(홈페이지, 오프라인, 당근마켓 등) 또는 광고 플랫폼 데이터와 매핑되지 않은 항목입니다.' : undefined}
                              >
                                {row.label}
                              </span>
                              {sourceLinkMap?.[row.label] && (
                                <button
                                  type="button"
                                  onClick={e => { e.stopPropagation(); setPreviewSourceLink(sourceLinkMap[row.label]) }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', display: 'flex', alignItems: 'center', flexShrink: 0, marginLeft: 'auto', color: '#4C61CC' }}
                                  title="시안 미리보기"
                                >
                                  <Eye size={15} />
                                </button>
                              )}
                            </div>

                            {/* Value cells */}
                            {hasColPivot ? (
                              <>
                                {filteredColKeys.map((ck) =>
                                  valueFields.map((vf, vfIdx) => {
                                    const isLast = vfIdx === valueFields.length - 1
                                    const val = getNodeColMetric(row._node, ck, vf)
                                    const bgColor = getConditionalBgColor(val, vf, conditionalRules)
                                    const hIdx = rowFields.indexOf('hospital_name')
                                    const hName = hIdx >= 0 ? row.path?.split('|')[hIdx] : null
                                    const tStyle = getTargetCostStyle(vf, val, hName, targetCosts)
                                    return (
                                      <div
                                        key={`${ck}::${vf}`}
                                        style={{
                                          flexShrink: 0,
                                          width: getColumnWidth(vf, false),
                                          padding: '0 12px',
                                          fontSize: 13,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'flex-end',
                                          fontVariantNumeric: 'tabular-nums',
                                          borderRight: isLast ? '2px solid #cbd5e0' : '1px solid #e2e8f0',
                                          overflow: 'hidden',
                                          backgroundColor: bgColor || undefined,
                                          ...tStyle,
                                        }}
                                      >
                                        {formatValue(val, vf)}
                                      </div>
                                    )
                                  })
                                )}
                                {showGrandTotalCol && valueFields.map((vf, vfIdx) => {
                                  const val = getNodeColMetric(row._node, GRAND_TOTAL_KEY, vf)
                                  const bgColor = getConditionalBgColor(val, vf, conditionalRules)
                                  const isLast = vfIdx === valueFields.length - 1
                                  return (
                                    <div
                                      key={`total::${vf}`}
                                      style={{
                                        flexShrink: 0,
                                        width: getColumnWidth(vf, false),
                                        padding: '0 12px',
                                        fontSize: 13,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        fontVariantNumeric: 'tabular-nums',
                                        borderRight: isLast ? '2px solid #cbd5e0' : '1px solid #e2e8f0',
                                        overflow: 'hidden',
                                        backgroundColor: bgColor || undefined,
                                      }}
                                    >
                                      {formatValue(val, vf)}
                                    </div>
                                  )
                                })}
                              </>
                            ) : (
                              valueFields.map((vf) => {
                                const val = row.metrics[vf] !== undefined ? row.metrics[vf] : null
                                const bgColor = getConditionalBgColor(val, vf, conditionalRules)
                                const hospitalIdx = rowFields.indexOf('hospital_name')
                                const hospitalName = hospitalIdx >= 0 ? row.path?.split('|')[hospitalIdx] : null
                                const targetStyle = getTargetCostStyle(vf, val, hospitalName, targetCosts)
                                return (
                                  <div
                                    key={vf}
                                    style={{
                                      flexShrink: 0,
                                      width: getColumnWidth(vf, false),
                                      padding: '0 12px',
                                      fontSize: 13,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'flex-end',
                                      fontVariantNumeric: 'tabular-nums',
                                      borderRight: '1px solid #e2e8f0',
                                      overflow: 'hidden',
                                      backgroundColor: bgColor || undefined,
                                      ...targetStyle,
                                    }}
                                  >
                                    {formatValue(val, vf)}
                                  </div>
                                )
                              })
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Selected totals footer */}
              {selectedTotals && (
                <div style={{
                  display: 'flex',
                  backgroundColor: '#eff6ff',
                  fontWeight: 700,
                  fontSize: 13,
                  borderTop: '2px solid #93c5fd',
                  height: 40,
                  alignItems: 'stretch',
                  position: 'sticky',
                  bottom: 40,
                  zIndex: 20,
                }}>
                  <div style={{ flexShrink: 0, width: labelWidth, padding: '0 12px', display: 'flex', alignItems: 'center', position: 'sticky', left: 0, backgroundColor: '#dbeafe' }}>
                    선택 합계 ({checkedPaths.size}건)
                  </div>
                  {hasColPivot ? (
                    <>
                      {filteredColKeys.map((ck) =>
                        valueFields.map((vf, vfIdx) => {
                          const isLast = vfIdx === valueFields.length - 1
                          return (
                            <div key={`${ck}::${vf}`} style={{ flexShrink: 0, width: getColumnWidth(vf, false), padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderRight: isLast ? '2px solid #cbd5e0' : '1px solid #e2e8f0' }}>
                              {formatValue(selectedColTotals?.[ck]?.[vf], vf)}
                            </div>
                          )
                        })
                      )}
                      {showGrandTotalCol && valueFields.map((vf) => (
                        <div key={`total::${vf}`} style={{ flexShrink: 0, width: getColumnWidth(vf, false), padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderRight: '1px solid #e2e8f0' }}>
                          {formatValue(selectedTotals[vf], vf)}
                        </div>
                      ))}
                    </>
                  ) : (
                    valueFields.map((vf) => (
                      <div key={vf} style={{ flexShrink: 0, width: getColumnWidth(vf, false), padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderRight: '1px solid #e2e8f0' }}>
                        {formatValue(selectedTotals[vf], vf)}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Grand totals footer */}
              <div style={{
                display: 'flex',
                backgroundColor: '#f7fafc',
                fontWeight: 700,
                fontSize: 13,
                borderTop: '2px solid #e2e8f0',
                height: 40,
                alignItems: 'stretch',
                position: 'sticky',
                bottom: 0,
                zIndex: 20,
              }}>
                <div style={{ flexShrink: 0, width: labelWidth, padding: '0 12px', display: 'flex', alignItems: 'center', position: 'sticky', left: 0, backgroundColor: '#f7fafc' }}>
                  총합
                </div>
                {hasColPivot ? (
                  <>
                    {filteredColKeys.map((ck) =>
                      valueFields.map((vf, vfIdx) => {
                        const isLast = vfIdx === valueFields.length - 1
                        const totalsForCk = (totals?.[ck]) || {}
                        return (
                          <div key={`${ck}::${vf}`} style={{ flexShrink: 0, width: getColumnWidth(vf, false), padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderRight: isLast ? '2px solid #cbd5e0' : '1px solid #e2e8f0' }}>
                            {formatValue(totalsForCk[vf], vf)}
                          </div>
                        )
                      })
                    )}
                    {showGrandTotalCol && valueFields.map((vf) => {
                      const totalsForCk = (totals?.[GRAND_TOTAL_KEY]) || {}
                      return (
                        <div key={`total::${vf}`} style={{ flexShrink: 0, width: getColumnWidth(vf, false), padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderRight: '1px solid #e2e8f0' }}>
                          {formatValue(totalsForCk[vf], vf)}
                        </div>
                      )
                    })}
                  </>
                ) : (
                  valueFields.map((vf) => {
                    const totalsRow = (totals?.[GRAND_TOTAL_KEY]) || {}
                    return (
                      <div key={vf} style={{ flexShrink: 0, width: getColumnWidth(vf, false), padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderRight: '1px solid #e2e8f0' }}>
                        {formatValue(totalsRow[vf], vf)}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {previewSourceLink && (
        <SourcePreviewModal
          sourceLink={previewSourceLink}
          onClose={() => setPreviewSourceLink(null)}
        />
      )}
    </>
  )
})

export default PivotTable
