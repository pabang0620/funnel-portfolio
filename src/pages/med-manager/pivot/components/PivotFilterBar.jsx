import React, { useState, useCallback, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { startOfDay, subDays, format } from 'date-fns'

import 'react-datepicker/dist/react-datepicker.css'

import pivotData from '@/data/med-manager/pivot-data.json'

// ---------------------------------------------------------------------------
// 단축 버튼 정의
// ---------------------------------------------------------------------------
const SHORTCUT_BUTTONS = [
  {
    label: '금일',
    getRange: () => {
      const today = startOfDay(new Date())
      return { start: today, end: today }
    },
  },
  {
    label: '전일',
    getRange: () => {
      const yesterday = startOfDay(subDays(new Date(), 1))
      return { start: yesterday, end: yesterday }
    },
  },
  {
    label: '최근3일',
    getRange: () => ({
      start: startOfDay(subDays(new Date(), 3)),
      end: startOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: '최근7일',
    getRange: () => ({
      start: startOfDay(subDays(new Date(), 7)),
      end: startOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: '최근14일',
    getRange: () => ({
      start: startOfDay(subDays(new Date(), 14)),
      end: startOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: '최근30일',
    getRange: () => ({
      start: startOfDay(subDays(new Date(), 30)),
      end: startOfDay(subDays(new Date(), 1)),
    }),
  },
]

// ---------------------------------------------------------------------------
// 메인 컴포넌트
// ---------------------------------------------------------------------------
function PivotFilterBar({ onDataLoaded, isLoading, setIsLoading, isSyncing, setIsSyncing, onSyncReady, onSyncComplete }) {
  const [startDate, setStartDate] = useState(startOfDay(new Date()))
  const [endDate, setEndDate] = useState(startOfDay(new Date()))

  const handleShortcut = useCallback((getRange) => {
    const { start, end } = getRange()
    setStartDate(start)
    setEndDate(end)
  }, [])

  const isActiveShortcut = useCallback((getRange) => {
    const { start, end } = getRange()
    return (
      startDate && endDate &&
      format(startDate, 'yyyy-MM-dd') === format(start, 'yyyy-MM-dd') &&
      format(endDate, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')
    )
  }, [startDate, endDate])

  const handleSearch = useCallback(async () => {
    if (!startDate || !endDate) {
      alert('날짜를 선택해주세요.')
      return
    }
    if (setIsLoading) setIsLoading(true)
    try {
      const startStr = format(startDate, 'yyyy-MM-dd')
      const endStr = format(endDate, 'yyyy-MM-dd')

      // 더미 데이터 필터링 (날짜 범위)
      const filtered = pivotData.filter(row => {
        return row.date >= startStr && row.date <= endStr
      })

      // todayImpressionsMap: 광고제목별 오늘 노출수 합계 (데모에서는 전체 합계로 대체)
      const todayMap = {}
      for (const row of pivotData) {
        if (row.ad_title) {
          todayMap[row.ad_title] = (todayMap[row.ad_title] || 0) + (row.impressions || 0)
        }
      }

      onDataLoaded(filtered, todayMap)
    } catch (error) {
      onDataLoaded([], {})
    } finally {
      if (setIsLoading) setIsLoading(false)
    }
  }, [startDate, endDate, onDataLoaded, setIsLoading])

  // 동기화: 데모에서는 쿨다운 없이 즉시 완료
  const handleSync = useCallback(async () => {
    if (setIsSyncing) setIsSyncing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('데모 버전에서는 동기화 기능이 제공되지 않습니다.')
    } finally {
      if (setIsSyncing) setIsSyncing(false)
    }
  }, [setIsSyncing])

  useEffect(() => {
    if (onSyncReady) onSyncReady(handleSync)
  }, [handleSync, onSyncReady])

  return (
    <div className="pfb-container">
      {/* 날짜 범위 picker */}
      <div className="pfb-date-range">
        <DatePicker
          selected={startDate}
          onChange={setStartDate}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="yyyy-MM-dd"
          placeholderText="시작일"
          className="pfb-datepicker-input"
        />
        <span className="pfb-date-sep">~</span>
        <DatePicker
          selected={endDate}
          onChange={setEndDate}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="yyyy-MM-dd"
          placeholderText="종료일"
          className="pfb-datepicker-input"
        />
      </div>

      {/* 단축 버튼 그룹 */}
      <div className="pfb-shortcuts">
        {SHORTCUT_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            className={`pfb-shortcut-btn${isActiveShortcut(btn.getRange) ? ' active' : ''}`}
            onClick={() => handleShortcut(btn.getRange)}
            disabled={isLoading}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 검색 버튼 */}
      <button
        type="button"
        className="pfb-search-btn"
        onClick={handleSearch}
        disabled={isLoading || isSyncing}
      >
        {isLoading ? '검색 중...' : '검색'}
      </button>
    </div>
  )
}

export default PivotFilterBar
