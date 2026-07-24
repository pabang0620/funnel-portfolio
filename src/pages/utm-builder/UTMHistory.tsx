import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from './lib/toast';
import { Copy, ChevronLeft, ChevronRight, Filter, ArrowUp, ArrowDown, Search, FileSpreadsheet, Calendar, Settings2, GripVertical, Columns } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Pagination } from './components/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { DayPicker } from 'react-day-picker';
import type { DateRange } from 'react-day-picker';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-day-picker/style.css';
import { SearchableSelect } from './components/SearchableSelect';
import * as mockService from '@/data/utm-builder/mockService';
import { cn, getProductColor } from './lib/utils';
import { useMasterDataContext } from './contexts/MasterDataContext';
import type { UTMCode } from './types/utm_codes';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 50;

const COLUMN_ORDER_KEY = 'utm-history-column-order-v4';
const COLUMN_VISIBILITY_KEY = 'utm-history-column-visibility-v1';

const DEFAULT_VISIBLE_COLUMNS = {
  brand: true,
  media: true,
  contentType: true,
  placement: true,
  product: true,
  planner: true,
  marketer: true,
  creator: true,
  author: true,
  createdAt: true,
  utmCode: true,
  adUrl: true,
};

function loadVisibleColumns() {
  try {
    const saved = localStorage.getItem(COLUMN_VISIBILITY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_VISIBLE_COLUMNS, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_VISIBLE_COLUMNS };
}

function saveVisibleColumns(cols: typeof DEFAULT_VISIBLE_COLUMNS) {
  localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(cols));
}

// 드래그 가능한 열 정의 (체크박스, No, 제품은 고정 / 나머지 전부 순서 변경 가능)
const DRAGGABLE_COLUMNS = [
  { key: 'brand',       label: '브랜드' },
  { key: 'media',       label: '매체' },
  { key: 'contentType', label: '콘텐츠타입' },
  { key: 'placement',   label: '지면/구좌' },
  { key: 'product',     label: '제품' },
  { key: 'planner',     label: '기획자' },
  { key: 'marketer',    label: '마케터' },
  { key: 'creator',     label: '제작자' },
  { key: 'author',      label: '생성자' },
  { key: 'createdAt',   label: '생성일시' },
  { key: 'utmCode',     label: 'UTM 코드' },
  { key: 'adUrl',       label: '광고 URL' },
] as const;

type DraggableColumnKey = typeof DRAGGABLE_COLUMNS[number]['key'];

const DEFAULT_COLUMN_ORDER: DraggableColumnKey[] = DRAGGABLE_COLUMNS.map(c => c.key);

function loadColumnOrder(): DraggableColumnKey[] {
  try {
    const saved = localStorage.getItem(COLUMN_ORDER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as DraggableColumnKey[];
      // 저장된 목록에 누락된 키가 있으면 뒤에 추가
      const allKeys = DEFAULT_COLUMN_ORDER;
      const missing = allKeys.filter(k => !parsed.includes(k));
      return [...parsed.filter(k => allKeys.includes(k)), ...missing];
    }
  } catch {}
  return [...DEFAULT_COLUMN_ORDER];
}

function saveColumnOrder(order: DraggableColumnKey[]) {
  localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(order));
}

interface FilterState {
  searchTerm: string;
  brand: string;
  product: string;
  media: string;
  contentType: string;
  placement: string;
  planner: string;
  marketer: string;
  creator: string;
  author: string;
  createdAtFrom: string;
  createdAtTo: string;
}

const emptyFilters: FilterState = {
  searchTerm: '',
  brand: '',
  product: '',
  media: '',
  contentType: '',
  placement: '',
  planner: '',
  marketer: '',
  creator: '',
  author: '',
  createdAtFrom: '',
  createdAtTo: '',
};

