import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFileExcel, faCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { uploadCSExcel, saveCSData, getProducts } from '../api';

const UploadModal = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [products, setProducts] = useState([]);
  const [manualMappings, setManualMappings] = useState({});
  const [saveResult, setSaveResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.match(/\.(xlsx|xls)$/)) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('엑셀 파일만 업로드 가능합니다.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await uploadCSExcel(file);

      if (!result.success) {
        setError(result.msg);
        setLoading(false);
        return;
      }

      setUploadResult(result.data);

      if (result.data.unmatchedProducts.length > 0) {
        const productsResult = await getProducts();
        if (productsResult.success) {
          setProducts(productsResult.data);
        }
      }

      setStep(2);
    } catch (err) {
      setError('업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (csProductName, productId, productName) => {
    setManualMappings(prev => ({
      ...prev,
      [csProductName]: { csProductName, productId, productName }
    }));
  };

  const handleSave = async () => {
    const unmatchedCount = uploadResult.unmatchedProducts.filter(
      name => !manualMappings[name]
    ).length;

    if (unmatchedCount > 0) {
      setError(`${unmatchedCount}개 상품의 매칭이 필요합니다.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await saveCSData({
        parsedData: uploadResult.parsedData,
        newMappings: Object.values(manualMappings),
        marketPlaceId: null
      });

      if (!result.success) {
        setError(result.msg);
        setLoading(false);
        return;
      }

      setSaveResult(result.data);
      setStep(3);
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isAllMatched = uploadResult?.unmatchedProducts.every(
    name => manualMappings[name]
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>CS 데이터 업로드</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
              <span className="step-number">{step > 1 ? <FontAwesomeIcon icon={faCheck} /> : '1'}</span>
              <span className="step-label">파일 선택</span>
            </div>
            <div className="step-divider" />
            <div className={`step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
              <span className="step-number">{step > 2 ? <FontAwesomeIcon icon={faCheck} /> : '2'}</span>
              <span className="step-label">매칭 확인</span>
            </div>
            <div className="step-divider" />
            <div className={`step ${step === 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">완료</span>
            </div>
          </div>

          {/* Step 1: File Upload */}
          {step === 1 && (
            <>
              <div
                className={`dropzone ${file ? 'has-file' : ''}`}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls"
                  hidden
                />
                <div className="dropzone-icon">
                  <FontAwesomeIcon icon={file ? faFileExcel : faCloudUploadAlt} />
                </div>
                {file ? (
                  <p className="file-name">{file.name}</p>
                ) : (
                  <p>파일을 드래그하거나 클릭하여 선택</p>
                )}
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button className="btn-cancel" onClick={onClose}>취소</button>
                <button
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={!file || loading}
                >
                  {loading ? '처리 중...' : '업로드'}
                </button>
              </div>
            </>
          )}

          {/* Step 2: Matching */}
          {step === 2 && uploadResult && (
            <>
              {/* Summary */}
              <div className="upload-summary">
                <div className="summary-grid">
                  <div className="summary-item">
                    <div className="summary-label">전체</div>
                    <div className="summary-value">{uploadResult.summary.total}건</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">유효</div>
                    <div className="summary-value">{uploadResult.summary.valid}건</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">필터링</div>
                    <div className="summary-value">{uploadResult.summary.filtered}건</div>
                  </div>
                </div>
              </div>

              {/* Matched Products */}
              {uploadResult.matchedProducts.length > 0 && (
                <div className="matched-section">
                  <div className="section-title">
                    자동 매칭됨
                    <span className="badge">{uploadResult.matchedProducts.length}</span>
                  </div>
                  <div className="matched-list">
                    {uploadResult.matchedProducts.map((item, idx) => (
                      <div key={idx} className="matched-item">
                        <span>{item.csProductName}</span>
                        <span className="matched-arrow">
                          <FontAwesomeIcon icon={faArrowRight} />
                        </span>
                        <span>{item.productName}</span>
                        <span className="matched-count">{item.count}건</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unmatched Products */}
              {uploadResult.unmatchedProducts.length > 0 && (
                <div className="unmatched-section">
                  <div className="section-title warning">
                    매칭 필요
                    <span className="badge">{uploadResult.unmatchedProducts.length}</span>
                  </div>
                  <div className="mapping-form">
                    {uploadResult.unmatchedProducts.map((name, idx) => (
                      <div key={idx} className="mapping-row">
                        <span className="cs-product-name">{name}</span>
                        <select
                          className="mapping-select"
                          value={manualMappings[name]?.productId || ''}
                          onChange={e => {
                            const product = products.find(p => p.id === parseInt(e.target.value));
                            if (product) {
                              handleMappingChange(name, product.id, product.name);
                            }
                          }}
                        >
                          <option value="">제품 선택</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setStep(1)}>이전</button>
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={!isAllMatched || loading}
                >
                  {loading ? '저장 중...' : '저장'}
                </button>
              </div>
            </>
          )}

          {/* Step 3: Complete */}
          {step === 3 && saveResult && (
            <div className="result-section">
              <div className="result-icon">
                <FontAwesomeIcon icon={faCheck} />
              </div>
              <div className="result-title">저장 완료</div>
              <p className="result-description">
                {saveResult.summary.created}건이 저장되었습니다.
              </p>
              <div className="modal-actions" style={{ justifyContent: 'center' }}>
                <button className="btn-primary" onClick={onComplete}>
                  확인
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
