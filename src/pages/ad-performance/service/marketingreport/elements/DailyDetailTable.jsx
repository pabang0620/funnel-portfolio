import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
// import { filterData, aggregateDailyData } from "../dummyData"; // Removed: using API data instead
import { calculateWeekTotals, calculateCPC, calculateCTR, calculateCVR, calculateROAS, calculateAvgOrderValue } from "./utils/metricsUtils";
import { useAuth } from "../../../contexts/AuthContext";
import "./DailyDetailTable.css";

// 편집 가능한 필드 순서
const EDITABLE_FIELDS = ["impressions", "clicks", "adCost", "conversions", "revenue"];

// 필드 한글 레이블
const FIELD_LABELS = {
  adCost: "광고비",
  revenue: "직접매출",
  impressions: "노출수",
  clicks: "클릭수",
  conversions: "구매건수",
};

// 모든 데이터 필드는 동적으로 생성 (컬럼 순서 반영)

// 컬럼 메타데이터
const COLUMN_METADATA = {
  impressions: { label: '노출수', tooltip: null },
  clicks: { label: '클릭수', tooltip: null },
  adCost: { label: '광고비', tooltip: null },
  cpc: { label: 'CPC', tooltip: '광고비 / 클릭수' },
  ctr: { label: 'CTR', tooltip: '(클릭수 / 노출수) × 100' },
  conversions: { label: '구매건수', tooltip: null },
  revenue: { label: '직접매출', tooltip: null },
  avgOrderValue: { label: '객단가', tooltip: '직접매출 / 구매건수' },
  cvr: { label: 'CVR', tooltip: '(구매건수 / 클릭수) × 100' },
  roas: { label: 'ROAS', tooltip: '(직접매출 / 광고비) × 100' },
};

