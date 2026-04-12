import { useState, useEffect, useRef } from 'react';
import { toast } from './lib/toast';
import { SheetContainer } from './components/sheet/SheetContainer';
import { Link } from 'react-router-dom';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { SearchableSelect, type SelectOption } from './components/SearchableSelect';
import {
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  GripVertical,
  Settings2,
} from 'lucide-react';
import * as mockService from '@/data/utm-builder/mockService';
import { cn, getProductColor } from './lib/utils';
import type { UTMDecodeResult } from './types/utm_codes';
import { useMasterDataContext } from './contexts/MasterDataContext';

// Extended SelectOption interface to include additional data attributes
interface ExtendedSelectOption extends SelectOption {
  fullname?: string;
  campaign?: string;
  brandId?: string;
  brandName?: string;
  productId?: string;
  productName?: string;
  medium?: string;
  name?: string;
  initial?: string;
  id?: string; // UUID for color lookup
  landingNumbers?: Array<{
    id: string;
    number: string;
    description: string | null;
    initial?: string | null;
  }>;
  baseUrl?: string;
}

// Form state interface
interface FormState {
  media: string;
  mediaName: string;
  mediaFullname: string;
  contentType: string;
  contentTypeName: string;
  contentTypeFullname: string;
  space: string;
  spaceName: string;
  spaceCampaign: string;
  product: string;
  productName: string;
  productLandingNumberId: string;
  productLandingNumber: string;
  productLandingDescription: string;
  productLandingInitial: string;
  brandId: string | null;
  brandName: string;
  brandUrl: string;
  planner: string;
  plannerName: string;
  marketer: string;
  marketerName: string;
  creator: string;
  creatorName: string;
}

type SortKey =
  | 'utm_code'
  | 'status'
  | 'media_name'
  | 'content_type_name'
  | 'placement_name'
  | 'product_name'
  | 'brand_name'
  | 'planner_name'
  | 'marketer_name'
  | 'creator_name'
  | 'ad_url';

