import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { formatNumber, parseNumber } from "../utils";
import {
  getBoxPriceList,
  getBoxPriceByIds,
  createBoxPrice,
  updateBoxPrice,
  deleteBoxPrice,
  getProductMasterList,
  uploadBoxPriceExcel,
} from "../api";
import { getMarketPlaces, getChildMarketPlaces } from "../../marketplace-admedia/api";

// 수정 중인 박스별 가격의 productId, marketPlaceId를 저장
let editingProductId = null;
let editingMarketPlaceId = null;

export function useBoxPriceTab(showCustomAlert) {
  const [boxPriceList, setBoxPriceList] = useState([]);
  const [boxPriceSelectedProduct, setBoxPriceSelectedProduct] = useState([]);
  const [boxPriceSelectedParentChannel, setBoxPriceSelectedParentChannel] = useState([]);
  const [boxPriceSelectedChannel, setBoxPriceSelectedChannel] = useState([]);
  const [boxPriceFee, setBoxPriceFee] = useState("");
  const [boxPriceMaxBox, setBoxPriceMaxBox] = useState(1);
  const [boxPricesInput, setBoxPricesInput] = useState({});
  const [hiddenPricesInput, setHiddenPricesInput] = useState({});
  const [editingBoxPriceId, setEditingBoxPriceId] = useState(null);
  const [deleteBoxPriceConfirmId, setDeleteBoxPriceConfirmId] = useState(null);
  const [expandedHiddenBoxes, setExpandedHiddenBoxes] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [parentChannelOptions, setParentChannelOptions] = useState([]);
  const [childChannelOptions, setChildChannelOptions] = useState([]);
  const [productList, setProductList] = useState([]);
  const menuRef = useRef(null);

  // 중복 업데이트 확인 모달 상태
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false);
  const [updateConfirmData, setUpdateConfirmData] = useState(null);

  // 엑셀 업로드 관련 상태
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showUploadResultModal, setShowUploadResultModal] = useState(false);
  const fileInputRef = useRef(null);
  const activeFiltersRef = useRef({}); // 마지막 검색 필터 보존 (페이지네이션 시 재사용)

  // 페이지네이션 상태
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 옵션 데이터 조회
  const fetchOptions = useCallback(async () => {
    try {
      const [marketPlacesResponse, productMastersResponse] = await Promise.all([
        getMarketPlaces(),
        getProductMasterList({ page: 1, limit: 100 }),
      ]);

      if (marketPlacesResponse.success) {
        // 부모 판매처 (parentId가 없는 것)
        const parents = marketPlacesResponse.data.filter(mp => !mp.parentId);
        setParentChannelOptions(
          parents.map((mp) => ({
            id: mp.id,
            name: mp.name,
          }))
        );

        // 모든 자식 판매처 추출 (각 부모의 fileMarketPlaces에서)
        const allChildren = [];
        marketPlacesResponse.data.forEach(mp => {
          if (mp.fileMarketPlaces && mp.fileMarketPlaces.length > 0) {
            mp.fileMarketPlaces.forEach(child => {
              allChildren.push({
                id: child.id,
                name: child.name,
                parentId: mp.id,
              });
            });
          }
        });
        setChildChannelOptions(allChildren);
      }

      if (productMastersResponse.success) {
        setProductList(productMastersResponse.data);
        setProductOptions(
          productMastersResponse.data.map((pm) => ({
            id: pm.id,
            name: pm.name,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch options:", error);
    }
  }, []);

  // 부모 판매처 선택 시 자식 판매처 목록 조회 (여러 부모 지원)
  const fetchChildChannels = useCallback(async (parentIds) => {
    if (!parentIds || parentIds.length === 0) {
      setChildChannelOptions([]);
      return;
    }

    try {
      // 여러 부모의 자식들을 모두 가져오기
      const responses = await Promise.all(
        parentIds.map(parentId => getChildMarketPlaces(parentId))
      );

      // 모든 자식 판매처를 하나의 배열로 합치기
      const allChildren = [];
      responses.forEach(response => {
        if (response.success && response.data) {
          allChildren.push(...response.data.map((child) => ({
            id: child.id,
            name: child.name,
            parentId: child.parentId,
          })));
        }
      });

      setChildChannelOptions(allChildren);
    } catch (error) {
      console.error("Failed to fetch child channels:", error);
      setChildChannelOptions([]);
    }
  }, []);

  // 박스별 가격 목록 조회 (검색 필터 지원)
  const fetchBoxPrices = useCallback(async (page = 1, searchFilters = null) => {
    // 명시적 필터가 전달된 경우에만 저장, 없으면 마지막 필터 재사용 (페이지네이션)
    if (searchFilters !== null) {
      activeFiltersRef.current = searchFilters;
    }
    const filtersToUse = activeFiltersRef.current;

    setLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      if (filtersToUse.productIds && filtersToUse.productIds.length > 0) {
        params.productIds = filtersToUse.productIds;
      }
      if (filtersToUse.marketPlaceIds && filtersToUse.marketPlaceIds.length > 0) {
        params.marketPlaceIds = filtersToUse.marketPlaceIds;
      }
      const response = await getBoxPriceList(params);
      if (response.success) {
        setBoxPriceList(response.data || []);
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
      console.error("Failed to fetch box prices:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // 탭 진입 시 데이터 로드
  const initializeData = useCallback(async () => {
    await fetchOptions();
    await fetchBoxPrices();
  }, [fetchOptions, fetchBoxPrices]);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // 선택된 제품의 히든 정보 조회 (productId로 검색)
  const getSelectedProductHiddens = (productId) => {
    if (!productId && boxPriceSelectedProduct.length === 0) return [];
    const searchId = productId || boxPriceSelectedProduct[0];
    const product = productList.find((p) => p.id === searchId);
    return product?.hiddenNumbers || [];
  };

  // 부모 판매처 선택 시 자식 목록 로드
  useEffect(() => {
    const parentId = boxPriceSelectedParentChannel[0];
    if (parentId) {
      fetchChildChannels([parentId]);
      // 부모가 변경되면 자식 선택 초기화
      setBoxPriceSelectedChannel([]);
    } else {
      setChildChannelOptions([]);
      setBoxPriceSelectedChannel([]);
    }
  }, [boxPriceSelectedParentChannel, fetchChildChannels]);

  // 선택된 제품+판매처의 기존 데이터 조회 (API 호출)
  const [existingBoxPrice, setExistingBoxPrice] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  useEffect(() => {
    const checkExistingBoxPrice = async () => {
      // 조건 체크
      if (boxPriceSelectedProduct.length === 0 || boxPriceSelectedChannel.length === 0) {
        setExistingBoxPrice(null);
        return;
      }
      if (editingBoxPriceId) {
        setExistingBoxPrice(null);
        return;
      }

      // boxPriceSelectedProduct와 boxPriceSelectedChannel은 이제 ID 배열
      const productId = boxPriceSelectedProduct[0];
      const channelId = boxPriceSelectedChannel[0];

      if (!productId || !channelId) {
        setExistingBoxPrice(null);
        return;
      }

      // API로 기존 데이터 조회
      setCheckingExisting(true);
      try {
        const response = await getBoxPriceByIds(productId, channelId);
        if (response.success && response.data) {
          setExistingBoxPrice(response.data);
        } else {
          setExistingBoxPrice(null);
        }
      } catch (error) {
        // 404 또는 데이터 없음
        setExistingBoxPrice(null);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingBoxPrice();
  }, [boxPriceSelectedProduct, boxPriceSelectedChannel, editingBoxPriceId]);

  // 기존 데이터가 있으면 입력 폼에 자동으로 채우기
  useEffect(() => {
    if (!existingBoxPrice || editingBoxPriceId) return;

    // 수수료 설정
    setBoxPriceFee(existingBoxPrice.fee?.toString() || "");

    // 일반 박스 가격에서 최대 박스 번호
    const boxPriceMaxNum = existingBoxPrice.boxPrices.length > 0
      ? Math.max(...existingBoxPrice.boxPrices.map((bp) => bp.boxCount))
      : 1;

    // 히든 가격에서 최대 박스 번호 (키 형식: "박스번호_히든번호")
    const hiddenBoxNums = Object.keys(existingBoxPrice.hiddenPrices || {})
      .map(key => parseInt(key.split('_')[0], 10))
      .filter(num => !isNaN(num));
    const hiddenPriceMaxNum = hiddenBoxNums.length > 0 ? Math.max(...hiddenBoxNums) : 0;

    // 둘 중 큰 값으로 박스 개수 설정
    const maxBox = Math.max(boxPriceMaxNum, hiddenPriceMaxNum, 1);
    setBoxPriceMaxBox(maxBox);

    const boxPricesData = {};
    existingBoxPrice.boxPrices.forEach((bp) => {
      boxPricesData[bp.boxCount] = {
        price: formatNumber(bp.price.toString()),
        shippingFee: formatNumber(bp.shippingFee.toString()),
      };
    });
    setBoxPricesInput(boxPricesData);

    // 히든 가격 데이터 설정
    // API 키 형식: "박스번호_히든번호" 또는 "박스번호_히든이름" → UI 키 형식: "박스번호_히든이름"으로 변환
    const hiddenPricesData = {};
    if (existingBoxPrice.hiddenPrices) {
      const productHiddens = getSelectedProductHiddens(existingBoxPrice.productId);

      Object.entries(existingBoxPrice.hiddenPrices).forEach(([key, value]) => {
        const [boxNumStr, hiddenIdentifier] = key.split('_');

        // 1. 먼저 히든 이름으로 찾기 (새로운 형식: "1_영어")
        let hiddenInfo = productHiddens.find(h => h.name === hiddenIdentifier);

        // 2. 없으면 히든 번호로 찾기 (이전 형식: "1_23")
        if (!hiddenInfo) {
          hiddenInfo = productHiddens.find(h => String(h.number) === hiddenIdentifier);
        }

        if (hiddenInfo) {
          // UI에서 사용하는 키 형식으로 변환: "박스번호_히든이름"
          const uiKey = `${boxNumStr}_${hiddenInfo.name}`;
          hiddenPricesData[uiKey] = {
            price: formatNumber(value.price.toString()),
            shippingFee: formatNumber(value.shippingFee.toString()),
          };
        }
      });
    }
    setHiddenPricesInput(hiddenPricesData);
  }, [existingBoxPrice, editingBoxPriceId, productList]);

  // 변경 비교 데이터 생성
  const generateChangeComparison = useCallback(() => {
    if (!existingBoxPrice) return null;

    const newBoxPrices = collectBoxPrices();
    const newHiddenPrices = collectHiddenPrices();
    const newFee = parseFloat(boxPriceFee) || 0;

    const changes = {
      fee: null,
      boxPrices: [],
      hiddenPrices: [],
    };

    // 수수료 변경 체크
    if (existingBoxPrice.fee !== newFee) {
      changes.fee = {
        oldValue: existingBoxPrice.fee || 0,
        newValue: newFee,
      };
    }

    // 박스별 가격 변경 체크
    const existingBoxMap = {};
    existingBoxPrice.boxPrices.forEach((bp) => {
      existingBoxMap[bp.boxCount] = bp;
    });

    newBoxPrices.forEach((newBp) => {
      const existingBp = existingBoxMap[newBp.boxCount];
      if (!existingBp) {
        // 새로 추가되는 박스
        changes.boxPrices.push({
          boxCount: newBp.boxCount,
          oldPrice: 0,
          newPrice: newBp.price,
          oldShippingFee: 0,
          newShippingFee: newBp.shippingFee,
          isNew: true,
        });
      } else if (existingBp.price !== newBp.price || existingBp.shippingFee !== newBp.shippingFee) {
        // 변경된 박스
        changes.boxPrices.push({
          boxCount: newBp.boxCount,
          oldPrice: existingBp.price,
          newPrice: newBp.price,
          oldShippingFee: existingBp.shippingFee,
          newShippingFee: newBp.shippingFee,
          isNew: false,
        });
      }
    });

    // 히든별 가격 변경 체크 (키 형식을 "박스번호_히든이름"으로 정규화)
    const productHiddens = getSelectedProductHiddens(existingBoxPrice.productId);
    const normalizedExistingHiddenMap = {};

    // 기존 데이터의 키를 정규화 (DB 형식: "박스번호_히든이름")
    Object.entries(existingBoxPrice.hiddenPrices || {}).forEach(([key, value]) => {
      const [boxNumStr, hiddenIdentifier] = key.split('_');
      // 히든 번호로 저장된 경우 이름으로 변환
      let hiddenInfo = productHiddens.find(h => h.name === hiddenIdentifier);
      if (!hiddenInfo) {
        hiddenInfo = productHiddens.find(h => String(h.number) === hiddenIdentifier);
      }
      // 통일된 키 형식: "박스번호_히든이름"
      const normalizedKey = hiddenInfo ? `${boxNumStr}_${hiddenInfo.name}` : key;
      normalizedExistingHiddenMap[normalizedKey] = value;
    });

    Object.entries(newHiddenPrices).forEach(([key, newHp]) => {
      const existingHp = normalizedExistingHiddenMap[key];
      if (!existingHp) {
        // 새로 추가되는 히든
        changes.hiddenPrices.push({
          key,
          oldPrice: 0,
          newPrice: newHp.price,
          oldShippingFee: 0,
          newShippingFee: newHp.shippingFee,
          isNew: true,
        });
      } else if (existingHp.price !== newHp.price || existingHp.shippingFee !== newHp.shippingFee) {
        // 변경된 히든
        changes.hiddenPrices.push({
          key,
          oldPrice: existingHp.price,
          newPrice: newHp.price,
          oldShippingFee: existingHp.shippingFee,
          newShippingFee: newHp.shippingFee,
          isNew: false,
        });
      }
    });

    return changes;
  }, [existingBoxPrice, boxPriceFee, boxPricesInput, hiddenPricesInput, boxPriceMaxBox]);

  const resetBoxPriceForm = () => {
    setBoxPriceSelectedProduct([]);
    setBoxPriceSelectedParentChannel([]);
    setBoxPriceSelectedChannel([]);
    setChildChannelOptions([]);
    setBoxPriceFee("");
    setBoxPriceMaxBox(1);
    setBoxPricesInput({});
    setHiddenPricesInput({});
    setExpandedHiddenBoxes({});
  };

  const handleBoxPriceInputChange = (boxNum, field, value) => {
    setBoxPricesInput((prev) => ({
      ...prev,
      [boxNum]: { ...(prev[boxNum] || { price: "", shippingFee: "" }), [field]: formatNumber(value) },
    }));
  };

  const handleHiddenPriceInputChange = (boxNum, hiddenName, field, value) => {
    const key = `${boxNum}_${hiddenName}`;
    setHiddenPricesInput((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { price: "", shippingFee: "" }), [field]: formatNumber(value) },
    }));
  };

  const handleAddBoxRow = () => {
    if (boxPriceMaxBox < 20) setBoxPriceMaxBox(boxPriceMaxBox + 1);
  };

  const handleRemoveBoxRow = () => {
    if (boxPriceMaxBox > 1) {
      const newBoxPrices = { ...boxPricesInput };
      delete newBoxPrices[boxPriceMaxBox];
      setBoxPricesInput(newBoxPrices);

      const newHiddenPrices = { ...hiddenPricesInput };
      Object.keys(newHiddenPrices).forEach((key) => {
        if (key.startsWith(`${boxPriceMaxBox}_`)) delete newHiddenPrices[key];
      });
      setHiddenPricesInput(newHiddenPrices);

      const newExpanded = { ...expandedHiddenBoxes };
      delete newExpanded[boxPriceMaxBox];
      setExpandedHiddenBoxes(newExpanded);

      setBoxPriceMaxBox(boxPriceMaxBox - 1);
    }
  };

  const collectBoxPrices = () => {
    const filledBoxPrices = [];
    for (let i = 1; i <= boxPriceMaxBox; i++) {
      const box = boxPricesInput[i];
      // boxPricesInput에 항목이 있는 박스만 포함 (빈 값은 0원으로 처리)
      if (box) {
        const priceNum = parseFloat(parseNumber(box.price ?? "")) || 0;
        const shippingNum = parseFloat(parseNumber(box.shippingFee ?? "")) || 0;
        filledBoxPrices.push({ boxCount: i, price: priceNum, shippingFee: shippingNum });
      }
    }
    return filledBoxPrices;
  };

  const collectHiddenPrices = () => {
    const collectedHiddenPrices = {};
    const productHiddens = getSelectedProductHiddens();

    Object.entries(hiddenPricesInput).forEach(([key, value]) => {
      const priceNum = parseFloat(parseNumber(value?.price)) || 0;
      const shippingNum = parseFloat(parseNumber(value?.shippingFee)) || 0;
      if (value && priceNum > 0) {
        const parts = key.split("_");
        const boxCountStr = parts[0];
        const hiddenName = parts.slice(1).join("_");
        const hiddenInfo = productHiddens.find((h) => h.name === hiddenName);

        // API 저장용 키: "박스번호_히든이름" 형식으로 통일 (DB 저장 형식과 일치)
        const apiKey = `${boxCountStr}_${hiddenName}`;
        collectedHiddenPrices[apiKey] = {
          hiddenNumber: hiddenInfo?.number || "",
          hiddenName: hiddenName,
          price: priceNum,
          shippingFee: shippingNum,
        };
      }
    });
    return collectedHiddenPrices;
  };

  const handleBoxPriceSubmit = async () => {
    if (boxPriceSelectedProduct.length === 0) {
      showCustomAlert("제품을 선택해주세요.");
      return;
    }
    if (boxPriceSelectedChannel.length === 0) {
      showCustomAlert("판매처를 선택해주세요.");
      return;
    }

    const filledBoxPrices = collectBoxPrices();
    if (filledBoxPrices.length === 0) {
      showCustomAlert("최소 1개 박스의 가격을 입력해주세요.");
      return;
    }

    // boxPriceSelectedProduct와 boxPriceSelectedChannel은 이제 ID 배열
    const productId = boxPriceSelectedProduct[0];
    const channelId = boxPriceSelectedChannel[0];
    const selectedProductObj = productOptions.find((p) => p.id === productId);
    const selectedChannelObj = childChannelOptions.find((c) => c.id === channelId);

    if (!productId || !channelId) {
      showCustomAlert("제품 또는 판매처 정보를 찾을 수 없습니다.");
      return;
    }

    // 중복 데이터가 있는 경우 확인 모달 표시
    if (existingBoxPrice) {
      const changes = generateChangeComparison();
      setUpdateConfirmData({
        productId: productId,
        productName: selectedProductObj?.name || '',
        marketPlaceId: channelId,
        marketPlaceName: selectedChannelObj?.name || '',
        changes,
        newData: {
          fee: parseFloat(boxPriceFee) || 0,
          boxPrices: filledBoxPrices,
          hiddenPrices: collectHiddenPrices(),
        },
      });
      setShowUpdateConfirmModal(true);
      return;
    }

    // 새로 등록
    setLoading(true);
    try {
      const response = await createBoxPrice({
        productId: productId,
        marketPlaceId: channelId,
        fee: parseFloat(boxPriceFee) || 0,
        boxPrices: filledBoxPrices,
        hiddenPrices: collectHiddenPrices(),
      });

      if (response.success) {
        showCustomAlert("박스별 가격이 등록되었습니다.");
        resetBoxPriceForm();
        fetchBoxPrices(pagination.page);
      }
    } catch (error) {
      showCustomAlert(error.message || "박스별 가격 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 중복 업데이트 확인 후 실제 업데이트 실행
  const confirmUpdateExisting = async () => {
    if (!updateConfirmData || !existingBoxPrice) return;

    // 기존 데이터와 새 데이터 병합
    const mergedBoxPrices = [...existingBoxPrice.boxPrices];
    updateConfirmData.newData.boxPrices.forEach((newBp) => {
      const existingIndex = mergedBoxPrices.findIndex((bp) => bp.boxCount === newBp.boxCount);
      if (existingIndex >= 0) {
        mergedBoxPrices[existingIndex] = newBp; // 기존 값 덮어쓰기
      } else {
        mergedBoxPrices.push(newBp); // 새로 추가
      }
    });
    mergedBoxPrices.sort((a, b) => a.boxCount - b.boxCount);

    // 히든 가격도 병합 (키 형식을 "박스번호_히든이름"으로 통일)
    const productHiddens = getSelectedProductHiddens(existingBoxPrice.productId);
    const mergedHiddenPrices = {};

    // 기존 데이터의 키를 "박스번호_히든이름" 형식으로 변환
    Object.entries(existingBoxPrice.hiddenPrices || {}).forEach(([key, value]) => {
      const [boxNumStr, hiddenIdentifier] = key.split('_');
      // 히든 이름 또는 번호로 찾기
      let hiddenInfo = productHiddens.find(h => h.name === hiddenIdentifier);
      if (!hiddenInfo) {
        hiddenInfo = productHiddens.find(h => String(h.number) === hiddenIdentifier);
      }
      // 통일된 키 형식으로 저장: "박스번호_히든이름"
      const normalizedKey = hiddenInfo ? `${boxNumStr}_${hiddenInfo.name}` : key;
      mergedHiddenPrices[normalizedKey] = value;
    });

    // 새 데이터 병합 (이미 "박스번호_히든이름" 형식)
    Object.entries(updateConfirmData.newData.hiddenPrices || {}).forEach(([key, value]) => {
      mergedHiddenPrices[key] = value;
    });

    setLoading(true);
    try {
      const response = await updateBoxPrice(
        updateConfirmData.productId,
        updateConfirmData.marketPlaceId,
        {
          fee: updateConfirmData.newData.fee,
          boxPrices: mergedBoxPrices,
          hiddenPrices: mergedHiddenPrices,
        }
      );

      if (response.success) {
        showCustomAlert("박스별 가격이 업데이트되었습니다.");
        resetBoxPriceForm();
        fetchBoxPrices(pagination.page);
      }
    } catch (error) {
      showCustomAlert(error.message || "박스별 가격 업데이트에 실패했습니다.");
    } finally {
      setLoading(false);
      setShowUpdateConfirmModal(false);
      setUpdateConfirmData(null);
    }
  };

  // 중복 업데이트 취소
  const cancelUpdateExisting = () => {
    setShowUpdateConfirmModal(false);
    setUpdateConfirmData(null);
  };

  // 엑셀 업로드 핸들러
  const handleExcelUpload = async (file) => {
    if (!file) return;

    // 파일 확장자 검사
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      showCustomAlert('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadBoxPriceExcel(file);
      setUploadResult(result);
      setShowUploadResultModal(true);

      if (result.success) {
        // 성공 시 목록 새로고침
        fetchBoxPrices(pagination.page);
      }
    } catch (error) {
      setUploadResult({
        success: false,
        data: null,
        msg: error.message || '엑셀 업로드 중 오류가 발생했습니다.',
      });
      setShowUploadResultModal(true);
    } finally {
      setIsUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 업로드 결과 모달 닫기
  const closeUploadResultModal = () => {
    setShowUploadResultModal(false);
    setUploadResult(null);
  };

  const handleBoxPriceSave = async () => {
    const filledBoxPrices = collectBoxPrices();
    if (filledBoxPrices.length === 0) {
      showCustomAlert("최소 1개 박스의 가격을 입력해주세요.");
      return;
    }

    if (!editingProductId || !editingMarketPlaceId) {
      showCustomAlert("수정할 대상을 찾을 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      const response = await updateBoxPrice(editingProductId, editingMarketPlaceId, {
        fee: parseFloat(boxPriceFee) || 0,
        boxPrices: filledBoxPrices,
        hiddenPrices: collectHiddenPrices(),
      });

      if (response.success) {
        showCustomAlert("박스별 가격이 수정되었습니다.");
        setEditingBoxPriceId(null);
        editingProductId = null;
        editingMarketPlaceId = null;
        resetBoxPriceForm();
        fetchBoxPrices(pagination.page);
      }
    } catch (error) {
      showCustomAlert(error.message || "박스별 가격 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleBoxPriceEditCancel = () => {
    setEditingBoxPriceId(null);
    editingProductId = null;
    editingMarketPlaceId = null;
    resetBoxPriceForm();
  };

  // deleteBoxPriceConfirmId는 이제 {productId, marketPlaceId} 객체를 저장
  const handleBoxPriceDelete = (item) => setDeleteBoxPriceConfirmId({
    productId: item.productId,
    marketPlaceId: item.marketPlaceId,
  });

  const confirmBoxPriceDelete = async () => {
    if (!deleteBoxPriceConfirmId) return;

    const { productId, marketPlaceId } = deleteBoxPriceConfirmId;

    setLoading(true);
    try {
      const response = await deleteBoxPrice(productId, marketPlaceId);
      if (response.success) {
        showCustomAlert("박스별 가격이 삭제되었습니다.");
        fetchBoxPrices(pagination.page);
      }
    } catch (error) {
      showCustomAlert(error.message || "박스별 가격 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
      setDeleteBoxPriceConfirmId(null);
    }
  };

  // 수정 모드로 전환
  const handleBoxPriceEdit = async (item) => {
    setEditingBoxPriceId(`${item.productId}_${item.marketPlaceId}`);
    editingProductId = item.productId;
    editingMarketPlaceId = item.marketPlaceId;
    // ID로 선택 상태 설정
    setBoxPriceSelectedProduct([item.productId]);

    // parentId가 있으면 부모-자식 구조로 설정
    if (item.parentId) {
      setBoxPriceSelectedParentChannel([item.parentId]);
      // 자식 목록 로드 후 선택
      await fetchChildChannels([item.parentId]);
      setBoxPriceSelectedChannel([item.marketPlaceId]);
    } else {
      // 기존 데이터 (부모만 있는 경우)
      setBoxPriceSelectedParentChannel([item.marketPlaceId]);
      setBoxPriceSelectedChannel([]);
    }

    setBoxPriceFee(item.fee?.toString() || "");

    // 박스 가격 데이터 설정
    const maxBox = Math.max(...item.boxPrices.map((bp) => bp.boxCount), 1);
    setBoxPriceMaxBox(maxBox);

    const boxPricesData = {};
    item.boxPrices.forEach((bp) => {
      boxPricesData[bp.boxCount] = {
        price: formatNumber(bp.price.toString()),
        shippingFee: formatNumber(bp.shippingFee.toString()),
      };
    });
    setBoxPricesInput(boxPricesData);

    // 히든 가격 데이터 설정 (구 형식 숫자 키/신 형식 이름 키 모두 UI 이름 형식으로 변환)
    const hiddenPricesData = {};
    if (item.hiddenPrices) {
      const productHiddens = getSelectedProductHiddens(item.productId);
      Object.entries(item.hiddenPrices).forEach(([key, value]) => {
        const parts = key.split('_');
        const boxNumStr = parts[0];
        const hiddenIdentifier = parts.slice(1).join('_');

        let hiddenInfo = productHiddens.find(h => h.name === hiddenIdentifier);
        if (!hiddenInfo) {
          hiddenInfo = productHiddens.find(h => String(h.number) === hiddenIdentifier);
        }

        const uiKey = hiddenInfo ? `${boxNumStr}_${hiddenInfo.name}` : key;
        hiddenPricesData[uiKey] = {
          price: formatNumber(value.price.toString()),
          shippingFee: formatNumber(value.shippingFee.toString()),
        };
      });
    }
    setHiddenPricesInput(hiddenPricesData);
  };

  return {
    boxPriceList,
    setBoxPriceList,
    boxPriceSelectedProduct,
    setBoxPriceSelectedProduct,
    boxPriceSelectedParentChannel,
    setBoxPriceSelectedParentChannel,
    boxPriceSelectedChannel,
    setBoxPriceSelectedChannel,
    boxPriceFee,
    setBoxPriceFee,
    boxPriceMaxBox,
    boxPricesInput,
    hiddenPricesInput,
    setHiddenPricesInput,
    editingBoxPriceId,
    deleteBoxPriceConfirmId,
    setDeleteBoxPriceConfirmId,
    expandedHiddenBoxes,
    setExpandedHiddenBoxes,
    openMenuId,
    menuRef,
    loading,
    productOptions,
    parentChannelOptions,
    childChannelOptions,
    fetchChildChannels,
    toggleMenu,
    getSelectedProductHiddens,
    handleBoxPriceInputChange,
    handleHiddenPriceInputChange,
    handleAddBoxRow,
    handleRemoveBoxRow,
    handleBoxPriceSubmit,
    handleBoxPriceSave,
    handleBoxPriceEditCancel,
    handleBoxPriceDelete,
    confirmBoxPriceDelete,
    handleBoxPriceEdit,
    fetchBoxPrices,
    initializeData,
    // 중복 체크 관련
    existingBoxPrice,
    checkingExisting,
    showUpdateConfirmModal,
    setShowUpdateConfirmModal,
    updateConfirmData,
    confirmUpdateExisting,
    cancelUpdateExisting,
    // 페이지네이션
    pagination,
    // 엑셀 업로드 관련
    isUploading,
    uploadResult,
    showUploadResultModal,
    fileInputRef,
    handleExcelUpload,
    closeUploadResultModal,
    // 제품 목록 (히든 정보 포함)
    productList,
  };
}
