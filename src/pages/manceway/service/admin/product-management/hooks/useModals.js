import { useState, useCallback } from "react";
import { formatNumber, parseNumber, onlyNumbers } from "../utils";
import { getBoxPriceHistory, updateBoxPriceHistory, deleteBoxPriceHistory, updateBoxPrice, getBoxPricesByProduct } from "../api";

export function useModals(showCustomAlert, boxPriceList, setBoxPriceList, productList = []) {
  // 코드 상세 모달
  const [showCodeDetailModal, setShowCodeDetailModal] = useState(false);
  const [selectedCodeForDetail, setSelectedCodeForDetail] = useState(null);
  const [productBoxPrices, setProductBoxPrices] = useState([]); // 해당 제품의 박스별 가격 목록

  // 박스별 가격 상세 모달
  const [showBoxPriceDetailModal, setShowBoxPriceDetailModal] = useState(false);
  const [selectedBoxPriceForDetail, setSelectedBoxPriceForDetail] = useState(null);
  const [isDetailEditMode, setIsDetailEditMode] = useState(false);
  const [detailEditData, setDetailEditData] = useState(null);

  // 가격 히스토리 모달
  const [showPriceHistoryModal, setShowPriceHistoryModal] = useState(false);
  const [selectedPriceHistory, setSelectedPriceHistory] = useState(null);
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [editingHistoryData, setEditingHistoryData] = useState(null);
  const [expandedHistoryIds, setExpandedHistoryIds] = useState([]);
  const [isEditingMarketPlace, setIsEditingMarketPlace] = useState(false);
  const [newMarketPlaceId, setNewMarketPlaceId] = useState(null);

  // 질문 모달
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // 코드 상세 모달 핸들러
  const openCodeDetailModal = useCallback(async (item) => {
    setSelectedCodeForDetail(item);
    setShowCodeDetailModal(true);
    setProductBoxPrices([]);

    // 해당 제품의 모든 박스별 가격을 API로 조회
    if (item.productId) {
      try {
        const response = await getBoxPricesByProduct(item.productId);
        if (response.success) {
          setProductBoxPrices(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch product box prices:", error);
      }
    }
  }, []);

  const closeCodeDetailModal = () => {
    setShowCodeDetailModal(false);
    setSelectedCodeForDetail(null);
    setProductBoxPrices([]);
  };

  // 박스별 가격 상세 모달 핸들러
  const openBoxPriceDetailModal = (item) => {
    setSelectedBoxPriceForDetail(item);
    setShowBoxPriceDetailModal(true);
    setIsDetailEditMode(false);
    setDetailEditData(null);
  };

  const closeBoxPriceDetailModal = () => {
    setShowBoxPriceDetailModal(false);
    setSelectedBoxPriceForDetail(null);
    setIsDetailEditMode(false);
    setDetailEditData(null);
  };

  const startDetailEdit = () => {
    const boxPricesArray = selectedBoxPriceForDetail.boxPrices.length > 0
      ? selectedBoxPriceForDetail.boxPrices.map((bp) => ({
          boxCount: bp.boxCount.toString(),
          price: formatNumber(bp.price),
          shippingFee: formatNumber(bp.shippingFee),
        }))
      : [{ boxCount: "1", price: "", shippingFee: "" }];

    const editData = { fee: (selectedBoxPriceForDetail.fee || 0).toString(), boxPrices: boxPricesArray, hiddenPrices: {} };

    Object.entries(selectedBoxPriceForDetail.hiddenPrices || {}).forEach(([key, hp]) => {
      editData.hiddenPrices[key] = { price: formatNumber(hp.price), shippingFee: formatNumber(hp.shippingFee) };
    });
    setDetailEditData(editData);
    setIsDetailEditMode(true);
  };

  const cancelDetailEdit = () => {
    setIsDetailEditMode(false);
    setDetailEditData(null);
  };

  const saveDetailEdit = useCallback(async () => {
    const fee = parseFloat(detailEditData.fee || 0);
    if (fee <= 0) {
      showCustomAlert("수수료를 입력해주세요.");
      return;
    }

    const filledBoxPrices = [];
    detailEditData.boxPrices.forEach((bp) => {
      const boxCountNum = parseInt(parseNumber(bp?.boxCount)) || 0;
      const priceNum = parseFloat(parseNumber(bp?.price)) || 0;
      const shippingNum = parseFloat(parseNumber(bp?.shippingFee)) || 0;
      if (bp && boxCountNum > 0 && priceNum > 0) {
        filledBoxPrices.push({ boxCount: boxCountNum, price: priceNum, shippingFee: shippingNum });
      }
    });

    if (filledBoxPrices.length === 0) {
      showCustomAlert("최소 1개 박스의 가격을 입력해주세요.");
      return;
    }

    const collectedHiddenPrices = {};
    Object.entries(detailEditData.hiddenPrices || {}).forEach(([key, value]) => {
      const priceNum = parseFloat(parseNumber(value?.price)) || 0;
      const shippingNum = parseFloat(parseNumber(value?.shippingFee)) || 0;
      if (value && priceNum > 0) {
        collectedHiddenPrices[key] = { price: priceNum, shippingFee: shippingNum };
      }
    });

    filledBoxPrices.sort((a, b) => a.boxCount - b.boxCount);

    try {
      // API 호출로 DB에 저장 (boxPrice 업데이트 + boxPriceLog 생성)
      const response = await updateBoxPrice(
        selectedBoxPriceForDetail.productId,
        selectedBoxPriceForDetail.marketPlaceId,
        {
          fee,
          boxPrices: filledBoxPrices,
          hiddenPrices: collectedHiddenPrices,
        }
      );

      if (response.success) {
        const updatedItem = {
          ...selectedBoxPriceForDetail,
          fee,
          boxPrices: filledBoxPrices,
          hiddenPrices: collectedHiddenPrices,
          lastModifiedDate: response.data.lastModifiedDate || new Date().toISOString().split("T")[0],
        };

        setBoxPriceList(boxPriceList.map((item) => (item.id === selectedBoxPriceForDetail.id ? updatedItem : item)));
        setSelectedBoxPriceForDetail(updatedItem);
        setIsDetailEditMode(false);
        setDetailEditData(null);
        showCustomAlert("박스별 가격이 수정되었습니다.");
      } else {
        showCustomAlert(response.msg || "박스별 가격 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Save detail edit error:", error);
      showCustomAlert("박스별 가격 수정 중 오류가 발생했습니다.");
    }
  }, [detailEditData, selectedBoxPriceForDetail, boxPriceList, setBoxPriceList, showCustomAlert]);

  const handleDetailBoxPriceChange = (index, field, value) => {
    const formattedValue = field === "boxCount" ? onlyNumbers(value) : formatNumber(value);
    setDetailEditData((prev) => ({
      ...prev,
      boxPrices: prev.boxPrices.map((bp, i) => (i === index ? { ...bp, [field]: formattedValue } : bp)),
    }));
  };

  const addBoxPriceRow = () => {
    setDetailEditData((prev) => ({
      ...prev,
      boxPrices: [...prev.boxPrices, { boxCount: "", price: "", shippingFee: "" }],
    }));
  };

  const removeBoxPriceRow = (index) => {
    if (detailEditData.boxPrices.length <= 1) {
      showCustomAlert("최소 1개의 박스 가격은 필요합니다.");
      return;
    }
    setDetailEditData((prev) => ({ ...prev, boxPrices: prev.boxPrices.filter((_, i) => i !== index) }));
  };

  const handleDetailHiddenPriceChange = (key, field, value) => {
    setDetailEditData((prev) => ({
      ...prev,
      hiddenPrices: {
        ...prev.hiddenPrices,
        [key]: { ...(prev.hiddenPrices[key] || { price: "", shippingFee: "" }), [field]: formatNumber(value) },
      },
    }));
  };

  // 가격 히스토리 모달 핸들러
  const openPriceHistoryModal = useCallback(async (item) => {
    setSelectedPriceHistory(item);
    setShowPriceHistoryModal(true);
    setEditingHistoryId(null);
    setEditingHistoryData(null);
    setExpandedHistoryIds([]);

    // API에서 히스토리 불러오기
    try {
      const response = await getBoxPriceHistory(item.productId, item.marketPlaceId);
      if (response.success) {
        setSelectedPriceHistory((prev) => ({
          ...prev,
          priceHistory: response.data,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch price history:", error);
      showCustomAlert("히스토리를 불러오는데 실패했습니다.");
    }
  }, [showCustomAlert]);

  const closePriceHistoryModal = () => {
    setShowPriceHistoryModal(false);
    setSelectedPriceHistory(null);
    setEditingHistoryId(null);
    setEditingHistoryData(null);
    setExpandedHistoryIds([]);
    setIsEditingMarketPlace(false);
    setNewMarketPlaceId(null);
  };

  // 판매처 변경 핸들러
  const startEditMarketPlace = () => {
    setIsEditingMarketPlace(true);
    setNewMarketPlaceId(selectedPriceHistory?.marketPlaceId);
  };

  const cancelEditMarketPlace = () => {
    setIsEditingMarketPlace(false);
    setNewMarketPlaceId(null);
  };

  const saveMarketPlaceChange = useCallback(async (channelOptions) => {
    if (!selectedPriceHistory || !newMarketPlaceId) return;

    // 같은 판매처면 변경하지 않음
    if (newMarketPlaceId === selectedPriceHistory.marketPlaceId) {
      setIsEditingMarketPlace(false);
      setNewMarketPlaceId(null);
      return;
    }

    const newChannel = channelOptions.find((c) => c.id === newMarketPlaceId);
    if (!newChannel) {
      showCustomAlert("판매처를 선택해주세요.");
      return;
    }

    try {
      const response = await updateBoxPrice(
        selectedPriceHistory.productId,
        selectedPriceHistory.marketPlaceId,
        {
          fee: selectedPriceHistory.fee,
          boxPrices: selectedPriceHistory.boxPrices,
          hiddenPrices: selectedPriceHistory.hiddenPrices,
          newMarketPlaceId: newMarketPlaceId,
          newMarketPlaceName: newChannel.name,
        }
      );

      if (response.success) {
        // 로컬 상태 업데이트
        setSelectedPriceHistory((prev) => ({
          ...prev,
          marketPlaceId: newMarketPlaceId,
          channel: newChannel.name,
        }));

        // boxPriceList 업데이트
        setBoxPriceList(
          boxPriceList.map((item) =>
            item.id === selectedPriceHistory.id
              ? { ...item, marketPlaceId: newMarketPlaceId, channel: newChannel.name }
              : item
          )
        );

        setIsEditingMarketPlace(false);
        setNewMarketPlaceId(null);
        showCustomAlert("판매처가 변경되었습니다.");
      } else {
        showCustomAlert(response.msg || "판매처 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("Save marketplace change error:", error);
      showCustomAlert(error.message || "판매처 변경 중 오류가 발생했습니다.");
    }
  }, [selectedPriceHistory, newMarketPlaceId, boxPriceList, setBoxPriceList, showCustomAlert]);

  const toggleHistoryAccordion = (historyId) => {
    setExpandedHistoryIds((prev) =>
      prev.includes(historyId) ? prev.filter((id) => id !== historyId) : [...prev, historyId]
    );
  };

  const startEditHistory = (history) => {
    setEditingHistoryId(history.id);
    const formattedBoxPrices = (history.boxPrices || []).map((bp) => ({
      ...bp,
      price: formatNumber(bp.price),
      shippingFee: formatNumber(bp.shippingFee),
    }));

    // 제품의 히든 정보 가져오기
    const product = productList.find(p => p.id === history.productId || p.name === history.productName);
    const productHiddens = product?.hiddenNumbers || [];

    // hiddenPrices 키를 "박스번호_히든이름" 형식으로 정규화
    const formattedHiddenPrices = {};
    Object.entries(history.hiddenPrices || {}).forEach(([key, hp]) => {
      const [boxNumStr, hiddenIdentifier] = key.split('_');

      // 먼저 히든 이름으로 찾기
      let hiddenInfo = productHiddens.find(h => h.name === hiddenIdentifier);
      // 없으면 히든 번호로 찾기
      if (!hiddenInfo) {
        hiddenInfo = productHiddens.find(h => String(h.number) === hiddenIdentifier);
      }

      // 정규화된 키 (이름 형식으로 통일)
      const normalizedKey = hiddenInfo ? `${boxNumStr}_${hiddenInfo.name}` : key;
      formattedHiddenPrices[normalizedKey] = { price: formatNumber(hp.price), shippingFee: formatNumber(hp.shippingFee) };
    });
    // startDate, endDate에서 날짜 부분만 추출 (YYYY-MM-DD HH:mm:ss -> YYYY-MM-DD)
    const startDateRaw = history.startDate || history.date || "";
    const endDateRaw = history.endDate || "";
    const startDate = startDateRaw.split(" ")[0] || "";
    const endDate = endDateRaw.split(" ")[0] || "";

    setEditingHistoryData({
      startDate: startDate,
      endDate: endDate,
      fee: (history.fee || selectedPriceHistory?.fee || 0).toString(),
      boxPrices: formattedBoxPrices,
      hiddenPrices: formattedHiddenPrices,
    });
  };

  const cancelEditHistory = () => {
    setEditingHistoryId(null);
    setEditingHistoryData(null);
  };

  const saveHistoryEdit = useCallback(async () => {
    if (!editingHistoryData.startDate) {
      showCustomAlert("적용 시작일을 입력해주세요.");
      return;
    }

    const fee = parseFloat(editingHistoryData.fee || 0);
    const parsedBoxPrices = editingHistoryData.boxPrices.map((bp) => ({
      ...bp,
      price: parseFloat(parseNumber(bp.price)) || 0,
      shippingFee: parseFloat(parseNumber(bp.shippingFee)) || 0,
    }));
    const parsedHiddenPrices = {};
    Object.entries(editingHistoryData.hiddenPrices || {}).forEach(([key, hp]) => {
      parsedHiddenPrices[key] = {
        price: parseFloat(parseNumber(hp.price)) || 0,
        shippingFee: parseFloat(parseNumber(hp.shippingFee)) || 0,
      };
    });

    try {
      // API 호출로 히스토리 수정
      const response = await updateBoxPriceHistory(editingHistoryId, {
        startDate: editingHistoryData.startDate,
        endDate: editingHistoryData.endDate || null,
        fee,
        boxPrices: parsedBoxPrices,
        hiddenPrices: parsedHiddenPrices,
      });

      if (response.success) {
        // 최신 히스토리 수정 시 새 히스토리가 생성되므로 전체 목록을 다시 불러옴
        const historyResponse = await getBoxPriceHistory(
          selectedPriceHistory.productId,
          selectedPriceHistory.marketPlaceId
        );

        if (historyResponse.success) {
          const newHistoryList = historyResponse.data;

          setSelectedPriceHistory((prev) => ({
            ...prev,
            priceHistory: newHistoryList,
          }));

          // boxPriceList도 최신 데이터로 업데이트
          const latestHistory = newHistoryList[0];
          if (latestHistory) {
            setBoxPriceList(
              boxPriceList.map((item) => {
                if (item.id === selectedPriceHistory.id) {
                  return {
                    ...item,
                    fee: latestHistory.fee,
                    boxPrices: latestHistory.boxPrices,
                    hiddenPrices: latestHistory.hiddenPrices,
                    priceHistory: newHistoryList,
                  };
                }
                return item;
              })
            );
          }
        }

        setEditingHistoryId(null);
        setEditingHistoryData(null);
        showCustomAlert(response.msg || "가격 히스토리가 수정되었습니다.");
      } else {
        showCustomAlert(response.msg || "히스토리 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Save history edit error:", error);
      showCustomAlert("히스토리 수정 중 오류가 발생했습니다.");
    }
  }, [editingHistoryId, editingHistoryData, selectedPriceHistory, boxPriceList, setBoxPriceList, showCustomAlert]);

  const deleteHistory = useCallback(async (historyId) => {
    // 삭제하려는 히스토리가 최신인지 확인
    const historyList = selectedPriceHistory?.priceHistory || [];
    const isLatest = historyList.length > 0 && historyList[0].id === historyId;
    const confirmMsg = isLatest
      ? "최신 히스토리를 삭제하면 이전 가격으로 롤백됩니다. 삭제하시겠습니까?"
      : "해당 가격 히스토리를 삭제하시겠습니까?";

    if (!window.confirm(confirmMsg)) return;

    try {
      // API 호출로 DB에서 삭제
      const response = await deleteBoxPriceHistory(historyId);

      if (response.success) {
        const remainingHistory = historyList.filter((h) => h.id !== historyId);

        // 최신 히스토리 삭제 시 boxPrice도 이전 값으로 롤백
        if (response.data?.rolledBack && remainingHistory.length > 0) {
          const previousHistory = remainingHistory[0];
          setBoxPriceList(
            boxPriceList.map((item) =>
              item.id === selectedPriceHistory.id
                ? {
                    ...item,
                    fee: previousHistory.fee,
                    boxPrices: previousHistory.boxPrices,
                    hiddenPrices: previousHistory.hiddenPrices,
                    priceHistory: remainingHistory,
                  }
                : item
            )
          );
        } else if (response.data?.rolledBack && remainingHistory.length === 0) {
          // 이전 히스토리가 없으면 목록에서 제거 (비활성화됨)
          setBoxPriceList(boxPriceList.filter((item) => item.id !== selectedPriceHistory.id));
        } else {
          // 최신이 아닌 히스토리 삭제 시 히스토리만 업데이트
          setBoxPriceList(
            boxPriceList.map((item) =>
              item.id === selectedPriceHistory.id
                ? { ...item, priceHistory: remainingHistory }
                : item
            )
          );
        }

        setSelectedPriceHistory((prev) => ({
          ...prev,
          priceHistory: remainingHistory,
        }));

        showCustomAlert(response.msg || "가격 히스토리가 삭제되었습니다.");

        // 이전 히스토리가 없어서 비활성화된 경우 모달 닫기
        if (response.data?.rolledBack && remainingHistory.length === 0) {
          setShowPriceHistoryModal(false);
        }
      } else {
        showCustomAlert(response.msg || "히스토리 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete history error:", error);
      showCustomAlert("히스토리 삭제 중 오류가 발생했습니다.");
    }
  }, [selectedPriceHistory, boxPriceList, setBoxPriceList, showCustomAlert, setShowPriceHistoryModal]);

  const updateEditingHistoryBoxPrice = (boxCount, field, value) => {
    setEditingHistoryData((prev) => {
      const existingIndex = prev.boxPrices.findIndex((bp) => bp.boxCount === boxCount);
      const newBoxPrices =
        existingIndex >= 0
          ? prev.boxPrices.map((bp, idx) => (idx === existingIndex ? { ...bp, [field]: formatNumber(value) } : bp))
          : [...prev.boxPrices, { boxCount, price: 0, shippingFee: 0, [field]: parseFloat(value) || 0 }];
      return { ...prev, boxPrices: newBoxPrices };
    });
  };

  // 히스토리 수정 모드에서 박스 추가
  const addHistoryBoxRow = () => {
    setEditingHistoryData((prev) => {
      if (!prev) return prev;
      // 현재 박스 중 가장 큰 boxCount 찾기
      const maxBoxCount = prev.boxPrices.reduce((max, bp) => Math.max(max, bp.boxCount || 0), 0);
      const newBoxCount = maxBoxCount + 1;
      return {
        ...prev,
        boxPrices: [...prev.boxPrices, { boxCount: newBoxCount, price: "", shippingFee: "" }],
      };
    });
  };

  // 히스토리 수정 모드에서 박스 삭제
  const removeHistoryBoxRow = (boxCount) => {
    setEditingHistoryData((prev) => {
      if (!prev || prev.boxPrices.length <= 1) return prev;
      return {
        ...prev,
        boxPrices: prev.boxPrices.filter((bp) => bp.boxCount !== boxCount),
      };
    });
  };

  const updateEditingHistoryHiddenPrice = (key, field, value) => {
    setEditingHistoryData((prev) => ({
      ...prev,
      hiddenPrices: {
        ...prev.hiddenPrices,
        [key]: { ...(prev.hiddenPrices[key] || { price: "", shippingFee: "" }), [field]: formatNumber(value) },
      },
    }));
  };

  return {
    // 코드 상세 모달
    showCodeDetailModal,
    selectedCodeForDetail,
    productBoxPrices,
    openCodeDetailModal,
    closeCodeDetailModal,

    // 박스별 가격 상세 모달
    showBoxPriceDetailModal,
    selectedBoxPriceForDetail,
    isDetailEditMode,
    detailEditData, setDetailEditData,
    openBoxPriceDetailModal,
    closeBoxPriceDetailModal,
    startDetailEdit,
    cancelDetailEdit,
    saveDetailEdit,
    handleDetailBoxPriceChange,
    addBoxPriceRow,
    removeBoxPriceRow,
    handleDetailHiddenPriceChange,

    // 가격 히스토리 모달
    showPriceHistoryModal,
    selectedPriceHistory,
    editingHistoryId,
    editingHistoryData, setEditingHistoryData,
    expandedHistoryIds,
    openPriceHistoryModal,
    closePriceHistoryModal,
    toggleHistoryAccordion,
    startEditHistory,
    cancelEditHistory,
    saveHistoryEdit,
    deleteHistory,
    updateEditingHistoryBoxPrice,
    updateEditingHistoryHiddenPrice,
    addHistoryBoxRow,
    removeHistoryBoxRow,
    // 판매처 변경
    isEditingMarketPlace,
    newMarketPlaceId,
    setNewMarketPlaceId,
    startEditMarketPlace,
    cancelEditMarketPlace,
    saveMarketPlaceChange,

    // 질문 모달
    showQuestionModal, setShowQuestionModal,
  };
}