const DailyDetailTable = ({
  weekStartDay,
  customDateRange,
  selectedMedia,
  userTeam,
  isEditMode,
  editingCell,
  manualData,
  setEditingCell,
  handleCancel,
  handleManualInput,
  formatNumber,
  dailyData,
  loading,
  error,
  operationStatus,
  selectedProductId,
  selectedMediaId,
  onColumnReorder,
  columnOrder = ['impressions', 'clicks', 'adCost', 'cpc', 'ctr', 'conversions', 'revenue', 'avgOrderValue', 'cvr', 'roas'],
}) => {
  const { parentTeam, userRole, userId } = useAuth();
  const [collapsedWeeks, setCollapsedWeeks] = useState(new Set());
  const tableRef = useRef(null);

  // 컬럼 드래그 상태
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // 엑셀 스타일 셀 선택 상태
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [anchorCell, setAnchorCell] = useState(null); // Shift 선택용 앵커
  const dragStartTimeRef = useRef(0); // 드래그 시작 시간 추적
  const [initialSelection, setInitialSelection] = useState(new Set()); // Ctrl + 드래그 시 초기 선택 저장
  const isCtrlDraggingRef = useRef(false); // Ctrl 드래그 여부

  // 모든 데이터 필드 (동적 생성 - 컬럼 순서 반영)
  const ALL_DATA_FIELDS = useMemo(() => ['date', ...columnOrder], [columnOrder]);

  // 붙여넣기 모달 상태
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteData, setPasteData] = useState([]); // 클립보드에서 파싱된 행 데이터
  const [columnMappings, setColumnMappings] = useState([]); // 각 열이 어떤 필드에 매핑되는지
  const [pasteStartDate, setPasteStartDate] = useState(null); // 붙여넣기 시작 날짜

  // 셀 키 생성/파싱 함수 (날짜에 -가 포함되므로 구분자로 | 사용)
  const getCellKey = (date, field) => `${date}|${field}`;
  const parseCellKey = (key) => {
    const idx = key.lastIndexOf('|');
    return { date: key.substring(0, idx), field: key.substring(idx + 1) };
  };

  // 주차 토글 핸들러
  const toggleWeek = (weekName) => {
    const newCollapsedWeeks = new Set(collapsedWeeks);
    if (newCollapsedWeeks.has(weekName)) {
      newCollapsedWeeks.delete(weekName);
    } else {
      newCollapsedWeeks.add(weekName);
    }
    setCollapsedWeeks(newCollapsedWeeks);
  };


  const tableData = useMemo(() => {
    if (
      !customDateRange ||
      !customDateRange.startDate ||
      !customDateRange.endDate ||
      !dailyData ||
      dailyData.length === 0
    ) {
      return null;
    }

    // API 데이터를 직접 사용 (이미 필터링되고 집계된 상태)
    const completeData = dailyData.map(item => ({
      date: item.date,
      adCost: item.adCost,
      revenue: item.revenue,
      impressions: item.impressions,
      clicks: item.clicks,
      conversions: item.conversions,
      // 계산된 값들은 프론트엔드에서 계산
      cpc: calculateCPC(item.adCost, item.clicks),
      ctr: calculateCTR(item.clicks, item.impressions),
      cvr: calculateCVR(item.conversions, item.clicks),
      roas: calculateROAS(item.revenue, item.adCost),
      avgOrderValue: calculateAvgOrderValue(item.revenue, item.conversions),
    }));

    // 주차별로 그룹핑
    const groupedData = [];
    let currentWeek = "";
    let weekData = [];

    completeData.forEach((data, index) => {
      const date = new Date(data.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      let weekInfo;

      if (weekStartDay === "월요일 시작") {
        // 월요일 시작 방식 - ISO 주차 계산
        const firstDay = new Date(date.getFullYear(), month - 1, 1);
        const firstMonday = firstDay.getDate() + ((7 - firstDay.getDay() + 1) % 7);

        let weekNumber;
        if (day < firstMonday) {
          // 첫째 주에 속함
          weekNumber = 1;
        } else {
          // 첫 번째 월요일 이후의 주차 계산
          weekNumber = Math.floor((day - firstMonday) / 7) + 2;
        }
        weekInfo = `${month}월 ${weekNumber}주`;
      } else {
        // 1일 시작 방식 (기존)
        const weekNumber = Math.ceil(day / 7);
        weekInfo = `${month}월 ${weekNumber}주`;
      }

      if (weekInfo !== currentWeek) {
        if (currentWeek && weekData.length > 0) {
          groupedData.push({
            week: currentWeek,
            data: weekData,
          });
        }
        currentWeek = weekInfo;
        weekData = [data];
      } else {
        weekData.push(data);
      }

      // 마지막 그룹 처리
      if (index === completeData.length - 1) {
        groupedData.push({
          week: currentWeek,
          data: weekData,
        });
      }
    });

    return groupedData;
  }, [customDateRange, dailyData, weekStartDay]);

  // 모든 날짜를 flat 배열로 (Tab 이동용)
  const allDates = useMemo(() => {
    if (!tableData) return [];
    return tableData.flatMap(group => group.data.map(d => d.date));
  }, [tableData]);

  // 다음/이전 날짜 가져오기
  const getNextDate = (currentDate) => {
    const idx = allDates.indexOf(currentDate);
    return idx < allDates.length - 1 ? allDates[idx + 1] : null;
  };

  const getPreviousDate = (currentDate) => {
    const idx = allDates.indexOf(currentDate);
    return idx > 0 ? allDates[idx - 1] : null;
  };

  // Tab 키로 다음/이전 편집 가능한 셀로 이동
  const getNextEditableCell = (currentDate, currentField) => {
    const currentDateIndex = allDates.indexOf(currentDate);
    const currentFieldIndex = EDITABLE_FIELDS.indexOf(currentField);

    // 같은 날짜의 다음 필드로 이동
    if (currentFieldIndex < EDITABLE_FIELDS.length - 1) {
      return { date: currentDate, field: EDITABLE_FIELDS[currentFieldIndex + 1] };
    }

    // 다음 날짜의 첫 번째 필드로 이동
    if (currentDateIndex < allDates.length - 1) {
      return { date: allDates[currentDateIndex + 1], field: EDITABLE_FIELDS[0] };
    }

    // 마지막이면 null
    return null;
  };

  const getPreviousEditableCell = (currentDate, currentField) => {
    const currentDateIndex = allDates.indexOf(currentDate);
    const currentFieldIndex = EDITABLE_FIELDS.indexOf(currentField);

    // 같은 날짜의 이전 필드로 이동
    if (currentFieldIndex > 0) {
      return { date: currentDate, field: EDITABLE_FIELDS[currentFieldIndex - 1] };
    }

    // 이전 날짜의 마지막 필드로 이동
    if (currentDateIndex > 0) {
      return { date: allDates[currentDateIndex - 1], field: EDITABLE_FIELDS[EDITABLE_FIELDS.length - 1] };
    }

    // 첫 번째면 null
    return null;
  };

  // 방향키로 셀 이동
  const getLeftCell = (currentDate, currentField) => {
    const currentFieldIndex = ALL_DATA_FIELDS.indexOf(currentField);
    if (currentFieldIndex > 0) {
      return { date: currentDate, field: ALL_DATA_FIELDS[currentFieldIndex - 1] };
    }
    return null;
  };

  const getRightCell = (currentDate, currentField) => {
    const currentFieldIndex = ALL_DATA_FIELDS.indexOf(currentField);
    if (currentFieldIndex < ALL_DATA_FIELDS.length - 1) {
      return { date: currentDate, field: ALL_DATA_FIELDS[currentFieldIndex + 1] };
    }
    return null;
  };

  const getUpCell = (currentDate, currentField) => {
    const currentDateIndex = allDates.indexOf(currentDate);
    if (currentDateIndex > 0) {
      return { date: allDates[currentDateIndex - 1], field: currentField };
    }
    return null;
  };

  const getDownCell = (currentDate, currentField) => {
    const currentDateIndex = allDates.indexOf(currentDate);
    if (currentDateIndex < allDates.length - 1) {
      return { date: allDates[currentDateIndex + 1], field: currentField };
    }
    return null;
  };


  // 매체 운영 상태 확인 함수 (ID 기반)
  const checkMediaOperationStatus = () => {
    // S등급 사용자는 매체 중단 상태와 관계없이 모든 데이터 수정 가능
    if (userRole === 'S') {
      return { isStopped: false };
    }

    if (!operationStatus || !selectedProductId || !selectedMediaId) {
      return { isStopped: false };
    }

    // 제품ID-매체ID 조합으로 중단 상태 확인 (제품명 변경에도 영향 없음)
    const productMediaKey = `${selectedProductId}-${selectedMediaId}`;

    // 해당 제품-매체 조합이 어떤 팀에서든 중단됨인지 확인
    const isOperationStopped = Object.entries(operationStatus).some(([key, value]) => {
      return key.startsWith(productMediaKey + '-') && value?.statusValue === 0;
    });

    return { isStopped: isOperationStopped };
  };

  // 셀 클릭 핸들러 (매체 운영 상태 체크 포함)
  const handleCellClickWithCheck = (date, field) => {
    if (!isEditMode) return;

    const { isStopped } = checkMediaOperationStatus();

    if (isStopped) {
      alert('This media channel is paused. Data cannot be edited.');
      return;
    }

    // 클릭 시 편집 모드로 전환
    setEditingCell({ date, field });
  };

  // 드래그로 선택된 범위 계산
  const getSelectedRange = (start, end) => {
    if (!start || !end || allDates.length === 0) return new Set();

    const startDateIdx = allDates.indexOf(start.date);
    const endDateIdx = allDates.indexOf(end.date);
    const startFieldIdx = ALL_DATA_FIELDS.indexOf(start.field);
    const endFieldIdx = ALL_DATA_FIELDS.indexOf(end.field);

    const minDateIdx = Math.min(startDateIdx, endDateIdx);
    const maxDateIdx = Math.max(startDateIdx, endDateIdx);
    const minFieldIdx = Math.min(startFieldIdx, endFieldIdx);
    const maxFieldIdx = Math.max(startFieldIdx, endFieldIdx);

    const selected = new Set();
    for (let i = minDateIdx; i <= maxDateIdx; i++) {
      for (let j = minFieldIdx; j <= maxFieldIdx; j++) {
        if (allDates[i] && ALL_DATA_FIELDS[j]) {
          selected.add(getCellKey(allDates[i], ALL_DATA_FIELDS[j]));
        }
      }
    }
    return selected;
  };

  // 마우스 다운 핸들러 (엑셀 스타일 선택)
  const handleCellMouseDown = (e, date, field) => {
    if (editingCell) return;
    e.preventDefault();
    dragStartTimeRef.current = Date.now();

    const cellKey = getCellKey(date, field);

    if (e.ctrlKey || e.metaKey) {
      // Ctrl 선택: 드래그 시작 (기존 선택 유지하면서 새 범위 추가)
      isCtrlDraggingRef.current = true;
      setInitialSelection(new Set(selectedCells)); // 현재 선택 저장
      setIsDragging(true);
      setDragStart({ date, field });

      // 현재 셀도 선택에 추가
      const newSelection = new Set(selectedCells);
      newSelection.add(cellKey);
      setSelectedCells(newSelection);
      setAnchorCell({ date, field }); // 앵커 업데이트
    } else if (e.shiftKey) {
      // Shift 선택: 앵커부터 현재 셀까지 범위 선택
      if (anchorCell) {
        const range = getSelectedRange(anchorCell, { date, field });
        setSelectedCells(range);
      } else {
        setSelectedCells(new Set([cellKey]));
        setAnchorCell({ date, field });
      }
    } else {
      // 일반 선택: 새로운 선택 시작
      isCtrlDraggingRef.current = false;
      setIsDragging(true);
      setDragStart({ date, field });
      setSelectedCells(new Set([cellKey]));
      setAnchorCell({ date, field }); // 앵커 설정
    }

    // 테이블 컨테이너에 포커스를 줘서 키보드 이벤트가 작동하도록 함 (스크롤 방지)
    if (tableRef.current) {
      tableRef.current.focus({ preventScroll: true });
    }
  };

  // 마우스 이동 핸들러 (드래그 선택)
  const handleCellMouseEnter = (date, field) => {
    if (!isDragging || !dragStart) return;

    // 드래그 시작 후 100ms 이내의 mouseEnter는 무시 (클릭 시 발생하는 오류 방지)
    if (Date.now() - dragStartTimeRef.current < 100) return;

    const newRange = getSelectedRange(dragStart, { date, field });

    if (isCtrlDraggingRef.current) {
      // Ctrl + 드래그: 기존 선택과 새 범위를 합침
      const combined = new Set([...initialSelection, ...newRange]);
      setSelectedCells(combined);
    } else {
      // 일반 드래그: 새 범위만 선택
      setSelectedCells(newRange);
    }
  };

  // 마우스 업 핸들러 (드래그 종료)
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      isCtrlDraggingRef.current = false; // Ctrl 드래그 플래그 리셋
      setInitialSelection(new Set()); // 초기 선택 클리어
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // 더블클릭 핸들러 (편집 모드에서만 편집 진입)
  const handleCellDoubleClick = (date, field) => {
    if (!isEditMode) return;
    if (!EDITABLE_FIELDS.includes(field)) return;
    const { isStopped } = checkMediaOperationStatus();
    if (isStopped) {
      alert('This media channel is paused. Data cannot be edited.');
      return;
    }
    setEditingCell({ date, field });
    setSelectedCells(new Set([getCellKey(date, field)]));
  };

  // 선택된 셀들의 데이터 복사
  const copySelectedCells = async () => {
    if (selectedCells.size === 0) return;
    const dateFieldPairs = Array.from(selectedCells).map(key => parseCellKey(key));
    const dates = [...new Set(dateFieldPairs.map(p => p.date))].sort();
    const fields = [...new Set(dateFieldPairs.map(p => p.field))];
    const sortedFields = ALL_DATA_FIELDS.filter(f => fields.includes(f));

    const rows = dates.map(date => {
      return sortedFields.map(field => {
        const manual = manualData[date] || {};
        const dayData = dailyData.find(d => d.date === date) || {};
        let value;
        if (EDITABLE_FIELDS.includes(field)) {
          value = manual[field] !== undefined ? manual[field] : dayData[field];
        } else {
          const adCost = manual.adCost !== undefined ? manual.adCost : dayData.adCost || 0;
          const revenue = manual.revenue !== undefined ? manual.revenue : dayData.revenue || 0;
          const impressions = manual.impressions !== undefined ? manual.impressions : dayData.impressions || 0;
          const clicks = manual.clicks !== undefined ? manual.clicks : dayData.clicks || 0;
          const conversions = manual.conversions !== undefined ? manual.conversions : dayData.conversions || 0;
          switch (field) {
            case 'cpc': value = calculateCPC(adCost, clicks); break;
            case 'ctr': value = calculateCTR(clicks, impressions); break;
            case 'cvr': value = calculateCVR(conversions, clicks); break;
            case 'roas': value = calculateROAS(revenue, adCost); break;
            case 'avgOrderValue': value = calculateAvgOrderValue(revenue, conversions); break;
            default: value = dayData[field];
          }
        }
        return value !== null && value !== undefined ? value : '';
      }).join('\t');
    }).join('\n');

    try { await navigator.clipboard.writeText(rows); } catch (err) { console.error('복사 실패:', err); }
  };

  // 붙여넣기 모달 열기 (수정 모드에서만)
  const openPasteModal = async () => {
    if (!isEditMode) return;
    const { isStopped } = checkMediaOperationStatus();
    if (isStopped) { alert('해당 매체가 중단 상태입니다.'); return; }
    if (selectedCells.size === 0) return;

    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        alert('클립보드에 No data.');
        return;
      }

      // 클립보드 데이터 파싱
      const rows = text.split('\n')
        .filter(row => row.trim() !== '')
        .map(row => row.split('\t').map(cell => cell.trim()));

      if (rows.length === 0) {
        alert('붙여넣을 No data.');
        return;
      }

      // 선택된 셀 중 시작 날짜 찾기
      const dateFieldPairs = Array.from(selectedCells).map(key => parseCellKey(key));
      let startDateIdx = Infinity;
      dateFieldPairs.forEach(({ date }) => {
        const dateIdx = allDates.indexOf(date);
        if (dateIdx !== -1 && dateIdx < startDateIdx) startDateIdx = dateIdx;
      });
      if (startDateIdx === Infinity) startDateIdx = 0;

      // 열 개수에 맞게 기본 매핑 설정 (순서대로 광고비, 직접매출, 노출수, 클릭수, 구매건수)
      const colCount = Math.max(...rows.map(r => r.length));
      const defaultMappings = [];
      for (let i = 0; i < colCount; i++) {
        defaultMappings.push(i < EDITABLE_FIELDS.length ? EDITABLE_FIELDS[i] : 'skip');
      }

      setPasteData(rows);
      setColumnMappings(defaultMappings);
      setPasteStartDate(allDates[startDateIdx]);
      setShowPasteModal(true);
    } catch (err) {
      console.error('클립보드 읽기 실패:', err);
      alert('클립보드 접근에 실패했습니다. 권한을 확인해주세요.');
    }
  };

  // 붙여넣기 모달에서 열 매핑 변경
  const handleColumnMappingChange = (colIdx, newField) => {
    setColumnMappings(prev => {
      const updated = [...prev];
      updated[colIdx] = newField;
      return updated;
    });
  };

  // 붙여넣기 적용
  const applyPaste = () => {
    if (!pasteStartDate || pasteData.length === 0) return;

    const startDateIdx = allDates.indexOf(pasteStartDate);
    if (startDateIdx === -1) return;

    pasteData.forEach((row, rowIdx) => {
      const targetDateIdx = startDateIdx + rowIdx;
      if (targetDateIdx >= allDates.length) return;

      const targetDate = allDates[targetDateIdx];

      row.forEach((value, colIdx) => {
        const targetField = columnMappings[colIdx];
        if (!targetField || targetField === 'skip') return;
        if (!EDITABLE_FIELDS.includes(targetField)) return;

        // 모든 비숫자 문자 제거 (₩, $, 원, 쉼표, 공백 등)
        const numValue = value.replace(/[^\d]/g, '');
        handleManualInput(targetDate, targetField, numValue);
      });
    });

    // 모달 닫기
    setShowPasteModal(false);
    setPasteData([]);
    setColumnMappings([]);
    setPasteStartDate(null);
  };

  // 붙여넣기 모달 닫기
  const closePasteModal = () => {
    setShowPasteModal(false);
    setPasteData([]);
    setColumnMappings([]);
    setPasteStartDate(null);
  };

  // 선택된 셀 삭제 (수정 모드에서만)
  const deleteSelectedCells = () => {
    if (!isEditMode) return;
    const { isStopped } = checkMediaOperationStatus();
    if (isStopped) { alert('해당 매체가 중단 상태입니다.'); return; }
    if (selectedCells.size === 0) return;
    selectedCells.forEach(key => {
      const { date, field } = parseCellKey(key);
      if (EDITABLE_FIELDS.includes(field)) handleManualInput(date, field, '');
    });
  };

  // 컬럼 드래그 핸들러
  const handleColumnDragStart = (e, columnKey) => {
    setDraggedColumn(columnKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnKey);
  };

  const handleColumnDragOver = (e, columnKey) => {
    if (!draggedColumn) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const handleColumnDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleColumnDrop = (e, columnKey) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === columnKey) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    // 부모로 순서 변경 알림
    if (onColumnReorder) {
      onColumnReorder(draggedColumn, columnKey);
    }

    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (editingCell) return;

    // Ctrl+C: 복사 - 항상 가능
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      copySelectedCells();
      return;
    }

    // ESC: 선택 해제 - 항상 가능
    if (e.key === 'Escape') {
      setSelectedCells(new Set());
      setDragStart(null);
      setAnchorCell(null);
      return;
    }

    // Shift + 방향키: 범위 확장
    if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      if (selectedCells.size === 0) return;

      // 가장 최근 선택된 셀 (앵커가 아닌 확장 끝점)
      const cellKeys = Array.from(selectedCells);
      const lastKey = cellKeys[cellKeys.length - 1];
      const { date, field } = parseCellKey(lastKey);
      const dateIdx = allDates.indexOf(date);
      const fieldIdx = ALL_DATA_FIELDS.indexOf(field);

      let nextDate = date, nextField = field;
      if (e.key === 'ArrowUp' && dateIdx > 0) nextDate = allDates[dateIdx - 1];
      if (e.key === 'ArrowDown' && dateIdx < allDates.length - 1) nextDate = allDates[dateIdx + 1];
      if (e.key === 'ArrowLeft' && fieldIdx > 0) nextField = ALL_DATA_FIELDS[fieldIdx - 1];
      if (e.key === 'ArrowRight' && fieldIdx < ALL_DATA_FIELDS.length - 1) nextField = ALL_DATA_FIELDS[fieldIdx + 1];

      if (anchorCell && (nextDate !== date || nextField !== field)) {
        // 앵커부터 새로운 위치까지 범위 선택
        const range = getSelectedRange(anchorCell, { date: nextDate, field: nextField });
        setSelectedCells(range);
      }
      return;
    }

    // 방향키: 셀 이동 (Shift 없이) - 항상 가능
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedCells.size > 0) {
      e.preventDefault();
      const firstKey = Array.from(selectedCells)[0];
      const { date, field } = parseCellKey(firstKey);
      const dateIdx = allDates.indexOf(date);
      const fieldIdx = ALL_DATA_FIELDS.indexOf(field);

      let nextDate = date, nextField = field;
      if (e.key === 'ArrowUp' && dateIdx > 0) nextDate = allDates[dateIdx - 1];
      if (e.key === 'ArrowDown' && dateIdx < allDates.length - 1) nextDate = allDates[dateIdx + 1];
      if (e.key === 'ArrowLeft' && fieldIdx > 0) nextField = ALL_DATA_FIELDS[fieldIdx - 1];
      if (e.key === 'ArrowRight' && fieldIdx < ALL_DATA_FIELDS.length - 1) nextField = ALL_DATA_FIELDS[fieldIdx + 1];

      if (nextDate !== date || nextField !== field) {
        setSelectedCells(new Set([getCellKey(nextDate, nextField)]));
        setAnchorCell({ date: nextDate, field: nextField }); // 앵커 업데이트
      }
      return;
    }

    // Tab: 오른쪽 셀로 이동, 끝이면 다음 줄로 - 항상 가능
    if (e.key === 'Tab' && selectedCells.size > 0) {
      e.preventDefault();
      const firstKey = Array.from(selectedCells)[0];
      const { date, field } = parseCellKey(firstKey);
      const dateIdx = allDates.indexOf(date);
      const fieldIdx = ALL_DATA_FIELDS.indexOf(field);

      let nextDate = date, nextField = field;

      if (e.shiftKey) {
        // Shift+Tab: 왼쪽으로 이동
        if (fieldIdx > 0) {
          // 같은 날짜의 왼쪽 필드로
          nextField = ALL_DATA_FIELDS[fieldIdx - 1];
        } else if (dateIdx > 0) {
          // 이전 날짜의 마지막 필드로
          nextDate = allDates[dateIdx - 1];
          nextField = ALL_DATA_FIELDS[ALL_DATA_FIELDS.length - 1];
        }
      } else {
        // Tab: 오른쪽으로 이동
        if (fieldIdx < ALL_DATA_FIELDS.length - 1) {
          // 같은 날짜의 오른쪽 필드로
          nextField = ALL_DATA_FIELDS[fieldIdx + 1];
        } else if (dateIdx < allDates.length - 1) {
          // 다음 날짜의 첫 번째 필드로
          nextDate = allDates[dateIdx + 1];
          nextField = ALL_DATA_FIELDS[0];
        }
      }

      if (nextDate !== date || nextField !== field) {
        setSelectedCells(new Set([getCellKey(nextDate, nextField)]));
        setAnchorCell({ date: nextDate, field: nextField }); // 앵커 업데이트
      }
      return;
    }

    // 아래 기능들은 수정 모드에서만 동작
    if (!isEditMode) return;

    // Ctrl+V: 붙여넣기 모달 열기
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault();
      openPasteModal();
      return;
    }

    // Delete/Backspace: 삭제
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteSelectedCells();
      return;
    }

    // 숫자 입력: 편집 모드로 진입 (기존 값 덮어쓰기)
    if (/^\d$/.test(e.key) && selectedCells.size > 0 && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      for (const key of selectedCells) {
        const { date, field } = parseCellKey(key);
        if (EDITABLE_FIELDS.includes(field)) {
          const { isStopped } = checkMediaOperationStatus();
          if (!isStopped) {
            handleManualInput(date, field, e.key);
            setEditingCell({ date, field });
          }
          break;
        }
      }
      return;
    }

    // Enter: 선택된 셀 중 첫 번째 편집 가능한 셀로 편집 모드 진입
    if (e.key === 'Enter' && selectedCells.size > 0) {
      e.preventDefault();
      for (const key of selectedCells) {
        const { date, field } = parseCellKey(key);
        if (EDITABLE_FIELDS.includes(field)) {
          const { isStopped } = checkMediaOperationStatus();
          if (!isStopped) setEditingCell({ date, field });
          break;
        }
      }
      return;
    }
  };

  // 일별 상세 데이터가 표시되어야 하는지 확인 (모든 등급, 모든 팀 표시)
  const shouldShow = true;

  if (!shouldShow) {
    return null;
  }

  if (loading) {
    return (
      <div className="daily-detail">
        <h3 className="section-title">일별 상세 데이터</h3>
        <div className="data-table-container">
          <table className="data-table">
            <tbody>
              <tr>
                <td colSpan="12">데이터를 불러오는 중...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-detail">
        <h3 className="section-title">일별 상세 데이터</h3>
        <div className="data-table-container">
          <table className="data-table">
            <tbody>
              <tr>
                <td colSpan="12">오류: {error}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="daily-detail">
        <h3 className="section-title">일별 상세 데이터</h3>
        <div className="data-table-container">
          <table className="data-table">
            <tbody>
              <tr>
                <td colSpan="12">날짜를 선택하세요</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 컬럼별 셀 렌더링 함수 (동적 순서 지원)
  const renderCellByColumn = (columnKey, dayData, manual) => {
    // 편집 가능한 필드인 경우
    if (EDITABLE_FIELDS.includes(columnKey)) {
      return renderEditableCell(dayData, columnKey, FIELD_LABELS[columnKey]);
    }

    // 읽기 전용 계산 필드
    switch (columnKey) {
      case 'cpc': {
        const adCost = manual.adCost !== undefined ? manual.adCost : dayData.adCost;
        const clicks = manual.clicks !== undefined ? manual.clicks : dayData.clicks;
        const cpc = calculateCPC(adCost, clicks);
        return (
          <td
            onMouseDown={(e) => handleCellMouseDown(e, dayData.date, "cpc")}
            onMouseEnter={() => handleCellMouseEnter(dayData.date, "cpc")}
            className={`${!editingCell ? "selectable-cell" : ""} ${selectedCells.has(getCellKey(dayData.date, "cpc")) ? "selected-cell readonly-cell" : ""}`}
            style={{ cursor: "cell" }}
          >
            {(cpc || 0).toLocaleString()}
          </td>
        );
      }

      case 'ctr': {
        const impressions = manual.impressions !== undefined ? manual.impressions : dayData.impressions;
        const clicks = manual.clicks !== undefined ? manual.clicks : dayData.clicks;
        const ctr = calculateCTR(clicks, impressions);
        return (
          <td
            onMouseDown={(e) => handleCellMouseDown(e, dayData.date, "ctr")}
            onMouseEnter={() => handleCellMouseEnter(dayData.date, "ctr")}
            className={`${!editingCell ? "selectable-cell" : ""} ${selectedCells.has(getCellKey(dayData.date, "ctr")) ? "selected-cell readonly-cell" : ""}`}
            style={{ cursor: "cell" }}
          >
            {`${ctr || 0}%`}
          </td>
        );
      }

      case 'avgOrderValue': {
        const revenue = manual.revenue !== undefined ? manual.revenue : dayData.revenue;
        const conversions = manual.conversions !== undefined ? manual.conversions : dayData.conversions;
        const avgOrderValue = calculateAvgOrderValue(revenue, conversions);
        return (
          <td
            onMouseDown={(e) => handleCellMouseDown(e, dayData.date, "avgOrderValue")}
            onMouseEnter={() => handleCellMouseEnter(dayData.date, "avgOrderValue")}
            className={`${!editingCell ? "selectable-cell" : ""} ${selectedCells.has(getCellKey(dayData.date, "avgOrderValue")) ? "selected-cell readonly-cell" : ""}`}
            style={{ cursor: "cell" }}
          >
            {avgOrderValue.toLocaleString()}
          </td>
        );
      }

      case 'cvr': {
        const conversions = manual.conversions !== undefined ? manual.conversions : dayData.conversions;
        const clicks = manual.clicks !== undefined ? manual.clicks : dayData.clicks;
        const cvr = calculateCVR(conversions, clicks);
        return (
          <td
            onMouseDown={(e) => handleCellMouseDown(e, dayData.date, "cvr")}
            onMouseEnter={() => handleCellMouseEnter(dayData.date, "cvr")}
            className={`${!editingCell ? "selectable-cell" : ""} ${selectedCells.has(getCellKey(dayData.date, "cvr")) ? "selected-cell readonly-cell" : ""}`}
            style={{ cursor: "cell" }}
          >
            {`${cvr || 0}%`}
          </td>
        );
      }

      case 'roas': {
        const revenue = manual.revenue !== undefined ? manual.revenue : dayData.revenue;
        const adCost = manual.adCost !== undefined ? manual.adCost : dayData.adCost;
        const roas = calculateROAS(revenue, adCost);
        return (
          <td
            onMouseDown={(e) => handleCellMouseDown(e, dayData.date, "roas")}
            onMouseEnter={() => handleCellMouseEnter(dayData.date, "roas")}
            className={`roas-cell ${!editingCell ? "selectable-cell" : ""} ${selectedCells.has(getCellKey(dayData.date, "roas")) ? "selected-cell readonly-cell" : ""}`}
            style={{ cursor: "cell" }}
          >
            {`${roas}%`}
          </td>
        );
      }

      default:
        return null;
    }
  };

  // 편집 가능한 셀 렌더링 함수 (엑셀 스타일 방향키 지원)
  const renderEditableCell = (dayData, field, fieldLabel) => {
    const manual = manualData[dayData.date] || {};
    const cellValue = manual[field] !== undefined ? manual[field] : dayData[field];
    const showInput = editingCell?.date === dayData.date && editingCell?.field === field;

    // 편집 중 방향키 처리 (엑셀 스타일)
    const handleInputKeyDown = (e) => {
      const input = e.target;
      const cursorAtStart = input.selectionStart === 0;
      const cursorAtEnd = input.selectionStart === input.value.length;

      // Enter: 아래로 이동
      if (e.key === 'Enter') {
        e.preventDefault();
        const nextCell = getDownCell(dayData.date, field);
        setEditingCell(null);
        if (nextCell) {
          setSelectedCells(new Set([getCellKey(nextCell.date, nextCell.field)]));
          setAnchorCell(nextCell);
        }
        setTimeout(() => tableRef.current?.focus(), 0);
        return;
      }

      // Escape: 편집 취소
      if (e.key === 'Escape') {
        e.preventDefault();
        setEditingCell(null);
        setTimeout(() => tableRef.current?.focus(), 0);
        return;
      }

      // Tab: 다음/이전 편집 가능한 셀로 이동
      if (e.key === 'Tab') {
        e.preventDefault();
        const nextCell = e.shiftKey
          ? getPreviousEditableCell(dayData.date, field)
          : getNextEditableCell(dayData.date, field);
        setEditingCell(null);
        if (nextCell) {
          setSelectedCells(new Set([getCellKey(nextCell.date, nextCell.field)]));
          setAnchorCell(nextCell);
        }
        setTimeout(() => tableRef.current?.focus(), 0);
        return;
      }

      // 방향키: 커서가 끝에 있을 때만 셀 이동 (엑셀 스타일)
      if (e.key === 'ArrowLeft' && cursorAtStart) {
        e.preventDefault();
        const nextCell = getLeftCell(dayData.date, field);
        if (nextCell && EDITABLE_FIELDS.includes(nextCell.field)) {
          setEditingCell(nextCell);
          setSelectedCells(new Set([getCellKey(nextCell.date, nextCell.field)]));
          setAnchorCell(nextCell);
        } else {
          setEditingCell(null);
          if (nextCell) {
            setSelectedCells(new Set([getCellKey(nextCell.date, nextCell.field)]));
            setAnchorCell(nextCell);
          }
          setTimeout(() => tableRef.current?.focus(), 0);
        }
        return;
      }

      if (e.key === 'ArrowRight' && cursorAtEnd) {
        e.preventDefault();
        const nextCell = getRightCell(dayData.date, field);
        if (nextCell && EDITABLE_FIELDS.includes(nextCell.field)) {
          setEditingCell(nextCell);
          setSelectedCells(new Set([getCellKey(nextCell.date, nextCell.field)]));
          setAnchorCell(nextCell);
        } else {
          setEditingCell(null);
          if (nextCell) {
            setSelectedCells(new Set([getCellKey(nextCell.date, nextCell.field)]));
            setAnchorCell(nextCell);
          }
          setTimeout(() => tableRef.current?.focus(), 0);
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const nextCell = getUpCell(dayData.date, field);
        if (nextCell && EDITABLE_FIELDS.includes(nextCell.field)) {
          setEditingCell(nextCell);
          setSelectedCells(new Set([getCellKey(nextCell.date, nextCell.field)]));
          setAnchorCell(nextCell);
        } else {
          setEditingCell(null);
          if (nextCell) {
            setSelectedCells(new Set([getCellKey(nextCell.date, nextCell.field)]));
            setAnchorCell(nextCell);
          }
          setTimeout(() => tableRef.current?.focus(), 0);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextCell = getDownCell(dayData.date, field);
        if (nextCell && EDITABLE_FIELDS.includes(nextCell.field)) {
          setEditingCell(nextCell);
          setSelectedCells(new Set([getCellKey(nextCell.date, nextCell.field)]));
          setAnchorCell(nextCell);
        } else {
          setEditingCell(null);
          if (nextCell) {
            setSelectedCells(new Set([getCellKey(nextCell.date, nextCell.field)]));
            setAnchorCell(nextCell);
          }
          setTimeout(() => tableRef.current?.focus(), 0);
        }
        return;
      }
    };

    return (
      <td
        onMouseDown={(e) => handleCellMouseDown(e, dayData.date, field)}
        onMouseEnter={() => handleCellMouseEnter(dayData.date, field)}
        onDoubleClick={() => handleCellDoubleClick(dayData.date, field)}
        className={`
          ${!editingCell ? "selectable-cell" : ""}
          ${isEditMode && EDITABLE_FIELDS.includes(field) ? "editable-cell" : ""}
          ${selectedCells.has(getCellKey(dayData.date, field)) ? "selected-cell" : ""}
          ${editingCell?.date === dayData.date && editingCell?.field === field ? "editing-cell" : ""}
        `.trim()}
        style={{ cursor: "cell" }}
      >
        {showInput ? (
          <input
            type="text"
            className="editing-input"
            placeholder=""
            value={cellValue !== null && cellValue !== undefined ? formatNumber(cellValue) : ""}
            onChange={(e) => {
              const value = e.target.value.replace(/,/g, "");
              if (/^\d*$/.test(value)) {
                handleManualInput(dayData.date, field, value);
              }
            }}
            onKeyDown={handleInputKeyDown}
            autoFocus
          />
        ) : (
          <span>
            {cellValue !== null && cellValue !== undefined ? cellValue.toLocaleString() : ""}
          </span>
        )}
      </td>
    );
  };

  return (
    <div className="daily-detail">
      <h3 className="section-title">일별 상세 데이터</h3>
      <div
        className={`data-table-container ${isEditMode ? "edit-mode" : ""} ${isDragging ? "dragging" : ""}`}
        ref={tableRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>주차</th>
              <th>날짜</th>
              {(columnOrder || []).filter(key => COLUMN_METADATA[key]).map((columnKey) => {
                const meta = COLUMN_METADATA[columnKey];
                return (
                  <th
                    key={columnKey}
                    draggable={true}
                    onDragStart={(e) => handleColumnDragStart(e, columnKey)}
                    onDragOver={(e) => handleColumnDragOver(e, columnKey)}
                    onDragLeave={handleColumnDragLeave}
                    onDrop={(e) => handleColumnDrop(e, columnKey)}
                    onDragEnd={handleColumnDragEnd}
                    className={`draggable-header ${draggedColumn === columnKey ? 'dragging' : ''} ${dragOverColumn === columnKey ? 'drag-over' : ''}`}
                    style={{ cursor: 'move' }}
                    title={meta.tooltip || undefined}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      width: '100%',
                    }}>
                      <span style={{ whiteSpace: 'nowrap' }}>{meta.label}</span>
                      <span className="drag-handle">⋮⋮</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {tableData
              .map((group, groupIndex) => {
                const isCollapsed = collapsedWeeks.has(group.week);
                const weekTotals = calculateWeekTotals(group.data, manualData);
                const rows = [];

                if (isCollapsed) {
                  // 접혀있을 때는 합계 행만 표시
                  rows.push(
                    <tr
                      key={`week-${groupIndex}-summary`}
                      className="week-summary-row"
                    >
                      <td
                        onClick={() => toggleWeek(group.week)}
                        className="week-toggle-cell collapsed"
                      >
                        {group.week}
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className="toggle-icon"
                        />
                      </td>
                      <td className="week-summary-cell">합계</td>
                      {(columnOrder || []).filter(key => COLUMN_METADATA[key]).map((columnKey) => (
                        <td key={columnKey} className="week-summary-cell">
                          {weekTotals[columnKey] !== undefined
                            ? (columnKey === 'ctr' || columnKey === 'cvr' || columnKey === 'roas'
                                ? `${weekTotals[columnKey]}%`
                                : weekTotals[columnKey].toLocaleString())
                            : ''}
                        </td>
                      ))}
                    </tr>
                  );
                } else {
                  // 펼쳐있을 때는 모든 일별 데이터와 합계 행 표시
                  group.data.forEach((dayData, dateIndex) => {
                    const date = new Date(dayData.date);
                    const formattedDate = `${String(date.getMonth() + 1).padStart(2, "0")}.${String(
                      date.getDate()
                    ).padStart(2, "0")}`;

                    // 수동 입력 데이터 가져오기
                    const manual = manualData[dayData.date] || {};

                    // 현재 편집 중인 행인지 확인
                    const isCurrentlyEditingRow = editingCell?.date === dayData.date;

                    // null 체크 및 데이터 유무 확인
                    const hasData =
                      dayData.adCost !== null &&
                      dayData.adCost !== undefined &&
                      (dayData.adCost > 0 || dayData.impressions > 0);

                    // 계산된 값들 (수동 입력 데이터가 있을 때)
                    const calculated = hasData
                      ? {
                          cpc: calculateCPC(dayData.adCost, dayData.clicks),
                          ctr: calculateCTR(dayData.clicks, dayData.impressions),
                          cvr: calculateCVR(dayData.conversions, dayData.clicks)
                        }
                      : {
                          cpc: calculateCPC(manual.adCost || 0, manual.clicks || 0),
                          ctr: calculateCTR(manual.clicks || 0, manual.impressions || 0),
                          cvr: calculateCVR(manual.conversions || 0, manual.clicks || 0)
                        };

                    rows.push(
                      <tr key={`${groupIndex}-${dateIndex}`} className={isCurrentlyEditingRow ? "editing-row" : ""}>
                        {dateIndex === 0 && (
                          <td
                            rowSpan={group.data.length + 1}
                            onClick={() => toggleWeek(group.week)}
                            className="week-toggle-cell expanded"
                          >
                            {group.week}
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className="toggle-icon"
                            />
                          </td>
                        )}
                        <td
                          onMouseDown={(e) => handleCellMouseDown(e, dayData.date, "date")}
                          onMouseEnter={() => handleCellMouseEnter(dayData.date, "date")}
                          className={`date-cell ${!editingCell ? "selectable-cell" : ""} ${selectedCells.has(getCellKey(dayData.date, "date")) ? "selected-cell" : ""}`}
                          style={{ cursor: "cell" }}
                        >{formattedDate}</td>

                        {/* 동적 컬럼 순서로 렌더링 */}
                        {(columnOrder || []).filter(key => COLUMN_METADATA[key]).map((columnKey) => (
                          <React.Fragment key={columnKey}>
                            {renderCellByColumn(columnKey, dayData, manual)}
                          </React.Fragment>
                        ))}
                      </tr>
                    );
                  });

                  // 주차별 합계 행 추가
                  rows.push(
                    <tr
                      key={`week-${groupIndex}-total`}
                      className="week-total-row"
                    >
                      <td className="week-total-label">합계</td>
                      {(columnOrder || []).filter(key => COLUMN_METADATA[key]).map((columnKey) => (
                        <td key={columnKey} className="week-total-cell">
                          {weekTotals[columnKey] !== undefined
                            ? (columnKey === 'ctr' || columnKey === 'cvr' || columnKey === 'roas'
                                ? `${weekTotals[columnKey]}%`
                                : weekTotals[columnKey].toLocaleString())
                            : ''}
                        </td>
                      ))}
                    </tr>
                  );
                }

                return rows;
              })
              .flat()}
          </tbody>
        </table>
      </div>

      {/* 붙여넣기 열 매핑 모달 */}
      {showPasteModal && (
        <div className="paste-modal-overlay" onClick={closePasteModal}>
          <div className="paste-modal" onClick={(e) => e.stopPropagation()}>
            <div className="paste-modal-header">
              <h3>데이터 붙여넣기</h3>
              <button className="paste-modal-close" onClick={closePasteModal}>&times;</button>
            </div>
            <div className="paste-modal-body">
              <p className="paste-modal-info">
                시작 날짜: <strong>{pasteStartDate}</strong> |
                행 수: <strong>{pasteData.length}</strong> |
                열 수: <strong>{columnMappings.length}</strong>
              </p>
              <p className="paste-modal-guide">각 열이 어떤 항목에 해당하는지 선택해주세요:</p>

              <div className="paste-modal-mappings">
                {columnMappings.map((mapping, colIdx) => (
                  <div key={colIdx} className="paste-mapping-item">
                    <label>열 {colIdx + 1}</label>
                    <select
                      value={mapping}
                      onChange={(e) => handleColumnMappingChange(colIdx, e.target.value)}
                    >
                      <option value="skip">입력 안함</option>
                      {EDITABLE_FIELDS.map(field => (
                        <option key={field} value={field}>{FIELD_LABELS[field]}</option>
                      ))}
                    </select>
                    <span className="paste-preview-value">
                      예: {pasteData[0]?.[colIdx] ? pasteData[0][colIdx].replace(/[^\d]/g, '') || '(빈값)' : '(빈값)'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="paste-preview-table-container">
                <p className="paste-preview-title">미리보기 (최대 5행)</p>
                <table className="paste-preview-table">
                  <thead>
                    <tr>
                      <th>날짜</th>
                      {columnMappings.map((mapping, idx) => (
                        <th key={idx} className={mapping === 'skip' ? 'skipped-column' : ''}>
                          {mapping === 'skip' ? '입력 안함' : FIELD_LABELS[mapping]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pasteData.slice(0, 5).map((row, rowIdx) => {
                      const startIdx = allDates.indexOf(pasteStartDate);
                      const targetDate = allDates[startIdx + rowIdx];
                      return (
                        <tr key={rowIdx}>
                          <td>{targetDate || '범위 초과'}</td>
                          {columnMappings.map((mapping, colIdx) => (
                            <td key={colIdx} className={mapping === 'skip' ? 'skipped-column' : ''}>
                              {row[colIdx] ? row[colIdx].replace(/[^\d]/g, '') : ''}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {pasteData.length > 5 && (
                  <p className="paste-preview-more">... 외 {pasteData.length - 5}개 행</p>
                )}
              </div>
            </div>
            <div className="paste-modal-footer">
              <button className="paste-modal-cancel" onClick={closePasteModal}>취소</button>
              <button className="paste-modal-apply" onClick={applyPaste}>적용</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyDetailTable;
