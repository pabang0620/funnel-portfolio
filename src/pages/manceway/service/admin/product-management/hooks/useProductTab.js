import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getProductMasterList,
  createProductMaster,
  updateProductMaster,
  deleteProductMaster,
} from "../api";

export function useProductTab(showCustomAlert) {
  const [productManagement, setProductManagement] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // 검색용 전체 제품 목록
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    hiddenNumber: "",
    hiddenName: "",
    hiddenNumbers: [],
    costPrice: "",
    costPriceDate: "",
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingProductData, setEditingProductData] = useState(null);
  const [productHiddenForm, setProductHiddenForm] = useState({ number: "", name: "" });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [hiddenNumberDropdownOpen, setHiddenNumberDropdownOpen] = useState(null);
  const [editingHiddenId, setEditingHiddenId] = useState(null);
  const [editingHiddenData, setEditingHiddenData] = useState({ number: "", name: "" });

  // 페이지네이션 상태
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // 제품 목록 조회 (검색 필터 지원)
  const fetchProducts = useCallback(async (page = 1, searchFilters = {}) => {
    setLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      if (searchFilters.productIds && searchFilters.productIds.length > 0) {
        params.productIds = searchFilters.productIds;
      }
      const response = await getProductMasterList(params);
      if (response.success) {
        setProductManagement(response.data || []);
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            page: response.pagination.page,
            totalCount: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // 검색용 전체 제품 목록 조회
  const fetchAllProducts = useCallback(async () => {
    try {
      const response = await getProductMasterList({ page: 1, limit: 100 });
      if (response.success) {
        setAllProducts(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch all products:", error);
    }
  }, []);

  // 제품 옵션 (검색 드롭다운용)
  const productOptions = useMemo(() => {
    return allProducts.map((p) => ({
      id: p.id,
      name: p.name,
    }));
  }, [allProducts]);

  // 탭 진입 시 데이터 로드
  const initializeData = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchAllProducts()]);
  }, [fetchProducts, fetchAllProducts]);

  // 외부 클릭 핸들러
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        hiddenNumberDropdownOpen !== null &&
        !event.target.closest(".notion-style-dropdown") &&
        !event.target.closest("[data-hidden-trigger]")
      ) {
        setHiddenNumberDropdownOpen(null);
        setProductHiddenForm({ number: "", name: "" });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hiddenNumberDropdownOpen]);

  const handleProductSubmit = async () => {
    if (!productForm.name.trim()) {
      showCustomAlert("제품명을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 히든 번호가 있으면 배열로 변환
      const hiddenNumbers = [];
      if (productForm.hiddenNumber?.trim()) {
        hiddenNumbers.push({
          number: productForm.hiddenNumber.trim(),
          name: productForm.hiddenName?.trim() || "",
        });
      }

      const data = {
        name: productForm.name.trim(),
        costPrice: productForm.costPrice ? parseFloat(productForm.costPrice) : null,
        hiddenNumbers: hiddenNumbers.length > 0 ? hiddenNumbers : undefined,
      };

      const response = await createProductMaster(data);
      if (response.success) {
        showCustomAlert("제품이 등록되었습니다.");
        setProductForm({
          name: "",
          hiddenNumber: "",
          hiddenName: "",
          hiddenNumbers: [],
          costPrice: "",
          costPriceDate: "",
        });
        fetchProducts();
      }
    } catch (error) {
      showCustomAlert(error.message || "제품 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductEdit = (product) => {
    setEditingProductId(product.id);
    setEditingProductData({
      name: product.name,
      costPrice: product.costPrice || "",
      hiddenNumbers: product.hiddenNumbers || [],
    });
  };

  const handleProductSave = async () => {
    if (!editingProductData.name.trim()) {
      showCustomAlert("제품명을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: editingProductData.name.trim(),
        costPrice: editingProductData.costPrice ? parseFloat(editingProductData.costPrice) : null,
        hiddenNumbers: editingProductData.hiddenNumbers || [],
      };

      const response = await updateProductMaster(editingProductId, data);
      if (response.success) {
        showCustomAlert("제품이 수정되었습니다.");
        setEditingProductId(null);
        setEditingProductData(null);
        fetchProducts();
      }
    } catch (error) {
      showCustomAlert(error.message || "제품 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductEditCancel = () => {
    setEditingProductId(null);
    setEditingProductData(null);
  };

  const handleProductDelete = async (id) => {
    if (window.confirm("해당 제품을 삭제하시겠습니까?")) {
      setLoading(true);
      try {
        const response = await deleteProductMaster(id);
        if (response.success) {
          showCustomAlert("제품이 삭제되었습니다.");
          fetchProducts();
        }
      } catch (error) {
        showCustomAlert(error.message || "제품 삭제 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const toggleHiddenNumberDropdown = (productId) => {
    if (hiddenNumberDropdownOpen === productId) {
      setHiddenNumberDropdownOpen(null);
      setProductHiddenForm({ number: "", name: "" });
      setEditingHiddenId(null);
      setEditingHiddenData({ number: "", name: "" });
    } else {
      setHiddenNumberDropdownOpen(productId);
      setProductHiddenForm({ number: "", name: "" });
      setEditingHiddenId(null);
      setEditingHiddenData({ number: "", name: "" });
    }
  };

  const handleEditHidden = (hidden) => {
    setEditingHiddenId(hidden.id);
    setEditingHiddenData({ number: hidden.number, name: hidden.name });
  };

  const handleSaveHiddenEdit = (productId) => {
    if (!editingHiddenData.number.trim() || !editingHiddenData.name.trim()) {
      showCustomAlert("히든 번호와 이름을 모두 입력해주세요.");
      return;
    }

    setEditingProductData({
      ...editingProductData,
      hiddenNumbers: (editingProductData.hiddenNumbers || []).map((h) =>
        h.id === editingHiddenId
          ? { ...h, number: editingHiddenData.number.trim(), name: editingHiddenData.name.trim() }
          : h
      ),
    });

    setEditingHiddenId(null);
    setEditingHiddenData({ number: "", name: "" });
  };

  const handleCancelHiddenEdit = () => {
    setEditingHiddenId(null);
    setEditingHiddenData({ number: "", name: "" });
  };

  const handleAddProductHidden = (productId) => {
    if (!productHiddenForm.number.trim() || !productHiddenForm.name.trim()) {
      showCustomAlert("히든 번호와 이름을 모두 입력해주세요.");
      return;
    }

    setEditingProductData({
      ...editingProductData,
      hiddenNumbers: [
        ...(editingProductData.hiddenNumbers || []),
        { id: Date.now(), number: productHiddenForm.number.trim(), name: productHiddenForm.name.trim() },
      ],
    });

    setProductHiddenForm({ number: "", name: "" });
  };

  const handleDeleteProductHidden = (productId, hiddenId) => {
    setEditingProductData({
      ...editingProductData,
      hiddenNumbers: (editingProductData.hiddenNumbers || []).filter((h) => h.id !== hiddenId),
    });
  };

  return {
    productManagement,
    loading,
    productForm, setProductForm,
    editingProductId,
    editingProductData, setEditingProductData,
    openMenuId,
    hiddenNumberDropdownOpen,
    productHiddenForm, setProductHiddenForm,
    editingHiddenId,
    editingHiddenData, setEditingHiddenData,
    handleProductSubmit,
    handleProductEdit,
    handleProductSave,
    handleProductEditCancel,
    handleProductDelete,
    toggleMenu,
    toggleHiddenNumberDropdown,
    handleEditHidden,
    handleSaveHiddenEdit,
    handleCancelHiddenEdit,
    handleAddProductHidden,
    handleDeleteProductHidden,
    fetchProducts,
    initializeData,
    // 페이지네이션
    pagination,
    // 검색용 제품 옵션
    productOptions,
  };
}