export function UTMHistory() {
  const masterData = useMasterDataContext();
  const [utmCodes, setUtmCodes] = useState<UTMCode[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);
  const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false);

  // Pending filter state (UI 조작용 - 적용 전)
  const [pending, setPending] = useState<FilterState>(emptyFilters);

  // Applied filter state (실제 fetch에 사용)
  const [applied, setApplied] = useState<FilterState>(emptyFilters);

  // Raw data cache
  const [allProducts, setAllProducts] = useState<{id: string; brand_id: string; name: string; initial: string}[]>([]);

  // Filter options (from master data)
  const [brandOptions, setBrandOptions] = useState<{value: string; label: string}[]>([]);
  const [allProductOptions, setAllProductOptions] = useState<{value: string; label: string; brandId: string}[]>([]);
  const [filteredProductOptions, setFilteredProductOptions] = useState<{value: string; label: string; brandId: string}[]>([]);
  const [mediaOptions, setMediaOptions] = useState<{value: string; label: string; initial: string}[]>([]);
  const [contentTypeOptions, setContentTypeOptions] = useState<{value: string; label: string; initial: string}[]>([]);
  const [placementOptions, setPlacementOptions] = useState<{value: string; label: string; initial: string; name: string}[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{value: string; label: string; initial: string}[]>([]);
  const [authorOptions, setAuthorOptions] = useState<{value: string; label: string}[]>([]);

  // Column order
  const [columnOrder, setColumnOrder] = useState<DraggableColumnKey[]>(loadColumnOrder);
  const [isColOrderOpen, setIsColOrderOpen] = useState(false);
  const [isColVisOpen, setIsColVisOpen] = useState(false);
  const [tempColOrder, setTempColOrder] = useState<DraggableColumnKey[]>([]);
  const colModalDragIdx = useRef<number | null>(null);

  const openColOrderModal = () => {
    if (isColOrderOpen) {
      setIsColOrderOpen(false);
      return;
    }
    setTempColOrder([...columnOrder]);
    setIsColOrderOpen(true);
  };
  const applyHistoryColOrder = () => {
    setColumnOrder(tempColOrder);
    saveColumnOrder(tempColOrder);
    setIsColOrderOpen(false);
  };

  // Selection (체크박스)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Excel dialog
  const [excelDialogStep, setExcelDialogStep] = useState<'idle' | 'warn' | 'confirm'>('idle');
  const [excelLoading, setExcelLoading] = useState(false);

  // Date range picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Sort
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState(loadVisibleColumns);

  // Refs for indeterminate checkbox state
  const extraGroupCheckboxRef = useRef<HTMLInputElement>(null);
  const info2GroupCheckboxRef = useRef<HTMLInputElement>(null);

  const tableWrapRef = useRef<HTMLDivElement>(null);

  // 테이블 컨테이너 너비 리사이징
  const TABLE_WIDTH_KEY = 'utm-history-table-width-v1';
  const SIDEBAR_OPEN = 256;
  const SIDEBAR_COLLAPSED = 64;

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableWidth, setTableWidth] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(TABLE_WIDTH_KEY);
      return saved ? Number(saved) : null;
    } catch { return null; }
  });
  const resizingRef = useRef<{ startX: number; startWidth: number; side: 'left' | 'right' } | null>(null);
  // localStorage 저장을 동기로 처리하기 위해 최신 tableWidth를 ref로도 유지
  const tableWidthRef = useRef<number | null>(tableWidth);

  const setTableWidthSync = useCallback((val: number | null) => {
    tableWidthRef.current = val;
    setTableWidth(val);
    if (val !== null) {
      localStorage.setItem(TABLE_WIDTH_KEY, String(val));
    } else {
      localStorage.removeItem(TABLE_WIDTH_KEY);
    }
  }, []);

  const getMaxWidth = useCallback(() => {
    const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    return window.innerWidth - (collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_OPEN);
  }, []);

  // 사이드바 토글 감지: 테이블이 가용 영역을 넘칠 때만 줄임
  useEffect(() => {
    const handleSidebarToggle = (e: Event) => {
      const collapsed = (e as CustomEvent).detail?.collapsed as boolean;
      const prev = tableWidthRef.current;
      if (prev === null) return;
      const maxW = window.innerWidth - (collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_OPEN);
      if (prev <= maxW) return;
      setTableWidthSync(Math.max(400, maxW));
    };
    window.addEventListener('sidebar-toggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle);
  }, [setTableWidthSync]);

  const handleTableResizeStart = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
    e.preventDefault();
    const container = tableContainerRef.current;
    if (!container) return;
    resizingRef.current = { startX: e.clientX, startWidth: container.offsetWidth, side };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingRef.current) return;
      const { startX, startWidth, side } = resizingRef.current;
      const rawDelta = e.clientX - startX;
      const delta = side === 'left' ? -rawDelta : rawDelta;
      const newWidth = Math.max(400, Math.min(startWidth + delta * 2, getMaxWidth()));
      // 드래그 중에는 ref만 업데이트 (렌더 최적화), 저장은 mouseup에서
      tableWidthRef.current = newWidth;
      setTableWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (!resizingRef.current) return;
      resizingRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // ref에서 동기로 읽어서 저장 (React 배치 영향 없음)
      if (tableWidthRef.current !== null) {
        localStorage.setItem(TABLE_WIDTH_KEY, String(tableWidthRef.current));
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [getMaxWidth]);

  // 필터가 처음 열릴 때 1회만 lazy loading (Promise.allSettled - 개별 실패 허용)
  useEffect(() => {
    if (!filterExpanded || filterOptionsLoaded) return;

    const loadFilterOptions = async () => {
      setFilterOptionsLoading(true);
      const [brandsResult, productsResult, mediaResult, contentTypesResult, placementsResult, employeesResult, usersResult] = await Promise.allSettled([
        mockService.getBrands(),
        mockService.getProducts(),
        mockService.getMedia(),
        mockService.getContentTypes(),
        mockService.getPlacements(),
        mockService.getEmployees(),
        mockService.getEmployees(),
      ]);

      if (brandsResult.status === 'fulfilled') {
        const brands = brandsResult.value;
        setBrandOptions(brands.map(b => ({ value: b.id, label: b.name })).sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        console.error('Failed to load brands:', brandsResult.reason);
      }

      if (productsResult.status === 'fulfilled') {
        const products = productsResult.value;
        setAllProducts(products.filter(p => p.initial).map(p => ({ id: p.id, brand_id: p.brand_id, name: p.name, initial: p.initial })));
        const opts = products.filter(p => p.initial).map(p => ({ value: p.name, label: `${p.name} (${p.initial})`, brandId: p.brand_id })).sort((a, b) => a.label.localeCompare(b.label));
        setAllProductOptions(opts);
        setFilteredProductOptions(opts);
      } else {
        console.error('Failed to load products:', productsResult.reason);
      }

      if (mediaResult.status === 'fulfilled') {
        const media = mediaResult.value;
        setMediaOptions(media.filter(m => m.initial).map(m => ({ value: m.name, label: `${m.name} (${m.initial})`, initial: m.initial })).sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        console.error('Failed to load media:', mediaResult.reason);
      }

      if (contentTypesResult.status === 'fulfilled') {
        const contentTypes = contentTypesResult.value;
        setContentTypeOptions(contentTypes.filter(ct => ct.initial).map(ct => ({ value: ct.name, label: `${ct.name} (${ct.initial})`, initial: ct.initial })).sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        console.error('Failed to load content types:', contentTypesResult.reason);
      }

      if (placementsResult.status === 'fulfilled') {
        const placements = placementsResult.value;
        setPlacementOptions(placements.filter(pl => pl.initial).map(pl => ({ value: pl.id, label: `${pl.name} (${pl.initial})`, initial: pl.initial, name: pl.name })).sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        console.error('Failed to load placements:', placementsResult.reason);
      }

      if (employeesResult.status === 'fulfilled') {
        const employees = employeesResult.value;
        setEmployeeOptions(employees.filter((e: any) => e.initial && e.initial.trim()).map((e: any) => ({ value: e.name, label: `${e.name} (${e.initial})`, initial: e.initial })).sort((a: any, b: any) => a.label.localeCompare(b.label)));
      } else {
        console.error('Failed to load employees:', employeesResult.reason);
      }

      if (usersResult.status === 'fulfilled') {
        const users = usersResult.value;
        setAuthorOptions(users.map((u: any) => ({ value: u.name, label: u.name })).sort((a: any, b: any) => a.label.localeCompare(b.label)));
      } else {
        console.error('Failed to load users:', usersResult.reason);
      }

      setFilterOptionsLoading(false);
      setFilterOptionsLoaded(true);
    };

    loadFilterOptions();
  }, [filterExpanded]);

  // 브랜드 선택 시 해당 브랜드 제품만 필터링
  useEffect(() => {
    if (!pending.brand) {
      setFilteredProductOptions(allProductOptions);
    } else {
      setFilteredProductOptions(allProductOptions.filter(p => p.brandId === pending.brand));
    }
  }, [pending.brand, allProductOptions]);

  // Fetch on: applied filters / sort / page change
  useEffect(() => {
    fetchUTMCodes();
  }, [applied, currentPage, sortConfig]);

  const fetchUTMCodes = async () => {
    try {
      setLoading(true);

      // 브랜드 선택 시 해당 브랜드의 제품 이니셜 목록 계산
      const brandProductInitials = applied.brand
        ? allProducts.filter(p => p.brand_id === applied.brand).map(p => p.initial)
        : [];

      // 제품 선택 시 해당 제품 이니셜
      const selectedProductInitial = applied.product
        ? allProducts.find(p => p.name === applied.product)?.initial
        : undefined;

      // 브랜드 + 제품 이니셜 합산 (중복 제거)
      const allProductInitials = [...new Set([
        ...brandProductInitials,
        ...(selectedProductInitial ? [selectedProductInitial] : []),
      ])];

      const result = await mockService.getUTMCodes({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        utm_code: applied.searchTerm || undefined,
        product_initials: allProductInitials.length ? allProductInitials : undefined,
        media_initials: applied.media ? [mediaOptions.find(m => m.value === applied.media)?.initial].filter(Boolean) as string[] : undefined,
        content_type_initials: applied.contentType ? [contentTypeOptions.find(ct => ct.value === applied.contentType)?.initial].filter(Boolean) as string[] : undefined,
        placement_id: applied.placement || undefined,
        planner_initials: applied.planner ? [employeeOptions.find(e => e.value === applied.planner)?.initial].filter(Boolean) as string[] : undefined,
        marketer_initials: applied.marketer ? [employeeOptions.find(e => e.value === applied.marketer)?.initial].filter(Boolean) as string[] : undefined,
        creator_initials: applied.creator ? [employeeOptions.find(e => e.value === applied.creator)?.initial].filter(Boolean) as string[] : undefined,
        author_name: applied.author || undefined,
        created_at_from: applied.createdAtFrom || undefined,
        created_at_to: applied.createdAtTo || undefined,
        sort_key: sortConfig?.key,
        sort_dir: sortConfig?.direction || 'desc',
      });
      setUtmCodes(result.items);
      setTotal(result.total);
      setSelectedIds(new Set());
    } catch (error: any) {
      console.error('Failed to load UTM codes:', error);
      alert(`데이터 로딩 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setCurrentPage(1);
    setApplied({ ...pending });
  };

  const handleReset = () => {
    setPending(emptyFilters);
    setDateRange(undefined);
    setCurrentPage(1);
    setApplied(emptyFilters);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  const copyToClipboard = async (text: string, type: 'utm' | 'url') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type === 'utm' ? 'UTM 코드' : '광고 URL'} 복사됨`);
    } catch {
      toast.error('복사에 실패했습니다');
    }
  };

  const formatDate = (dateString: string) => {
    const utcDate = new Date(dateString + 'Z');
    return utcDate.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul',
    });
  };

  const hasAppliedFilters = applied.searchTerm || applied.brand || applied.product || applied.media || applied.contentType || applied.placement || applied.planner || applied.marketer || applied.creator || applied.author || applied.createdAtFrom || applied.createdAtTo;

  const hasPendingFilters = pending.searchTerm || pending.brand || pending.product || pending.media || pending.contentType || pending.placement || pending.planner || pending.marketer || pending.creator || pending.author || pending.createdAtFrom || pending.createdAtTo;

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // 부가정보 그룹 컬럼 목록
  const extraGroupKeys = ['brand', 'product', 'utmCode', 'author', 'createdAt', 'adUrl'] as const;

  const extraGroupChecked = extraGroupKeys.every(k => visibleColumns[k]);
  const extraGroupSomeChecked = extraGroupKeys.some(k => visibleColumns[k]);
  const extraGroupIndeterminate = !extraGroupChecked && extraGroupSomeChecked;

  const info2GroupKeys = ['media', 'contentType', 'placement', 'planner', 'marketer', 'creator'] as const;

  const info2GroupChecked = info2GroupKeys.every(k => visibleColumns[k]);
  const info2GroupSomeChecked = info2GroupKeys.some(k => visibleColumns[k]);
  const info2GroupIndeterminate = !info2GroupChecked && info2GroupSomeChecked;

  // Sync indeterminate state
  useEffect(() => {
    if (extraGroupCheckboxRef.current) {
      extraGroupCheckboxRef.current.indeterminate = extraGroupIndeterminate;
    }
  }, [extraGroupIndeterminate]);

  useEffect(() => {
    if (info2GroupCheckboxRef.current) {
      info2GroupCheckboxRef.current.indeterminate = info2GroupIndeterminate;
    }
  }, [info2GroupIndeterminate]);


  const handleInfo2GroupToggle = () => {
    const nextValue = !info2GroupChecked;
    if (!nextValue && !extraGroupKeys.some(k => visibleColumns[k])) return;
    setVisibleColumns((prev: typeof DEFAULT_VISIBLE_COLUMNS) => {
      const next = { ...prev };
      info2GroupKeys.forEach(k => { next[k] = nextValue; });
      saveVisibleColumns(next as typeof DEFAULT_VISIBLE_COLUMNS);
      return next;
    });
  };

  const handleExtraGroupToggle = () => {
    const nextValue = !extraGroupChecked;
    if (!nextValue && !info2GroupKeys.some(k => visibleColumns[k])) return;
    setVisibleColumns((prev: typeof DEFAULT_VISIBLE_COLUMNS) => {
      const next = { ...prev };
      extraGroupKeys.forEach(k => { next[k] = nextValue; });
      saveVisibleColumns(next as typeof DEFAULT_VISIBLE_COLUMNS);
      return next;
    });
  };

  const handleColumnToggle = (key: string, value: boolean) => {
    const next = { ...visibleColumns, [key]: value };
    const info1Empty = extraGroupKeys.every(k => !next[k as keyof typeof next]);
    const info2Empty = info2GroupKeys.every(k => !next[k as keyof typeof next]);
    if (info1Empty && info2Empty) return;
    setVisibleColumns(next);
    saveVisibleColumns(next as typeof DEFAULT_VISIBLE_COLUMNS);
  };


  // selectedItems 계산
  const selectedItems = utmCodes.filter(item => selectedIds.has(item.id));
  const allSelected = utmCodes.length > 0 && selectedIds.size === utmCodes.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < utmCodes.length;

  // 엑셀 컬럼 맵
  const COLUMN_MAP = [
    { key: 'utmCode' as const,       header: 'UTM 코드',    field: 'utm_code' as const },
    { key: 'adUrl' as const,         header: '광고 URL',    field: 'ad_url' as const },
    { key: 'brand' as const,         header: '브랜드',      field: 'brand_name' as const },
    { key: 'media' as const,         header: '매체',        field: 'media_name' as const },

    { key: 'contentType' as const,   header: '콘텐츠 유형', field: 'content_type_name' as const },
    { key: 'placement' as const,   header: '지면',        field: 'placement_name' as const },
    { key: 'planner' as const,     header: '플래너',      field: 'planner_name' as const },
    { key: 'marketer' as const,    header: '마케터',      field: 'marketer_name' as const },
    { key: 'creator' as const,     header: '제작자',      field: 'creator_name' as const },
    { key: 'author' as const,      header: '작성자',      field: 'author_name' as const },
    { key: 'createdAt' as const,   header: '생성일',      field: 'created_at' as const },
  ] as const;

  const handleExcelDownload = async () => {
    if (!hasAppliedFilters) {
      toast.error('필터를 지정한 후 다운로드해주세요.');
      return;
    }
    setExcelDialogStep('confirm');
  };

  const doExcelDownload = async () => {
    setExcelLoading(true);
    try {
      // fetchUTMCodes와 동일한 product_initials 계산
      const brandProductInitials = applied.brand
        ? allProducts.filter(p => p.brand_id === applied.brand).map(p => p.initial)
        : [];
      const selectedProductInitial = applied.product
        ? allProducts.find(p => p.name === applied.product)?.initial
        : undefined;
      const allProductInitials = [...new Set([
        ...brandProductInitials,
        ...(selectedProductInitial ? [selectedProductInitial] : []),
      ])];

      const items = await mockService.exportUTMCodes({
        utm_code: applied.searchTerm || undefined,
        product_initials: allProductInitials.length ? allProductInitials : undefined,
        media_initials: applied.media ? [mediaOptions.find(m => m.value === applied.media)?.initial].filter(Boolean) as string[] : undefined,
        content_type_initials: applied.contentType ? [contentTypeOptions.find(ct => ct.value === applied.contentType)?.initial].filter(Boolean) as string[] : undefined,
        placement_id: applied.placement || undefined,
        planner_initials: applied.planner ? [employeeOptions.find(e => e.value === applied.planner)?.initial].filter(Boolean) as string[] : undefined,
        marketer_initials: applied.marketer ? [employeeOptions.find(e => e.value === applied.marketer)?.initial].filter(Boolean) as string[] : undefined,
        creator_initials: applied.creator ? [employeeOptions.find(e => e.value === applied.creator)?.initial].filter(Boolean) as string[] : undefined,
        author_name: applied.author || undefined,
        created_at_from: applied.createdAtFrom || undefined,
        created_at_to: applied.createdAtTo || undefined,
      });

      const activeColumns = COLUMN_MAP.filter(c => visibleColumns[c.key]);
      const rows = items.map(item => {
        const row: Record<string, unknown> = { '제품': item.product_name };
        for (const col of activeColumns) {
          const value = (item as any)[col.field];
          row[col.header] = col.field === 'created_at' && value ? formatDate(value) : value;
        }
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'UTM 목록');
      const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).replace(/\. /g, '').replace('.', '');
      XLSX.writeFile(wb, `utm_codes_${today}.xlsx`);
      toast.success(`${items.length}개 항목을 엑셀로 다운로드했습니다`);
    } catch (e: any) {
      toast.error(`다운로드 실패: ${e.message}`);
    } finally {
      setExcelLoading(false);
      setExcelDialogStep('idle');
    }
  };

  if (loading && utmCodes.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="shrink-0 bg-background px-6 pt-6 pb-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold tracking-tight">UTM 목록</h1>
            <p className="text-sm text-muted-foreground">생성된 UTM 코드와 광고 URL을 확인하고 관리합니다</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 bg-background px-6 pt-6 pb-4 max-w-[1480px] mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold tracking-tight">UTM 목록</h1>
            <p className="text-sm text-muted-foreground">생성된 UTM 코드와 광고 URL을 확인하고 관리합니다</p>
          </div>
          {/* 필터 컨트롤 + 액션 버튼 */}
          <div className="flex items-center gap-2">
            {/* 컬럼 */}
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setIsColVisOpen(v => !v)}>
                <Columns className="h-3.5 w-3.5 mr-1.5" />열 표시
              </Button>
              {isColVisOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 bg-card border rounded-lg shadow-xl p-3 w-52">
                  {/* 정보1 */}
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">정보1</span>
                    <div className="mt-1.5 space-y-1">
                      <label className="flex items-center gap-2 cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50">
                        <input ref={extraGroupCheckboxRef} type="checkbox" checked={extraGroupChecked} onChange={handleExtraGroupToggle} className="w-4 h-4 rounded border-gray-300" />
                        <span className="text-sm font-medium">전체</span>
                      </label>
                      {[
                        { key: 'brand', label: '브랜드' }, { key: 'product', label: '제품' },
                        { key: 'utmCode', label: 'UTM코드' }, { key: 'author', label: '생성자' },
                        { key: 'createdAt', label: '생성일시' }, { key: 'adUrl', label: '광고URL' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50">
                          <input type="checkbox" checked={visibleColumns[key as keyof typeof visibleColumns]} onChange={(e) => handleColumnToggle(key, e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <span className="text-xs font-semibold text-muted-foreground">정보2</span>
                    <div className="mt-1.5 space-y-1">
                      <label className="flex items-center gap-2 cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50">
                        <input ref={info2GroupCheckboxRef} type="checkbox" checked={info2GroupChecked} onChange={handleInfo2GroupToggle} className="w-4 h-4 rounded border-gray-300" />
                        <span className="text-sm font-medium">전체</span>
                      </label>
                      {[
                        { key: 'media', label: '매체' }, { key: 'contentType', label: '콘텐츠타입' },
                        { key: 'placement', label: '지면/구좌' }, { key: 'planner', label: '기획자' },
                        { key: 'marketer', label: '마케터' }, { key: 'creator', label: '제작자' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50">
                          <input type="checkbox" checked={visibleColumns[key as keyof typeof visibleColumns]} onChange={(e) => handleColumnToggle(key, e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* 열 순서 */}
            <div className="relative">
              <Button variant="outline" size="sm" onClick={openColOrderModal}>
                <Settings2 className="h-3.5 w-3.5 mr-1.5" />열 순서
              </Button>
              {isColOrderOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 bg-card border rounded-lg shadow-xl p-3 w-48">
                  <div className="space-y-1">
                    {tempColOrder.map((key, idx) => {
                      const meta = DRAGGABLE_COLUMNS.find(c => c.key === key);
                      return (
                        <div
                          key={key}
                          draggable
                          onDragStart={e => {
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', String(idx));
                            colModalDragIdx.current = idx;
                            (e.currentTarget as HTMLElement).style.opacity = '0.4';
                          }}
                          onDragEnter={e => {
                            e.preventDefault();
                            (e.currentTarget as HTMLElement).style.outline = '2px dashed hsl(var(--primary))';
                            (e.currentTarget as HTMLElement).style.outlineOffset = '-2px';
                          }}
                          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                          onDragLeave={e => {
                            (e.currentTarget as HTMLElement).style.outline = '';
                            (e.currentTarget as HTMLElement).style.outlineOffset = '';
                          }}
                          onDrop={e => {
                            e.preventDefault();
                            (e.currentTarget as HTMLElement).style.outline = '';
                            const from = Number(e.dataTransfer.getData('text/plain'));
                            if (isNaN(from) || from === idx) return;
                            setTempColOrder(prev => {
                              const next = [...prev];
                              const [item] = next.splice(from, 1);
                              next.splice(idx, 0, item);
                              return next;
                            });
                            colModalDragIdx.current = null;
                          }}
                          onDragEnd={e => {
                            (e.currentTarget as HTMLElement).style.opacity = '';
                            colModalDragIdx.current = null;
                          }}
                          className="flex items-center gap-2 rounded px-3 py-2 text-sm cursor-grab select-none bg-muted/40 hover:bg-muted/70"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span>{meta?.label ?? key}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setTempColOrder(DEFAULT_COLUMN_ORDER)}>초기화</Button>
                    <Button size="sm" className="flex-1" onClick={applyHistoryColOrder}>적용</Button>
                  </div>
                </div>
              )}
            </div>
            {/* 엑셀 다운로드 */}
            <Button variant="outline" size="sm" onClick={handleExcelDownload}>
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />엑셀 다운로드
            </Button>
            {/* 필터 그룹 버튼 */}
            <div className="relative">
            {/* 필터 토글 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterExpanded(!filterExpanded)}
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              필터
              {hasAppliedFilters && (
                <span className="ml-1 text-xs font-semibold text-primary">
                  {[pending.searchTerm, pending.brand, pending.product, pending.media, pending.contentType, pending.placement, pending.planner, pending.marketer, pending.creator, pending.author, pending.createdAtFrom].filter(Boolean).length}
                </span>
              )}
            </Button>

            {/* 플로팅 필터 패널 */}
            {filterExpanded && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 bg-card border rounded-lg shadow-xl p-4 w-[900px]">
                {/* 활성 필터 칩 + 초기화 */}
                {hasPendingFilters && (
                  <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b items-center">
                    {([
                      { key: 'searchTerm', label: 'UTM' },
                      { key: 'brand', label: '브랜드' },
                      { key: 'product', label: '제품' },
                      { key: 'media', label: '매체' },
                      { key: 'contentType', label: '콘텐츠타입' },
                      { key: 'placement', label: '지면' },
                      { key: 'planner', label: '기획자' },
                      { key: 'marketer', label: '마케터' },
                      { key: 'creator', label: '제작자' },
                      { key: 'author', label: '생성자' },
                    ] as { key: keyof FilterState; label: string }[]).filter(({ key }) => pending[key]).map(({ key, label }) => (
                      <button key={key} onClick={() => setPending(p => ({ ...p, [key]: '' }))}
                        className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center gap-1">
                        {label}: {key === 'brand' ? (brandOptions.find(o => o.value === pending.brand)?.label ?? pending.brand) : key === 'placement' ? (placementOptions.find(o => o.value === pending.placement)?.label ?? pending.placement) : pending[key]}
                        <span className="opacity-60">×</span>
                      </button>
                    ))}
                    {(pending.createdAtFrom || pending.createdAtTo) && (
                      <button onClick={() => { setPending(p => ({ ...p, createdAtFrom: '', createdAtTo: '' })); setDateRange(undefined); }}
                        className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center gap-1">
                        생성일: {pending.createdAtFrom || '?'} ~ {pending.createdAtTo || '?'}
                        <span className="opacity-60">×</span>
                      </button>
                    )}
                    {(hasAppliedFilters || hasPendingFilters) && (
                      <Button variant="outline" size="sm" className="ml-auto" onClick={handleReset}>초기화</Button>
                    )}
                  </div>
                )}
            {/* Row 1: 브랜드, 제품, 매체, 콘텐츠타입, 지면/구좌 */}
            <div className="flex gap-2">
              <div className="w-40">
                <SearchableSelect
                  label="브랜드"
                  options={brandOptions}
                  value={pending.brand}
                  onChange={(v) => setPending(p => ({ ...p, brand: v, product: '' }))}
                  placeholder={filterOptionsLoading ? "로딩 중..." : "전체"}
                  disabled={filterOptionsLoading}
                />
              </div>

              <div className="w-40">
                <SearchableSelect
                  label="제품"
                  options={filteredProductOptions}
                  value={pending.product}
                  onChange={(v) => setPending(p => ({ ...p, product: v }))}
                  placeholder={filterOptionsLoading ? "로딩 중..." : "전체"}
                  disabled={filterOptionsLoading}
                  renderOption={(opt) => {
                    const product = allProducts.find(p => p.name === opt.value);
                    if (!product) return opt.label;
                    const color = getProductColor(product.id);
                    return <span className="flex items-center gap-1.5"><Badge className={cn(color.bg, color.text)}>{product.name}</Badge><span className="text-xs text-muted-foreground">({product.initial})</span></span>;
                  }}
                />
              </div>

              <div className="w-40">
                <SearchableSelect
                  label="매체"
                  options={mediaOptions}
                  value={pending.media}
                  onChange={(v) => setPending(p => ({ ...p, media: v }))}
                  placeholder={filterOptionsLoading ? "로딩 중..." : "전체"}
                  disabled={filterOptionsLoading}
                />
              </div>

              <div className="w-40">
                <SearchableSelect
                  label="콘텐츠타입"
                  options={contentTypeOptions}
                  value={pending.contentType}
                  onChange={(v) => setPending(p => ({ ...p, contentType: v }))}
                  placeholder={filterOptionsLoading ? "로딩 중..." : "전체"}
                  disabled={filterOptionsLoading}
                />
              </div>

              <div className="w-40">
                <SearchableSelect
                  label="지면/구좌"
                  options={placementOptions}
                  value={pending.placement}
                  onChange={(v) => setPending(p => ({ ...p, placement: v }))}
                  placeholder={filterOptionsLoading ? "로딩 중..." : "전체"}
                  disabled={filterOptionsLoading}
                />
              </div>
            </div>

            {/* Row 2: 기획자, 마케터, 제작자, 생성자 */}
            <div className="flex gap-2 mt-2">
              <div className="w-40">
                <SearchableSelect
                  label="기획자"
                  options={employeeOptions}
                  value={pending.planner}
                  onChange={(v) => setPending(p => ({ ...p, planner: v }))}
                  placeholder={filterOptionsLoading ? "로딩 중..." : "전체"}
                  disabled={filterOptionsLoading}
                />
              </div>

              <div className="w-40">
                <SearchableSelect
                  label="마케터"
                  options={employeeOptions}
                  value={pending.marketer}
                  onChange={(v) => setPending(p => ({ ...p, marketer: v }))}
                  placeholder={filterOptionsLoading ? "로딩 중..." : "전체"}
                  disabled={filterOptionsLoading}
                />
              </div>

              <div className="w-40">
                <SearchableSelect
                  label="제작자"
                  options={employeeOptions}
                  value={pending.creator}
                  onChange={(v) => setPending(p => ({ ...p, creator: v }))}
                  placeholder={filterOptionsLoading ? "로딩 중..." : "전체"}
                  disabled={filterOptionsLoading}
                />
              </div>

              <div className="w-40">
                <SearchableSelect
                  label="생성자"
                  options={authorOptions}
                  value={pending.author}
                  onChange={(v) => setPending(p => ({ ...p, author: v }))}
                  placeholder={filterOptionsLoading ? "로딩 중..." : "전체"}
                  disabled={filterOptionsLoading}
                />
              </div>
            </div>
            {/* Row 3: 생성일, UTM 코드 */}
            <div className="flex gap-2 mt-2">
              <div className="w-40 space-y-2">
                <label className="text-sm font-medium">생성일</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-9 w-full justify-start text-left font-normal text-sm overflow-hidden">
                      <Calendar className="mr-2 h-4 w-4 shrink-0" />
                      {dateRange?.from ? (
                        dateRange.to
                          ? `${format(dateRange.from, 'yyyy.MM.dd')} ~ ${format(dateRange.to, 'yyyy.MM.dd')}`
                          : format(dateRange.from, 'yyyy.MM.dd')
                      ) : (
                        <span className="text-muted-foreground">날짜 범위 선택</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    {(() => {
                      const applyRange = (from: Date, to: Date) => {
                        const range = { from, to };
                        setDateRange(range);
                        setPending(prev => ({
                          ...prev,
                          createdAtFrom: format(from, 'yyyy-MM-dd'),
                          createdAtTo: format(to, 'yyyy-MM-dd'),
                        }));
                      };
                      const today = new Date();
                      const quickOptions = [
                        { label: '오늘', from: today, to: today },
                        { label: '어제', from: subDays(today, 1), to: subDays(today, 1) },
                        { label: '지난 7일', from: subDays(today, 6), to: today },
                        { label: '이번 달', from: startOfMonth(today), to: endOfMonth(today) },
                        { label: '저번 달', from: startOfMonth(subMonths(today, 1)), to: endOfMonth(subMonths(today, 1)) },
                      ];
                      return (
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-3">
                            {/* 빠른 선택 */}
                            <div className="flex flex-col gap-1 border-r pr-3 min-w-[80px]">
                              {quickOptions.map(opt => (
                                <Button
                                  key={opt.label}
                                  variant="ghost"
                                  size="sm"
                                  className="justify-start text-xs h-7"
                                  onClick={() => applyRange(opt.from, opt.to)}
                                >
                                  {opt.label}
                                </Button>
                              ))}
                            </div>
                            {/* 달력 */}
                            <div className="[&_button[data-selected]]:!font-normal [&_button[data-today]]:!font-normal">
                              <DayPicker
                                mode="range"
                                selected={dateRange}
                                onSelect={(range) => {
                                  setDateRange(range);
                                  setPending(prev => ({
                                    ...prev,
                                    createdAtFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                                    createdAtTo: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
                                  }));
                                }}
                                numberOfMonths={2}
                                locale={ko}
                                style={{
                                  '--rdp-accent-color': 'hsl(220 90% 56%)',
                                  '--rdp-accent-background-color': 'hsl(220 90% 93%)',
                                } as React.CSSProperties}
                                classNames={{
                                  day: 'h-6 w-6 text-sm',
                                  month_caption: 'font-medium mt-2 mb-2 pl-2',
                                  weekday: 'h-6 w-6 text-xs',
                                }}
                                components={{
                                  Nav: ({ onPreviousClick, onNextClick }) => (
                                    <div className="absolute right-0 top-1 flex gap-2 items-center pr-1">
                                      <button
                                        onClick={onPreviousClick}
                                        className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                                      >
                                        <ChevronLeft className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={onNextClick}
                                        className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ),
                                }}
                              />
                            </div>
                          </div>
                          {/* 직접 입력 + 초기화 */}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <input
                                type="date"
                                value={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                                onChange={e => {
                                  const from = e.target.value ? new Date(e.target.value) : undefined;
                                  const next = { from, to: dateRange?.to };
                                  setDateRange(next);
                                  setPending(prev => ({
                                    ...prev,
                                    createdAtFrom: e.target.value,
                                  }));
                                }}
                                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="시작일"
                              />
                              <span className="text-muted-foreground text-sm">~</span>
                              <input
                                type="date"
                                value={dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                                onChange={e => {
                                  const to = e.target.value ? new Date(e.target.value) : undefined;
                                  const next = { from: dateRange?.from, to };
                                  setDateRange(next);
                                  setPending(prev => ({
                                    ...prev,
                                    createdAtTo: e.target.value,
                                  }));
                                }}
                                className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="종료일"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 text-muted-foreground"
                              onClick={() => {
                                setDateRange(undefined);
                                setPending(prev => ({ ...prev, createdAtFrom: '', createdAtTo: '' }));
                              }}
                            >
                              초기화
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="w-[328px] space-y-2">
                <label className="text-sm font-medium">UTM 코드</label>
                <Input
                  placeholder="검색..."
                  value={pending.searchTerm}
                  onChange={(e) => setPending(p => ({ ...p, searchTerm: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  className="w-full h-9 text-sm"
                />
              </div>

            </div>
            {/* 적용 버튼 */}
            <div className="flex justify-end mt-3 pt-3 border-t">
              <Button size="sm" onClick={() => { handleApply(); setFilterExpanded(false); }}>
                <Search className="h-3.5 w-3.5 mr-1.5" />적용
              </Button>
            </div>
          </div>
        )}
            </div>{/* closes relative (filter) */}
          </div>{/* closes flex items-center gap-2 (header right) */}
        </div>{/* closes flex items-center justify-between */}
      </div>{/* closes shrink-0 header */}

      <div
        ref={tableContainerRef}
        className="flex-1 overflow-hidden flex flex-col px-6 pb-6 relative mx-auto"
        style={tableWidth ? { width: tableWidth, minWidth: 400 } : { width: '100%', maxWidth: 1480 }}
      >
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-2 mb-[10px] shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigator.clipboard
                .writeText(selectedItems.map(i => i.utm_code).join('\n'))
                .then(() => toast.success(`UTM 코드 ${selectedItems.length}개 복사됨`))
            }
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />UTM 코드 복사
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const urls = selectedItems.map(i => i.ad_url).filter(Boolean);
              navigator.clipboard
                .writeText(urls.join('\n'))
                .then(() => toast.success(`광고 URL ${urls.length}개 복사됨`));
            }}
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />광고 URL 복사
          </Button>
        </div>
      )}

      <div ref={tableWrapRef} className="flex-1 overflow-auto min-h-0 rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader className="[&_th]:bg-card">
            <TableRow>
              <TableHead className="px-2 text-center" style={{ width: '32px', minWidth: '32px' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedIds(new Set(utmCodes.map(i => i.id)));
                    } else {
                      setSelectedIds(new Set());
                    }
                  }}
                />
              </TableHead>
              <TableHead className="px-2 w-10 whitespace-nowrap">No</TableHead>
              {/* 드래그 순서 기반 동적 열 */}
              {columnOrder.map(colKey => {
                if (!visibleColumns[colKey as keyof typeof visibleColumns]) return null;
                const colMeta: Record<DraggableColumnKey, { label: string; sortKey: string; widthKey: string }> = {
                  brand:       { label: '브랜드',     sortKey: 'brand_name',        widthKey: 'brand_name' },
                  media:       { label: '매체',       sortKey: 'media_name',        widthKey: 'media_name' },
                  contentType: { label: '콘텐츠타입', sortKey: 'content_type_name', widthKey: 'content_type_name' },
                  placement:   { label: '지면/구좌',  sortKey: 'placement_name',    widthKey: 'placement_name' },
                  product:     { label: '제품',       sortKey: 'product_name',      widthKey: 'product_name' },
                  planner:     { label: '기획자',     sortKey: 'planner_name',      widthKey: 'planner_name' },
                  marketer:    { label: '마케터',     sortKey: 'marketer_name',     widthKey: 'marketer_name' },
                  creator:     { label: '제작자',     sortKey: 'creator_name',      widthKey: 'creator_name' },
                  author:      { label: '생성자',     sortKey: 'author_name',       widthKey: 'author_name' },
                  createdAt:   { label: '생성일시',   sortKey: 'created_at',        widthKey: 'created_at' },
                  utmCode:     { label: 'UTM 코드',   sortKey: 'utm_code',          widthKey: 'utm_code' },
                  adUrl:       { label: '광고 URL',   sortKey: 'ad_url',            widthKey: 'ad_url' },
                };
                const meta = colMeta[colKey];
                return (
                  <TableHead
                    key={colKey}
                    className="cursor-pointer hover:bg-muted select-none"
                    onClick={() => handleSort(meta.sortKey)}
                  >
                    <div className="flex items-center gap-1">
                      {meta.label}
                      {sortConfig?.key === meta.sortKey && (sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3 + Object.values(visibleColumns).filter(Boolean).length} className="text-center text-muted-foreground py-8">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : utmCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3 + Object.values(visibleColumns).filter(Boolean).length} className="text-center text-muted-foreground py-8">
                  No data
                </TableCell>
              </TableRow>
            ) : (
              utmCodes.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={`cursor-pointer ${selectedIds.has(item.id) ? 'bg-muted/60' : 'hover:bg-muted/40'}`}
                  onClick={() => {
                    setSelectedIds(prev => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    });
                  }}
                >
                  <TableCell className="px-2 text-center" style={{ width: '32px', minWidth: '32px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onClick={e => e.stopPropagation()}
                      onChange={e => {
                        setSelectedIds(prev => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(item.id);
                          else next.delete(item.id);
                          return next;
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell className="px-2 text-xs text-muted-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  {/* 드래그 순서 기반 동적 열 */}
                  {columnOrder.map(colKey => {
                    if (!visibleColumns[colKey as keyof typeof visibleColumns]) return null;
                    switch (colKey) {
                      case 'brand':
                        return <TableCell key={colKey} className="text-sm whitespace-nowrap">{item.brand_name || '—'}</TableCell>;
                      case 'product': {
                        const colorKey = item.product_id ?? item.product_name?.replace(/ \([^)]+\)$/, '') ?? '';
                        return <TableCell key={colKey} className="text-sm whitespace-nowrap">{item.product_name ? <Badge className={cn(getProductColor(colorKey).bg, getProductColor(colorKey).text)}>{item.product_name}</Badge> : '—'}</TableCell>;
                      }
                      case 'media': { const n = item.media_name?.replace(/ \([^)]+\)$/, '') ?? '';
                        const mediaId = masterData?.mediaList.find(m => m.initial === item.media_initial)?.id ?? masterData?.mediaList.find(m => m.name === n)?.id ?? n;
                        return <TableCell key={colKey} className="text-xs whitespace-nowrap">{item.media_name ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(mediaId).bg, getProductColor(mediaId).text)}>{item.media_name}</Badge> : '—'}</TableCell>; }
                      case 'contentType': { const n = item.content_type_name?.replace(/ \([^)]+\)$/, '') ?? '';
                        const ctId = masterData?.contentTypesList.find(ct => ct.initial === item.content_type_initial)?.id ?? masterData?.contentTypesList.find(ct => ct.name === n)?.id ?? n;
                        return <TableCell key={colKey} className="text-xs whitespace-nowrap">{item.content_type_name ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(ctId).bg, getProductColor(ctId).text)}>{item.content_type_name}</Badge> : '—'}</TableCell>; }
                      case 'placement': { const n = item.placement_name?.replace(/ \([^)]+\)$/, '') ?? '';
                        const plId = masterData?.placementsList.find(pl => pl.initial === item.placement_initial)?.id ?? masterData?.placementsList.find(pl => pl.name === n)?.id ?? n;
                        return <TableCell key={colKey} className="text-xs whitespace-nowrap">{item.placement_name ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(plId).bg, getProductColor(plId).text)}>{item.placement_name}</Badge> : '—'}</TableCell>; }
                      case 'planner': {
                        const plannerKey = item.planner_initial ?? '';
                        return <TableCell key={colKey} className="text-xs whitespace-nowrap">{item.planner_name ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(plannerKey).bg, getProductColor(plannerKey).text)}>{item.planner_name}</Badge> : '—'}</TableCell>; }
                      case 'marketer': {
                        const marketerKey = item.marketer_initial ?? '';
                        return <TableCell key={colKey} className="text-xs whitespace-nowrap">{item.marketer_name ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(marketerKey).bg, getProductColor(marketerKey).text)}>{item.marketer_name}</Badge> : '—'}</TableCell>; }
                      case 'creator': {
                        const creatorKey = item.creator_initial ?? '';
                        return <TableCell key={colKey} className="text-xs whitespace-nowrap">{item.creator_name ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(creatorKey).bg, getProductColor(creatorKey).text)}>{item.creator_name}</Badge> : '—'}</TableCell>; }
                      case 'author':
                        return <TableCell key={colKey} className="text-sm whitespace-nowrap">{item.author_name || '—'}</TableCell>;
                      case 'createdAt':
                        return <TableCell key={colKey} className="text-xs whitespace-nowrap">{formatDate(item.created_at)}</TableCell>;
                      case 'utmCode':
                        return (
                          <TableCell key={colKey} className="whitespace-nowrap">
                            <div className="flex items-center gap-2 min-w-0">
                              <code className="text-xs">{item.utm_code}</code>
                              <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); copyToClipboard(item.utm_code, 'utm'); }} title="UTM 코드 복사">
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        );
                      case 'adUrl':
                        return (
                          <TableCell key={colKey}>
                            <div className="flex items-center gap-2">
                              <code className="text-xs whitespace-nowrap">{item.ad_url || '-'}</code>
                              {item.ad_url && (
                                <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); copyToClipboard(item.ad_url!, 'url'); }} title="광고 URL 복사">
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        );
                      default:
                        return null;
                    }
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* 데이터 개수 확인 다이얼로그 */}
      <Dialog open={excelDialogStep === 'confirm'} onOpenChange={() => setExcelDialogStep('idle')}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>다운로드 확인</DialogTitle>
          </DialogHeader>
          <p className="pb-6 text-sm text-muted-foreground">총 {total}개의 데이터를 다운로드합니다. 계속하시겠습니까?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExcelDialogStep('idle')}>취소</Button>
            <Button onClick={doExcelDownload} disabled={excelLoading}>
              {excelLoading ? '다운로드 중...' : '다운로드'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 테이블 컨테이너 좌측 리사이즈 핸들 */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <div
          className="w-2 h-10 rounded-full bg-border hover:bg-primary/50 cursor-col-resize transition-colors flex items-center justify-center"
          onMouseDown={(e) => handleTableResizeStart(e, 'left')}
          onDoubleClick={() => { resizingRef.current = null; setTableWidthSync(null); }}
          title="드래그하여 너비 조절 · 더블클릭으로 초기화"
        >
          <div className="w-[2px] h-4 bg-muted-foreground/40 rounded-full" />
        </div>
      </div>
      {/* 테이블 컨테이너 우측 리사이즈 핸들 */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <div
          className="w-2 h-10 rounded-full bg-border hover:bg-primary/50 cursor-col-resize transition-colors flex items-center justify-center"
          onMouseDown={(e) => handleTableResizeStart(e, 'right')}
          onDoubleClick={() => { resizingRef.current = null; setTableWidthSync(null); }}
          title="드래그하여 너비 조절 · 더블클릭으로 초기화"
        >
          <div className="w-[2px] h-4 bg-muted-foreground/40 rounded-full" />
        </div>
      </div>
      </div>
    </div>
  );
}
