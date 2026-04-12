import { useState, useEffect } from "react";
import Modal from "../../../components/ui/Modal";
import DataTable from "../../../components/common/DataTable";
import CustomSelect from "../../../components/ui/CustomSelect";
import { getAgencyFeeDetail } from "../api";

/**
 * 대행료 상세 모달 컴포넌트
 * 매체별 광고비와 대행료를 표시합니다
 * 대행료 = 광고비 x fee% (fee는 부모 매체에서 가져옴)
 */
const FeeDetailModal = ({
  isOpen,
  onClose,
  customDateRange,
  productList = [],
  selectedProducts = [],
}) => {
  // 매체 목록 (API에서 로드)
  const [mediaList, setMediaList] = useState([]);
  const [mediaSpecialOptions, setMediaSpecialOptions] = useState({});

  // 모달 내부에서 매체 선택 관리
  const [selectedMedia, setSelectedMedia] = useState([]);

  // 대행료 데이터
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 매체 목록 및 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, customDateRange, selectedProducts]);

  // 선택된 매체가 변경될 때 데이터 다시 로드
  useEffect(() => {
    if (isOpen && selectedMedia.length > 0) {
      loadFeeData();
    }
  }, [selectedMedia]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getAgencyFeeDetail({
        startDate: customDateRange?.startDate,
        endDate: customDateRange?.endDate,
        productIds: selectedProducts,
        media: [], // 처음에는 전체 매체
      });

      if (response.success) {
        // 매체 목록 설정
        const mediaOptions = [
          { id: 0, name: "전체" },
          ...response.data.mediaList.map((m) => ({ id: m.id, name: m.name })),
        ];
        setMediaList(mediaOptions);

        // 특수 옵션 설정
        const allMediaNames = response.data.mediaList.map((m) => m.name);
        setMediaSpecialOptions({ 전체: allMediaNames });

        // 기본값: 전체 매체 선택
        if (selectedMedia.length === 0) {
          setSelectedMedia(allMediaNames);
        }

        setFeeData(response.data);
      }
    } catch (error) {
      console.error("대행료 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeeData = async () => {
    try {
      const response = await getAgencyFeeDetail({
        startDate: customDateRange?.startDate,
        endDate: customDateRange?.endDate,
        productIds: selectedProducts,
        media: selectedMedia,
      });

      if (response.success) {
        setFeeData(response.data);
      }
    } catch (error) {
      console.error("대행료 데이터 로드 실패:", error);
    }
  };

  // 선택된 매체 목록 가져오기
  const getSelectedMediaList = () => {
    if (selectedMedia.includes("전체") || selectedMedia.length === 0) {
      return mediaSpecialOptions["전체"] || [];
    }
    return selectedMedia;
  };

  const actualSelectedMedia = getSelectedMediaList();

  // 테이블 컬럼 구성 (선택된 매체에 따라 동적 생성)
  const columns = [
    [
      { title: "제품", rowSpan: 2 },
      ...actualSelectedMedia.map((media) => ({ title: media, colSpan: 3 })),
      { title: "합계", colSpan: 3 },
    ],
    [
      ...actualSelectedMedia.reduce((acc) => {
        acc.push({ title: "광고비" });
        acc.push({ title: "대행료", tooltip: "돌려받는 금액" });
        acc.push({ title: "%" });
        return acc;
      }, []),
      { title: "광고비" },
      { title: "대행료", tooltip: "돌려받는 금액" },
      { title: "%" },
    ],
  ];

  // 테이블 데이터 구성
  const generateTableData = () => {
    if (!feeData || !feeData.productData) {
      return [];
    }

    const rows = feeData.productData.map((product) => {
      const cells = [product.productName];
      let productTotalAdCost = 0;
      let productTotalFee = 0;

      actualSelectedMedia.forEach((mediaName) => {
        const mediaData = product.mediaData.find(
          (m) => m.mediaName === mediaName
        );
        if (mediaData) {
          cells.push(mediaData.adCost.toLocaleString() + "원");
          cells.push(mediaData.agencyFee.toLocaleString() + "원");
          cells.push(mediaData.feeRate + "%");
          productTotalAdCost += mediaData.adCost;
          productTotalFee += mediaData.agencyFee;
        } else {
          cells.push("0원");
          cells.push("0원");
          cells.push("-");
        }
      });

      // 제품별 합계
      const avgFeeRate =
        productTotalAdCost > 0
          ? ((productTotalFee / productTotalAdCost) * 100).toFixed(1)
          : 0;
      cells.push(productTotalAdCost.toLocaleString() + "원");
      cells.push(productTotalFee.toLocaleString() + "원");
      cells.push(avgFeeRate + "%");

      return { cells };
    });

    // 전체 합계 행
    let grandTotalAdCost = 0;
    let grandTotalFee = 0;
    const totalCells = ["합계"];

    actualSelectedMedia.forEach((mediaName) => {
      let mediaAdCost = 0;
      let mediaFee = 0;
      let mediaFeeRate = 0;

      feeData.productData.forEach((product) => {
        const mediaData = product.mediaData.find(
          (m) => m.mediaName === mediaName
        );
        if (mediaData) {
          mediaAdCost += mediaData.adCost;
          mediaFee += mediaData.agencyFee;
          mediaFeeRate = mediaData.feeRate; // 같은 매체는 같은 fee rate
        }
      });

      totalCells.push(mediaAdCost.toLocaleString() + "원");
      totalCells.push(mediaFee.toLocaleString() + "원");
      totalCells.push(mediaFeeRate + "%");

      grandTotalAdCost += mediaAdCost;
      grandTotalFee += mediaFee;
    });

    // 전체 합계
    const grandAvgFeeRate =
      grandTotalAdCost > 0
        ? ((grandTotalFee / grandTotalAdCost) * 100).toFixed(1)
        : 0;
    totalCells.push(grandTotalAdCost.toLocaleString() + "원");
    totalCells.push(grandTotalFee.toLocaleString() + "원");
    totalCells.push(grandAvgFeeRate + "%");

    rows.push({ isTotal: true, cells: totalCells });

    return rows;
  };

  const data = generateTableData();

  return (
    <Modal isOpen={isOpen} maxWidth="90%">
      <div className="modal-header">
        <h2 className="modal-title" title="돌려받는 금액">대행료 상세</h2>
        <button onClick={onClose} className="modal-close-btn">
          닫기
        </button>
      </div>
      <div className="modal-body">
        <div className="fee-detail-section">
          {/* 테이블 상단 영역 - 매체 선택을 오른쪽에 배치 */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div style={{ width: "200px" }}>
              <CustomSelect
                options={mediaList}
                selectedValues={selectedMedia}
                onSelectionChange={setSelectedMedia}
                placeholder="매체 선택"
                specialOptions={mediaSpecialOptions}
                multiple={true}
              />
            </div>
          </div>

          <div className="table-container">
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                데이터를 불러오는 중...
              </div>
            ) : (
              <DataTable isAdmin={true} columns={columns} data={data} />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FeeDetailModal;
