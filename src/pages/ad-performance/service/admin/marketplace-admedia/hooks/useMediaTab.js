import { useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "../../../../utils/auth";
import {
  getAdMedias,
  createAdMedia,
  updateAdMedia,
  deleteAdMedia,
  getAdMediaDetails,
  createAdMediaDetail,
  updateAdMediaDetail,
  deleteAdMediaDetail,
  getProductMasters,
} from "../api";

export function useMediaTab() {
  // 매체 관리 상태
  const [mediaCategories, setMediaCategories] = useState([]);
  const [mediaDetails, setMediaDetails] = useState([]);
  const [products, setProducts] = useState([]);
  const [mediaForm, setMediaForm] = useState({
    name: "",
    mediaCategoryId: null,
    status: 1,
  });
  const [editingMediaId, setEditingMediaId] = useState(null);
  const [editingMediaData, setEditingMediaData] = useState(null);
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState("all");
  const [mediaCategoryDropdownOpen, setMediaCategoryDropdownOpen] = useState(null);

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

  // 매체 데이터 로드
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

      const [adMediasRes, adMediaDetailsRes, productsRes] = await Promise.all([
        getAdMedias(),
        getAdMediaDetails(params),
        getProductMasters(),
      ]);

      if (adMediasRes.success && adMediasRes.data) {
        setMediaCategories(
          adMediasRes.data.map((item) => ({
            id: item.id,
            name: item.name,
            fee: item.fee,
          }))
        );
      }

      if (adMediaDetailsRes.success && adMediaDetailsRes.data) {
        setMediaDetails(
          adMediaDetailsRes.data.map((item) => ({
            id: item.id,
            name: item.name,
            adMediaDetailName: item.adMediaDetailName,
            mediaCategoryId: item.parentId,
            fee: item.fee,
            productId: item.productId,
            productName: item.productName,
            status: item.status !== undefined ? item.status : 1,
            registeredDate: item.registeredDate,
            modifiedDate: item.modifiedDate,
          }))
        );

        if (adMediaDetailsRes.pagination) {
          setPagination((prev) => ({
            ...prev,
            page: adMediaDetailsRes.pagination.page,
            totalCount: adMediaDetailsRes.pagination.totalCount,
            totalPages: adMediaDetailsRes.pagination.totalPages,
          }));
        }
      }

      // 제품 데이터 처리
      if (productsRes.success && productsRes.data) {
        setProducts(
          productsRes.data.map((item) => ({
            id: item.id,
            name: item.name,
          }))
        );
      }
    } catch (error) {
      console.error("매체 데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchData();
  }, []);

  // 매체 상세 등록 핸들러
  const handleSubmit = async () => {
    if (!mediaForm.name.trim()) {
      alert("태그를 입력해주세요.");
      return;
    }

    try {
      const res = await createAdMediaDetail({
        name: mediaForm.name.trim(),
        parentId: mediaForm.mediaCategoryId,
      });

      if (res.success) {
        alert("매체 상세가 등록되었습니다.");
        setMediaForm({ name: "", mediaCategoryId: null, status: 1 });
        fetchData();
      } else {
        alert(res.msg || "매체 상세 등록에 실패했습니다.");
      }
    } catch (error) {
      alert(error.message || "매체 상세 등록 중 오류가 발생했습니다.");
    }
  };

  // 매체 상세 인라인 편집 시작
  const handleEdit = (mediaItem) => {
    setEditingMediaId(mediaItem.id);
    const category = mediaCategories.find(
      (cat) => cat.id === mediaItem.mediaCategoryId
    );
    setEditingMediaData({
      name: mediaItem.name,
      fee: category?.fee ?? "",
      mediaCategoryId: mediaItem.mediaCategoryId,
      productId: mediaItem.productId || null,
      status: mediaItem.status !== undefined ? mediaItem.status : 1,
      adMediaDetailName: mediaItem.adMediaDetailName || "",
    });
    setOpenMenuId(null);
  };

  // 매체 상세 인라인 편집 저장
  const handleSave = async () => {
    const detailName = editingMediaData.adMediaDetailName?.trim();
    if (!detailName) {
      alert("태그를 입력해주세요.");
      return;
    }

    let parsedFee = null;
    if (editingMediaData.fee !== "" && editingMediaData.fee !== null) {
      parsedFee = parseFloat(editingMediaData.fee);
      if (isNaN(parsedFee) || parsedFee < 0 || parsedFee > 100) {
        alert("대행료는 0~100 사이의 값을 입력해주세요.");
        return;
      }
    }

    try {
      const res = await updateAdMediaDetail(editingMediaId, {
        name: detailName,
        parentId: editingMediaData.mediaCategoryId,
        productId: editingMediaData.productId,
        status: editingMediaData.status,
      });

      if (!res.success) {
        alert(res.msg || "매체 상세 수정에 실패했습니다.");
        return;
      }

      // 대행료 수정 (매체 카테고리가 선택된 경우)
      let feeUpdated = false;
      if (editingMediaData.mediaCategoryId) {
        const currentCategory = mediaCategories.find(
          (cat) => cat.id === editingMediaData.mediaCategoryId
        );
        // 숫자로 변환하여 비교 (타입 불일치 방지)
        const currentFee = currentCategory?.fee != null ? parseFloat(currentCategory.fee) : null;
        if (currentFee !== parsedFee) {
          const feeRes = await updateAdMedia(editingMediaData.mediaCategoryId, {
            fee: parsedFee,
          });
          if (feeRes.success) {
            feeUpdated = true;
          }
        }
      }

      alert("매체 상세가 수정되었습니다.");
      setEditingMediaId(null);
      setEditingMediaData(null);
      setMediaCategoryDropdownOpen(null);
      fetchData();
    } catch (error) {
      alert(error.message || "매체 상세 수정 중 오류가 발생했습니다.");
    }
  };

  // 매체 상세 인라인 편집 취소
  const handleEditCancel = () => {
    setEditingMediaId(null);
    setEditingMediaData(null);
    setMediaCategoryDropdownOpen(null);
  };

  // 매체 상세 삭제
  const handleDelete = async (id) => {
    if (window.confirm("해당 매체 상세를 삭제하시겠습니까?")) {
      try {
        const res = await deleteAdMediaDetail(id);
        if (res.success) {
          alert("매체 상세가 삭제되었습니다.");
          fetchData();
        } else {
          alert(res.msg || "매체 상세 삭제에 실패했습니다.");
        }
      } catch (error) {
        alert(error.message || "매체 상세 삭제 중 오류가 발생했습니다.");
      }
    }
    setOpenMenuId(null);
  };

  // 매체 카테고리 드롭다운에서 선택
  const handleSelectCategory = (categoryId) => {
    setEditingMediaData({
      ...editingMediaData,
      mediaCategoryId: categoryId,
    });
    setMediaCategoryDropdownOpen(null);
  };

  // 새 매체 카테고리 추가
  const handleAddCategory = async (name, fee = null) => {
    const currentUser = getCurrentUser();
    if (currentUser?.roleCode !== 'S') {
      alert("매체 카테고리 추가는 S등급만 가능합니다.");
      return;
    }

    try {
      const res = await createAdMedia({ name: name.trim(), fee });
      if (res.success && res.data) {
        setMediaForm({ ...mediaForm, mediaCategoryId: res.data.id });
        fetchData();
      } else {
        alert(res.msg || "매체 추가에 실패했습니다.");
      }
    } catch (error) {
      alert(error.message || "매체 추가 중 오류가 발생했습니다.");
    }
  };

  // 매체 카테고리 수정
  const handleEditCategory = async (id, name, fee = null) => {
    const currentUser = getCurrentUser();
    if (currentUser?.roleCode !== 'S') {
      alert("매체 카테고리 수정은 S등급만 가능합니다.");
      return;
    }

    try {
      const res = await updateAdMedia(id, { name: name.trim(), fee });
      if (res.success) {
        fetchData();
      } else {
        alert(res.msg || "매체 수정에 실패했습니다.");
      }
    } catch (error) {
      alert(error.message || "매체 수정 중 오류가 발생했습니다.");
    }
  };

  // 매체 카테고리 삭제
  const handleDeleteCategory = async (id) => {
    const currentUser = getCurrentUser();
    if (currentUser?.roleCode !== 'S') {
      alert("매체 카테고리 삭제는 S등급만 가능합니다.");
      return;
    }

    try {
      const res = await deleteAdMedia(id);
      if (res.success) {
        if (mediaForm.mediaCategoryId === id) {
          setMediaForm({ ...mediaForm, mediaCategoryId: null });
        }
        fetchData();
      } else {
        alert(res.msg || "매체 삭제에 실패했습니다.");
      }
    } catch (error) {
      alert(error.message || "매체 삭제 중 오류가 발생했습니다.");
    }
  };

  // 드롭다운 메뉴 토글
  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return {
    // 상태
    mediaCategories,
    mediaDetails,
    products,
    mediaForm,
    setMediaForm,
    editingMediaId,
    editingMediaData,
    setEditingMediaData,
    mediaCategoryFilter,
    setMediaCategoryFilter,
    mediaCategoryDropdownOpen,
    setMediaCategoryDropdownOpen,
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
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    toggleMenu,
  };
}