export function UTMGenerator() {
  const [formState, setFormState] = useState<FormState>({
    media: '',
    mediaName: '',
    mediaFullname: '',
    contentType: '',
    contentTypeName: '',
    contentTypeFullname: '',
    space: '',
    spaceName: '',
    spaceCampaign: '',
    product: '',
    productName: '',
    productLandingNumberId: '',
    productLandingNumber: '',
    productLandingDescription: '',
    productLandingInitial: '',
    brandId: null,
    brandName: '',
    brandUrl: '',
    planner: '',
    plannerName: '',
    marketer: '',
    marketerName: '',
    creator: '',
    creatorName: '',
  });

  const [previewRegisterResult, setPreviewRegisterResult] = useState<{ success: number; fail: number } | null>(null);

  const [previewSelectedRows, setPreviewSelectedRows] = useState<Set<number>>(new Set());

  const [previewItems, setPreviewItems] = useState<Array<{
    baseCode: string;
    sequence: string;
    utmCode: string;
    adUrl: string | null;
    mediaName: string;
    mediaInitial: string;
    mediaId: string;
    contentTypeName: string;
    contentTypeInitial: string;
    contentTypeId: string;
    spaceName: string;
    spaceInitial: string;
    placementId: string;
    productName: string;
    productInitial: string;
    productId: string;
    landingNumber: string;
    landingNumberId: string;
    landingInitial: string;
    landingDescription: string;
    brandName: string;
    plannerName: string;
    plannerInitial: string;
    marketerName: string;
    marketerInitial: string;
    creatorName: string;
    creatorInitial: string;
    status: 'new' | 'duplicate' | 'registered';
  }>>([]);

  const [count, setCount] = useState<number | ''>(1);
  const [useSimpleUrl, setUseSimpleUrl] = useState(false);

  const [sequence, setSequence] = useState('');
  const [suggestedSequence, setSuggestedSequence] = useState('');
  const [existingSequences, setExistingSequences] = useState<string[]>([]);
  const [existingAdUrls, setExistingAdUrls] = useState<Record<string, string>>({});
  const [sequenceLoading, setSequenceLoading] = useState(false);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  // Options states
  const [mediaOptions, setMediaOptions] = useState<ExtendedSelectOption[]>([]);
  const [contentTypeOptions, setContentTypeOptions] = useState<ExtendedSelectOption[]>([]);
  const [spaceOptions, setSpaceOptions] = useState<ExtendedSelectOption[]>([]);
  const [productOptions, setProductOptions] = useState<ExtendedSelectOption[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<ExtendedSelectOption[]>([]);
  const [landingNumberOptions, setLandingNumberOptions] = useState<SelectOption[]>([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  const masterData = useMasterDataContext();

  // ── Decode tab state ──────────────────────────────────────────────────
  const [decodeBaseCode, setDecodeBaseCode] = useState('');
  const [decodeStartSeq, setDecodeStartSeq] = useState('');
  const [decodeCount, setDecodeCount] = useState<number | ''>(1);
  const [decodeSuggestingSeq, setDecodeSuggestingSeq] = useState(false);
  const [decodeResults, setDecodeResults] = useState<UTMDecodeResult[]>([]);
  const [decoding, setDecoding] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>('utm_code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [registerResult, setRegisterResult] = useState<{
    success: number;
    fail: number;
  } | null>(null);
  const [registering, setRegistering] = useState(false);
  const [landingNumberSelections, setLandingNumberSelections] = useState<Record<string, string>>({});

  // FUN-666: 미선택 필드 강조 (자동완성 후 비어 있는 필드)
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(
    new URLSearchParams(window.location.search).get('tab') ?? sessionStorage.getItem('utm-generator-tab') ?? 'sheet'
  );

  // 크리테오 매체 여부 (UI 표시 및 URL 생성에 공통 사용)
  const isCriteoMedia = formState.mediaName === '크리테오' || formState.mediaFullname.toLowerCase() === 'criteo';

  // ── Column order for preview tables ──────────────────────────────────
  const PREVIEW_COLUMNS: { key: string; label: string }[] = [
    { key: 'status', label: '상태' },
    { key: 'utm_code', label: 'UTM 코드' },
    { key: 'media_name', label: '매체' },
    { key: 'landing_number', label: '랜딩번호' },
    { key: 'content_type_name', label: '콘텐츠타입' },
    { key: 'placement_name', label: '지면/구좌' },
    { key: 'product_name', label: '제품' },
    { key: 'planner_name', label: '기획자' },
    { key: 'marketer_name', label: '마케터' },
    { key: 'creator_name', label: '제작자' },
    { key: 'ad_url', label: '광고 URL' },
  ];
  const DEFAULT_PREVIEW_COL_ORDER = PREVIEW_COLUMNS.map(c => c.key);

  // 직접생성 preview column order
  const [previewColOrder, setPreviewColOrder] = useState<string[]>(() => {
    try { const s = localStorage.getItem('utm-preview-column-order'); if (s) { const arr = JSON.parse(s); if (Array.isArray(arr) && arr.length === DEFAULT_PREVIEW_COL_ORDER.length) return arr; } } catch {}
    return DEFAULT_PREVIEW_COL_ORDER;
  });
  const [isPreviewColOrderOpen, setIsPreviewColOrderOpen] = useState(false);
  const [tempPreviewColOrder, setTempPreviewColOrder] = useState<string[]>(DEFAULT_PREVIEW_COL_ORDER);
  const previewColDragIdx = useRef<number | null>(null);

  const openPreviewColOrder = () => { setTempPreviewColOrder(previewColOrder); setIsPreviewColOrderOpen(v => !v); };
  const applyPreviewColOrder = () => { setPreviewColOrder(tempPreviewColOrder); localStorage.setItem('utm-preview-column-order', JSON.stringify(tempPreviewColOrder)); setIsPreviewColOrderOpen(false); };

  // 코드역산 preview column order
  const [decodeColOrder, setDecodeColOrder] = useState<string[]>(() => {
    try { const s = localStorage.getItem('utm-decode-column-order'); if (s) { const arr = JSON.parse(s); if (Array.isArray(arr) && arr.length === DEFAULT_PREVIEW_COL_ORDER.length) return arr; } } catch {}
    return DEFAULT_PREVIEW_COL_ORDER;
  });
  const [isDecodeColOrderOpen, setIsDecodeColOrderOpen] = useState(false);
  const [tempDecodeColOrder, setTempDecodeColOrder] = useState<string[]>(DEFAULT_PREVIEW_COL_ORDER);
  const decodeColDragIdx = useRef<number | null>(null);

  const openDecodeColOrder = () => { setTempDecodeColOrder(decodeColOrder); setIsDecodeColOrderOpen(v => !v); };
  const applyDecodeColOrder = () => { setDecodeColOrder(tempDecodeColOrder); localStorage.setItem('utm-decode-column-order', JSON.stringify(tempDecodeColOrder)); setIsDecodeColOrderOpen(false); };

  // Shared popover renderer
  const renderColOrderPopover = (
    isOpen: boolean,
    tempOrder: string[],
    setTempOrder: React.Dispatch<React.SetStateAction<string[]>>,
    dragIdxRef: React.MutableRefObject<number | null>,
    applyFn: () => void,
    resetFn: () => void,
  ) => isOpen ? (
    <div className="absolute right-0 top-[calc(100%+6px)] z-50 bg-card border rounded-lg shadow-xl p-3 w-48">
      <div className="space-y-1">
        {tempOrder.map((key, idx) => {
          const meta = PREVIEW_COLUMNS.find(c => c.key === key);
          return (
            <div
              key={key}
              draggable
              onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(idx)); dragIdxRef.current = idx; (e.currentTarget as HTMLElement).style.opacity = '0.4'; }}
              onDragEnter={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.outline = '2px dashed hsl(var(--primary))'; (e.currentTarget as HTMLElement).style.outlineOffset = '-2px'; }}
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
              onDragLeave={e => { (e.currentTarget as HTMLElement).style.outline = ''; (e.currentTarget as HTMLElement).style.outlineOffset = ''; }}
              onDrop={e => {
                e.preventDefault();
                (e.currentTarget as HTMLElement).style.outline = '';
                const from = Number(e.dataTransfer.getData('text/plain'));
                if (isNaN(from) || from === idx) return;
                setTempOrder(prev => { const next = [...prev]; const [item] = next.splice(from, 1); next.splice(idx, 0, item); return next; });
                dragIdxRef.current = null;
              }}
              onDragEnd={e => { (e.currentTarget as HTMLElement).style.opacity = ''; dragIdxRef.current = null; }}
              className="flex items-center gap-2 rounded px-3 py-2 text-sm cursor-grab select-none bg-muted/40 hover:bg-muted/70"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{meta?.label ?? key}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t">
        <Button variant="outline" size="sm" className="flex-1" onClick={resetFn}>초기화</Button>
        <Button size="sm" className="flex-1" onClick={applyFn}>적용</Button>
      </div>
    </div>
  ) : null;

  // FUN-668: 직접생성 탭 SearchableSelect 방향키 탭 이동용 ref 배열
  // 순서: 제품(0) → 마케터(1) → 기획자(2) → 제작자(3) → 랜딩번호(4) → 매체(5) → 콘텐츠타입(6) → 지면/구좌(7) → 랜딩(8)
  const selectWrapperRefs = useRef<(HTMLDivElement | null)[]>(Array(11).fill(null));
  // 코드 역산 탭 입력 필드 refs: [0=베이스코드, 1=시퀀스번호, 2=생성개수]
  const decodeInputRefs = useRef<(HTMLInputElement | null)[]>(Array(3).fill(null));
  const focusDecodeAt = (index: number) => decodeInputRefs.current[index]?.focus({ preventScroll: true });
  const focusSelectAt = (index: number) => {
    const wrapper = selectWrapperRefs.current[index];
    if (!wrapper) return;
    const btn = wrapper.querySelector<HTMLButtonElement>('button[type="button"]');
    if (btn) { btn.focus({ preventScroll: true }); return; }
    const input = wrapper.querySelector<HTMLInputElement>('input');
    input?.focus({ preventScroll: true });
  };

  // Populate options from MasterDataContext
  useEffect(() => {
    if (!masterData || masterData.loading) return;

    setMediaOptions(masterData.mediaList.map(item => ({
      value: item.initial,
      label: `${item.name} (${item.initial})`,
      fullname: item.display_name || '',
      name: item.name,
      initial: item.initial,
      id: item.id,
    })));

    setContentTypeOptions(masterData.contentTypesList.map(item => ({
      value: item.initial,
      label: `${item.name} (${item.initial})`,
      fullname: item.display_name || '',
      name: item.name,
      initial: item.initial,
      id: item.id,
    })));

    setSpaceOptions(masterData.placementsList.map(item => ({
      value: item.id,
      label: `${item.name} (${item.initial})`,
      campaign: item.display_name || '',
      name: item.name,
      initial: item.initial,
    })));

    setProductOptions(masterData.productsList.map(item => ({
      value: item.initial,
      label: `${item.brand_name} - ${item.name} (${item.initial})`,
      brandId: item.brand_id,
      brandName: item.brand_name,
      productId: item.id,
      name: item.name,
      initial: item.initial,
      landingNumbers: item.landing_numbers || [],
      baseUrl: item.base_url || '',
      disabled: !item.base_url,
    })));

    const employeeOpts = masterData.employeesList
      .filter(item => item.initial && item.initial.trim() !== '')
      .map(item => ({
        value: item.initial!,
        label: `${item.name} (${item.initial})`,
        name: item.name,
        initial: item.initial!,
      }));
    setEmployeeOptions(employeeOpts);

    setLoading(false);
  }, [masterData]);

  // Auto-suggest sequence when all required fields are filled
  useEffect(() => {
    const fetchSuggestedSequence = async () => {
      if (
        formState.media &&
        formState.contentType &&
        formState.space &&
        formState.product &&
        formState.productLandingNumberId &&
        formState.planner &&
        formState.marketer &&
        formState.creator
      ) {
        try {
          setSequenceLoading(true);

          // 저장된 데이터에서 ID 찾기 (API 재호출 방지)
          const mediaId = masterData?.mediaList.find(m => m.initial === formState.media)?.id;
          const contentTypeId = masterData?.contentTypesList.find(ct => ct.initial === formState.contentType)?.id;
          const placementId = formState.space; // FUN-672: space now stores id directly
          const productId = masterData?.productsList.find(p => p.initial === formState.product)?.id;
          const plannerId = masterData?.employeesList.find(e => e.initial === formState.planner)?.id;
          const marketerId = masterData?.employeesList.find(e => e.initial === formState.marketer)?.id;
          const creatorId = masterData?.employeesList.find(e => e.initial === formState.creator)?.id;

          if (!mediaId || !contentTypeId || !placementId || !productId || !plannerId || !marketerId || !creatorId) {
            return;
          }

          const result = await mockService.suggestSequence({
            media_id: mediaId,
            landing_number_id: formState.productLandingNumberId,
            content_type_id: contentTypeId,
            placement_id: placementId,
            product_id: productId,
            planner_id: plannerId,
            marketer_id: marketerId,
            creator_id: creatorId,
          });
          setSuggestedSequence(result.next_available);
          setSequence(result.next_available);
          setExistingSequences(result.existing_sequences || []);
          setExistingAdUrls(result.existing_ad_urls || {});
        } catch (error) {
          console.error('Failed to fetch suggested sequence:', error);
        } finally {
          setSequenceLoading(false);
        }
      }
    };

    fetchSuggestedSequence();
  }, [
    formState.media,
    formState.contentType,
    formState.space,
    formState.product,
    formState.productLandingNumberId,
    formState.planner,
    formState.marketer,
    formState.creator,
    masterData,
  ]);

  // 마케터 + 제품 선택 시 나머지 항목 자동 완성
  useEffect(() => {
    let cancelled = false;
    const fetchSuggestedFields = async () => {
      if (!formState.marketer || !formState.product) {
        return;
      }

      const marketerId = masterData?.employeesList.find(e => e.initial === formState.marketer)?.id;
      const productId = masterData?.productsList.find(p => p.initial === formState.product)?.id;

      if (!marketerId || !productId) {
        return;
      }

      try {
        setFieldsLoading(true);
        const suggestion = await mockService.suggestFields({
          marketer_id: marketerId,
          product_id: productId,
        });

        // 자동완성 대상 필드 초기화 (일치 없거나 일부만 있을 때도 이전 값 남지 않도록)
        const newState = {
          ...formState,
          media: '', mediaName: '', mediaFullname: '',
          contentType: '', contentTypeName: '', contentTypeFullname: '',
          space: '', spaceName: '', spaceCampaign: '',
          planner: '', plannerName: '',
          creator: '', creatorName: '',
          productLandingNumberId: '', productLandingNumber: '', productLandingDescription: '', productLandingInitial: '',
        };

        if (cancelled) return;

        if (!suggestion) {
          setFormState(newState);
          // FUN-666: 자동완성 결과 없을 때도 모든 자동완성 필드 강조
          const autoFillFields = ['media', 'contentType', 'space', 'planner', 'creator', 'productLandingNumberId'];
          setHighlightedFields(new Set<string>(autoFillFields));
          return;
        }

        if (suggestion.media_id) {
          const m = masterData?.mediaList.find(x => x.id === suggestion.media_id);
          if (m) {
            newState.media = m.initial;
            newState.mediaName = m.name || '';
            newState.mediaFullname = m.display_name || '';
          }
        }
        if (suggestion.content_type_id) {
          const ct = masterData?.contentTypesList.find(x => x.id === suggestion.content_type_id);
          if (ct) {
            newState.contentType = ct.initial;
            newState.contentTypeName = ct.name || '';
            newState.contentTypeFullname = ct.display_name || '';
          }
        }
        if (suggestion.placement_id) {
          const pl = masterData?.placementsList.find(x => x.id === suggestion.placement_id);
          if (pl) {
            newState.space = pl.id; // FUN-672: store id instead of initial
            newState.spaceName = pl.name || '';
            newState.spaceCampaign = pl.display_name || '';
          }
        }
        if (suggestion.planner_id) {
          const emp = masterData?.employeesList.find(x => x.id === suggestion.planner_id);
          if (emp && emp.initial) {
            newState.planner = emp.initial;
            newState.plannerName = emp.name || '';
          }
        }
        if (suggestion.creator_id) {
          const emp = masterData?.employeesList.find(x => x.id === suggestion.creator_id);
          if (emp && emp.initial) {
            newState.creator = emp.initial;
            newState.creatorName = emp.name || '';
          }
        }
        if (suggestion.landing_number_id) {
          const product = masterData?.productsList.find(p => p.initial === formState.product);
          if (product?.landing_numbers) {
            const ln = product.landing_numbers.find(x => String(x.id) === String(suggestion.landing_number_id));
            if (ln) {
              newState.productLandingNumberId = ln.id;
              newState.productLandingNumber = ln.number;
              newState.productLandingDescription = ln.description || '';
              newState.productLandingInitial = ln.initial ?? '';
            }
          }
        }

        if (!cancelled) {
          setFormState(newState);
          setUseSimpleUrl(suggestion.simple_url ?? false);
          // FUN-666: 자동완성 완료 후 비어 있는 필드를 highlightedFields에 추가
          const autoFillFields = ['media', 'contentType', 'space', 'planner', 'creator', 'productLandingNumberId'] as const;
          const emptyFields = new Set<string>(autoFillFields.filter(f => !newState[f]));
          setHighlightedFields(emptyFields);
        }
      } catch (error) {
        console.error('Failed to fetch suggested fields:', error);
      } finally {
        if (!cancelled) setFieldsLoading(false);
      }
    };

    fetchSuggestedFields();
    return () => { cancelled = true; };
  }, [formState.marketer, formState.product, masterData]);


  const handleSelectChange = (field: keyof FormState, value: string) => {
    const newState = { ...formState, [field]: value };

    // Handle specific field logic
    if (field === 'media') {
      const option = mediaOptions.find(opt => opt.value === value);
      if (option) {
        newState.mediaName = option.name || '';
        newState.mediaFullname = option.fullname || '';
      }
    } else if (field === 'contentType') {
      const option = contentTypeOptions.find(opt => opt.value === value);
      if (option) {
        newState.contentTypeName = option.name || '';
        newState.contentTypeFullname = option.fullname || '';
      }
    } else if (field === 'space') {
      const option = spaceOptions.find(opt => opt.value === value);
      if (option) {
        newState.spaceName = option.name || '';
        newState.spaceCampaign = option.campaign || '';
      }
    } else if (field === 'product') {
      const option = productOptions.find(opt => opt.value === value);
      if (option) {
        newState.productName = option.name || '';
        newState.brandId = option.brandId || null;
        newState.brandName = option.brandName || '';
        newState.brandUrl = option.baseUrl || '';

        // 랜딩번호 options 설정
        const landingOpts = (option.landingNumbers || []).map(ln => {
          const s = [ln.initial, ln.description].filter(Boolean).join('-');
          const label = s ? `${ln.number} (${s})` : String(ln.number);
          return { value: ln.id, label, displayLabel: label, disabled: !ln.initial };
        });
        setLandingNumberOptions(landingOpts);

        // 랜딩번호 초기화
        newState.productLandingNumberId = '';
        newState.productLandingNumber = '';
        newState.productLandingDescription = '';
        newState.productLandingInitial = '';
      }
    } else if (field === 'productLandingNumberId') {
      const option = productOptions.find(opt => opt.value === formState.product);
      if (option && option.landingNumbers) {
        const landing = option.landingNumbers.find(ln => ln.id === value);
        if (landing) {
          newState.productLandingNumberId = value;
          newState.productLandingNumber = landing.number;
          newState.productLandingDescription = landing.description || '';
          newState.productLandingInitial = landing.initial ?? '';
        }
      }
    } else if (field === 'planner') {
      const option = employeeOptions.find(opt => opt.value === value);
      if (option) {
        newState.plannerName = option.name || '';
      }
    } else if (field === 'marketer') {
      const option = employeeOptions.find(opt => opt.value === value);
      if (option) {
        newState.marketerName = option.name || '';
      }
    } else if (field === 'creator') {
      const option = employeeOptions.find(opt => opt.value === value);
      if (option) {
        newState.creatorName = option.name || '';
      }
    }

    setFormState(newState);
    setPreviewItems([]);
    setPreviewRegisterResult(null);
    setPreviewSelectedRows(new Set());
    // FUN-666: 필드 변경 시 해당 필드 강조 해제
    if (highlightedFields.has(field)) {
      setHighlightedFields(prev => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  };

  const togglePreviewRow = (idx: number) => {
    setPreviewSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAllPreviewRows = () => {
    const newableIdxs = previewItems
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => item.status === 'new')
      .map(({ idx }) => idx);
    if (previewSelectedRows.size === newableIdxs.length && newableIdxs.length > 0) {
      setPreviewSelectedRows(new Set());
    } else {
      setPreviewSelectedRows(new Set(newableIdxs));
    }
  };

  const buildPreview = () => {
    const { media: mediaInitial, contentType, space, product, planner, marketer, creator } = formState;

    if (!mediaInitial || !contentType || !space || !product || !planner || !marketer || !creator) {
      alert('모든 항목을 선택해주세요');
      return;
    }
    if (landingNumberOptions.length === 0) {
      alert('이 제품에 등록된 랜딩번호가 없거나 이니셜이 설정되지 않았습니다. 온라인팀에 문의해주세요.');
      return;
    }
    if (!formState.productLandingNumberId) {
      alert('랜딩번호를 선택해주세요');
      return;
    }
    const errors: string[] = [];
    if (!formState.mediaFullname) errors.push(`• 매체 "${formState.mediaName}"의 파라미터값이 설정되지 않았습니다`);
    if (!formState.contentTypeFullname) errors.push(`• 콘텐츠타입 "${formState.contentTypeName}"의 파라미터값이 설정되지 않았습니다`);
    if (!formState.spaceCampaign) errors.push(`• 지면/구좌 "${formState.spaceName}"의 파라미터값이 설정되지 않았습니다`);
    if (errors.length > 0) {
      alert(`UTM 코드를 생성할 수 없습니다.\n\n다음 항목의 파라미터값이 설정되지 않았습니다:\n\n${errors.join('\n')}\n\n해당 관리 페이지에서 파라미터값을 설정해주세요.`);
      return;
    }
    if (!count) return;

    // FUN-672: space stores id, look up initial for baseCode
    const spaceInitial = masterData?.placementsList.find(p => p.id === space)?.initial ?? space;
    const landingInitial = formState.productLandingInitial;
    const baseCode = `${mediaInitial}${landingInitial}${contentType}${spaceInitial}${product}${planner}${marketer}${creator}`;
    const resolvedProductId = masterData?.productsList.find(p => p.initial === product)?.id ?? '';
    const resolvedMediaId = masterData?.mediaList.find(m => m.initial === mediaInitial)?.id ?? '';
    const resolvedContentTypeId = masterData?.contentTypesList.find(ct => ct.initial === contentType)?.id ?? '';
    const startSeq = sequence ? parseInt(sequence, 10) : parseInt(suggestedSequence || '1', 10);

    const items: Array<{
      baseCode: string;
      sequence: string;
      utmCode: string;
      adUrl: string | null;
      mediaName: string;
      mediaInitial: string;
      mediaId: string;
      contentTypeName: string;
      contentTypeInitial: string;
      contentTypeId: string;
      spaceName: string;
      spaceInitial: string;
      placementId: string;
      productName: string;
      productInitial: string;
      productId: string;
      landingNumber: string;
      landingNumberId: string;
      landingInitial: string;
      landingDescription: string;
      brandName: string;
      plannerName: string;
      plannerInitial: string;
      marketerName: string;
      marketerInitial: string;
      creatorName: string;
      creatorInitial: string;
      status: 'new' | 'duplicate' | 'registered';
    }> = [];
    for (let i = 0; i < (count as number); i++) {
      const seq = (startSeq + i).toString().padStart(3, '0');
      const utmCode = `ue_${baseCode}${seq}`;
      const status = (existingSequences.includes(seq) ? 'duplicate' : 'new') as 'new' | 'duplicate';
      const isNew = status === 'new';
      const isCriteo = isNew && isCriteoMedia;
      const brandOrigin = (() => { try { return new URL(formState.brandUrl).origin; } catch { return formState.brandUrl; } })();
      const adUrl = !isNew
        ? (existingAdUrls[seq] ?? null)
        : (useSimpleUrl
          ? `${brandOrigin}?utm_source=${formState.mediaFullname}&utm_medium=${formState.contentTypeFullname}&utm_campaign=${formState.spaceCampaign}&utm_content=${utmCode}${isCriteo ? '&utm_id={{adsetid}}' : ''}`
          : `${formState.brandUrl}/P/${formState.productLandingNumber}?utm_source=${formState.mediaFullname}&utm_medium=${formState.contentTypeFullname}&utm_campaign=${formState.spaceCampaign}&utm_content=${utmCode}${isCriteo ? '&utm_id={{adsetid}}' : ''}`);
      items.push({
        baseCode,
        sequence: seq,
        utmCode,
        adUrl,
        mediaName: formState.mediaName,
        mediaInitial: formState.media,
        mediaId: resolvedMediaId,
        contentTypeName: formState.contentTypeName,
        contentTypeInitial: formState.contentType,
        contentTypeId: resolvedContentTypeId,
        spaceName: formState.spaceName,
        spaceInitial: spaceInitial,
        placementId: space,
        productName: formState.productName,
        productInitial: formState.product,
        productId: resolvedProductId,
        landingNumber: formState.productLandingNumber,
        landingNumberId: formState.productLandingNumberId,
        landingInitial: formState.productLandingInitial,
        landingDescription: formState.productLandingDescription ?? '',
        brandName: formState.brandName,
        plannerName: formState.plannerName,
        plannerInitial: formState.planner,
        marketerName: formState.marketerName,
        marketerInitial: formState.marketer,
        creatorName: formState.creatorName,
        creatorInitial: formState.creator,
        status,
      });
    }
    setPreviewItems(items);
    setPreviewSelectedRows(new Set(items.map((_, idx) => idx).filter(idx => items[idx].status === 'new')));
  };


  const registerAll = async () => {
    const toRegister = previewItems.filter(
      (item, idx) => item.status === 'new' && previewSelectedRows.has(idx)
    );

    if (toRegister.length === 0) {
      alert('등록할 항목을 선택해주세요');
      return;
    }

    const { media: mediaInitial, contentType, space, product, planner, marketer, creator } = formState;

    try {
      setRegistering(true);

      const mediaId = masterData?.mediaList.find(m => m.initial === mediaInitial)?.id;
      const contentTypeId = masterData?.contentTypesList.find(ct => ct.initial === contentType)?.id;
      const placementId = space; // FUN-672: space now stores id directly
      const productId = masterData?.productsList.find(p => p.initial === product)?.id;
      const plannerId = masterData?.employeesList.find(e => e.initial === planner)?.id;
      const marketerId = masterData?.employeesList.find(e => e.initial === marketer)?.id;
      const creatorId = masterData?.employeesList.find(e => e.initial === creator)?.id;

      if (!mediaId || !contentTypeId || !placementId || !productId || !plannerId || !marketerId || !creatorId) {
        alert('선택한 항목의 ID를 찾을 수 없습니다');
        return;
      }

      const bulkItems = toRegister.map(item => ({
        media_id: mediaId,
        content_type_id: contentTypeId,
        placement_id: placementId,
        product_id: productId,
        landing_number_id: formState.productLandingNumberId,
        planner_id: plannerId,
        marketer_id: marketerId,
        creator_id: creatorId,
        sequence: item.sequence,
        author_user_id: null,
        simple_url: useSimpleUrl || undefined,
        criteo: isCriteoMedia || undefined,
      }));

      const bulkResult = await mockService.bulkCreateUTMCodes(bulkItems);

      // 성공한 항목의 sequence 추출
      const successfulSequences = new Set(
        bulkResult.results
          .filter(r => r.success)
          .map((r) => toRegister[r.input_index]?.sequence)
          .filter(Boolean)
      );

      setPreviewRegisterResult({ success: bulkResult.success_count, fail: bulkResult.fail_count });
      // 등록된 항목 status를 'registered'로 변경 (유지)
      const registeredSequences = successfulSequences;
      setPreviewItems(prev => prev.map(item =>
        registeredSequences.has(item.sequence) ? { ...item, status: 'registered' as const } : item
      ));
      setPreviewSelectedRows(new Set());
      setSequence('');
      setSuggestedSequence('');
    } catch (error: any) {
      console.error('Failed to register UTM codes:', error);
      alert(`UTM 코드 등록 실패: ${error.message}`);
    } finally {
      setRegistering(false);
    }
  };

  // ── Decode tab handlers ───────────────────────────────────────────────

  const buildDecodeCodes = () => {
    const fullBase = `ue_${decodeBaseCode.trim()}`;
    const startNum = decodeStartSeq ? parseInt(decodeStartSeq, 10) : 1;
    const count = typeof decodeCount === 'number' ? decodeCount : 0;
    return Array.from({ length: count }, (_, i) =>
      `${fullBase}${String(startNum + i).padStart(3, '0')}`
    );
  };

  useEffect(() => {
    const trimmed = decodeBaseCode.trim();
    if (trimmed.length < 13) return;
    let cancelled = false;
    const run = async () => {
      try {
        setDecodeSuggestingSeq(true);
        const result = await mockService.suggestSequenceByBase(trimmed);
        if (!cancelled) setDecodeStartSeq(result.suggested_sequence);
      } catch (e) {
        console.error('suggestSequenceByBase 실패:', e);
      } finally {
        if (!cancelled) setDecodeSuggestingSeq(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [decodeBaseCode]);

  const runDecode = async (codes: string[]) => {
    try {
      setDecoding(true);
      setRegisterResult(null);
      setSelectedRows(new Set());
      const results = await mockService.decodeUTMCodes(codes);
      setDecodeResults(results);

      // 자동 랜딩번호 선택
      const autoSelections: Record<string, string> = {};
      const baseLandingMap: Record<string, string> = {};

      const findLandingId = (productName: string | null | undefined, landingNumber: string | number | null | undefined) => {
        if (!productName || !landingNumber) return null;
        const product = masterData?.productsList.find(p => p.name === productName);
        return product?.landing_numbers?.find((ln: { id: string; number: string }) => String(ln.number) === String(landingNumber))?.id ?? null;
      };

      // 1단계: registered 코드 - landing_number로 id 역산
      for (const r of results) {
        if (r.status === 'registered' && r.landing_number) {
          const id = findLandingId(r.product_name, r.landing_number);
          if (id) {
            autoSelections[r.input_code] = id;
            baseLandingMap[r.base_code] = id;
          }
        }
      }
      // 2단계: decoded 코드 중 landing_number 있는 경우
      for (const r of results) {
        if (r.status === 'decoded' && !autoSelections[r.input_code] && r.landing_number) {
          const id = findLandingId(r.product_name, r.landing_number);
          if (id) {
            autoSelections[r.input_code] = id;
            if (!baseLandingMap[r.base_code]) baseLandingMap[r.base_code] = id;
          }
        }
      }
      // 3단계: baseLandingMap 전파
      for (const r of results) {
        if (r.status === 'decoded' && !autoSelections[r.input_code]) {
          const matched = baseLandingMap[r.base_code];
          if (matched) autoSelections[r.input_code] = matched;
        }
      }
      // 4단계: 여전히 미선택 decoded 코드 - 제품의 첫 번째 랜딩번호 자동 선택
      for (const r of results) {
        if (r.status === 'decoded' && !autoSelections[r.input_code] && r.product_name) {
          const product = masterData?.productsList.find(p => p.name === r.product_name);
          const firstLandingNumber = product?.landing_numbers?.[0];
          if (firstLandingNumber) {
            autoSelections[r.input_code] = firstLandingNumber.id;
            if (!baseLandingMap[r.base_code]) baseLandingMap[r.base_code] = firstLandingNumber.id;
          }
        }
      }
      setLandingNumberSelections(autoSelections);
    } catch (error: any) {
      console.error('Failed to decode UTM codes:', error);
      alert(`역산 실패: ${error.message}`);
    } finally {
      setDecoding(false);
    }
  };

  const handleDecode = async () => {
    if (!decodeBaseCode.trim()) {
      alert('베이스코드를 입력해주세요');
      return;
    }
    if (!decodeStartSeq) {
      alert('시작 시퀀스 번호를 입력해주세요');
      return;
    }
    if (!decodeCount || decodeCount < 1) {
      alert('생성 갯수를 입력해주세요');
      return;
    }
    await runDecode(buildDecodeCodes());
  };


  const toggleRowSelection = (inputCode: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(inputCode)) {
        next.delete(inputCode);
      } else {
        next.add(inputCode);
      }
      return next;
    });
  };

  const toggleAllRows = () => {
    const registerable = decodeResults.filter(r => r.status === 'decoded');
    if (selectedRows.size === registerable.length && registerable.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(registerable.map(r => r.input_code)));
    }
  };

  const handleSortClick = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const computeDisplayAdUrl = (item: (typeof decodeResults)[0], selectedLandingId: string | undefined): string | null => {
    if (item.status === 'registered') return item.ad_url ?? null;
    if (!selectedLandingId) return null;
    const product = masterData?.productsList.find(p => p.name === item.product_name);
    const baseUrl = item.brand_url || product?.base_url;
    if (baseUrl && item.media_display && item.content_type_display && item.placement_display) {
      const productLandingNumbers = product?.landing_numbers ?? [];
      const ln = productLandingNumbers.find((l: { id: string; number: string }) => l.id === selectedLandingId);
      if (ln) {
        const utmCode = item.utm_code.startsWith('ue_') ? item.utm_code : `ue_${item.utm_code}`;
        return `${baseUrl}/P/${ln.number}?utm_source=${item.media_display}&utm_medium=${item.content_type_display}&utm_campaign=${item.placement_display}&utm_content=${utmCode}`;
      }
    }
    return null;
  };

  const sortedResults = [...decodeResults].sort((a, b) => {
    const aVal = (a[sortKey] ?? '') as string;
    const bVal = (b[sortKey] ?? '') as string;
    const cmp = aVal.localeCompare(bVal, 'ko');
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleRegister = async () => {
    const toRegister = decodeResults.filter(
      r => r.status === 'decoded' && selectedRows.has(r.input_code),
    );

    if (toRegister.length === 0) {
      alert('등록할 항목을 선택해주세요 (매핑 성공 상태의 항목만 등록 가능)');
      return;
    }

    const missingLanding = toRegister.some(r => !r.landing_number);
    if (missingLanding) {
      alert('랜딩번호 이니셜이 설정되지 않은 항목이 있습니다. 온라인팀에 문의해주세요.');
      return;
    }

    setRegistering(true);

    const bulkItems = toRegister.map(item => {
      // decode 결과의 name 필드로 ID 조회 (그리디 파싱 결과 사용)
      const mediaId = masterData?.mediaList.find(m => m.name === item.media_name)?.id ?? '';
      const ctId = masterData?.contentTypesList.find(ct => ct.name === item.content_type_name)?.id ?? '';
      const placementId = masterData?.placementsList.find(p => p.name === item.placement_name)?.id ?? '';
      const productId = masterData?.productsList.find(p => p.name === item.product_name)?.id ?? '';
      const plannerId = masterData?.employeesList.find(e => e.name === item.planner_name)?.id ?? '';
      const marketerId = masterData?.employeesList.find(e => e.name === item.marketer_name)?.id ?? '';
      const creatorId = masterData?.employeesList.find(e => e.name === item.creator_name)?.id ?? '';
      const isCriteo = item.media_name === '크리테오' || item.media_display?.toLowerCase() === 'criteo';
      const simpleUrl = item.ad_url ? !item.ad_url.includes('/P/') : false;

      return {
        media_id: mediaId,
        content_type_id: ctId,
        placement_id: placementId,
        product_id: productId,
        landing_number_id: item.landing_number != null ? String(item.landing_number) : '',
        planner_id: plannerId,
        marketer_id: marketerId,
        creator_id: creatorId,
        sequence: item.sequence,
        author_user_id: null,
        simple_url: simpleUrl || undefined,
        criteo: isCriteo || undefined,
      };
    });

    let successCount = 0;
    let failCount = 0;

    try {
      const result = await mockService.bulkCreateUTMCodes(bulkItems);
      successCount = result.success_count;
      failCount = result.fail_count;
    } catch (error) {
      console.error('Bulk register failed:', error);
      failCount = toRegister.length;
    }

    setRegistering(false);
    setRegisterResult({ success: successCount, fail: failCount });

    // Refresh decode results to reflect registered status
    if (successCount > 0) {
      const codes = decodeResults.map(r => r.input_code);
      if (codes.length > 0) {
        try {
          const refreshed = await mockService.decodeUTMCodes(codes);
          setDecodeResults(refreshed);
          setSelectedRows(new Set());
        } catch {
          // ignore refresh error
        }
      }
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) {
      return <ChevronsUpDown className="w-3 h-3 ml-1 inline-block opacity-40" />;
    }
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 ml-1 inline-block" />
    ) : (
      <ChevronDown className="w-3 h-3 ml-1 inline-block" />
    );
  };

  const statusBadge = (item: UTMDecodeResult) => {
    if (item.status === 'decoded') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          매핑 성공
        </span>
      );
    }
    if (item.status === 'registered') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          이미 등록됨
        </span>
      );
    }
    // not_found
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-help"
        title={item.error ?? '매핑 실패'}
      >
        매핑 실패
      </span>
    );
  };

  const registerableSelected = decodeResults.filter(
    r => r.status === 'decoded' && selectedRows.has(r.input_code),
  ).length;

  const hasUnselectedLandingNumber = Array.from(selectedRows).some(inputCode => {
    const item = decodeResults.find(r => r.input_code === inputCode);
    return item?.status === 'decoded' && !item.landing_number;
  });

  const allRegisterableCount = decodeResults.filter(r => r.status === 'decoded').length;

  return (
    <div className="flex flex-col h-full">
      <Tabs
        defaultValue={activeTab}
        onValueChange={(v) => { sessionStorage.setItem('utm-generator-tab', v); setActiveTab(v); }}
        className="flex flex-col h-full"
      >
        <div className="shrink-0 bg-background px-6 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold tracking-tight">
              {activeTab === 'generate' ? 'UTM 직접 생성' : activeTab === 'decode' ? 'UTM 코드 역산 등록' : 'UTM 시트 뷰'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'generate'
                ? '8개 셀렉트박스로 이니셜을 선택하고 UTM 코드와 광고 URL을 자동 생성합니다'
                : activeTab === 'decode'
                  ? '기존 UTM 코드를 입력하면 각 항목을 역산하여 자동으로 등록합니다'
                  : '스프레드시트 형태로 UTM을 일괄 생성하고 관리합니다'}
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="generate">직접 생성</TabsTrigger>
            <TabsTrigger value="decode">코드 역산 등록</TabsTrigger>
            <TabsTrigger value="sheet">시트 뷰</TabsTrigger>
          </TabsList>
        </div>
        </div>

        {/* ── Tab 1: 직접 생성 ─────────────────────────────────────────── */}
        <TabsContent value="generate" className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 pb-6 space-y-6">
          <Card className="p-6">
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Row 1: 제품 → 마케터 → 기획자 → 제작자 */}
              <div ref={el => { selectWrapperRefs.current[0] = el; }} className="w-full">
              <SearchableSelect
                  label="제품"
                  placeholder={loading ? "로딩 중..." : "선택하세요"}
                  disabled={loading}
                  options={loading ? [] : productOptions}
                  value={formState.product}
                  onChange={(value) => handleSelectChange('product', value)}
                  onFocusNext={() => focusSelectAt(1)}
                  onFocusDown={() => focusSelectAt(4)}
                  renderOption={(opt) => {
                    const extOpt = opt as ExtendedSelectOption;
                    if (!extOpt.productId) return opt.label;
                    const color = getProductColor(extOpt.productId);
                    return <span className={`flex items-center gap-1.5 ${opt.disabled ? 'opacity-40' : ''}`}><Badge className={cn(color.bg, color.text)}>{extOpt.name} ({opt.value})</Badge><span className="text-xs text-muted-foreground">{extOpt.brandName}</span></span>;
                  }}
                  renderSelected={(opt) => {
                    const extOpt = opt as ExtendedSelectOption;
                    if (!extOpt.productId) return <span>{opt.label}</span>;
                    const color = getProductColor(extOpt.productId);
                    return <Badge className={cn(color.bg, color.text)}>{extOpt.name} ({opt.value})</Badge>;
                  }}
                />
              </div>

                <div ref={el => { selectWrapperRefs.current[1] = el; }} className="w-full">
                  <SearchableSelect
                    label="마케터"
                    placeholder={loading ? "로딩 중..." : "선택하세요"}
                    disabled={loading}
                    options={loading ? [] : employeeOptions}
                    value={formState.marketer}
                    onChange={(value) => handleSelectChange('marketer', value)}
                    onFocusPrev={() => focusSelectAt(0)}
                    onFocusNext={() => focusSelectAt(2)}
                    onFocusDown={() => focusSelectAt(5)}
                    renderOption={(opt) => {
                      const label = `${(opt as ExtendedSelectOption).name} (${opt.value})`;
                      const color = getProductColor(opt.value);
                      return <Badge className={cn(color.bg, color.text)}>{label}</Badge>;
                    }}
                    renderSelected={(opt) => {
                      const label = `${(opt as ExtendedSelectOption).name} (${opt.value})`;
                      const color = getProductColor(opt.value);
                      return <Badge className={cn(color.bg, color.text)}>{label}</Badge>;
                    }}
                  />
                </div>

                <div ref={el => { selectWrapperRefs.current[2] = el; }} className="w-full">
                <SearchableSelect
                  label="기획자"
                  placeholder={loading ? "로딩 중..." : fieldsLoading ? "자동 완성 중..." : "선택하세요"}
                  disabled={loading || fieldsLoading}
                  options={loading ? [] : employeeOptions}
                  value={formState.planner}
                  onChange={(value) => handleSelectChange('planner', value)}
                  highlight={highlightedFields.has('planner')}
                  onFocusPrev={() => focusSelectAt(1)}
                  onFocusNext={() => focusSelectAt(3)}
                  onFocusDown={() => focusSelectAt(6)}
                  renderOption={(opt) => {
                    const color = getProductColor(opt.value);
                    return <Badge className={cn(color.bg, color.text)}>{(opt as ExtendedSelectOption).name} ({opt.value})</Badge>;
                  }}
                  renderSelected={(opt) => {
                    const color = getProductColor(opt.value);
                    return <Badge className={cn(color.bg, color.text)}>{(opt as ExtendedSelectOption).name} ({opt.value})</Badge>;
                  }}
                />
                </div>

                <div ref={el => { selectWrapperRefs.current[3] = el; }} className="w-full">
                <SearchableSelect
                  label="제작자"
                  placeholder={loading ? "로딩 중..." : fieldsLoading ? "자동 완성 중..." : "선택하세요"}
                  disabled={loading || fieldsLoading}
                  options={loading ? [] : employeeOptions}
                  value={formState.creator}
                  onChange={(value) => handleSelectChange('creator', value)}
                  highlight={highlightedFields.has('creator')}
                  onFocusPrev={() => focusSelectAt(2)}
                  onFocusNext={() => focusSelectAt(4)}
                  onFocusDown={() => focusSelectAt(7)}
                  renderOption={(opt) => {
                    const color = getProductColor(opt.value);
                    return <Badge className={cn(color.bg, color.text)}>{(opt as ExtendedSelectOption).name} ({opt.value})</Badge>;
                  }}
                  renderSelected={(opt) => {
                    const color = getProductColor(opt.value);
                    return <Badge className={cn(color.bg, color.text)}>{(opt as ExtendedSelectOption).name} ({opt.value})</Badge>;
                  }}
                />
                </div>

                {/* Row 2: 랜딩번호 → 매체 → 콘텐츠타입 → 지면/구좌 */}
                {/* 랜딩번호 선택 (항상 표시) */}
                <div>
                  <div ref={el => { selectWrapperRefs.current[4] = el; }} className="w-full">
                  <SearchableSelect
                    label="랜딩번호"
                    placeholder={loading ? "로딩 중..." : fieldsLoading ? "자동 완성 중..." : !formState.product ? "제품을 먼저 선택하세요" : landingNumberOptions.length === 0 ? "랜딩번호 없음" : "선택하세요"}
                    disabled={loading || !formState.product || landingNumberOptions.length === 0}
                    options={loading ? [] : landingNumberOptions}
                    value={formState.productLandingNumberId}
                    onChange={(value) => handleSelectChange('productLandingNumberId', value)}
                    required={landingNumberOptions.length > 0}
                    highlight={highlightedFields.has('productLandingNumberId') && landingNumberOptions.length > 0}
                    onFocusPrev={() => focusSelectAt(3)}
                    onFocusNext={() => focusSelectAt(5)}
                    onFocusUp={() => focusSelectAt(0)}
                    onFocusDown={() => focusSelectAt(9)}
                    renderOption={(opt) => {
                      const color = getProductColor(opt.value);
                      return <Badge className={cn(color.bg, color.text)}>{opt.label}</Badge>;
                    }}
                    renderSelected={(opt) => {
                      const label = opt.displayLabel || opt.label;
                      const color = getProductColor(opt.value);
                      return <Badge className={cn(color.bg, color.text)}>{label}</Badge>;
                    }}
                  />
                  </div>

                  {/* 랜딩번호 없음 / 이니셜 미설정 경고 메시지 */}
                  {formState.product && (landingNumberOptions.length === 0 || landingNumberOptions.every(o => o.disabled)) && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700 mt-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {landingNumberOptions.length === 0
                          ? '이 제품에 등록된 랜딩번호가 없습니다.'
                          : <>등록된 랜딩번호에 이니셜이 설정되지 않았습니다.<br />온라인팀에 문의해주세요.</>}
                        {landingNumberOptions.length === 0 && <>{' '}온라인팀에 문의해주세요.</>}
                      </span>
                    </div>
                  )}
                </div>

                <div ref={el => { selectWrapperRefs.current[5] = el; }} className="w-full">
                <SearchableSelect
                  label="매체"
                  placeholder={loading ? "로딩 중..." : fieldsLoading ? "자동 완성 중..." : "선택하세요"}
                  disabled={loading || fieldsLoading}
                  options={loading ? [] : mediaOptions}
                  value={formState.media}
                  onChange={(value) => handleSelectChange('media', value)}
                  error={formState.media !== '' && !formState.mediaFullname}
                  highlight={highlightedFields.has('media')}
                  onFocusPrev={() => focusSelectAt(4)}
                  onFocusNext={() => focusSelectAt(6)}
                  onFocusUp={() => focusSelectAt(1)}
                  onFocusDown={() => focusSelectAt(9)}
                  renderOption={(opt) => {
                    const color = getProductColor((opt as ExtendedSelectOption).id ?? opt.value);
                    return <Badge className={cn(color.bg, color.text)}>{(opt as ExtendedSelectOption).name} ({opt.value})</Badge>;
                  }}
                  renderSelected={(opt) => {
                    const color = getProductColor((opt as ExtendedSelectOption).id ?? opt.value);
                    return <Badge className={cn(color.bg, color.text)}>{(opt as ExtendedSelectOption).name} ({opt.value})</Badge>;
                  }}
                />
                </div>

                <div ref={el => { selectWrapperRefs.current[6] = el; }} className="w-full">
                <SearchableSelect
                  label="콘텐츠타입"
                  placeholder={loading ? "로딩 중..." : fieldsLoading ? "자동 완성 중..." : "선택하세요"}
                  disabled={loading || fieldsLoading}
                  options={loading ? [] : contentTypeOptions}
                  value={formState.contentType}
                  onChange={(value) => handleSelectChange('contentType', value)}
                  error={formState.contentType !== '' && !formState.contentTypeFullname}
                  highlight={highlightedFields.has('contentType')}
                  onFocusPrev={() => focusSelectAt(5)}
                  onFocusNext={() => focusSelectAt(7)}
                  onFocusUp={() => focusSelectAt(2)}
                  onFocusDown={() => focusSelectAt(10)}
                  renderOption={(opt) => {
                    const color = getProductColor((opt as ExtendedSelectOption).id ?? opt.value);
                    return <Badge className={cn(color.bg, color.text)}>{(opt as ExtendedSelectOption).name} ({opt.value})</Badge>;
                  }}
                  renderSelected={(opt) => {
                    const color = getProductColor((opt as ExtendedSelectOption).id ?? opt.value);
                    return <Badge className={cn(color.bg, color.text)}>{(opt as ExtendedSelectOption).name} ({opt.value})</Badge>;
                  }}
                />
                </div>

                <div ref={el => { selectWrapperRefs.current[7] = el; }} className="w-full">
                <SearchableSelect
                  label="지면/구좌"
                  placeholder={loading ? "로딩 중..." : fieldsLoading ? "자동 완성 중..." : "선택하세요"}
                  disabled={loading || fieldsLoading}
                  options={loading ? [] : spaceOptions}
                  value={formState.space}
                  onChange={(value) => handleSelectChange('space', value)}
                  error={formState.space !== '' && !formState.spaceCampaign}
                  highlight={highlightedFields.has('space')}
                  onFocusPrev={() => focusSelectAt(6)}
                  onFocusNext={() => focusSelectAt(9)}
                  onFocusUp={() => focusSelectAt(3)}
                  renderOption={(opt) => {
                    const extOpt = opt as ExtendedSelectOption;
                    const color = getProductColor(opt.value);
                    return <Badge className={cn(color.bg, color.text)}>{extOpt.name} ({extOpt.initial})</Badge>;
                  }}
                  renderSelected={(opt) => {
                    const extOpt = opt as ExtendedSelectOption;
                    const color = getProductColor(opt.value);
                    return <Badge className={cn(color.bg, color.text)}>{extOpt.name} ({extOpt.initial})</Badge>;
                  }}
                />
                </div>

                {/* Row 3: 시퀀스번호 (나머지) */}
                <div ref={el => { selectWrapperRefs.current[9] = el; }} className="space-y-2">
                  <Label className="text-sm">
                    시퀀스 번호
                    {sequenceLoading && (
                      <span className="text-muted-foreground ml-1">(확인 중...)</span>
                    )}
                    {!sequenceLoading && suggestedSequence && (
                      <span className="text-muted-foreground ml-1">(추천: {suggestedSequence})</span>
                    )}
                  </Label>
                  <Input
                    type="text"
                    placeholder="001"
                    className="h-9"
                    value={sequence}
                    onChange={(e) => {
                      const value = e.target.value;
                      // 숫자만 허용, 3자리 제한
                      if (value === '' || /^\d{1,3}$/.test(value)) {
                        setSequence(value);
                        setPreviewItems([]);
                        setPreviewRegisterResult(null);
                        if (value) {
                          const seqNum = parseInt(value, 10);
                          const maxCount = Math.min(100, 999 - seqNum + 1);
                          if (typeof count === 'number' && count > maxCount) setCount(maxCount);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value && value.length < 3) {
                        setSequence(value.padStart(3, '0'));
                      }
                      if (value) {
                        const seqNum = parseInt(value, 10);
                        const maxCount = Math.min(100, 999 - seqNum + 1);
                        if (typeof count === 'number' && count > maxCount) setCount(maxCount);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
                        e.preventDefault();
                        focusSelectAt(7);
                      } else if (e.key === 'ArrowRight' && e.currentTarget.selectionStart === e.currentTarget.value.length) {
                        e.preventDefault();
                        focusSelectAt(10);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        focusSelectAt(4);
                      }
                    }}
                    maxLength={3}
                    disabled={loading || sequenceLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    비워두면 DB 기준 3자리 숫자 자동 할당
                  </p>
                </div>

                <div ref={el => { selectWrapperRefs.current[10] = el; }} className="space-y-2">
                  <Label className="text-sm">생성 개수</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    className="h-9"
                    value={count}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') { setCount(''); setPreviewItems([]); setPreviewRegisterResult(null); return; }
                      const val = parseInt(raw, 10);
                      const startSeq = parseInt(sequence || '1', 10);
                      const maxCount = sequence ? Math.min(100, 999 - startSeq + 1) : 100;
                      if (!isNaN(val) && val >= 1 && val <= maxCount) { setCount(val); setPreviewItems([]); setPreviewRegisterResult(null); }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        focusSelectAt(9);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        focusSelectAt(5);
                      }
                    }}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(() => { const s = parseInt(sequence || '1', 10); const max = sequence ? Math.min(100, 999 - s + 1) : 100; return `한 번에 생성할 UTM 코드 수 (1~${max})`; })()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">메인URL</Label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background">
                    <input
                      type="checkbox"
                      id="useSimpleUrl"
                      checked={useSimpleUrl}
                      onChange={(e) => { setUseSimpleUrl(e.target.checked); setPreviewItems([]); setPreviewRegisterResult(null); }}
                      className="h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="useSimpleUrl" className="text-sm cursor-pointer select-none">
                      {useSimpleUrl ? '사용 중' : '사용 안 함'}
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    체크 시 URL에서 <code className="font-mono">/P/&#123;랜딩번호&#125;</code> 경로가 제외됩니다
                  </p>
                </div>

            </div>

            <Button
              className="w-full mt-6"
              onClick={buildPreview}
              disabled={
                loading ||
                !formState.media || !formState.contentType ||
                !formState.space || !formState.product || !formState.planner ||
                !formState.marketer || !formState.creator ||
                !formState.mediaFullname || !formState.contentTypeFullname || !formState.spaceCampaign ||
                (formState.product && (landingNumberOptions.length === 0 || !formState.productLandingNumberId)) ||
                !formState.productLandingInitial ||
                !count
              }
            >
              <Sparkles className="w-4 h-4 mr-2" />
              미리보기
            </Button>
            </div>

            {/* Right: 광고URL 파라미터 */}
            <div className="w-56 shrink-0 border-l pl-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">파라미터1 (매체 종류)</Label>
                  <Input
                    readOnly
                    placeholder="매체 선택"
                    className="bg-muted text-xs cursor-not-allowed"
                    value={formState.mediaFullname ? `utm_source=${formState.mediaFullname}` : ''}
                  />
                  {formState.media && !formState.mediaFullname && (
                    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span>파라미터값 미설정</span>
                      <Link to="/media" className="text-primary hover:underline">설정하기</Link>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">파라미터2 (광고 유형)</Label>
                  <Input
                    readOnly
                    placeholder="콘텐츠타입 선택"
                    className="bg-muted text-xs cursor-not-allowed"
                    value={formState.contentTypeFullname ? `utm_medium=${formState.contentTypeFullname}` : ''}
                  />
                  {formState.contentType && !formState.contentTypeFullname && (
                    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span>파라미터값 미설정</span>
                      <Link to="/content-type" className="text-primary hover:underline">설정하기</Link>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">파라미터3 (캠페인 유형)</Label>
                  <Input
                    readOnly
                    placeholder="지면/구좌 선택"
                    className="bg-muted text-xs cursor-not-allowed"
                    value={formState.spaceCampaign ? `utm_campaign=${formState.spaceCampaign}` : ''}
                  />
                  {formState.space && !formState.spaceCampaign && (
                    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      <span>파라미터값 미설정</span>
                      <Link to="/placement" className="text-primary hover:underline">설정하기</Link>
                    </div>
                  )}
                </div>

                {isCriteoMedia && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">파라미터4 (크리테오 전용)</Label>
                    <Input
                      readOnly
                      className="bg-muted text-xs cursor-not-allowed"
                      value="utm_id={{adsetid}}"
                    />
                  </div>
                )}

            </div>
          </div>
          </Card>

          {(previewItems.length > 0 || previewRegisterResult) && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">미리보기 ({previewItems.length}개)</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button variant="outline" size="sm" onClick={openPreviewColOrder}>
                      <Settings2 className="h-3.5 w-3.5 mr-1.5" />열 순서
                    </Button>
                    {renderColOrderPopover(isPreviewColOrderOpen, tempPreviewColOrder, setTempPreviewColOrder, previewColDragIdx, applyPreviewColOrder, () => setTempPreviewColOrder(DEFAULT_PREVIEW_COL_ORDER))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(previewItems.map(i => i.utmCode).join('\n')).then(() => toast.success(`UTM 코드 ${previewItems.length}개 복사됨`))}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />UTM 코드 전체 복사
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { const urls = previewItems.map(i => i.adUrl).filter(Boolean); navigator.clipboard.writeText(urls.join('\n')).then(() => toast.success(`광고 URL ${urls.length}개 복사됨`)); }}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />광고 URL 전체 복사
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setPreviewItems([]); setPreviewSelectedRows(new Set()); setPreviewRegisterResult(null); }}>
                    취소
                  </Button>
                </div>
              </div>

              {previewRegisterResult && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm ${
                  previewRegisterResult.fail === 0
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}>
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>
                    등록 완료: 성공 {previewRegisterResult.success}건
                    {previewRegisterResult.fail > 0 && `, 실패 ${previewRegisterResult.fail}건`}
                  </span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="text-sm" style={{ tableLayout: 'fixed', minWidth: 1400 }}>
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-3 py-2 text-left" style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          checked={
                            previewItems.filter(item => item.status === 'new').length > 0 &&
                            previewSelectedRows.size === previewItems.filter(item => item.status === 'new').length
                          }
                          onChange={toggleAllPreviewRows}
                          className="cursor-pointer"
                          title="등록 가능 항목 전체 선택"
                        />
                      </th>
                      {previewColOrder.map(colKey => {
                        const meta = PREVIEW_COLUMNS.find(c => c.key === colKey);
                        if (colKey === 'ad_url') {
                          return (
                            <th key={colKey} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span>{meta?.label}</span>
                                {useSimpleUrl && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">메인URL</span>}
                                {isCriteoMedia && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">크리테오</span>}
                              </div>
                            </th>
                          );
                        }
                        return <th key={colKey} className="px-3 py-2 text-left font-medium whitespace-nowrap">{meta?.label}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {previewItems.map((item, idx) => {
                      const cellMap: Record<string, React.ReactNode> = {
                        status: (
                          <td key="status" className="px-3 py-2 whitespace-nowrap">
                            {item.status === 'duplicate' ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">중복</span>
                            ) : item.status === 'registered' ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">등록 완료</span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">등록 가능</span>
                            )}
                          </td>
                        ),
                        utm_code: (
                          <td key="utm_code" className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono">{item.utmCode}</code>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(item.utmCode).then(() => toast.success('UTM 코드 복사됨'))} title="UTM 코드 복사"><Copy className="h-3 w-3" /></Button>
                            </div>
                          </td>
                        ),
                        media_name: <td key="media_name" className="px-3 py-2 whitespace-nowrap">{item.mediaName ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(item.mediaId || item.mediaInitial).bg, getProductColor(item.mediaId || item.mediaInitial).text)}>{item.mediaName}{item.mediaInitial ? ` (${item.mediaInitial})` : ''}</Badge> : '—'}</td>,
                        landing_number: (
                          <td key="landing_number" className="px-3 py-2 whitespace-nowrap">
                            {item.landingNumber ? (() => {
                              const suffix = [item.landingInitial, item.landingDescription].filter(Boolean).join('-');
                              const label = suffix ? `${item.landingNumber} (${suffix})` : item.landingNumber;
                              const color = getProductColor(item.landingNumberId);
                              return <Badge className={cn('text-xs px-1.5 py-0', color.bg, color.text)}>{label}</Badge>;
                            })() : '—'}
                          </td>
                        ),
                        content_type_name: <td key="content_type_name" className="px-3 py-2 whitespace-nowrap">{item.contentTypeName ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(item.contentTypeId || item.contentTypeInitial).bg, getProductColor(item.contentTypeId || item.contentTypeInitial).text)}>{item.contentTypeName}{item.contentTypeInitial ? ` (${item.contentTypeInitial})` : ''}</Badge> : '—'}</td>,
                        placement_name: <td key="placement_name" className="px-3 py-2 whitespace-nowrap">{item.spaceName ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(item.placementId).bg, getProductColor(item.placementId).text)}>{item.spaceName}{item.spaceInitial ? ` (${item.spaceInitial})` : ''}</Badge> : '—'}</td>,
                        product_name: <td key="product_name" className="px-3 py-2 whitespace-nowrap">{item.productName ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(item.productId).bg, getProductColor(item.productId).text)}>{item.productName}{item.productInitial ? ` (${item.productInitial})` : ''}</Badge> : '—'}</td>,
                        planner_name: <td key="planner_name" className="px-3 py-2 whitespace-nowrap">{item.plannerName ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(item.plannerInitial).bg, getProductColor(item.plannerInitial).text)}>{item.plannerName}{item.plannerInitial ? ` (${item.plannerInitial})` : ''}</Badge> : '—'}</td>,
                        marketer_name: <td key="marketer_name" className="px-3 py-2 whitespace-nowrap">{item.marketerName ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(item.marketerInitial).bg, getProductColor(item.marketerInitial).text)}>{item.marketerName}{item.marketerInitial ? ` (${item.marketerInitial})` : ''}</Badge> : '—'}</td>,
                        creator_name: <td key="creator_name" className="px-3 py-2 whitespace-nowrap">{item.creatorName ? <Badge className={cn('text-xs px-1.5 py-0', getProductColor(item.creatorInitial).bg, getProductColor(item.creatorInitial).text)}>{item.creatorName}{item.creatorInitial ? ` (${item.creatorInitial})` : ''}</Badge> : '—'}</td>,
                        ad_url: (
                          <td key="ad_url" className="px-3 py-2 overflow-hidden">
                            <div className="flex items-center gap-2 min-w-0">
                              <code className="text-xs truncate min-w-0">{item.adUrl}</code>
                              <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0" onClick={() => navigator.clipboard.writeText(item.adUrl ?? '').then(() => toast.success('광고 URL 복사됨'))} title="광고 URL 복사"><Copy className="h-3 w-3" /></Button>
                            </div>
                          </td>
                        ),
                      };
                      return (
                        <tr key={idx} className="border-b hover:bg-muted/30">
                          <td className="px-3 py-2">
                            <input type="checkbox" checked={previewSelectedRows.has(idx)} disabled={item.status === 'duplicate' || item.status === 'registered'} onChange={() => togglePreviewRow(idx)} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40" />
                          </td>
                          {previewColOrder.map(colKey => cellMap[colKey])}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  {previewSelectedRows.size}개 선택됨 (등록 가능 항목만 등록 가능)
                </span>
                <Button
                  onClick={registerAll}
                  disabled={registering || previewSelectedRows.size === 0 || previewItems.filter(item => item.status === 'new').length === 0}
                >
                  {registering ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />등록 중...</>
                  ) : (
                    `선택 항목 등록 (${previewSelectedRows.size}건)`
                  )}
                </Button>
              </div>
            </Card>
          )}

          <div className="flex justify-center">
            <Link to="/utm-builder/history" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              전체 생성 이력 보기
            </Link>
          </div>
          </div>
        </TabsContent>

        {/* ── Tab 2: 코드 역산 등록 (코드 생성) ──────────────────────── */}
        <TabsContent value="decode" className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 pb-6 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* 베이스코드 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  베이스코드
                  {(/ue_/i.test(decodeBaseCode) || /\d{3}$/.test(decodeBaseCode)) && (
                    <span className="text-xs text-amber-600 font-medium ml-2">⚠️ 베이스코드를 다시 확인하세요</span>
                  )}
                </Label>
                <div className="flex items-center">
                  <span className="text-sm font-mono text-muted-foreground px-3 py-2 bg-muted rounded-l-md border border-r-0 border-input h-10 flex items-center">ue_</span>
                  <Input
                    ref={el => { decodeInputRefs.current[0] = el; }}
                    className="font-mono rounded-l-none"
                    placeholder="NVPDBAXXXXX"
                    value={decodeBaseCode}
                    onChange={e => setDecodeBaseCode(e.target.value.toUpperCase())}
                    onKeyDown={e => {
                      if (e.key === 'ArrowRight' && e.currentTarget.selectionStart === e.currentTarget.value.length) {
                        e.preventDefault(); focusDecodeAt(1);
                      }
                    }}
                  />
                </div>
              </div>

              {/* 시퀀스 번호 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  시퀀스 번호
                  {decodeSuggestingSeq && (
                    <span className="text-xs text-muted-foreground ml-2">(확인 중...)</span>
                  )}
                  {!decodeSuggestingSeq && decodeStartSeq && (
                    <span className="text-xs text-muted-foreground ml-2">(추천: {decodeStartSeq})</span>
                  )}
                  <span className="text-xs text-amber-600 font-medium ml-2">
                    ⚠️ 구글시트 최종번호 확인 후 입력하세요
                  </span>
                </Label>
                <Input
                  ref={el => { decodeInputRefs.current[1] = el; }}
                  type="text"
                  placeholder="001"
                  value={decodeStartSeq}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === '' || /^\d{1,3}$/.test(value)) {
                      setDecodeStartSeq(value);
                    }
                  }}
                  onBlur={e => {
                    const value = e.target.value;
                    if (value && value.length < 3) {
                      setDecodeStartSeq(value.padStart(3, '0'));
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'ArrowLeft' && e.currentTarget.selectionStart === 0) {
                      e.preventDefault(); focusDecodeAt(0);
                    } else if (e.key === 'ArrowRight' && e.currentTarget.selectionStart === e.currentTarget.value.length) {
                      e.preventDefault(); focusDecodeAt(2);
                    }
                  }}
                  maxLength={3}
                  disabled={decodeSuggestingSeq}
                />
                <p className="text-xs text-muted-foreground">
                  비워두면 DB 기준 3자리 숫자 자동 할당 (구글시트 미반영)
                </p>
              </div>

              {/* 생성 개수 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">생성 개수</Label>
                <Input
                  ref={el => { decodeInputRefs.current[2] = el; }}
                  type="number"
                  min={1}
                  max={100}
                  value={decodeCount}
                  onChange={e => {
                    const raw = e.target.value;
                    if (raw === '') { setDecodeCount(''); return; }
                    const val = parseInt(raw, 10);
                    if (!isNaN(val) && val >= 1 && val <= 100) setDecodeCount(val);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'ArrowLeft') { e.preventDefault(); focusDecodeAt(1); }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  한 번에 생성할 UTM 코드 수 (1~100)
                </p>
              </div>
            </div>

            <Button
              onClick={handleDecode}
              disabled={decoding || !decodeBaseCode.trim() || !decodeCount}
              className="w-full"
            >
              {decoding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  역산 중...
                </>
              ) : (
                '역산 미리보기'
              )}
            </Button>
          </Card>

          {decodeResults.length > 0 && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">미리보기 ({decodeResults.length}개)</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button variant="outline" size="sm" onClick={openDecodeColOrder}>
                      <Settings2 className="h-3.5 w-3.5 mr-1.5" />열 순서
                    </Button>
                    {renderColOrderPopover(isDecodeColOrderOpen, tempDecodeColOrder, setTempDecodeColOrder, decodeColDragIdx, applyDecodeColOrder, () => setTempDecodeColOrder(DEFAULT_PREVIEW_COL_ORDER))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const codes = sortedResults.map(i => { const c = i.utm_code || i.input_code; return c.startsWith('ue_') ? c : `ue_${c}`; }).join('\n');
                    navigator.clipboard.writeText(codes).then(() => toast.success(`UTM 코드 ${sortedResults.length}개 복사됨`));
                  }}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />UTM 코드 전체 복사
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const urls = sortedResults.map(i => computeDisplayAdUrl(i, landingNumberSelections[i.input_code])).filter(Boolean);
                    navigator.clipboard.writeText(urls.join('\n')).then(() => toast.success(`광고 URL ${urls.length}개 복사됨`));
                  }}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />광고 URL 전체 복사
                  </Button>
                </div>
              </div>

              {registerResult && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm ${
                  registerResult.fail === 0
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}>
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>
                    등록 완료: 성공 {registerResult.success}건
                    {registerResult.fail > 0 && `, 실패 ${registerResult.fail}건`}
                  </span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="text-sm" style={{ tableLayout: 'fixed', minWidth: 1400 }}>
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-3 py-2 text-left" style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          checked={
                            allRegisterableCount > 0 &&
                            selectedRows.size === allRegisterableCount
                          }
                          onChange={toggleAllRows}
                          className="cursor-pointer"
                          title="매핑 성공 항목 전체 선택"
                        />
                      </th>
                      {decodeColOrder.map(colKey => {
                        const sortableKeys = new Set(['status', 'utm_code', 'media_name', 'content_type_name', 'placement_name', 'product_name', 'planner_name', 'marketer_name', 'creator_name', 'ad_url']);
                        const sortable = sortableKeys.has(colKey);
                        const meta = PREVIEW_COLUMNS.find(c => c.key === colKey);
                        return (
                          <th
                            key={colKey}
                            className={`px-3 py-2 text-left font-medium select-none whitespace-nowrap ${sortable ? 'cursor-pointer hover:bg-muted/60' : ''}`}
                            onClick={sortable ? () => handleSortClick(colKey as SortKey) : undefined}
                          >
                            {meta?.label}
                            {sortable && <SortIcon col={colKey as SortKey} />}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map(item => {
                      const selectedLandingId = landingNumberSelections[item.input_code];
                      const displayAdUrl = computeDisplayAdUrl(item, selectedLandingId);
                      const isDecodable = item.status === 'decoded' && !!selectedLandingId;
                      const isChecked = selectedRows.has(item.input_code);

                      const findEntity = (list: { id: string; name: string; initial?: string }[] | undefined, name: string | undefined) => {
                        if (!name || !list) return null;
                        const baseName = name.replace(/ \([^)]+\)$/, '');
                        return list.find(x => x.name === baseName) ?? null;
                      };
                      const findEmp = (name: string | undefined) => {
                        if (!name) return null;
                        const baseName = name.replace(/ \([^)]+\)$/, '');
                        return masterData?.employeesList.find(e => e.name === baseName) ?? null;
                      };
                      const media = findEntity(masterData?.mediaList, item.media_name);
                      const ct = findEntity(masterData?.contentTypesList, item.content_type_name);
                      const pl = findEntity(masterData?.placementsList, item.placement_name);
                      const product = findEntity(masterData?.productsList, item.product_name);
                      const planner = findEmp(item.planner_name);
                      const marketer = findEmp(item.marketer_name);
                      const creator = findEmp(item.creator_name);
                      const mediaColor = getProductColor(media?.id ?? item.media_name ?? '');
                      const ctColor = getProductColor(ct?.id ?? item.content_type_name ?? '');
                      const plColor = getProductColor(pl?.id ?? item.placement_name ?? '');
                      const productColor = getProductColor(item.product_id ?? product?.id ?? item.product_name ?? '');
                      const selectedLnId = landingNumberSelections[item.input_code];
                      const selectedLn = product ? (product as { landing_numbers?: { id: string; number: string; initial?: string | null; description?: string | null }[] }).landing_numbers?.find(ln => ln.id === selectedLnId) : undefined;
                      const landingColor = getProductColor(selectedLnId ?? String(item.landing_number ?? ''));
                      const plannerColor = getProductColor(planner?.initial ?? item.planner_name ?? '');
                      const marketerColor = getProductColor(marketer?.initial ?? item.marketer_name ?? '');
                      const creatorColor = getProductColor(creator?.initial ?? item.creator_name ?? '');

                      const decodeCellMap: Record<string, React.ReactNode> = {
                        status: <td key="status" className="px-3 py-2 whitespace-nowrap">{statusBadge(item)}</td>,
                        utm_code: (
                          <td key="utm_code" className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono">{(() => { const code = item.utm_code || item.input_code; return code.startsWith('ue_') ? code : `ue_${code}`; })()}</code>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => navigator.clipboard.writeText((() => { const c = item.utm_code || item.input_code; return c.startsWith('ue_') ? c : `ue_${c}`; })()).then(() => toast.success('UTM 코드 복사됨'))} title="UTM 코드 복사"><Copy className="h-3 w-3" /></Button>
                            </div>
                          </td>
                        ),
                        media_name: <td key="media_name" className="px-3 py-2 whitespace-nowrap">{item.media_name ? <Badge className={cn('text-xs px-1.5 py-0', mediaColor.bg, mediaColor.text)}>{item.media_name}{media?.initial && !item.media_name?.includes('(') ? ` (${media.initial})` : ''}</Badge> : '—'}</td>,
                        landing_number: (
                          <td key="landing_number" className="px-3 py-2 whitespace-nowrap">{selectedLn ? (() => {
                            const suffix = [selectedLn.initial, selectedLn.description].filter(Boolean).join('-');
                            const label = suffix ? `${selectedLn.number} (${suffix})` : selectedLn.number;
                            return <Badge className={cn('text-xs px-1.5 py-0', landingColor.bg, landingColor.text)}>{label}</Badge>;
                          })() : item.landing_number != null ? <span className="text-xs text-muted-foreground">{item.landing_number}</span> : '—'}</td>
                        ),
                        content_type_name: <td key="content_type_name" className="px-3 py-2 whitespace-nowrap">{item.content_type_name ? <Badge className={cn('text-xs px-1.5 py-0', ctColor.bg, ctColor.text)}>{item.content_type_name}{ct?.initial && !item.content_type_name?.includes('(') ? ` (${ct.initial})` : ''}</Badge> : '—'}</td>,
                        placement_name: <td key="placement_name" className="px-3 py-2 whitespace-nowrap">{item.placement_name ? <Badge className={cn('text-xs px-1.5 py-0', plColor.bg, plColor.text)}>{item.placement_name}{pl?.initial && !item.placement_name?.includes('(') ? ` (${pl.initial})` : ''}</Badge> : '—'}</td>,
                        product_name: <td key="product_name" className="px-3 py-2 whitespace-nowrap">{item.product_name ? <Badge className={cn('text-xs px-1.5 py-0', productColor.bg, productColor.text)}>{item.product_name}{product?.initial && !item.product_name?.includes('(') ? ` (${product.initial})` : ''}</Badge> : '—'}</td>,
                        planner_name: <td key="planner_name" className="px-3 py-2 whitespace-nowrap">{item.planner_name ? <Badge className={cn('text-xs px-1.5 py-0', plannerColor.bg, plannerColor.text)}>{item.planner_name}{planner?.initial && !item.planner_name?.includes('(') ? ` (${planner.initial})` : ''}</Badge> : '—'}</td>,
                        marketer_name: <td key="marketer_name" className="px-3 py-2 whitespace-nowrap">{item.marketer_name ? <Badge className={cn('text-xs px-1.5 py-0', marketerColor.bg, marketerColor.text)}>{item.marketer_name}{marketer?.initial && !item.marketer_name?.includes('(') ? ` (${marketer.initial})` : ''}</Badge> : '—'}</td>,
                        creator_name: <td key="creator_name" className="px-3 py-2 whitespace-nowrap">{item.creator_name ? <Badge className={cn('text-xs px-1.5 py-0', creatorColor.bg, creatorColor.text)}>{item.creator_name}{creator?.initial && !item.creator_name?.includes('(') ? ` (${creator.initial})` : ''}</Badge> : '—'}</td>,
                        ad_url: item.status === 'not_found' ? (
                          <td key="ad_url" className="px-3 py-2 text-xs text-red-500 whitespace-nowrap">{item.error ?? '매핑 실패'}</td>
                        ) : (
                          <td key="ad_url" className="px-3 py-2">
                            {displayAdUrl ? (
                              <div className="flex items-center gap-2">
                                <code className="text-xs break-all">{displayAdUrl}</code>
                                <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0" onClick={() => navigator.clipboard.writeText(displayAdUrl).then(() => toast.success('광고 URL 복사됨'))} title="광고 URL 복사"><Copy className="h-3 w-3" /></Button>
                              </div>
                            ) : item.status === 'registered' ? '—' : (
                              <span className="text-xs text-muted-foreground">랜딩번호를 선택하세요.</span>
                            )}
                          </td>
                        ),
                      };

                      return (
                        <tr
                          key={item.input_code}
                          className={`border-b transition-colors ${
                            isChecked ? 'bg-primary/5' : 'hover:bg-muted/30'
                          }`}
                        >
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!isDecodable}
                              onChange={() => toggleRowSelection(item.input_code)}
                              className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                            />
                          </td>
                          {decodeColOrder.map(colKey => decodeCellMap[colKey])}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={allRegisterableCount > 0 && selectedRows.size === allRegisterableCount}
                      onChange={toggleAllRows}
                      className="w-4 h-4 cursor-pointer"
                    />
                    전체선택
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {registerableSelected}개 선택됨 (매핑 성공 항목만 등록 가능)
                  </span>
                </div>
                <Button
                  onClick={handleRegister}
                  disabled={registering || registerableSelected === 0 || hasUnselectedLandingNumber}
                  title={hasUnselectedLandingNumber ? '랜딩번호 이니셜이 설정되지 않은 항목이 있습니다. 온라인팀에 문의해주세요.' : undefined}
                >
                  {registering ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      등록 중...
                    </>
                  ) : (
                    `선택 항목 등록 (${registerableSelected}건)`
                  )}
                </Button>
              </div>
            </Card>
          )}

          <div className="flex justify-center">
            <Link to="/utm-builder/history" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              전체 생성 이력 보기
            </Link>
          </div>
          </div>
        </TabsContent>

        <TabsContent value="sheet" className="mt-0" style={{ height: 'calc(100vh - 120px)' }}>
          <SheetContainer />
        </TabsContent>

      </Tabs>
    </div>
  );
}

