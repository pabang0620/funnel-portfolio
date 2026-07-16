import * as XLSX from 'xlsx'
import { getField } from './pivotFieldRegistry'

function getFieldLabel(key) {
  const field = getField(key)
  return field ? field.label : key
}

function formatCellValue(value, fieldKey) {
  if (value === null || value === undefined) return '-'
  const field = getField(fieldKey)
  if (!field) return value

  const num = Number(value)
  if (field.format === 'currency') {
    return isNaN(num) ? value : num
  }
  if (field.format === 'percent') {
    return isNaN(num) ? value : Math.round(num * 100) / 100
  }
  if (field.format === 'number') {
    return isNaN(num) ? value : num
  }
  return value
}

/**
 * 피봇 테이블의 flatRows를 엑셀로 다운로드한다.
 *
 * @param {object[]} flatRows - flattenTree 결과
 * @param {string[]} rowFields - 행 차원 필드 배열
 * @param {string[]} valueFields - 값 필드 배열
 * @param {object} totals - 전체 합계 객체
 * @param {boolean} hasColPivot - 열 피봇 여부
 * @param {string[]} colKeys - 열 키 배열
 */
export function exportPivotToExcel(flatRows, rowFields, valueFields, totals, hasColPivot, colKeys) {
  const data = []

  // 헤더 행
  if (hasColPivot && colKeys) {
    const header = [...rowFields.map(rf => getFieldLabel(rf))]
    for (const ck of colKeys) {
      for (const vf of valueFields) {
        header.push(`${ck === '(합계)' ? '합계' : ck} - ${getFieldLabel(vf)}`)
      }
    }
    data.push(header)
  } else {
    const header = [
      ...rowFields.map(rf => getFieldLabel(rf)),
      ...valueFields.map(vf => getFieldLabel(vf)),
    ]
    data.push(header)
  }

  // 데이터 행
  // row.level / row.label로 현재 차원 컨텍스트를 추적하여 각 열에 채움
  const dimContext = new Array(rowFields.length).fill('')

  for (const row of flatRows) {
    const level = typeof row.level === 'number' ? row.level : 0
    const labelVal = row._node?.key ?? row.label ?? ''
    dimContext[level] = String(labelVal)
    for (let i = level + 1; i < rowFields.length; i++) dimContext[i] = ''
    const dimCells = [...dimContext]

    if (hasColPivot && colKeys) {
      const cells = [...dimCells]
      for (const ck of colKeys) {
        for (const vf of valueFields) {
          cells.push(formatCellValue(row._node?.values?.[ck]?.[vf], vf))
        }
      }
      data.push(cells)
    } else {
      const cells = [...dimCells, ...valueFields.map(vf => formatCellValue(row.metrics?.[vf], vf))]
      data.push(cells)
    }
  }

  // 합계 행
  if (totals) {
    const emptyDimCells = rowFields.slice(1).map(() => '')
    if (hasColPivot && colKeys) {
      const totalCells = ['합계', ...emptyDimCells]
      for (const ck of colKeys) {
        const t = totals[ck] || {}
        for (const vf of valueFields) {
          totalCells.push(formatCellValue(t[vf], vf))
        }
      }
      data.push(totalCells)
    } else {
      const t = totals['(합계)'] || {}
      const totalCells = [
        '합계',
        ...emptyDimCells,
        ...valueFields.map(vf => formatCellValue(t[vf], vf)),
      ]
      data.push(totalCells)
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '피봇 데이터')

  const now = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().substring(0, 10)
  XLSX.writeFile(wb, `피봇분석_${now}.xlsx`)
}
