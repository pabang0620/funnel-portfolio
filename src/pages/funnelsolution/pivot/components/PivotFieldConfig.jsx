import React, { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  X,
  Plus,
  ChevronRight,
  ChevronDown,
  Rows3,
  Columns3,
  BarChart3,
} from 'lucide-react'
import {
  DIMENSION_FIELDS,
  RAW_FIELDS,
  CALCULATED_FIELDS,
  REF_FIELDS,
  getField,
} from '../lib/pivotFieldRegistry'

// ---------------------------------------------------------------------------
// 존 타입 헬퍼
// ---------------------------------------------------------------------------
function getSourceZone(id) {
  if (id.startsWith('row::')) return 'row'
  if (id.startsWith('col::')) return 'col'
  if (id.startsWith('val::')) return 'val'
  return 'avail'
}

function getTargetZone(overId) {
  if (overId === 'zone-row' || overId.startsWith('row::')) return 'row'
  if (overId === 'zone-col' || overId.startsWith('col::')) return 'col'
  if (overId === 'zone-value' || overId.startsWith('val::')) return 'val'
  return 'avail'
}

function parseFieldKey(id) {
  const idx = id.indexOf('::')
  return idx !== -1 ? id.slice(idx + 2) : id
}

function getFieldLabel(key) {
  const field = getField(key)
  return field ? field.label : key
}

