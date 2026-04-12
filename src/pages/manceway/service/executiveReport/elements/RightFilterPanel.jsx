import { useState } from 'react';
import CustomSelect from '../../../components/ui/CustomSelect';
import CalendarDateFilter from './CalendarDateFilter';
import ExcelUpload from '../../../components/ui/ExcelUpload';
import Button from '../../../components/ui/Button';
import CustomAlert from '../../../components/ui/CustomAlert';
import PermissionWrapper from '../../../components/PermissionWrapper';
import CSMappingModal from './CSMappingModal';
import { uploadExcel } from '../api';

/**
 * 우측 필터 패널 컴포넌트
 * 제품 선택, 날짜 필터, 엑셀 업로드를 포함합니다
 */
const RightFilterPanel = ({
  productList,
  selectedSingleProduct,
  onProductChange,
  customDateRange,
  setCustomDateRange,
  selectedPeriod,
  setSelectedPeriod,
  userId,
  productTypeFilter,
  setProductTypeFilter,
  onSaveAsImage,
  isSavingImage,
  isAdmin,
  favoriteProducts,
  onToggleFavorite,
}) => {
  const [uploading, setUploading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // 중복 파일 관련 상태
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingInputRef, setPendingInputRef] = useState(null);

  // 업로드 결과 모달 상태
  const [showResultModal, setShowResultModal] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // 미등록 코드 모달 상태
  const [showUnregisteredCodeModal, setShowUnregisteredCodeModal] = useState(false);
  const [unregisteredCodeInfo, setUnregisteredCodeInfo] = useState(null);

  // 제품코드+판매처 미매칭 모달 상태
  const [showUnmatchedModal, setShowUnmatchedModal] = useState(false);
  const [unmatchedInfo, setUnmatchedInfo] = useState(null);

  // 박스별 금액 미등록(날짜) 모달 상태
  const [showNoPriceModal, setShowNoPriceModal] = useState(false);
  const [noPriceInfo, setNoPriceInfo] = useState(null);

  // 히든 가격 미등록 모달 상태
  const [showNoHiddenPriceModal, setShowNoHiddenPriceModal] = useState(false);
  const [noHiddenPriceInfo, setNoHiddenPriceInfo] = useState(null);

  // 매핑 실패 데이터 모달 상태
  const [showFailedRowsModal, setShowFailedRowsModal] = useState(false);
  const [failedRowsInfo, setFailedRowsInfo] = useState(null);

  // 쿠팡 날짜 선택 모달 상태
  const [showDateSelectionModal, setShowDateSelectionModal] = useState(false);
  const [dateSelectionInfo, setDateSelectionInfo] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);

  // 다량 파일 업로드 관련 상태
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [multiUploadResults, setMultiUploadResults] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // CS 데이터 매핑 모달 상태
  const [showCSMappingModal, setShowCSMappingModal] = useState(false);
  const [csData, setCSData] = useState(null);

  // 단일 파일 업로드 실행 함수 (결과 반환)
  const executeSingleUpload = async (file, action = null, dates = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (action) {
        formData.append('action', action);
      }
      if (dates) {
        formData.append('selectedDates', dates);
      }

      const result = await uploadExcel(formData, action);

      // CS 데이터 감지된 경우
      if (result.data?.fileType === 'cs') {
        return {
          fileName: file.name,
          status: 'cs',
          csData: result.data,
          file: file
        };
      }

      // 쿠팡 날짜 선택 필요한 경우
      if (result.isDateSelection) {
        return {
          fileName: file.name,
          status: 'dateSelection',
          dateSelectionInfo: result.data,
          file: file
        };
      }

      // 중복 파일 감지된 경우
      if (result.isDuplicate) {
        return {
          fileName: file.name,
          status: 'duplicate',
          duplicateInfo: result.data,
          file: file
        };
      }

      // 성공
      return {
        fileName: file.name,
        status: 'success',
        data: result.data,
        message: result.message
      };

    } catch (error) {
      console.error('Upload error:', error);

      // 미등록 코드 에러
      if (error.response?.isUnregisteredCode) {
        return {
          fileName: file.name,
          status: 'unregistered',
          unregisteredInfo: error.response.data
        };
      }

      // 제품코드+판매처 미매칭 에러
      if (error.response?.isUnmatchedCodeMarketPlace) {
        return {
          fileName: file.name,
          status: 'unmatched',
          unmatchedInfo: error.response.data
        };
      }

      // 박스별 금액 미등록(날짜) 에러
      if (error.response?.isNoPriceAtDate) {
        return {
          fileName: file.name,
          status: 'noPrice',
          noPriceInfo: error.response.data
        };
      }

      // 히든 가격 미등록 에러
      if (error.response?.isNoHiddenPrice) {
        return {
          fileName: file.name,
          status: 'noHiddenPrice',
          noHiddenPriceInfo: error.response.data
        };
      }

      // 매핑 실패 데이터 에러
      if (error.response?.isFailedRows) {
        return {
          fileName: file.name,
          status: 'failedRows',
          failedRowsInfo: error.response.data
        };
      }

      // 기타 에러
      return {
        fileName: file.name,
        status: 'error',
        message: error.message || "파일 업로드 중 오류가 발생했습니다."
      };
    }
  };

  // 다량 파일 순차 업로드 처리
  const processMultipleFiles = async (files) => {
    const results = [];
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    setMultiUploadResults([]);

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length });

      const result = await executeSingleUpload(files[i]);
      results.push(result);

      // CS 데이터 발견 시 - 중단하고 모달 표시
      if (result.status === 'cs') {
        setMultiUploadResults(results.slice(0, -1));
        setCSData(result.csData);
        setShowCSMappingModal(true);
        setUploading(false);
        return;
      }

      // 중복 파일 발견 시 - 나머지 파일들 저장하고 중복 모달 표시
      if (result.status === 'duplicate') {
        setPendingFiles(files.slice(i + 1));
        setCurrentFileIndex(i);
        setMultiUploadResults(results.slice(0, -1)); // 중복 파일 제외한 결과 저장
        setDuplicateInfo(result.duplicateInfo);
        setPendingFile(result.file);
        setShowDuplicateModal(true);
        setUploading(false);
        return;
      }

      // 미등록 코드 발견 시 - 중단하고 모달 표시
      if (result.status === 'unregistered') {
        setMultiUploadResults(results);
        setUnregisteredCodeInfo(result.unregisteredInfo);
        setShowUnregisteredCodeModal(true);
        setUploading(false);
        return;
      }

      // 제품코드+판매처 미매칭 발견 시 - 중단하고 모달 표시
      if (result.status === 'unmatched') {
        setMultiUploadResults(results);
        setUnmatchedInfo(result.unmatchedInfo);
        setShowUnmatchedModal(true);
        setUploading(false);
        return;
      }

      // 박스별 금액 미등록(날짜) 발견 시 - 중단하고 모달 표시
      if (result.status === 'noPrice') {
        setMultiUploadResults(results);
        setNoPriceInfo(result.noPriceInfo);
        setShowNoPriceModal(true);
        setUploading(false);
        return;
      }

      // 히든 가격 미등록 발견 시 - 중단하고 모달 표시
      if (result.status === 'noHiddenPrice') {
        setMultiUploadResults(results);
        setNoHiddenPriceInfo(result.noHiddenPriceInfo);
        setShowNoHiddenPriceModal(true);
        setUploading(false);
        return;
      }

      // 매핑 실패 데이터 발견 시 - 중단하고 모달 표시
      if (result.status === 'failedRows') {
        setMultiUploadResults(results);
        setFailedRowsInfo(result.failedRowsInfo);
        setShowFailedRowsModal(true);
        setUploading(false);
        return;
      }
    }

    // 모든 파일 처리 완료
    setUploading(false);
    showMultiUploadResult(results);
  };

  // 다량 업로드 결과 표시
  const showMultiUploadResult = (results) => {
    const successResults = results.filter(r => r.status === 'success');
    const errorResults = results.filter(r => r.status === 'error');

    // 통합 결과 생성
    const totalSaved = successResults.reduce((sum, r) => sum + (r.data?.savedCount || 0), 0);
    const totalFailed = successResults.reduce((sum, r) => sum + (r.data?.failedCount || 0), 0) +
                        errorResults.length;
    const allNewMarketPlaces = [...new Set(
      successResults.flatMap(r => r.data?.newMarketPlaces || [])
    )];

    setUploadResult({
      success: errorResults.length === 0,
      message: `${results.length}개 파일 업로드 완료`,
      isMultiple: true,
      data: {
        totalFiles: results.length,
        successFiles: successResults.length,
        errorFiles: errorResults.length,
        savedCount: totalSaved,
        failedCount: totalFailed,
        newMarketPlaces: allNewMarketPlaces,
        fileResults: results
      }
    });
    setShowResultModal(true);
  };

  // 파일 업로드 핸들러 (다량 파일 지원)
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (!files || files.length === 0) {
      return;
    }

    // 파일 개수 제한 (최대 20개)
    if (files.length > 20) {
      setAlertMessage("한 번에 최대 20개 파일까지 업로드 가능합니다.");
      setShowAlert(true);
      e.target.value = null;
      return;
    }

    // 파일 검증
    const validExtensions = ['.xlsx', '.xls'];
    const maxSize = 10 * 1024 * 1024;
    const invalidFiles = [];

    for (const file of files) {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        invalidFiles.push(`${file.name}: 엑셀 파일이 아닙니다`);
        continue;
      }

      if (file.size > maxSize) {
        invalidFiles.push(`${file.name}: 10MB 초과`);
      }
    }

    if (invalidFiles.length > 0) {
      setAlertMessage(`잘못된 파일:\n${invalidFiles.join('\n')}`);
      setShowAlert(true);
      e.target.value = null;
      return;
    }

    setPendingInputRef(e.target);

    // 단일 파일 vs 다량 파일 처리
    if (files.length === 1) {
      setUploading(true);
      const result = await executeSingleUpload(files[0]);

      if (result.status === 'cs') {
        // CS 데이터 매핑 모달 표시
        setCSData(result.csData);
        setShowCSMappingModal(true);
      } else if (result.status === 'dateSelection') {
        // 쿠팡 날짜 선택 모달 표시
        setDateSelectionInfo(result.dateSelectionInfo);
        setPendingFile(result.file);
        setSelectedDates([]);
        setShowDateSelectionModal(true);
      } else if (result.status === 'duplicate') {
        setDuplicateInfo(result.duplicateInfo);
        setPendingFile(result.file);
        setShowDuplicateModal(true);
      } else if (result.status === 'unregistered') {
        setUnregisteredCodeInfo(result.unregisteredInfo);
        setShowUnregisteredCodeModal(true);
      } else if (result.status === 'unmatched') {
        setUnmatchedInfo(result.unmatchedInfo);
        setShowUnmatchedModal(true);
      } else if (result.status === 'noPrice') {
        setNoPriceInfo(result.noPriceInfo);
        setShowNoPriceModal(true);
      } else if (result.status === 'noHiddenPrice') {
        setNoHiddenPriceInfo(result.noHiddenPriceInfo);
        setShowNoHiddenPriceModal(true);
      } else if (result.status === 'failedRows') {
        setFailedRowsInfo(result.failedRowsInfo);
        setShowFailedRowsModal(true);
      } else if (result.status === 'error') {
        setAlertMessage(result.message);
        setShowAlert(true);
      } else {
        setUploadResult({
          success: true,
          message: result.message,
          data: result.data
        });
        setShowResultModal(true);
      }
      setUploading(false);
    } else {
      await processMultipleFiles(files);
    }

    e.target.value = null;
  };

  // 중복 파일 처리 핸들러 (다량 파일 지원)
  const handleDuplicateAction = async (action) => {
    setShowDuplicateModal(false);

    if (pendingFile && action) {
      setUploading(true);
      const result = await executeSingleUpload(pendingFile, action);

      // 다량 파일 업로드 중이었다면 나머지 파일들도 계속 처리
      if (pendingFiles.length > 0) {
        const allResults = [...multiUploadResults, result];

        // 나머지 파일들 순차 처리
        for (let i = 0; i < pendingFiles.length; i++) {
          setUploadProgress({
            current: currentFileIndex + 2 + i,
            total: currentFileIndex + 1 + pendingFiles.length + 1
          });

          const nextResult = await executeSingleUpload(pendingFiles[i]);
          allResults.push(nextResult);

          // 또 다른 중복 파일 발견
          if (nextResult.status === 'duplicate') {
            setPendingFiles(pendingFiles.slice(i + 1));
            setCurrentFileIndex(currentFileIndex + 1 + i);
            setMultiUploadResults(allResults.slice(0, -1));
            setDuplicateInfo(nextResult.duplicateInfo);
            setPendingFile(nextResult.file);
            setShowDuplicateModal(true);
            setUploading(false);
            return;
          }

          // 미등록 코드 발견
          if (nextResult.status === 'unregistered') {
            setMultiUploadResults(allResults);
            setUnregisteredCodeInfo(nextResult.unregisteredInfo);
            setShowUnregisteredCodeModal(true);
            setUploading(false);
            return;
          }

          // 제품코드+판매처 미매칭 발견
          if (nextResult.status === 'unmatched') {
            setMultiUploadResults(allResults);
            setUnmatchedInfo(nextResult.unmatchedInfo);
            setShowUnmatchedModal(true);
            setUploading(false);
            return;
          }

          // 박스별 금액 미등록(날짜) 발견
          if (nextResult.status === 'noPrice') {
            setMultiUploadResults(allResults);
            setNoPriceInfo(nextResult.noPriceInfo);
            setShowNoPriceModal(true);
            setUploading(false);
            return;
          }

          // 히든 가격 미등록 발견
          if (nextResult.status === 'noHiddenPrice') {
            setMultiUploadResults(allResults);
            setNoHiddenPriceInfo(nextResult.noHiddenPriceInfo);
            setShowNoHiddenPriceModal(true);
            setUploading(false);
            return;
          }

          // 매핑 실패 데이터 발견
          if (nextResult.status === 'failedRows') {
            setMultiUploadResults(allResults);
            setFailedRowsInfo(nextResult.failedRowsInfo);
            setShowFailedRowsModal(true);
            setUploading(false);
            return;
          }
        }

        // 모든 파일 처리 완료
        setUploading(false);
        setPendingFiles([]);
        showMultiUploadResult(allResults);
      } else {
        // 단일 파일 업로드
        setUploading(false);
        if (result.status === 'success') {
          setUploadResult({
            success: true,
            message: result.message,
            data: result.data
          });
          setShowResultModal(true);
        } else if (result.status === 'error') {
          setAlertMessage(result.message);
          setShowAlert(true);
        }
      }
    }

    if (pendingInputRef) {
      pendingInputRef.value = null;
    }
    setPendingFile(null);
  };

  // 중복 모달 닫기 (다량 파일 업로드 중단)
  const closeDuplicateModal = () => {
    setShowDuplicateModal(false);
    setPendingFile(null);

    // 다량 파일 업로드 중이었다면 지금까지 결과 표시
    if (multiUploadResults.length > 0) {
      showMultiUploadResult(multiUploadResults);
    }

    setPendingFiles([]);
    setMultiUploadResults([]);

    if (pendingInputRef) {
      pendingInputRef.value = null;
    }
    setPendingInputRef(null);
  };

  // CS 매핑 완료 핸들러
  const handleCSMappingComplete = (saveResult) => {
    setShowCSMappingModal(false);
    setCSData(null);

    if (pendingInputRef) {
      pendingInputRef.value = null;
    }

    // 성공 메시지 표시
    setAlertMessage(`${saveResult.summary.created}건이 저장되었습니다.`);
    setShowAlert(true);

    // 페이지 새로고침
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // CS 매핑 모달 닫기
  const closeCSMappingModal = () => {
    setShowCSMappingModal(false);
    setCSData(null);

    if (pendingInputRef) {
      pendingInputRef.value = null;
    }
  };

  // 쿠팡 날짜 선택 토글
  const handleDateToggle = (date) => {
    setSelectedDates(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };

  // 쿠팡 날짜 전체 선택/해제
  const handleSelectAllDates = () => {
    if (dateSelectionInfo?.availableDates) {
      const allDates = dateSelectionInfo.availableDates.map(d => d.date);
      if (selectedDates.length === allDates.length) {
        setSelectedDates([]);
      } else {
        setSelectedDates(allDates);
      }
    }
  };

  // 쿠팡 날짜 선택 후 업로드 실행
  const handleDateSelectionSubmit = async (uploadAll = false) => {
    setShowDateSelectionModal(false);

    if (!pendingFile) return;

    setUploading(true);

    // 날짜 선택 또는 전체
    const datesToUpload = uploadAll ? 'all' : selectedDates.join(',');

    const result = await executeSingleUpload(pendingFile, null, datesToUpload);

    if (result.status === 'duplicate') {
      setDuplicateInfo(result.duplicateInfo);
      setShowDuplicateModal(true);
    } else if (result.status === 'error') {
      setAlertMessage(result.message);
      setShowAlert(true);
      setPendingFile(null);
    } else if (result.status === 'success') {
      setUploadResult({
        success: true,
        message: result.message,
        data: result.data
      });
      setShowResultModal(true);
      setPendingFile(null);
    }

    setUploading(false);
    setDateSelectionInfo(null);
    setSelectedDates([]);

    if (pendingInputRef) {
      pendingInputRef.value = null;
    }
  };

  // 쿠팡 날짜 선택 모달 닫기
  const closeDateSelectionModal = () => {
    setShowDateSelectionModal(false);
    setDateSelectionInfo(null);
    setSelectedDates([]);
    setPendingFile(null);

    if (pendingInputRef) {
      pendingInputRef.value = null;
    }
  };

  // 자사/대행 필터에 따라 제품 목록 필터링
  const filteredProductList = productList.filter(product => {
    // "전체" 옵션은 항상 포함
    if (product.name === "전체" || product.id === null) {
      return true;
    }

    const isAgency = product.name.startsWith("대행_");
    const isInHouse = !isAgency;

    // 자사 탭
    if (productTypeFilter === 'inHouse') {
      return isInHouse;
    }

    // 대행 탭
    if (productTypeFilter === 'agency') {
      return isAgency;
    }

    // 기본: 모든 제품 표시
    return true;
  });

  // 제품 선택 변경 핸들러
  const handleProductChange = (values) => {
    onProductChange(values);
  };

  return (
    <div className="filter-panel-container">
      {/* 달력 박스 */}
      <div className="filter-box">
        <CalendarDateFilter
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />
      </div>

      {/* 두번째 박스: 엑셀 파일 업로드 - 특정 제품 선택 시 숨김, 전체일 때 표시, 권한 체크 */}
      {(!selectedSingleProduct || selectedSingleProduct.length === 0 || selectedSingleProduct[0] === null) && (
        <PermissionWrapper
          pageId="executive-report-sales"
          groupName="filter-panel"
          displayName="excel-upload"
        >
          <div className="filter-box">
            <ExcelUpload
              id="excel-upload"
              onFileChange={handleFileChange}
              mainText={
                uploading
                  ? uploadProgress.total > 1
                    ? `업로드 중... (${uploadProgress.current}/${uploadProgress.total})`
                    : "업로드 중..."
                  : "엑셀 파일 업로드"
              }
              subText="xlsx, xls 파일 (다중 선택 가능)"
              multiple={true}
            />
          </div>
        </PermissionWrapper>
      )}

      {/* 이미지 저장 버튼 (S등급만, 제품이 "전체"일 때만) */}
      {isAdmin && (!selectedSingleProduct || selectedSingleProduct.length === 0 || selectedSingleProduct[0] === null) && (
        <button
          onClick={onSaveAsImage}
          disabled={isSavingImage}
          style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            cursor: isSavingImage ? 'not-allowed' : 'pointer',
            backgroundColor: isSavingImage ? '#f3f4f6' : '#fff',
            color: '#3b82f6',
            fontWeight: '500',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            if (!isSavingImage) {
              e.target.style.backgroundColor = '#eff6ff';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSavingImage) {
              e.target.style.backgroundColor = '#fff';
            }
          }}
        >
          <span>{isSavingImage ? '⏳' : '📸'}</span>
          <span>{isSavingImage ? '저장 중...' : '이미지 저장'}</span>
        </button>
      )}

      {/* Alert */}
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* 중복 파일 확인 모달 */}
      {showDuplicateModal && (
        <div className="modal-overlay" onClick={closeDuplicateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>중복 파일 감지</h3>
              <button className="modal-close" onClick={closeDuplicateModal}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  ⚠️
                </div>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  이전에 업로드한 파일과 동일한 파일로 의심됩니다.<br />
                  그래도 업로드하시겠습니까?
                </p>
              </div>

              {duplicateInfo && (
                <div style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  color: '#64748b'
                }}>
                  <div><strong>파일명:</strong> {duplicateInfo.fileName}</div>
                  <div><strong>파일 형식:</strong> {duplicateInfo.fileType === 'coupang' ? '쿠팡' : '사방넷'}</div>
                  <div><strong>데이터 수:</strong> {duplicateInfo.rowCount}건</div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => handleDuplicateAction('overwrite')}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                  onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                    기존 데이터 덮어씌기
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    기존 데이터를 삭제하고 새 데이터로 교체합니다
                  </div>
                </button>

                <button
                  onClick={() => handleDuplicateAction('append')}
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.borderColor = '#3b82f6'}
                  onMouseOut={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                    데이터 추가하기
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    기존 데이터를 유지하고 새 데이터를 추가합니다
                  </div>
                </button>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button variant="secondary" size="medium" onClick={closeDuplicateModal}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 업로드 결과 모달 */}
      {showResultModal && uploadResult && (
        <div className="modal-overlay" onClick={() => {}}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>📊 업로드 결과</h3>
              <button className="modal-close" onClick={() => {
                setShowResultModal(false);
                window.location.reload();
              }}>×</button>
            </div>
            <div className="modal-body">
              {/* 성공 아이콘 및 메시지 */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: uploadResult.success ? '#dcfce7' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  {uploadResult.success ? '✅' : '❌'}
                </div>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                  {uploadResult.message}
                </p>
              </div>

              {/* 파일 정보 */}
              {uploadResult.data && (
                <>
                  {/* 다량 파일 업로드: 파일별 결과 요약 */}
                  {uploadResult.isMultiple ? (
                    <div style={{
                      background: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                        <strong>📁 파일 처리 결과 ({uploadResult.data.totalFiles}개)</strong>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ color: '#16a34a' }}>✅ 성공: {uploadResult.data.successFiles}개</div>
                        <div style={{ color: uploadResult.data.errorFiles > 0 ? '#dc2626' : '#64748b' }}>
                          ❌ 실패: {uploadResult.data.errorFiles}개
                        </div>
                      </div>
                      {/* 파일별 상세 목록 */}
                      <div style={{
                        maxHeight: '120px',
                        overflowY: 'auto',
                        fontSize: '0.8rem',
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: '0.5rem'
                      }}>
                        {uploadResult.data.fileResults?.map((result, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.25rem 0',
                            color: result.status === 'success' ? '#16a34a' : '#dc2626'
                          }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                              {result.fileName}
                            </span>
                            <span>{result.status === 'success' ? '성공' : '실패'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* 단일 파일 업로드: 기존 UI */
                    <div style={{
                      background: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                        <strong>📁 파일 정보</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div><span style={{ color: '#64748b' }}>파일명:</span> <span style={{ color: '#1e293b' }}>{uploadResult.data.fileName}</span></div>
                        <div><span style={{ color: '#64748b' }}>파일 형식:</span> <span style={{ color: '#1e293b' }}>{uploadResult.data.fileType === 'coupang' ? '쿠팡' : '사방넷'}</span></div>
                      </div>
                    </div>
                  )}

                  {/* 처리 결과 요약 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      background: '#dcfce7',
                      padding: '1rem',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a' }}>
                        {uploadResult.data.savedCount || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>{uploadResult.isMultiple ? '총 저장 건수' : '성공'}</div>
                    </div>
                    <div style={{
                      background: uploadResult.data.failedCount > 0 ? '#fee2e2' : '#f1f5f9',
                      padding: '1rem',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: uploadResult.data.failedCount > 0 ? '#dc2626' : '#64748b' }}>
                        {uploadResult.data.failedCount || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: uploadResult.data.failedCount > 0 ? '#dc2626' : '#64748b' }}>{uploadResult.isMultiple ? '총 실패 건수' : '실패'}</div>
                    </div>
                  </div>

                  {/* 실패 상세 정보 */}
                  {uploadResult.data.failedRows && uploadResult.data.failedRows.length > 0 && (
                    <div style={{
                      background: '#fef2f2',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #fecaca'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: '600', marginBottom: '0.75rem' }}>
                        ⚠️ 실패한 행 상세
                      </div>
                      <div style={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                        fontSize: '0.8rem'
                      }}>
                        {uploadResult.data.failedRows.map((failed, index) => (
                          <div key={index} style={{
                            padding: '0.5rem 0',
                            borderBottom: index < uploadResult.data.failedRows.length - 1 ? '1px solid #fecaca' : 'none',
                            color: '#991b1b'
                          }}>
                            <strong>{failed.row}행:</strong> {failed.reason}
                          </div>
                        ))}
                      </div>
                      {uploadResult.data.failedCount > uploadResult.data.failedRows.length && (
                        <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', fontStyle: 'italic' }}>
                          ... 외 {uploadResult.data.failedCount - uploadResult.data.failedRows.length}건
                        </div>
                      )}
                    </div>
                  )}

                  {/* 삭제된 데이터 정보 */}
                  {uploadResult.data.deletedCount > 0 && (
                    <div style={{
                      background: '#fefce8',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      marginTop: '1rem',
                      fontSize: '0.85rem',
                      color: '#854d0e'
                    }}>
                      ℹ️ 기존 데이터 <strong>{uploadResult.data.deletedCount}건</strong>이 삭제되었습니다.
                    </div>
                  )}

                  {/* 새로 생성된 판매처 정보 */}
                  {uploadResult.data.newMarketPlaces && uploadResult.data.newMarketPlaces.length > 0 && (
                    <div style={{
                      background: '#f0fdf4',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0',
                      marginTop: '1rem'
                    }}>
                      <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '600', marginBottom: '0.75rem' }}>
                        🏪 새로 생성된 판매처 ({uploadResult.data.newMarketPlaces.length}개)
                      </div>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        fontSize: '0.8rem'
                      }}>
                        {uploadResult.data.newMarketPlaces.map((name, index) => (
                          <span key={index} style={{
                            background: '#dcfce7',
                            color: '#166534',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            {name}
                          </span>
                        ))}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#166534',
                        marginTop: '0.75rem'
                      }}>
                        💡 새 판매처는 "미지정" 상태입니다.<br />
                        판매처 및 매체 등록 {'>'} <a
                          href="/management-resources/marketplace-admedia"
                          style={{
                            color: '#166534',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >판매처 등록</a>에서 확인하세요.
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button variant="primary" size="medium" onClick={() => {
                setShowResultModal(false);
                window.location.reload();
              }}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 미등록 코드 모달 */}
      {showUnregisteredCodeModal && unregisteredCodeInfo && (
        <div className="modal-overlay" onClick={() => setShowUnregisteredCodeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>⚠️ 상품코드 등록 필요</h3>
              <button className="modal-close" onClick={() => setShowUnregisteredCodeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* 경고 아이콘 및 메시지 */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  📋
                </div>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                  등록되지 않은 상품코드가 있습니다
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                  아래 코드를 먼저 등록한 후 다시 업로드해주세요.
                </p>
              </div>

              {/* 파일 정보 */}
              <div style={{
                background: '#f8fafc',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>파일명:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{unregisteredCodeInfo.fileName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ color: '#64748b' }}>파일 형식:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{unregisteredCodeInfo.fileType === 'coupang' ? '쿠팡' : '사방넷'}</span>
                </div>
              </div>

              {/* 미등록 코드 수 */}
              <div style={{
                background: '#fef2f2',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: '600', marginBottom: '0.75rem' }}>
                  미등록 코드: {unregisteredCodeInfo.unregisteredCount}개
                </div>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace'
                }}>
                  {unregisteredCodeInfo.unregisteredCodes?.map((code, index) => (
                    <div key={index} style={{
                      padding: '0.375rem 0.5rem',
                      background: index % 2 === 0 ? '#fff' : '#fef2f2',
                      borderRadius: '4px',
                      color: '#991b1b'
                    }}>
                      {code}
                    </div>
                  ))}
                </div>
                {unregisteredCodeInfo.unregisteredCount > (unregisteredCodeInfo.unregisteredCodes?.length || 0) && (
                  <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    ... 외 {unregisteredCodeInfo.unregisteredCount - (unregisteredCodeInfo.unregisteredCodes?.length || 0)}개
                  </div>
                )}
              </div>

              {/* 안내 메시지 */}
              <div style={{
                background: '#eff6ff',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#1e40af'
              }}>
                💡 <strong>관리 리소스 → 코드 및 제품 등록 → <a
                  href="/management-resources/product-management"
                  style={{
                    color: '#1e40af',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >코드 등록</a></strong> 메뉴에서 상품코드를 등록할 수 있습니다.
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button variant="primary" size="medium" onClick={() => setShowUnregisteredCodeModal(false)}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 제품코드+판매처 미매칭 모달 */}
      {showUnmatchedModal && unmatchedInfo && (
        <div className="modal-overlay" onClick={() => setShowUnmatchedModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>⚠️ 제품코드-판매처 등록 필요</h3>
              <button className="modal-close" onClick={() => setShowUnmatchedModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* 경고 아이콘 및 메시지 */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  🔗
                </div>
                <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                  제품코드와 판매처 조합이 등록되지 않았습니다
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                  아래 조합을 먼저 등록한 후 다시 업로드해주세요.
                </p>
              </div>

              {/* 파일 정보 */}
              <div style={{
                background: '#f8fafc',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>파일명:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{unmatchedInfo.fileName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ color: '#64748b' }}>파일 형식:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{unmatchedInfo.fileType === 'coupang' ? '쿠팡' : '사방넷'}</span>
                </div>
              </div>

              {/* 미매칭 조합 목록 */}
              <div style={{
                background: '#fef2f2',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: '600', marginBottom: '0.75rem' }}>
                  미등록 조합: {unmatchedInfo.unmatchedCount}개
                </div>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  fontSize: '0.8rem'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#fee2e2' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #fecaca' }}>제품코드</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #fecaca' }}>판매처</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unmatchedInfo.unmatchedCodeMarketPlace?.map((item, index) => (
                        <tr key={index} style={{ background: index % 2 === 0 ? '#fff' : '#fef2f2' }}>
                          <td style={{ padding: '0.375rem 0.5rem', color: '#991b1b', fontFamily: 'monospace' }}>{item.code}</td>
                          <td style={{ padding: '0.375rem 0.5rem', color: '#991b1b' }}>{item.marketPlaceName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {unmatchedInfo.unmatchedCount > (unmatchedInfo.unmatchedCodeMarketPlace?.length || 0) && (
                  <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    ... 외 {unmatchedInfo.unmatchedCount - (unmatchedInfo.unmatchedCodeMarketPlace?.length || 0)}개
                  </div>
                )}
              </div>

              {/* 안내 메시지 */}
              <div style={{
                background: '#eff6ff',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#1e40af'
              }}>
                💡 <strong>관리 리소스 → 코드 및 제품 등록 → <a
                  href="/management-resources/product-management"
                  style={{
                    color: '#1e40af',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >코드 등록</a></strong> 메뉴에서 해당 제품코드에 판매처를 추가 등록할 수 있습니다.
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button variant="primary" size="medium" onClick={() => setShowUnmatchedModal(false)}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 박스별 금액 미등록 모달 */}
      {showNoPriceModal && noPriceInfo && (
        <div className="modal-overlay" onClick={() => setShowNoPriceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>⚠️ 박스별 금액 미등록</h3>
              <button className="modal-close" onClick={() => setShowNoPriceModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* 경고 아이콘 및 메시지 */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: '#fef2f2',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: '2rem',
                  lineHeight: 1
                }}>💰</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: '#991b1b' }}>
                    박스별 금액이 등록되지 않은 제품이 있습니다
                  </p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#7f1d1d' }}>
                    해당 제품+판매처의 박스별 금액을 먼저 등록해주세요.
                  </p>
                </div>
              </div>

              {/* 파일 정보 */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  파일: <strong>{noPriceInfo.fileName}</strong>
                </p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  미등록 항목: <strong style={{ color: '#dc2626' }}>{noPriceInfo.noPriceCount}개</strong>
                </p>
              </div>

              {/* 날짜별 그룹핑 표시 */}
              {noPriceInfo.dateGroups && Object.keys(noPriceInfo.dateGroups).length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>날짜별 미등록 현황:</p>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    {Object.entries(noPriceInfo.dateGroups).map(([date, items]) => (
                      <div key={date} style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '0.25rem' }}>
                          📆 {date}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {items.slice(0, 5).join(', ')}
                          {items.length > 5 && ` 외 ${items.length - 5}건`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 안내 메시지 */}
              <div style={{
                background: '#eff6ff',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#1e40af'
              }}>
                💡 <strong>관리 리소스 → 코드 및 제품 등록 → <a
                  href="/management-resources/product-management"
                  style={{
                    color: '#1e40af',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >박스별 금액</a></strong> 메뉴에서 해당 제품의 박스별 금액을 등록할 수 있습니다.
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button variant="primary" size="medium" onClick={() => setShowNoPriceModal(false)}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 히든 가격 미등록 모달 */}
      {showNoHiddenPriceModal && noHiddenPriceInfo && (
        <div className="modal-overlay" onClick={() => setShowNoHiddenPriceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>⚠️ 히든 가격 미등록</h3>
              <button className="modal-close" onClick={() => setShowNoHiddenPriceModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* 경고 아이콘 및 메시지 */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: '#fef2f2',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: '2rem',
                  lineHeight: 1
                }}>🔒</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: '#991b1b' }}>
                    히든 가격이 등록되지 않은 데이터가 있습니다
                  </p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#7f1d1d' }}>
                    해당 제품의 히든 가격을 등록해주세요.
                  </p>
                </div>
              </div>

              {/* 파일 정보 */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                  파일: <strong>{noHiddenPriceInfo.fileName}</strong>
                </p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  미등록 항목: <strong style={{ color: '#dc2626' }}>{noHiddenPriceInfo.noHiddenPriceCount}개</strong>
                </p>
              </div>

              {/* 히든 가격 미등록 목록 */}
              {noHiddenPriceInfo.noHiddenPriceItems && noHiddenPriceInfo.noHiddenPriceItems.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>미등록 히든 가격 목록:</p>
                  <div style={{
                    maxHeight: '250px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>제품명</th>
                          <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>박스수</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>히든</th>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>판매처</th>
                        </tr>
                      </thead>
                      <tbody>
                        {noHiddenPriceInfo.noHiddenPriceItems.map((item, index) => (
                          <tr key={index} style={{ background: index % 2 === 0 ? '#fff' : '#fef2f2' }}>
                            <td style={{ padding: '0.375rem 0.5rem', color: '#991b1b' }}>{item.productName}</td>
                            <td style={{ padding: '0.375rem 0.5rem', color: '#991b1b', textAlign: 'center' }}>{item.boxCount}박스</td>
                            <td style={{ padding: '0.375rem 0.5rem', color: '#991b1b' }}>
                              {item.hiddenName} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({item.hiddenNumber})</span>
                            </td>
                            <td style={{ padding: '0.375rem 0.5rem', color: '#991b1b' }}>{item.marketPlaceName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {noHiddenPriceInfo.noHiddenPriceCount > (noHiddenPriceInfo.noHiddenPriceItems?.length || 0) && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      ... 외 {noHiddenPriceInfo.noHiddenPriceCount - (noHiddenPriceInfo.noHiddenPriceItems?.length || 0)}개
                    </div>
                  )}
                </div>
              )}

              {/* 안내 메시지 */}
              <div style={{
                background: '#eff6ff',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#1e40af'
              }}>
                💡 <strong>관리 리소스 → 코드 및 제품 등록 → <a
                  href="/management-resources/product-management"
                  style={{
                    color: '#1e40af',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >박스별 금액</a></strong> 메뉴에서 해당 제품의 히든 가격을 등록할 수 있습니다.
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button variant="primary" size="medium" onClick={() => setShowNoHiddenPriceModal(false)}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 매핑 실패 데이터 모달 */}
      {showFailedRowsModal && failedRowsInfo && (
        <div className="modal-overlay" onClick={() => setShowFailedRowsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>업로드 차단됨</h3>
              <button className="modal-close" onClick={() => setShowFailedRowsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* 경고 아이콘 및 메시지 */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                background: '#fef2f2',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{
                  fontSize: '2rem',
                  lineHeight: 1
                }}>🚫</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: '#991b1b' }}>
                    매핑 실패한 데이터가 발견되어 업로드가 차단되었습니다
                  </p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#7f1d1d' }}>
                    모든 데이터가 유효해야 업로드할 수 있습니다. 아래 문제를 수정한 후 다시 시도해주세요.
                  </p>
                </div>
              </div>

              {/* 파일 정보 */}
              <div style={{
                background: '#f8fafc',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>파일명:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{failedRowsInfo.fileName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ color: '#64748b' }}>파일 형식:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{failedRowsInfo.fileType === 'coupang' ? '쿠팡' : '사방넷'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ color: '#64748b' }}>전체 행:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{failedRowsInfo.totalRows}개</span>
                </div>
              </div>

              {/* 처리 결과 요약 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: '#dcfce7',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a' }}>
                    {failedRowsInfo.validCount || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>유효한 데이터</div>
                </div>
                <div style={{
                  background: '#fee2e2',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>
                    {failedRowsInfo.failedCount || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>실패한 데이터</div>
                </div>
              </div>

              {/* 실패 상세 정보 */}
              {failedRowsInfo.failedRows && failedRowsInfo.failedRows.length > 0 && (
                <div style={{
                  background: '#fef2f2',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #fecaca'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: '600', marginBottom: '0.75rem' }}>
                    실패한 행 상세
                  </div>
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    fontSize: '0.8rem'
                  }}>
                    {failedRowsInfo.failedRows.map((failed, index) => (
                      <div key={index} style={{
                        padding: '0.5rem 0',
                        borderBottom: index < failedRowsInfo.failedRows.length - 1 ? '1px solid #fecaca' : 'none',
                        color: '#991b1b'
                      }}>
                        <strong>{failed.row}행:</strong> {failed.reason}
                      </div>
                    ))}
                  </div>
                  {failedRowsInfo.failedCount > failedRowsInfo.failedRows.length && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      ... 외 {failedRowsInfo.failedCount - failedRowsInfo.failedRows.length}건
                    </div>
                  )}
                </div>
              )}

              {/* 안내 메시지 */}
              <div style={{
                background: '#eff6ff',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#1e40af',
                marginTop: '1rem'
              }}>
                💡 엑셀 파일에서 위 문제를 수정한 후 다시 업로드해주세요.
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button variant="primary" size="medium" onClick={() => setShowFailedRowsModal(false)}>
                확인
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CS 데이터 매핑 모달 */}
      {showCSMappingModal && csData && (
        <CSMappingModal
          csData={csData}
          onClose={closeCSMappingModal}
          onComplete={handleCSMappingComplete}
        />
      )}

      {/* 쿠팡 날짜 선택 모달 */}
      {showDateSelectionModal && dateSelectionInfo && (
        <div className="modal-overlay" onClick={closeDateSelectionModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>업로드할 날짜 선택</h3>
              <button className="modal-close" onClick={closeDateSelectionModal}>×</button>
            </div>
            <div className="modal-body">
              {/* 아이콘 및 메시지 */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem'
                }}>
                  📅
                </div>
                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  쿠팡 파일에서 업로드할 날짜를 선택하세요.
                </p>
              </div>

              {/* 파일 정보 */}
              <div style={{
                background: '#f8fafc',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>파일명:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{dateSelectionInfo.fileName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ color: '#64748b' }}>전체 데이터:</span>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{dateSelectionInfo.totalRows}건</span>
                </div>
              </div>

              {/* 날짜 선택 영역 */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>날짜 선택</span>
                  <button
                    onClick={handleSelectAllDates}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#475569'
                    }}
                  >
                    {selectedDates.length === dateSelectionInfo.availableDates?.length ? '전체 해제' : '전체 선택'}
                  </button>
                </div>

                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}>
                  {dateSelectionInfo.availableDates?.map((item, index) => {
                    const isSelected = selectedDates.includes(item.date);
                    // 날짜 포맷팅 (YYYY-MM-DD → M/D)
                    const dateParts = item.date.split('-');
                    const formattedDate = `${parseInt(dateParts[1])}/${parseInt(dateParts[2])}`;

                    return (
                      <div
                        key={item.date}
                        onClick={() => handleDateToggle(item.date)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          borderBottom: index < dateSelectionInfo.availableDates.length - 1 ? '1px solid #e2e8f0' : 'none',
                          background: isSelected ? '#eff6ff' : '#fff',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span style={{ fontWeight: '500', color: '#1e293b' }}>{formattedDate}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({item.date})</span>
                        </div>
                        <span style={{
                          background: isSelected ? '#3b82f6' : '#e2e8f0',
                          color: isSelected ? '#fff' : '#64748b',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {item.count}건
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 선택된 데이터 수 표시 */}
                {selectedDates.length > 0 && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: '#f0fdf4',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#166534'
                  }}>
                    선택된 데이터:{' '}
                    <strong>
                      {dateSelectionInfo.availableDates
                        ?.filter(d => selectedDates.includes(d.date))
                        .reduce((sum, d) => sum + d.count, 0)}건
                    </strong>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end'
            }}>
              <Button variant="secondary" size="medium" onClick={closeDateSelectionModal}>
                취소
              </Button>
              <Button
                variant="secondary"
                size="medium"
                onClick={() => handleDateSelectionSubmit(true)}
              >
                모두 넣기
              </Button>
              <Button
                variant="primary"
                size="medium"
                onClick={() => handleDateSelectionSubmit(false)}
                disabled={selectedDates.length === 0}
              >
                선택 항목만 업로드
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightFilterPanel;
