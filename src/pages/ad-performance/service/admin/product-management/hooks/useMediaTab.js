import { useState, useEffect } from "react";

// 초기 매체 데이터 (계층 구조: 매체 > 매체 상세)
const initialMediaList = [
  {
    id: 1,
    name: "구글",
    fee: 15,
    details: [
      { id: 1, name: "구글1" },
      { id: 2, name: "구글2" },
      { id: 3, name: "구글3" },
    ],
    registeredDate: "2025-11-01",
  },
  {
    id: 2,
    name: "페이스북",
    fee: 20,
    details: [
      { id: 1, name: "페이스북1" },
      { id: 2, name: "페이스북2" },
    ],
    registeredDate: "2025-11-05",
  },
  {
    id: 3,
    name: "네이버",
    fee: 10,
    details: [
      { id: 1, name: "네이버_검색" },
      { id: 2, name: "네이버_디스플레이" },
    ],
    registeredDate: "2025-11-10",
  },
];

export function useMediaTab(showCustomAlert) {
  const [mediaList, setMediaList] = useState(initialMediaList);
  const [mediaForm, setMediaForm] = useState({ name: "", fee: "" });
  const [editingMediaId, setEditingMediaId] = useState(null);
  const [editingMediaData, setEditingMediaData] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // 매체 상세 관련 상태
  const [detailDropdownOpen, setDetailDropdownOpen] = useState(null);
  const [detailForm, setDetailForm] = useState({ name: "" });
  const [editingDetailId, setEditingDetailId] = useState(null);
  const [editingDetailData, setEditingDetailData] = useState({ name: "" });

  // 외부 클릭 핸들러
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null && !event.target.closest(".dropdown-menu-container")) {
        setOpenMenuId(null);
      }
      if (
        detailDropdownOpen !== null &&
        !event.target.closest(".notion-style-dropdown") &&
        !event.target.closest("[data-detail-trigger]")
      ) {
        setDetailDropdownOpen(null);
        setDetailForm({ name: "" });
        setEditingDetailId(null);
        setEditingDetailData({ name: "" });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId, detailDropdownOpen]);

  // 매체 등록
  const handleMediaSubmit = () => {
    if (!mediaForm.name.trim()) {
      showCustomAlert("매체명을 입력해주세요.");
      return;
    }

    // 대행료 유효성 검사
    let parsedFee = null;
    if (mediaForm.fee !== "" && mediaForm.fee !== null) {
      parsedFee = parseFloat(mediaForm.fee);
      if (isNaN(parsedFee) || parsedFee < 0 || parsedFee > 100) {
        showCustomAlert("대행료는 0~100 사이의 값을 입력해주세요.");
        return;
      }
    }

    // 중복 체크
    if (mediaList.some((m) => m.name === mediaForm.name.trim())) {
      showCustomAlert("이미 등록된 매체입니다.");
      return;
    }

    const newMedia = {
      id: Date.now(),
      name: mediaForm.name.trim(),
      fee: parsedFee,
      details: [],
      registeredDate: new Date().toISOString().split("T")[0],
    };

    setMediaList([newMedia, ...mediaList]);
    setMediaForm({ name: "", fee: "" });
    showCustomAlert("매체가 등록되었습니다.");
  };

  // 매체 수정 모드 진입
  const handleMediaEdit = (media) => {
    setEditingMediaId(media.id);
    setEditingMediaData({ name: media.name, fee: media.fee ?? "", details: [...media.details] });
    setOpenMenuId(null);
  };

  // 매체 수정 저장
  const handleMediaSave = () => {
    if (!editingMediaData.name.trim()) {
      showCustomAlert("매체명을 입력해주세요.");
      return;
    }

    // 대행료 유효성 검사
    let parsedFee = null;
    if (editingMediaData.fee !== "" && editingMediaData.fee !== null) {
      parsedFee = parseFloat(editingMediaData.fee);
      if (isNaN(parsedFee) || parsedFee < 0 || parsedFee > 100) {
        showCustomAlert("대행료는 0~100 사이의 값을 입력해주세요.");
        return;
      }
    }

    // 중복 체크 (자기 자신 제외)
    if (mediaList.some((m) => m.id !== editingMediaId && m.name === editingMediaData.name.trim())) {
      showCustomAlert("이미 등록된 매체입니다.");
      return;
    }

    setMediaList(
      mediaList.map((m) =>
        m.id === editingMediaId
          ? { ...m, name: editingMediaData.name.trim(), fee: parsedFee, details: editingMediaData.details }
          : m
      )
    );

    setEditingMediaId(null);
    setEditingMediaData(null);
    setDetailDropdownOpen(null);
    showCustomAlert("매체가 수정되었습니다.");
  };

  // 매체 수정 취소
  const handleMediaEditCancel = () => {
    setEditingMediaId(null);
    setEditingMediaData(null);
    setDetailDropdownOpen(null);
    setDetailForm({ name: "" });
    setEditingDetailId(null);
    setEditingDetailData({ name: "" });
  };

  // 매체 삭제
  const handleMediaDelete = (id) => {
    if (window.confirm("해당 매체를 삭제하시겠습니까?\n매체 상세 항목도 모두 삭제됩니다.")) {
      setMediaList(mediaList.filter((m) => m.id !== id));
      showCustomAlert("매체가 삭제되었습니다.");
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  // 매체 상세 드롭다운 토글
  const toggleDetailDropdown = (mediaId) => {
    if (detailDropdownOpen === mediaId) {
      setDetailDropdownOpen(null);
      setDetailForm({ name: "" });
      setEditingDetailId(null);
      setEditingDetailData({ name: "" });
    } else {
      setDetailDropdownOpen(mediaId);
      setDetailForm({ name: "" });
      setEditingDetailId(null);
      setEditingDetailData({ name: "" });
    }
  };

  // 매체 상세 추가
  const handleAddDetail = (mediaId) => {
    if (!detailForm.name.trim()) {
      showCustomAlert("매체 상세명을 입력해주세요.");
      return;
    }

    // 중복 체크
    if (editingMediaData.details.some((d) => d.name === detailForm.name.trim())) {
      showCustomAlert("이미 등록된 매체 상세입니다.");
      return;
    }

    setEditingMediaData({
      ...editingMediaData,
      details: [
        ...editingMediaData.details,
        { id: Date.now(), name: detailForm.name.trim() },
      ],
    });

    setDetailForm({ name: "" });
  };

  // 매체 상세 수정 모드 진입
  const handleEditDetail = (detail) => {
    setEditingDetailId(detail.id);
    setEditingDetailData({ name: detail.name });
  };

  // 매체 상세 수정 저장
  const handleSaveDetailEdit = () => {
    if (!editingDetailData.name.trim()) {
      showCustomAlert("매체 상세명을 입력해주세요.");
      return;
    }

    // 중복 체크 (자기 자신 제외)
    if (editingMediaData.details.some((d) => d.id !== editingDetailId && d.name === editingDetailData.name.trim())) {
      showCustomAlert("이미 등록된 매체 상세입니다.");
      return;
    }

    setEditingMediaData({
      ...editingMediaData,
      details: editingMediaData.details.map((d) =>
        d.id === editingDetailId ? { ...d, name: editingDetailData.name.trim() } : d
      ),
    });

    setEditingDetailId(null);
    setEditingDetailData({ name: "" });
  };

  // 매체 상세 수정 취소
  const handleCancelDetailEdit = () => {
    setEditingDetailId(null);
    setEditingDetailData({ name: "" });
  };

  // 매체 상세 삭제
  const handleDeleteDetail = (detailId) => {
    setEditingMediaData({
      ...editingMediaData,
      details: editingMediaData.details.filter((d) => d.id !== detailId),
    });
  };

  return {
    mediaList,
    mediaForm,
    setMediaForm,
    editingMediaId,
    editingMediaData,
    setEditingMediaData,
    openMenuId,
    detailDropdownOpen,
    detailForm,
    setDetailForm,
    editingDetailId,
    editingDetailData,
    setEditingDetailData,
    handleMediaSubmit,
    handleMediaEdit,
    handleMediaSave,
    handleMediaEditCancel,
    handleMediaDelete,
    toggleMenu,
    toggleDetailDropdown,
    handleAddDetail,
    handleEditDetail,
    handleSaveDetailEdit,
    handleCancelDetailEdit,
    handleDeleteDetail,
  };
}