// ---------------------------------------------------------------------------
// 드롭 존 컨테이너
// ---------------------------------------------------------------------------
function DroppableZone({ id, children, label, isEmpty, emptyText, highlightColor, disabled, collapsible, itemCount }) {
  const [open, setOpen] = useState(true)
  const { setNodeRef, isOver } = useDroppable({ id, disabled })

  const ringStyle = isOver && !disabled ? {
    outline: `2px solid ${highlightColor === 'blue' ? '#60a5fa' : highlightColor === 'green' ? '#34d399' : '#9ca3af'}`,
    backgroundColor: highlightColor === 'blue' ? 'rgba(219,234,254,0.3)' : highlightColor === 'green' ? 'rgba(209,250,229,0.3)' : 'rgba(243,244,246,0.3)',
  } : {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="pfc-zone-title"
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left', padding: '6px 4px 4px' }}
        >
          {open
            ? <ChevronDown size={12} style={{ color: '#718096', flexShrink: 0 }} />
            : <ChevronRight size={12} style={{ color: '#718096', flexShrink: 0 }} />}
          <span style={{ fontSize: 12, fontWeight: 600, color: '#718096', flex: 1 }}>{label}</span>
          {itemCount > 0 && <span style={{ fontSize: 12, color: '#a0aec0' }}>{itemCount}</span>}
        </button>
      ) : (
        <p className="pfc-zone-title">{label}</p>
      )}
      {(!collapsible || open) && (
        <div
          ref={setNodeRef}
          className="pfc-zone-tags"
          style={{
            marginLeft: 12,
            minHeight: 40,
            borderRadius: 6,
            padding: '2px 0 2px 0',
            border: isEmpty && !isOver ? '1px dashed #e2e8f0' : '1px solid transparent',
            ...ringStyle,
          }}
        >
          {children}
          {isEmpty && (
            <p style={{ fontSize: 11, color: '#a0aec0', fontStyle: 'italic', padding: '8px 4px' }}>
              {emptyText}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sortable Row Chip
// ---------------------------------------------------------------------------
function SortableRowChip({ fieldKey, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `row::${fieldKey}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="pfc-tag">
      <div className="pfc-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>
      <span className="pfc-tag-label">{getFieldLabel(fieldKey)}</span>
      <button type="button" className="pfc-tag-btn pfc-tag-remove" onClick={onRemove} title="제거">
        <X size={11} />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sortable Col Chip
// ---------------------------------------------------------------------------
function SortableColChip({ fieldKey, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `col::${fieldKey}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="pfc-tag">
      <div className="pfc-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>
      <span className="pfc-tag-label">{getFieldLabel(fieldKey)}</span>
      <button type="button" className="pfc-tag-btn pfc-tag-remove" onClick={onRemove} title="제거">
        <X size={11} />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sortable Value Chip
// ---------------------------------------------------------------------------
function SortableValueChip({ fieldKey, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `val::${fieldKey}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="pfc-tag">
      <div className="pfc-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={14} />
      </div>
      <span className="pfc-tag-label">{getFieldLabel(fieldKey)}</span>
      <button type="button" className="pfc-tag-btn pfc-tag-remove" onClick={onRemove} title="제거">
        <X size={11} />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Available Field Item (드래그 소스)
// ---------------------------------------------------------------------------
function AvailableFieldItem({ fieldKey, disabled, onAssignToZone, isColFull }) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `avail::${fieldKey}`, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pfc-group-item${disabled ? ' pfc-group-item--selected' : ''}`}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'grab',
          color: '#cbd5e0',
        }}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={12} />
      </div>
      {onAssignToZone && !disabled ? (
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#1a202c', textAlign: 'left', width: '100%', padding: 0 }}
            onClick={() => setPopoverOpen(v => !v)}
          >
            {getFieldLabel(fieldKey)}
          </button>
          {popoverOpen && (
            <div className="pfc-assign-popover">
              <button
                type="button"
                className="pfc-assign-option"
                onClick={() => { onAssignToZone(fieldKey, 'row'); setPopoverOpen(false) }}
              >
                <Rows3 size={12} style={{ color: '#3b82f6' }} />
                <span>행 차원</span>
              </button>
              <button
                type="button"
                className="pfc-assign-option"
                onClick={() => { onAssignToZone(fieldKey, 'val'); setPopoverOpen(false) }}
              >
                <BarChart3 size={12} style={{ color: '#10b981' }} />
                <span>밸류 지표</span>
              </button>
              <button
                type="button"
                className={`pfc-assign-option${isColFull ? ' pfc-assign-option--disabled' : ''}`}
                disabled={isColFull}
                onClick={() => { if (!isColFull) { onAssignToZone(fieldKey, 'col'); setPopoverOpen(false) } }}
              >
                <Columns3 size={12} style={{ color: '#f59e0b' }} />
                <span>열 차원{isColFull ? ' (최대 1개)' : ''}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <span style={{ fontSize: 12, flex: 1 }}>{getFieldLabel(fieldKey)}</span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Collapsible Field Group
// ---------------------------------------------------------------------------
function FieldGroup({ label, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="pfc-group">
      <button
        type="button"
        className="pfc-group-title"
        style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left', width: '100%', padding: '6px 14px 4px' }}
        onClick={() => setOpen(v => !v)}
      >
        {open
          ? <ChevronDown size={11} style={{ color: '#718096' }} />
          : <ChevronRight size={11} style={{ color: '#718096' }} />}
        {label}
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ColValueTree - 열 값 표시/순서 조정
// ---------------------------------------------------------------------------
function SortableColValue({ colKey, checked, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: colKey })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const label = colKey === '(합계)' ? '합계' : colKey

  return (
    <div ref={setNodeRef} style={style} className="pfc-tag">
      <div className="pfc-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={12} />
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        style={{ width: 13, height: 13, accentColor: '#4C61CC', flexShrink: 0 }}
      />
      <span style={{
        fontSize: 12,
        flex: 1,
        userSelect: 'none',
        color: checked ? '#1a202c' : '#a0aec0',
        textDecoration: checked ? 'none' : 'line-through',
      }}>
        {label}
      </span>
    </div>
  )
}

function ColValueTree({ colFields, orderedColKeys, visibleColKeys, onVisibleColKeysChange, onOrderedColKeysChange }) {
  const [expanded, setExpanded] = useState(true)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  if (!orderedColKeys || !visibleColKeys) return null

  const allChecked = orderedColKeys.every(k => visibleColKeys.has(k))
  const someChecked = orderedColKeys.some(k => visibleColKeys.has(k))

  function handleToggleAll() {
    if (allChecked) {
      onVisibleColKeysChange(new Set())
    } else {
      onVisibleColKeysChange(new Set(orderedColKeys))
    }
  }

  function handleToggle(key) {
    const next = new Set(visibleColKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onVisibleColKeysChange(next)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = orderedColKeys.indexOf(active.id)
    const newIndex = orderedColKeys.indexOf(over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onOrderedColKeysChange(arrayMove(orderedColKeys, oldIndex, newIndex))
  }

  if (!colFields || colFields.length === 0) return null
  const parentLabel = getFieldLabel(colFields[0])

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="pfc-group-item"
        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '6px 14px' }}
      >
        {expanded
          ? <ChevronDown size={12} style={{ color: '#718096', flexShrink: 0 }} />
          : <ChevronRight size={12} style={{ color: '#718096', flexShrink: 0 }} />}
        <input
          type="checkbox"
          checked={allChecked}
          ref={(el) => { if (el) el.indeterminate = !allChecked && someChecked }}
          onChange={handleToggleAll}
          onClick={(e) => e.stopPropagation()}
          style={{ width: 13, height: 13, accentColor: '#4C61CC', flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{parentLabel}</span>
        <span style={{ fontSize: 11, color: '#a0aec0' }}>
          {orderedColKeys.filter(k => visibleColKeys.has(k)).length}/{orderedColKeys.length}
        </span>
      </button>

      {expanded && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={orderedColKeys} strategy={verticalListSortingStrategy}>
            <div style={{ marginLeft: 12, borderLeft: '1px solid #e2e8f0' }}>
              {orderedColKeys.map((ck) => (
                <SortableColValue
                  key={ck}
                  colKey={ck}
                  checked={visibleColKeys.has(ck)}
                  onToggle={() => handleToggle(ck)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 메인 컴포넌트
// ---------------------------------------------------------------------------
const ALL_DIMENSION_KEYS = DIMENSION_FIELDS.map(f => f.key)
const ALL_METRIC_KEYS = [...RAW_FIELDS, ...CALCULATED_FIELDS].map(f => f.key)
const ALL_REF_KEYS = REF_FIELDS.map(f => f.key)

function PivotFieldConfig({
  rowFields,
  colFields,
  valueFields,
  onRowFieldsChange,
  onColFieldsChange,
  onValueFieldsChange,
  colKeys,
  visibleColKeys,
  onVisibleColKeysChange,
  orderedColKeys,
  onOrderedColKeysChange,
}) {
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const rowFieldSet = new Set(rowFields)
  const colFieldSet = new Set(colFields)
  const valFieldSet = new Set(valueFields)
  const usedFieldSet = new Set([...rowFieldSet, ...colFieldSet, ...valFieldSet])

  const rowSortableIds = rowFields.map(f => `row::${f}`)
  const colSortableIds = colFields.map(f => `col::${f}`)
  const valSortableIds = valueFields.map(f => `val::${f}`)

  const availSortableIds = [
    ...ALL_DIMENSION_KEYS.filter(k => !usedFieldSet.has(k)).map(k => `avail::${k}`),
    ...ALL_METRIC_KEYS.filter(k => !usedFieldSet.has(k)).map(k => `avail::${k}`),
    ...ALL_REF_KEYS.filter(k => !usedFieldSet.has(k)).map(k => `avail::${k}`),
  ]

  function handleRemoveRow(key) {
    onRowFieldsChange(rowFields.filter(k => k !== key))
  }

  function handleRemoveCol(key) {
    onColFieldsChange(colFields.filter(k => k !== key))
  }

  function handleRemoveValue(key) {
    onValueFieldsChange(valueFields.filter(k => k !== key))
  }

  function handleAssignToZone(fieldKey, zone) {
    if (zone === 'row') {
      if (rowFields.includes(fieldKey)) return
      onRowFieldsChange([...rowFields, fieldKey])
    } else if (zone === 'col') {
      if (colFields.length >= 1) return
      onColFieldsChange([fieldKey])
    } else if (zone === 'val') {
      if (valueFields.includes(fieldKey)) return
      onValueFieldsChange([...valueFields, fieldKey])
    }
  }

  function handleDragStart(event) {
    setActiveId(event.active.id)
  }

  function insertAt(arr, item, index) {
    if (index !== undefined && index >= 0) {
      const next = [...arr]
      next.splice(index, 0, item)
      return next
    }
    return [...arr, item]
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const aId = active.id
    const oId = over.id
    if (aId === oId) return

    const srcZone = getSourceZone(aId)
    const tgtZone = getTargetZone(oId)
    const fieldKey = parseFieldKey(aId)

    const isZoneContainer = oId.startsWith('zone-')
    let targetIndex
    if (!isZoneContainer) {
      const overFieldKey = parseFieldKey(oId)
      if (tgtZone === 'row') targetIndex = rowFields.indexOf(overFieldKey)
      else if (tgtZone === 'col') targetIndex = colFields.indexOf(overFieldKey)
      else if (tgtZone === 'val') targetIndex = valueFields.indexOf(overFieldKey)
    }

    // 같은 존: 순서 변경
    if (srcZone === tgtZone) {
      if (srcZone === 'row') {
        const oldIndex = rowFields.indexOf(fieldKey)
        const newIndex = targetIndex
        if (oldIndex !== -1 && newIndex !== undefined && newIndex !== -1 && oldIndex !== newIndex) {
          onRowFieldsChange(arrayMove(rowFields, oldIndex, newIndex))
        }
      } else if (srcZone === 'col') {
        const oldIndex = colFields.indexOf(fieldKey)
        const newIndex = targetIndex
        if (oldIndex !== -1 && newIndex !== undefined && newIndex !== -1 && oldIndex !== newIndex) {
          onColFieldsChange(arrayMove(colFields, oldIndex, newIndex))
        }
      } else if (srcZone === 'val') {
        const oldIndex = valueFields.indexOf(fieldKey)
        const newIndex = targetIndex
        if (oldIndex !== -1 && newIndex !== undefined && newIndex !== -1 && oldIndex !== newIndex) {
          onValueFieldsChange(arrayMove(valueFields, oldIndex, newIndex))
        }
      }
      return
    }

    // 존 간 이동
    let nextRows = [...rowFields]
    let nextCols = [...colFields]
    let nextVals = [...valueFields]

    if (srcZone === 'row') nextRows = nextRows.filter(k => k !== fieldKey)
    else if (srcZone === 'col') nextCols = nextCols.filter(k => k !== fieldKey)
    else if (srcZone === 'val') nextVals = nextVals.filter(k => k !== fieldKey)

    if (tgtZone === 'row') {
      nextRows = insertAt(nextRows, fieldKey, targetIndex)
    } else if (tgtZone === 'col') {
      if (colFields.length >= 1 && srcZone !== 'col') return
      nextCols = [fieldKey]
    } else if (tgtZone === 'val') {
      nextVals = insertAt(nextVals, fieldKey, targetIndex)
    }

    onRowFieldsChange(nextRows)
    onColFieldsChange(nextCols)
    onValueFieldsChange(nextVals)
  }

  const activeFieldKey = activeId ? parseFieldKey(activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 행 차원 */}
        <DroppableZone
          id="zone-row"
          label="행 차원"
          isEmpty={rowFields.length === 0}
          emptyText="필드를 여기로 드래그하세요"
          highlightColor="blue"
          collapsible
          itemCount={rowFields.length}
        >
          <SortableContext items={rowSortableIds} strategy={verticalListSortingStrategy}>
            {rowFields.map((fieldKey) => (
              <SortableRowChip
                key={fieldKey}
                fieldKey={fieldKey}
                onRemove={() => handleRemoveRow(fieldKey)}
              />
            ))}
          </SortableContext>
        </DroppableZone>

        <hr className="pfc-separator" />

        {/* 열 차원 */}
        <DroppableZone
          id="zone-col"
          label="열 차원"
          isEmpty={colFields.length === 0}
          emptyText="필드를 여기로 드래그하세요 (최대 1개)"
          highlightColor="green"
          disabled={colFields.length >= 1}
          collapsible
          itemCount={colFields.length}
        >
          <SortableContext items={colSortableIds} strategy={verticalListSortingStrategy}>
            {colFields.map((fieldKey) => (
              <SortableColChip
                key={fieldKey}
                fieldKey={fieldKey}
                onRemove={() => handleRemoveCol(fieldKey)}
              />
            ))}
          </SortableContext>
        </DroppableZone>

        {/* 열 값 표시 트리 */}
        {colKeys && colKeys.length > 0 && visibleColKeys && onVisibleColKeysChange && orderedColKeys && onOrderedColKeysChange && (
          <div style={{ paddingLeft: 2, paddingTop: 4 }}>
            <ColValueTree
              colFields={colFields}
              orderedColKeys={orderedColKeys}
              visibleColKeys={visibleColKeys}
              onVisibleColKeysChange={onVisibleColKeysChange}
              onOrderedColKeysChange={onOrderedColKeysChange}
            />
          </div>
        )}

        <hr className="pfc-separator" />

        {/* 밸류 지표 */}
        <DroppableZone
          id="zone-value"
          label="밸류 지표"
          isEmpty={valueFields.length === 0}
          emptyText="필드를 여기로 드래그하세요"
          highlightColor="green"
          collapsible
          itemCount={valueFields.length}
        >
          <SortableContext items={valSortableIds} strategy={verticalListSortingStrategy}>
            {valueFields.map((fieldKey) => (
              <SortableValueChip
                key={fieldKey}
                fieldKey={fieldKey}
                onRemove={() => handleRemoveValue(fieldKey)}
              />
            ))}
          </SortableContext>
        </DroppableZone>

        <hr className="pfc-separator" />

        {/* 사용 가능 필드 */}
        <div className="pfc-group">
          <div className="pfc-group-title" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#718096', padding: '6px 14px 4px' }}>
            사용 가능 필드
          </div>
          <SortableContext items={availSortableIds} strategy={verticalListSortingStrategy}>
            <div>
              <FieldGroup label="차원 필드">
                {ALL_DIMENSION_KEYS.filter(k => !usedFieldSet.has(k)).map(k => (
                  <AvailableFieldItem
                    key={k}
                    fieldKey={k}
                    onAssignToZone={handleAssignToZone}
                    isColFull={colFields.length >= 1}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="지표 필드">
                {ALL_METRIC_KEYS.filter(k => !usedFieldSet.has(k)).map(k => (
                  <AvailableFieldItem
                    key={k}
                    fieldKey={k}
                    onAssignToZone={handleAssignToZone}
                    isColFull={colFields.length >= 1}
                  />
                ))}
              </FieldGroup>
              <FieldGroup label="REF 필드">
                {ALL_REF_KEYS.filter(k => !usedFieldSet.has(k)).map(k => (
                  <AvailableFieldItem
                    key={k}
                    fieldKey={k}
                    onAssignToZone={handleAssignToZone}
                    isColFull={colFields.length >= 1}
                  />
                ))}
              </FieldGroup>
            </div>
          </SortableContext>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeFieldKey ? (
          <div className="pfc-tag" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', backgroundColor: '#fff' }}>
            <GripVertical size={14} style={{ color: '#cbd5e0' }} />
            <span style={{ fontSize: 12 }}>{getFieldLabel(activeFieldKey)}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default PivotFieldConfig
