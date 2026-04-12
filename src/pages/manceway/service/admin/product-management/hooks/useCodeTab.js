import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getProductCodes, createProductCode, deleteProductCode, updateProductCode, getBoxPriceByIds } from "../api";
import { getMarketPlaces, getProductMasters, getChildMarketPlaces } from "../../marketplace-admedia/api";

export function useCodeTab(showCustomAlert, boxPriceList = []) {
  const [code, setCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedParentChannel, setSelectedParentChannel] = useState([]); // 부모 판매처
  const [selectedChannels, setSelectedChannels] = useState([]); // 자식 판매처
  const [selectedBoxCount, setSelectedBoxCount] = useState([]);
  const [codeList, setCodeList] = useState([]);
  const [codeSearchQuery, setCodeSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parentChannelOptions, setParentChannelOptions] = useState([]); // 부모 판매처 옵션
  const [channelOptions, setChannelOptions] = useState([]); // 자식 판매처 옵션
  const [productOptions, setProductOptions] = useState([]);
  const [fetchedBoxPrice, setFetchedBoxPrice] = useState(null); // API로 조회한 boxPrice
  const [isFetchingBoxPrice, setIsFetchingBoxPrice] = useState(false); // boxPrice 조회 중
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const menuRef = useRef(null);

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

  // 판매처 및 제품 목록 조회
  const fetchOptions = useCallback(async () => {
    try {
      const [marketPlacesResponse, productMastersResponse] = await Promise.all([
        getMarketPlaces(),
        getProductMasters(),
      ]);

      if (marketPlacesResponse.success) {
        // 부모 판매처만 필터링 (parentId가 없는 것)
        setParentChannelOptions(marketPlacesResponse.data.map((mp) => ({
          id: mp.id,
          name: mp.name,
        })));
      }

      if (productMastersResponse.success) {
        setProductOptions(productMastersResponse.data.map((pm) => ({
          id: pm.id,
          name: pm.name,
        })));
      }
    } catch (error) {
      console.error("Failed to fetch options:", error);
    }
  }, []);

  // 제품 코드 목록 조회 (검색 필터 지원)
  const fetchProductCodes = useCallback(async (page = 1, searchFilters = {}) => {
    setIsLoading(true);
    try {
      const params = { page, limit: pagination.limit };
      if (searchFilters.textSearch) {
        params.textSearch = searchFilters.textSearch;
      }
      if (searchFilters.productIds && searchFilters.productIds.length > 0) {
        params.productIds = searchFilters.productIds;
      }
      if (searchFilters.marketPlaceIds && searchFilters.marketPlaceIds.length > 0) {
        params.marketPlaceIds = searchFilters.marketPlaceIds;
      }
      const response = await getProductCodes(params);
      if (response.success) {
        const formattedData = response.data.map((item) => ({
          code: item.code,
          productId: item.productId,
          product: item.productName,
          channels: item.channels.map((c) => c.name),
          channelIds: item.channels.map((c) => c.marketPlaceId),
          channelDetails: item.channels.map((c) => ({
            id: c.id,
            marketPlaceId: c.marketPlaceId,
            name: c.name,
            parentId: c.parentId,
            parentName: c.parentName,
          })),
          boxCount: item.boxCount,
          registeredDate: item.registeredDate,
          lastModifiedDate: item.modifiedDate,
        }));
        setCodeList(formattedData);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch product codes:", error);
      showCustomAlert("제품 코드 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, showCustomAlert]);

  // 탭 진입 시 데이터 로드
  const initializeData = useCallback(async () => {
    await fetchOptions();
    await fetchProductCodes();
  }, [fetchOptions, fetchProductCodes]);

  // 부모 판매처 선택 시 자식 판매처 조회
  useEffect(() => {
    const fetchChildChannels = async () => {
      if (selectedParentChannel.length === 0) {
        setChannelOptions([]);
        setSelectedChannels([]);
        return;
      }

      try {
        const parentId = selectedParentChannel[0];
        const response = await getChildMarketPlaces(parentId);

        if (response.success && response.data) {
          setChannelOptions(response.data.map((child) => ({
            id: child.id,
            name: child.name,
            parentId: child.parentId,
            parentName: child.parentName,
          })));
        } else {
          setChannelOptions([]);
        }
        // 부모 판매처가 변경되면 자식 판매처 선택 초기화
        setSelectedChannels([]);
      } catch (error) {
        console.error("Failed to fetch child marketplaces:", error);
        setChannelOptions([]);
        setSelectedChannels([]);
      }
    };

    fetchChildChannels();
  }, [selectedParentChannel]);

  // selectedChannels(ID 배열)를 객체 배열로 변환
  const selectedChannelObjects = useMemo(() => {
    return selectedChannels.map((channelId) => {
      const channelObj = channelOptions.find((c) => c.id === channelId);
      return channelObj || { id: channelId, name: String(channelId) };
    });
  }, [selectedChannels, channelOptions]);

  // 제품+판매처 선택 시 API로 boxPrice 조회
  useEffect(() => {
    const fetchBoxPrice = async () => {
      if (selectedProduct.length === 0 || selectedChannels.length === 0) {
        setFetchedBoxPrice(null);
        return;
      }

      const productId = selectedProduct[0];
      const channelId = selectedChannels[0];

      setIsFetchingBoxPrice(true);
      try {
        const response = await getBoxPriceByIds(productId, channelId);
        if (response.success && response.data) {
          setFetchedBoxPrice(response.data);
        } else {
          setFetchedBoxPrice(null);
        }
      } catch (error) {
        // 404 또는 데이터 없음
        setFetchedBoxPrice(null);
      } finally {
        setIsFetchingBoxPrice(false);
      }
    };

    fetchBoxPrice();
  }, [selectedProduct, selectedChannels]);

  // 선택한 제품+판매처에 대해 DB에 등록된 박스갯수 옵션 및 가격 정보 계산
  const availableBoxCounts = useMemo(() => {
    if (selectedProduct.length === 0 || selectedParentChannel.length === 0 || selectedChannels.length === 0) {
      return { options: [], channelPrices: {}, registeredChannels: [], isLoading: isFetchingBoxPrice };
    }

    // selectedChannels는 이제 자식 판매처 ID 배열
    const selectedChannelId = selectedChannels[0];
    const selectedChannelObj = channelOptions.find((c) => c.id === selectedChannelId);
    const selectedChannelName = selectedChannelObj?.name;
    const parentChannelName = selectedChannelObj?.parentName;

    const channelPrices = {}; // 판매처별 가격 정보
    const allBoxCounts = new Set();
    const registeredChannels = []; // 가격이 등록된 판매처 목록

    // API로 조회한 boxPrice 사용 (fetchedBoxPrice)
    if (fetchedBoxPrice) {
      // 일반 박스 가격에서 박스갯수 추출
      if (fetchedBoxPrice.boxPrices && fetchedBoxPrice.boxPrices.length > 0) {
        const counts = fetchedBoxPrice.boxPrices.map((bp) => bp.boxCount);
        counts.forEach((c) => allBoxCounts.add(c));
      }

      // 히든 가격에서도 박스갯수 추출 (키 형식: "6_GFA", "6_메타" 등)
      if (fetchedBoxPrice.hiddenPrices && typeof fetchedBoxPrice.hiddenPrices === 'object') {
        Object.keys(fetchedBoxPrice.hiddenPrices).forEach((key) => {
          const boxCount = parseInt(key.split('_')[0], 10);
          if (!isNaN(boxCount)) {
            allBoxCounts.add(boxCount);
          }
        });
      }

      // 가격 정보 저장 (부모-자식 이름 조합)
      if (allBoxCounts.size > 0) {
        const displayName = parentChannelName ? `${parentChannelName} > ${selectedChannelName}` : selectedChannelName;
        channelPrices[displayName] = {
          channelId: selectedChannelId,
          fee: fetchedBoxPrice.fee || 0,
          boxPrices: fetchedBoxPrice.boxPrices || [],
          hiddenPrices: fetchedBoxPrice.hiddenPrices || {},
        };

        registeredChannels.push({
          id: selectedChannelId,
          name: displayName,
        });
      }
    }

    // 박스갯수 옵션 생성 (정렬)
    const options = Array.from(allBoxCounts)
      .sort((a, b) => a - b)
      .map((count) => ({
        id: count,
        name: `${count}`,
      }));

    return { options, channelPrices, registeredChannels, isLoading: isFetchingBoxPrice };
  }, [selectedProduct, selectedParentChannel, selectedChannels, fetchedBoxPrice, isFetchingBoxPrice, channelOptions]);

  // 선택한 박스갯수에 해당하는 판매처별 가격 정보
  const selectedBoxPriceInfo = useMemo(() => {
    if (selectedBoxCount.length === 0 || !availableBoxCounts.channelPrices) {
      return null;
    }

    const boxCount = parseInt(selectedBoxCount[0], 10);
    const result = {};

    // 등록된 모든 판매처에 대해 가격 정보 조회
    Object.entries(availableBoxCounts.channelPrices).forEach(([channelName, priceInfo]) => {
      if (priceInfo) {
        const boxPrice = priceInfo.boxPrices?.find((bp) => bp.boxCount === boxCount);

        // 히든 가격 파싱 (일반 가격 유무와 무관하게)
        const hiddenPricesForBox = [];
        if (priceInfo.hiddenPrices && typeof priceInfo.hiddenPrices === 'object') {
          Object.entries(priceInfo.hiddenPrices).forEach(([key, val]) => {
            const parts = key.split('_');
            const keyBoxCount = parseInt(parts[0], 10);
            const hiddenName = parts.slice(1).join('_');
            if (keyBoxCount === boxCount) {
              hiddenPricesForBox.push({
                hiddenName,
                price: val.price,
                shippingFee: val.shippingFee,
              });
            }
          });
        }

        // 일반 가격 또는 히든 가격 중 하나라도 있으면 결과에 추가
        if (boxPrice || hiddenPricesForBox.length > 0) {
          result[channelName] = {
            channelId: priceInfo.channelId,
            price: boxPrice?.price ?? null,
            shippingFee: boxPrice?.shippingFee ?? null,
            fee: priceInfo.fee,
            hiddenPrices: hiddenPricesForBox,
          };
        }
      }
    });

    return result;
  }, [selectedBoxCount, availableBoxCounts.channelPrices]);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleRegisterCode = async () => {
    if (!code.trim()) {
      showCustomAlert("코드를 입력해주세요.");
      return;
    }
    if (selectedProduct.length === 0) {
      showCustomAlert("제품을 선택해주세요.");
      return;
    }
    if (selectedChannels.length === 0) {
      showCustomAlert("판매처를 선택해주세요.");
      return;
    }
    if (selectedBoxCount.length === 0) {
      showCustomAlert("박스갯수를 선택해주세요.");
      return;
    }

    // selectedProduct와 selectedChannels는 이제 ID 배열
    const productId = selectedProduct[0];
    const selectedProductObj = productOptions.find((p) => p.id === productId);
    if (!selectedProductObj) {
      showCustomAlert("제품 정보를 찾을 수 없습니다.");
      return;
    }

    const channelId = selectedChannels[0];
    const selectedChannelObj = channelOptions.find((c) => c.id === channelId);
    if (!selectedChannelObj) {
      showCustomAlert("판매처 정보를 찾을 수 없습니다.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createProductCode({
        code: code.trim(),
        productId: productId,
        boxCount: parseInt(selectedBoxCount[0], 10),
        channels: [{
          marketPlaceId: channelId,
        }],
      });

      if (response.success) {
        showCustomAlert("코드가 성공적으로 등록되었습니다.");
        setCode("");
        setSelectedProduct([]);
        setSelectedChannels([]);
        setSelectedBoxCount([]);
        // 목록 새로고침
        fetchProductCodes(1);
      }
    } catch (error) {
      showCustomAlert(error.message || "코드 등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCode = (item) => {
    setDeleteConfirmId(item);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    setIsLoading(true);
    try {
      const response = await deleteProductCode(deleteConfirmId.code, deleteConfirmId.boxCount);
      if (response.success) {
        showCustomAlert("코드가 성공적으로 삭제되었습니다.");
        // 목록 새로고침
        fetchProductCodes(pagination.page);
      }
    } catch (error) {
      showCustomAlert(error.message || "코드 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
      setDeleteConfirmId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProductCodes(newPage);
    }
  };

  // 코드에 판매처 추가 (상세 모달에서)
  const addChannelToCode = async (codeData, channelId, channelName) => {
    setIsLoading(true);
    try {
      // 기존 채널 목록에 새 채널 추가 (ID만 전달, 이름은 백엔드에서 조회)
      const updatedChannels = [
        ...codeData.channelIds.map((id) => ({
          marketPlaceId: id,
        })),
        {
          marketPlaceId: channelId,
        },
      ];

      const response = await updateProductCode(codeData.code, {
        channels: updatedChannels,
        currentBoxCount: codeData.boxCount,
      });

      if (response.success) {
        showCustomAlert(`${channelName} 판매처가 추가되었습니다.`);
        // 목록 새로고침
        await fetchProductCodes(pagination.page);
        return true;
      }
      return false;
    } catch (error) {
      showCustomAlert(error.message || "판매처 추가에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 코드에서 판매처 삭제 (상세 모달에서)
  const removeChannelFromCode = async (codeData, channelId, channelName) => {
    // 판매처가 1개만 남은 경우 삭제 불가
    if (codeData.channelIds.length <= 1) {
      showCustomAlert("최소 1개의 판매처가 필요합니다.");
      return false;
    }

    setIsLoading(true);
    try {
      // 삭제할 채널을 제외한 목록 (ID만 전달, 이름은 백엔드에서 조회)
      const updatedChannels = codeData.channelIds
        .filter((id) => id !== channelId)
        .map((id) => ({
          marketPlaceId: id,
        }));

      const response = await updateProductCode(codeData.code, {
        channels: updatedChannels,
        currentBoxCount: codeData.boxCount,
      });

      if (response.success) {
        showCustomAlert(`${channelName} 판매처가 삭제되었습니다.`);
        // 목록 새로고침
        await fetchProductCodes(pagination.page);
        return true;
      }
      return false;
    } catch (error) {
      showCustomAlert(error.message || "판매처 삭제에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 제품 선택 시 모든 판매처, 박스갯수 초기화
  const handleProductChange = (values) => {
    setSelectedProduct(values);
    setSelectedParentChannel([]);
    setSelectedChannels([]);
    setSelectedBoxCount([]);
  };

  // 부모 판매처 선택 시 자식 판매처, 박스갯수 초기화
  const handleParentChannelChange = (values) => {
    setSelectedParentChannel(values);
    setSelectedChannels([]);
    setSelectedBoxCount([]);
  };

  // 자식 판매처 선택 시 박스갯수 초기화
  const handleChannelsChange = (values) => {
    setSelectedChannels(values);
    setSelectedBoxCount([]);
  };

  return {
    code, setCode,
    selectedProduct, setSelectedProduct: handleProductChange,
    selectedParentChannel, setSelectedParentChannel: handleParentChannelChange,
    selectedChannels, setSelectedChannels: handleChannelsChange,
    selectedChannelObjects,
    selectedBoxCount, setSelectedBoxCount,
    codeList,
    codeSearchQuery, setCodeSearchQuery,
    deleteConfirmId, setDeleteConfirmId,
    openMenuId,
    menuRef,
    toggleMenu,
    handleRegisterCode,
    handleDeleteCode,
    confirmDelete,
    isLoading,
    pagination,
    handlePageChange,
    fetchProductCodes,
    parentChannelOptions,
    channelOptions,
    productOptions,
    availableBoxCounts,
    selectedBoxPriceInfo,
    initializeData,
    addChannelToCode,
    removeChannelFromCode,
  };
}
