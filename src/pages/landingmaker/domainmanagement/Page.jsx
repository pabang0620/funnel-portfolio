import { useState, useEffect } from "react";
import PortfolioWidget from '@/components/landingmaker/PortfolioWidget'
import { useNavigate } from "react-router-dom";
import { Settings, CircleHelp, ChevronDown, Plus, X, Pencil, GripVertical } from "lucide-react";
import { getTagSettings, saveTagSettings } from "./api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/landingmaker/ui/button";
import { Input } from "@/components/landingmaker/ui/input";
import { Label } from "@/components/landingmaker/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/landingmaker/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/landingmaker/ui/alert-dialog";
import Header from "@/components/landingmaker/Header";

// SortableItem 컴포넌트
function SortableItem({ id, width, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    width: width,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="absolute left-2 top-2 cursor-grab active:cursor-grabbing z-10" {...attributes} {...listeners}>
        <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </div>
      {children}
    </div>
  );
}

export default function DomainManagement() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({});
  const [originalSettings, setOriginalSettings] = useState({});
  const [savedStatus, setSavedStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({}); // 각 도메인의 편집 모드 관리
  const [showGuide, setShowGuide] = useState(false); // 가이드 토글 상태
  const [expandedDomains, setExpandedDomains] = useState({}); // 각 도메인의 추가 태그 펼치기 상태
  const [deleteDialog, setDeleteDialog] = useState({ open: false, domain: null, tagNumber: null }); // 삭제 확인 다이얼로그
  const [maxTagAlert, setMaxTagAlert] = useState(false); // 최대 태그 개수 알림
  const [saveDialog, setSaveDialog] = useState({ open: false, domain: null, field: null }); // 저장 확인 다이얼로그
  const [successAlert, setSuccessAlert] = useState({ open: false, message: '' }); // 성공 알림
  const [domainOrder, setDomainOrder] = useState([]);

  // Authentication check - redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found. Redirecting to login...');
      navigate('/portfolio/landingmaker/login', { replace: true });
    }
  }, [navigate]);

  // 페이지 로드 시 태그 데이터 가져오기
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await getTagSettings();
        if (response.success) {
          setSettings(response.data);
          setOriginalSettings(response.data);

          // localStorage에서 도메인 순서 로드
          const savedOrder = localStorage.getItem('domainOrder');
          const domains = Object.keys(response.data);

          if (savedOrder) {
            const parsedOrder = JSON.parse(savedOrder);
            // 새로운 도메인이 추가되었을 수 있으므로 병합
            const newDomains = domains.filter(d => !parsedOrder.includes(d));
            setDomainOrder([...parsedOrder.filter(d => domains.includes(d)), ...newDomains]);
          } else {
            setDomainOrder(domains);
          }
        }
      } catch (err) {
        console.error("태그 데이터 조회 실패:", err);
        setError("태그 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const updateSetting = (domain, field, value) => {
    setSettings({
      ...settings,
      [domain]: {
        ...settings[domain],
        [field]: value,
      },
    });
  };

  const handleEdit = (domain, field) => {
    setEditMode({
      ...editMode,
      [domain]: {
        ...editMode[domain],
        [field]: true
      }
    });
  };

  const handleCancel = (domain, field) => {
    // 편집 취소 시 원래 데이터로 복원
    setSettings({
      ...settings,
      [domain]: {
        ...settings[domain],
        [field]: originalSettings[domain][field]
      }
    });
    setEditMode({
      ...editMode,
      [domain]: {
        ...editMode[domain],
        [field]: false
      }
    });
  };

  const handleSave = (domain, field) => {
    setSaveDialog({ open: true, domain, field });
  };

  const confirmSave = async () => {
    const { domain, field } = saveDialog;
    try {
      // 신규 도메인인지 확인 (originalSettings에 없으면 신규)
      const isNew = !originalSettings[domain];

      const response = await saveTagSettings(domain, settings[domain], isNew);
      if (response.success) {
        console.log(`태그 저장 성공 for ${domain} - ${field}:`, response.data);
        // 저장 성공 시 원본 데이터도 업데이트
        setOriginalSettings({
          ...originalSettings,
          [domain]: {
            ...originalSettings[domain],
            [field]: settings[domain][field]
          }
        });
        setSavedStatus({
          ...savedStatus,
          [domain]: {
            ...savedStatus[domain],
            [field]: true
          }
        });
        setEditMode({
          ...editMode,
          [domain]: {
            ...editMode[domain],
            [field]: false
          }
        }); // 저장 후 편집 모드 해제

        // 성공 알림 표시
        const actionType = isNew ? '생성' : '수정';
        setSuccessAlert({
          open: true,
          message: `${domain} 도메인의 태그 설정이 ${actionType}되었습니다.`
        });

        setTimeout(() => {
          setSavedStatus((prev) => ({
            ...prev,
            [domain]: {
              ...prev[domain],
              [field]: false
            }
          }));
        }, 3000);
      }
    } catch (err) {
      console.error(`태그 저장 실패 for ${domain} - ${field}:`, err);
      alert("태그 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaveDialog({ open: false, domain: null, field: null });
    }
  };

  const toggleExpandDomain = (domain) => {
    setExpandedDomains({
      ...expandedDomains,
      [domain]: !expandedDomains[domain]
    });
  };

  const handleAddTag = (domain) => {
    // 현재 비어있는 가장 낮은 번호의 태그 세트를 찾아서 편집 모드로 전환
    if (!settings[domain].googleTagId2 && !settings[domain].conversionCode2) {
      setEditMode({
        ...editMode,
        [domain]: {
          ...editMode[domain],
          googleTagId2: true,
          conversionCode2: true
        }
      });
    } else if (!settings[domain].googleTagId3 && !settings[domain].conversionCode3) {
      setEditMode({
        ...editMode,
        [domain]: {
          ...editMode[domain],
          googleTagId3: true,
          conversionCode3: true
        }
      });
    } else {
      setMaxTagAlert(true);
    }
  };

  const handleDeleteTag = (domain, tagNumber) => {
    setDeleteDialog({ open: true, domain, tagNumber });
  };

  const confirmDeleteTag = async () => {
    const { domain, tagNumber } = deleteDialog;
    const googleTagField = tagNumber === 2 ? 'googleTagId2' : 'googleTagId3';
    const conversionCodeField = tagNumber === 2 ? 'conversionCode2' : 'conversionCode3';

    // 값 비우기
    setSettings({
      ...settings,
      [domain]: {
        ...settings[domain],
        [googleTagField]: '',
        [conversionCodeField]: ''
      }
    });

    // 편집 모드 해제
    setEditMode({
      ...editMode,
      [domain]: {
        ...editMode[domain],
        [googleTagField]: false,
        [conversionCodeField]: false
      }
    });

    // 서버에 빈 값 저장
    try {
      await saveTagSettings(domain, {
        ...settings[domain],
        [googleTagField]: '',
        [conversionCodeField]: ''
      }, false); // 기존 도메인 수정
    } catch (err) {
      console.error('태그 삭제 실패:', err);
    }

    setDeleteDialog({ open: false, domain: null, tagNumber: null });
  };

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 종료 핸들러
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setDomainOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // localStorage에 저장
        localStorage.setItem('domainOrder', JSON.stringify(newOrder));

        return newOrder;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-800" />
            <h2 className="text-xl font-semibold text-gray-900">
              도메인 관리
            </h2>
          </div>
          <div className="text-sm text-gray-600">
            신규 도메인 추가는 개발팀에 문의해주세요.
          </div>
        </div>

        {/* 구글 태그 설정 안내 */}
        <div className="border rounded-lg px-4 mb-8">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center justify-between w-full py-4 hover:no-underline"
          >
            <div className="flex items-center gap-3">
              <CircleHelp className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">구글 태그 설정 안내</span>
            </div>
            {showGuide ? (
              <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-200 rotate-180" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-200" />
            )}
          </button>

          {showGuide && (
            <div className="space-y-6 pt-4 pb-4">
                {/* 구글 태그 ID */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">1️⃣</span>
                    구글 태그 ID
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      📌 메인 페이지/신청완료 페이지 태그
                    </div>
                    <div className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto font-mono">
                      <div>{`<!-- Google tag (gtag.js) -->`}</div>
                      <div>{`<script async src="https://www.googletagmanager.com/gtag/js?id=`}<span className="bg-yellow-400 text-gray-900 px-1">AW-98765432109</span>{`"></script>`}</div>
                      <div>{`<script>`}</div>
                      <div>{`  window.dataLayer = window.dataLayer || [];`}</div>
                      <div>{`  function gtag(){dataLayer.push(arguments);}`}</div>
                      <div>{`  gtag('js', new Date());`}</div>
                      <div></div>
                      <div>{`  gtag('config', '`}<span className="bg-yellow-400 text-gray-900 px-1">AW-98765432109</span>{`');`}</div>
                      <div>{`</script>`}</div>
                    </div>
                  </div>
                </div>

                {/* 전환 추적 코드 */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">2️⃣</span>
                    전환 추적 코드
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      📌 클릭 시 태그
                    </div>
                    <div className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto font-mono">
                      <div>{`gtag('set', 'user_data', {`}</div>
                      <div>{`  phone_number: Array.from(document.querySelectorAll('[type="tel"]'))`}</div>
                      <div>{`    .map(function(e){return e.value}).join('').replace(/^0/,'+82')`}</div>
                      <div>{`})`}</div>
                      <div></div>
                      <div>{`gtag('event', 'conversion', {`}</div>
                      <div>{`  send_to: '`}<span className="bg-yellow-400 text-gray-900 px-1">AW-98765432109/XyZ9WqRs8tUv7pLm</span>{`'`}</div>
                      <div>{`})`}</div>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>

        <div>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={domainOrder}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-wrap gap-6">
                  {domainOrder.map((domain) => {
                // 각 도메인의 태그 세트 개수 계산 (값이 있거나 편집 모드인 경우 포함)
                const tagSetCount = 1 +
                  (settings[domain].googleTagId2 || settings[domain].conversionCode2 || editMode[domain]?.googleTagId2 || editMode[domain]?.conversionCode2 ? 1 : 0) +
                  (settings[domain].googleTagId3 || settings[domain].conversionCode3 || editMode[domain]?.googleTagId3 || editMode[domain]?.conversionCode3 ? 1 : 0);

                // 전체 너비의 1/3을 한 단위로, gap을 고려한 너비 계산
                const widthPercentage = (tagSetCount / 3) * 100;
                const gapAdjustment = 24 * (3 - tagSetCount) / 3; // gap-6 = 24px

                return (
              <SortableItem key={domain} id={domain} width={`calc(${widthPercentage}% - ${gapAdjustment}px)`}>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-2">
                    {!editMode[domain]?.accountName ? (
                      <>
                        <CardTitle className="text-base">
                          {domain} {settings[domain].accountName && <span className="text-gray-600 text-sm">({settings[domain].accountName})</span>}
                        </CardTitle>
                        <Button
                          onClick={() => handleEdit(domain, 'accountName')}
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                        >
                          <Pencil className="w-2 h-2" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <CardTitle className="text-base">{domain}</CardTitle>
                        <Input
                          type="text"
                          value={settings[domain].accountName || ""}
                          onChange={(e) => updateSetting(domain, "accountName", e.target.value)}
                          placeholder="별명을 입력해주세요"
                          className="h-7 w-20 text-xs placeholder:text-gray-300"
                        />
                        <Button
                          onClick={() => handleSave(domain, 'accountName')}
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2 text-xs border"
                        >
                          {savedStatus[domain]?.accountName ? "✓" : "저장"}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={() => handleAddTag(domain)}
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1"
                    disabled={tagSetCount >= 3}
                  >
                    <Plus className="w-4 h-4" />
                    태그 추가
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {/* 태그 세트 1 - 항상 표시 */}
                    <div className="border rounded-lg p-4 bg-gray-50 flex-1 min-w-[300px]">
                      {/* 구글 태그 ID 1 */}
                      <div className="space-y-2">
                        <Label htmlFor={`googleTagId-${domain}`} className="text-sm">
                          구글 태그 ID
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`googleTagId-${domain}`}
                            type="text"
                            value={settings[domain].googleTagId || ""}
                            onChange={(e) =>
                              updateSetting(domain, "googleTagId", e.target.value)
                            }
                            placeholder="구글 태그 ID를 입력해주세요"
                            disabled={!editMode[domain]?.googleTagId}
                            className="disabled:opacity-100 disabled:bg-white placeholder:text-gray-300"
                          />
                          {!editMode[domain]?.googleTagId ? (
                            <Button
                              onClick={() => handleEdit(domain, "googleTagId")}
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                            >
                              수정
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleCancel(domain, "googleTagId")}
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                              >
                                취소
                              </Button>
                              <Button
                                onClick={() => handleSave(domain, "googleTagId")}
                                variant="secondary"
                                size="sm"
                                className="shrink-0 border"
                              >
                                {savedStatus[domain]?.googleTagId ? "✓" : "저장"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 전환 추적 코드 1 */}
                      <div className="space-y-2 mt-4">
                        <Label htmlFor={`conversionCode-${domain}`} className="text-sm">
                          전환 추적 코드
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`conversionCode-${domain}`}
                            type="text"
                            value={settings[domain].conversionCode || ""}
                            onChange={(e) =>
                              updateSetting(domain, "conversionCode", e.target.value)
                            }
                            placeholder="전환 추적 코드를 입력해주세요"
                            disabled={!editMode[domain]?.conversionCode}
                            className="disabled:opacity-100 disabled:bg-white placeholder:text-gray-300"
                          />
                          {!editMode[domain]?.conversionCode ? (
                            <Button
                              onClick={() => handleEdit(domain, "conversionCode")}
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                            >
                              수정
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleCancel(domain, "conversionCode")}
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                              >
                                취소
                              </Button>
                              <Button
                                onClick={() => handleSave(domain, "conversionCode")}
                                variant="secondary"
                                size="sm"
                                className="shrink-0 border"
                              >
                                {savedStatus[domain]?.conversionCode ? "✓" : "저장"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 태그 세트 2 - 값이 있거나 편집 모드일 때 표시 */}
                    {(settings[domain].googleTagId2 || settings[domain].conversionCode2 || editMode[domain]?.googleTagId2 || editMode[domain]?.conversionCode2) && (
                    <div className="border rounded-lg p-4 bg-gray-50 flex-1 min-w-[300px] relative">
                      {/* 삭제 버튼 */}
                      <Button
                        onClick={() => handleDeleteTag(domain, 2)}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>

                      {/* 구글 태그 ID 2 */}
                      <div className="space-y-2 mt-0">
                        <Label htmlFor={`googleTagId2-${domain}`} className="text-sm">
                          구글 태그 ID 2
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`googleTagId2-${domain}`}
                            type="text"
                            value={settings[domain].googleTagId2 || ""}
                            onChange={(e) =>
                              updateSetting(domain, "googleTagId2", e.target.value)
                            }
                            placeholder="구글 태그 ID를 입력해주세요"
                            disabled={!editMode[domain]?.googleTagId2}
                            className="disabled:opacity-100 disabled:bg-white placeholder:text-gray-300"
                          />
                          {!editMode[domain]?.googleTagId2 ? (
                            <Button
                              onClick={() => handleEdit(domain, "googleTagId2")}
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                            >
                              수정
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleCancel(domain, "googleTagId2")}
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                              >
                                취소
                              </Button>
                              <Button
                                onClick={() => handleSave(domain, "googleTagId2")}
                                variant="secondary"
                                size="sm"
                                className="shrink-0 border"
                              >
                                {savedStatus[domain]?.googleTagId2 ? "✓" : "저장"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 전환 추적 코드 2 */}
                      <div className="space-y-2 mt-4">
                        <Label htmlFor={`conversionCode2-${domain}`} className="text-sm">
                          전환 추적 코드 2
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`conversionCode2-${domain}`}
                            type="text"
                            value={settings[domain].conversionCode2 || ""}
                            onChange={(e) =>
                              updateSetting(domain, "conversionCode2", e.target.value)
                            }
                            placeholder="전환 추적 코드를 입력해주세요"
                            disabled={!editMode[domain]?.conversionCode2}
                            className="disabled:opacity-100 disabled:bg-white placeholder:text-gray-300"
                          />
                          {!editMode[domain]?.conversionCode2 ? (
                            <Button
                              onClick={() => handleEdit(domain, "conversionCode2")}
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                            >
                              수정
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleCancel(domain, "conversionCode2")}
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                              >
                                취소
                              </Button>
                              <Button
                                onClick={() => handleSave(domain, "conversionCode2")}
                                variant="secondary"
                                size="sm"
                                className="shrink-0 border"
                              >
                                {savedStatus[domain]?.conversionCode2 ? "✓" : "저장"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    )}

                    {/* 태그 세트 3 - 값이 있거나 편집 모드일 때 표시 */}
                    {(settings[domain].googleTagId3 || settings[domain].conversionCode3 || editMode[domain]?.googleTagId3 || editMode[domain]?.conversionCode3) && (
                    <div className="border rounded-lg p-4 bg-gray-50 flex-1 min-w-[300px] relative">
                      {/* 삭제 버튼 */}
                      <Button
                        onClick={() => handleDeleteTag(domain, 3)}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>

                      {/* 구글 태그 ID 3 */}
                      <div className="space-y-2 mt-0">
                        <Label htmlFor={`googleTagId3-${domain}`} className="text-sm">
                          구글 태그 ID 3
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`googleTagId3-${domain}`}
                            type="text"
                            value={settings[domain].googleTagId3 || ""}
                            onChange={(e) =>
                              updateSetting(domain, "googleTagId3", e.target.value)
                            }
                            placeholder="구글 태그 ID를 입력해주세요"
                            disabled={!editMode[domain]?.googleTagId3}
                            className="disabled:opacity-100 disabled:bg-white placeholder:text-gray-300"
                          />
                          {!editMode[domain]?.googleTagId3 ? (
                            <Button
                              onClick={() => handleEdit(domain, "googleTagId3")}
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                            >
                              수정
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleCancel(domain, "googleTagId3")}
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                              >
                                취소
                              </Button>
                              <Button
                                onClick={() => handleSave(domain, "googleTagId3")}
                                variant="secondary"
                                size="sm"
                                className="shrink-0 border"
                              >
                                {savedStatus[domain]?.googleTagId3 ? "✓" : "저장"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* 전환 추적 코드 3 */}
                      <div className="space-y-2 mt-4">
                        <Label htmlFor={`conversionCode3-${domain}`} className="text-sm">
                          전환 추적 코드 3
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`conversionCode3-${domain}`}
                            type="text"
                            value={settings[domain].conversionCode3 || ""}
                            onChange={(e) =>
                              updateSetting(domain, "conversionCode3", e.target.value)
                            }
                            placeholder="전환 추적 코드를 입력해주세요"
                            disabled={!editMode[domain]?.conversionCode3}
                            className="disabled:opacity-100 disabled:bg-white placeholder:text-gray-300"
                          />
                          {!editMode[domain]?.conversionCode3 ? (
                            <Button
                              onClick={() => handleEdit(domain, "conversionCode3")}
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                            >
                              수정
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleCancel(domain, "conversionCode3")}
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                              >
                                취소
                              </Button>
                              <Button
                                onClick={() => handleSave(domain, "conversionCode3")}
                                variant="secondary"
                                size="sm"
                                className="shrink-0 border"
                              >
                                {savedStatus[domain]?.conversionCode3 ? "✓" : "저장"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </SortableItem>
                );
              })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, domain: null, tagNumber: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteDialog.domain} {deleteDialog.tagNumber}번째 태그 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 태그를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTag} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 최대 태그 개수 알림 */}
      <AlertDialog open={maxTagAlert} onOpenChange={setMaxTagAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>태그 추가 불가</AlertDialogTitle>
            <AlertDialogDescription>
              최대 3개의 태그 세트까지 추가할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 저장 확인 다이얼로그 */}
      <AlertDialog open={saveDialog.open} onOpenChange={(open) => !open && setSaveDialog({ open: false, domain: null, field: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>저장 확인</AlertDialogTitle>
            <AlertDialogDescription>
              다음과 같이 변경하시겠습니까?
              <div className="mt-4 p-3 bg-gray-50 rounded border">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">도메인:</span> {saveDialog.domain}
                </div>
                <div className="text-sm mt-2">
                  <span className="font-medium text-gray-700">필드:</span> {
                    saveDialog.field === 'accountName' ? '별명' :
                    saveDialog.field === 'googleTagId' ? '구글 태그 ID' :
                    saveDialog.field === 'conversionCode' ? '전환 추적 코드' :
                    saveDialog.field === 'googleTagId2' ? '구글 태그 ID 2' :
                    saveDialog.field === 'conversionCode2' ? '전환 추적 코드 2' :
                    saveDialog.field === 'googleTagId3' ? '구글 태그 ID 3' :
                    saveDialog.field === 'conversionCode3' ? '전환 추적 코드 3' :
                    saveDialog.field
                  }
                </div>
                <div className="text-sm mt-2">
                  <span className="font-medium text-gray-700">기존 값:</span>{" "}
                  <span className="text-gray-500">
                    {saveDialog.domain && saveDialog.field && originalSettings[saveDialog.domain]?.[saveDialog.field]
                      ? originalSettings[saveDialog.domain][saveDialog.field]
                      : '(없음)'}
                  </span>
                </div>
                <div className="text-sm mt-2">
                  <span className="font-medium text-gray-700">새 값:</span>{" "}
                  <span className="text-blue-600 font-medium">
                    {saveDialog.domain && saveDialog.field && settings[saveDialog.domain]?.[saveDialog.field]
                      ? settings[saveDialog.domain][saveDialog.field]
                      : '(없음)'}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>
              저장
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 성공 알림 */}
      <AlertDialog open={successAlert.open} onOpenChange={(open) => !open && setSuccessAlert({ open: false, message: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>저장 완료</AlertDialogTitle>
            <AlertDialogDescription>
              {successAlert.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuccessAlert({ open: false, message: '' })}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PortfolioWidget />
    </div>
  );
}
