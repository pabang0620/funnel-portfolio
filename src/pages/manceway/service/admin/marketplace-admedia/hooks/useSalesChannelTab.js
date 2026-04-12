import { useState, useEffect, useCallback } from "react";
import {
  getMarketPlaces,
  createMarketPlace,
  updateMarketPlace,
  deleteMarketPlace,
  getFileMarketPlaceNames,
  createFileMarketPlaceName,
  updateFileMarketPlaceName,
  deleteFileMarketPlaceName,
} from "../api";

export function useSalesChannelTab() {
  // 판매처 관리 상태
  const [salesChannels, setSalesChannels] = useState([]);
  const [salesChannelForm, setSalesChannelForm] = useState({
    uploadedName: "",
    realChannelId: null,
  });
  const [editingSalesChannelId, setEditingSalesChannelId] = useState(null);
  const [editingSalesChannelData, setEditingSalesChannelData] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(null);

  // 판매처(실제) 관리 상태
  const [channels, setChannels] = useState([]);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 페이지네이션 상태
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // 드롭다운 메뉴 상태
  const [openMenuId, setOpenMenuId] = useState(null);

  // 판매처 데이터 로드 (페이지네이션 지원)
  const fetchData = useCallback(async (page = 1, parentIdFilter = null) => {
    setIsLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      if (
        parentIdFilter &&
        parentIdFilter !== "all" &&
        parentIdFilter !== "none"
      ) {
        params.parentId = parentIdFilter;
      }

      const [marketPlacesRes, fileMarketPlacesRes] = await Promise.all([
        getMarketPlaces(),
        getFileMarketPlaceNames(params),
      ]);

      if (marketPlacesRes.success && marketPlacesRes.data) {
        setChannels(
          marketPlacesRes.data.map((item) => ({
            id: item.id,
            name: item.name,
          }))
        );
      }

      if (fileMarketPlacesRes.success && fileMarketPlacesRes.data) {
        setSalesChannels(
          fileMarketPlacesRes.data.map((item) => ({
            id: item.id,
            uploadedName: item.name,
            fileMarketPlaceName: item.fileMarketPlaceName,
            realChannelId: item.parentId,
            isUnassigned: item.isUnassigned || false,
            status: item.status,
            registeredDate: item.registeredDate,
            modifiedDate: item.modifiedDate,
          }))
        );

        if (fileMarketPlacesRes.pagination) {
          setPagination((prev) => ({
            ...prev,
            page: fileMarketPlacesRes.pagination.page,
            totalCount: fileMarketPlacesRes.pagination.totalCount,
            totalPages: fileMarketPlacesRes.pagination.totalPages,
          }));
        }
      }
    } catch (error) {
      console.error("판매처 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchData();
  }, []);

  // 판매처 등록 핸들러
  const handleSubmit = async () => {
    if (!salesChannelForm.uploadedName.trim()) {
      alert("파일 판매처명을 입력해주세요.");
      return;
    }

    try {
      const res = await createFileMarketPlaceName({
        name: salesChannelForm.uploadedName.trim(),
        parentId: salesChannelForm.realChannelId,
      });

      if (res.success) {
        alert("판매처가 등록되었습니다.");
        setSalesChannelForm({ uploadedName: "", realChannelId: null });
        fetchData();
      } else {
        alert(res.msg || "판매처 등록에 실패했습니다.");
      }
    } catch (error) {
      alert(error.message || "판매처 등록 중 오류가 발생했습니다.");
    }
  };

  // 인라인 편집 시작
  const handleEdit = (channel) => {
    setEditingSalesChannelId(channel.id);
    setEditingSalesChannelData({
      uploadedName: channel.uploadedName,
      fileMarketPlaceName: channel.fileMarketPlaceName,
      realChannelId: channel.realChannelId,
    });
    setOpenMenuId(null); // 드롭다운 메뉴 닫기
  };

  // 인라인 편집 저장
  const handleSave = async () => {
    if (!editingSalesChannelData.realChannelId) {
      alert("판매처를 선택해주세요.");
      return;
    }

    try {
      const res = await updateFileMarketPlaceName(editingSalesChannelId, {
        parentId: editingSalesChannelData.realChannelId,
      });

      if (res.success) {
        alert("판매처가 수정되었습니다.");
        setEditingSalesChannelId(null);
        setEditingSalesChannelData(null);
        fetchData();
      } else {
        alert(res.msg || "판매처 수정에 실패했습니다.");
      }
    } catch (error) {
      alert(error.message || "판매처 수정 중 오류가 발생했습니다.");
    }
  };

  // 인라인 편집 취소
  const handleEditCancel = () => {
    setEditingSalesChannelId(null);
    setEditingSalesChannelData(null);
  };

  // 삭제
  const handleDelete = async (id) => {
    if (window.confirm("해당 판매처를 삭제하시겠습니까?")) {
      try {
        const res = await deleteFileMarketPlaceName(id);
        if (res.success) {
          alert("판매처가 삭제되었습니다.");
          fetchData();
        } else {
          alert(res.msg || "판매처 삭제에 실패했습니다.");
        }
      } catch (error) {
        alert(error.message || "판매처 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 분류 드롭다운에서 선택
  const handleSelectCategory = (categoryId) => {
    setEditingSalesChannelData({
      ...editingSalesChannelData,
      realChannelId: categoryId,
    });
    setCategoryDropdownOpen(null);
  };

  // 새 판매처(실제) 추가
  const handleAddChannel = async (name) => {
    try {
      const res = await createMarketPlace({ name: name.trim() });
      if (res.success && res.data) {
        setSalesChannelForm({
          ...salesChannelForm,
          realChannelId: res.data.id,
        });
        fetchData();
      } else {
        alert(res.msg || "판매처 추가에 실패했습니다.");
      }
    } catch (error) {
      alert(error.message || "판매처 추가 중 오류가 발생했습니다.");
    }
  };

  // 판매처(실제) 수정
  const handleEditChannel = async (id, name) => {
    try {
      const res = await updateMarketPlace(id, { name: name.trim() });
      if (res.success) {
        fetchData();
      } else {
        alert(res.msg || "판매처 수정에 실패했습니다.");
      }
    } catch (error) {
      alert(error.message || "판매처 수정 중 오류가 발생했습니다.");
    }
  };

  // 판매처(실제) 삭제
  const handleDeleteChannel = async (id) => {
    try {
      const res = await deleteMarketPlace(id);
      if (res.success) {
        if (salesChannelForm.realChannelId === id) {
          setSalesChannelForm({ ...salesChannelForm, realChannelId: null });
        }
        fetchData();
      } else {
        alert(res.msg || "판매처 삭제에 실패했습니다.");
      }
    } catch (error) {
      alert(error.message || "판매처 삭제 중 오류가 발생했습니다.");
    }
  };

  // 드롭다운 메뉴 토글
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return {
    // 상태
    salesChannels,
    salesChannelForm,
    setSalesChannelForm,
    editingSalesChannelId,
    editingSalesChannelData,
    setEditingSalesChannelData,
    categoryFilter,
    setCategoryFilter,
    categoryDropdownOpen,
    setCategoryDropdownOpen,
    channels,
    isLoading,
    pagination,
    openMenuId,
    setOpenMenuId,

    // 핸들러
    fetchData,
    handleSubmit,
    handleEdit,
    handleSave,
    handleEditCancel,
    handleDelete,
    handleSelectCategory,
    handleAddChannel,
    handleEditChannel,
    handleDeleteChannel,
    toggleMenu,
  };
}
