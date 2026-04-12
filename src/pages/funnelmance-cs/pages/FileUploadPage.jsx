import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import MultiFileInput from "../components/upload/MultiFileInput";
import PreviewTable from "../components/upload/PreviewTable";
import ResultsTable from "../components/upload/ResultsTable";
import DuplicateHandler from "../components/upload/DuplicateHandler";
import DuplicateCheckModal from "../components/upload/DuplicateCheckModal";
import * as api from "../lib/api";

function FileUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStep, setUploadStep] = useState("select"); // 'select' | 'preview' | 'uploading' | 'done'
  const [previewResults, setPreviewResults] = useState([]);
  const [uploadState, setUploadState] = useState("idle"); // 'idle' | 'uploading' | 'success' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [overwriteMode, setOverwriteMode] = useState("skip"); // 'skip' | 'overwrite' | 'ask'
  const [uploadResults, setUploadResults] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // 미리보기 로드 중
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [modifiedResults, setModifiedResults] = useState([]);
  const [showDuplicateCheckModal, setShowDuplicateCheckModal] = useState(false);
  const [duplicateCheckData, setDuplicateCheckData] = useState(null);
  const [duplicateAction, setDuplicateAction] = useState(null);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    setDuplicates([]);
    setUploadResults([]);
    setSelectedFiles([]);
    sessionStorage.removeItem("duplicates");
  }, []);

  // 미리보기 결과가 변경될 때 modifiedResults 업데이트
  useEffect(() => {
    if (previewResults.length > 0) {
      setModifiedResults([...previewResults]);
      setSelectedIndices(new Set());
    }
  }, [previewResults]);

  // 파일 선택 핸들러
  const handleFilesSelect = (newFiles) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    toast.success(`${newFiles.length}개 파일이 선택되었습니다!`);
  };

  // 파일 제거 핸들러
  const handleFileRemove = (fileId) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  // 파일 분류 로직 (재사용)
  const classifyFiles = (files) => {
    const audioFiles = [];
    const excelFiles = [];
    const archiveFiles = [];

    files.forEach((fileObj) => {
      const fileName = fileObj.name.toLowerCase();
      if (/\.(mp3|wav|m4a)$/.test(fileName)) {
        audioFiles.push(fileObj.file);
      } else if (/\.(xlsx|xls|csv)$/.test(fileName)) {
        excelFiles.push(fileObj.file);
      } else if (/\.(zip|tar\.gz|gz|tar)$/.test(fileName)) {
        archiveFiles.push(fileObj.file);
      }
    });

    return { audioFiles, excelFiles, archiveFiles };
  };

  // 미리보기 핸들러
  const handlePreview = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("음성 파일 또는 압축 파일을 선택해주세요.");
      return;
    }

    const { audioFiles, excelFiles, archiveFiles } =
      classifyFiles(selectedFiles);

    // Excel 파일은 반드시 필요함 (직접 선택하거나 압축 파일에 포함되어야 함)
    if (excelFiles.length === 0 && archiveFiles.length === 0) {
      toast.error(
        "Excel 파일은 필수입니다. (직접 선택하거나 압축 파일에 포함되어야 합니다)"
      );
      return;
    }

    // 음성 파일이 필요함
    if (audioFiles.length === 0 && archiveFiles.length === 0) {
      toast.error("음성 파일이 필요합니다. (MP3/WAV/M4A 파일 또는 압축 파일)");
      return;
    }

    setIsLoading(true);

    try {
      // FormData 구성
      const formData = new FormData();

      // 음성 파일 추가
      audioFiles.forEach((file) => {
        formData.append("files", file);
      });

      // Excel 파일 추가
      excelFiles.forEach((file) => {
        formData.append("excel_files", file);
      });

      // 압축 파일 추가
      archiveFiles.forEach((file) => {
        formData.append("archive", file);
      });

      // 중복 처리 모드
      formData.append("overwrite_mode", overwriteMode);

      // API 호출
      const results = await api.previewUpload(formData);

      // 중복 파일 분리
      const duplicateFiles = results.filter((r) => r.is_duplicate);
      const uniqueFiles = results.filter((r) => !r.is_duplicate);

      if (duplicateFiles.length > 0) {
        // 중복 파일이 있으면 모달 표시
        setDuplicateCheckData({
          duplicateFiles,
          uniqueFiles,
          allResults: results,
        });
        setShowDuplicateCheckModal(true);
        return;
      }

      setPreviewResults(results);
      setUploadStep("preview");
      toast.success(`${results.length}개 파일의 미리보기가 준비되었습니다!`);
    } catch (error) {
      console.error("미리보기 실패:", error);
      toast.error(`미리보기 실패: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 업로드 확인 핸들러
  const handleConfirmUpload = async (dataToUpload) => {
    setUploadStep("uploading");
    setUploadState("uploading");
    setUploadProgress(0);

    try {
      const results = await api.confirmUpload(dataToUpload);

      setUploadResults(results);
      setUploadProgress(100);
      setUploadState("success");
      setUploadStep("done");

      toast.success("업로드가 완료되었습니다!");
    } catch (error) {
      console.error("업로드 실패:", error);
      setUploadState("error");
      setUploadStep("preview");
      toast.error(`업로드 실패: ${error.message}`);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    setUploadStep("select");
    setPreviewResults([]);
  };

  // 중복 파일 처리 완료 핸들러
  const handleDuplicateResolve = async (filename, mode) => {
    // 중복 파일에 대한 재업로드 로직
    console.log(`중복 파일 처리: ${filename} - ${mode}`);
    // 사용자의 선택에 따라 재업로드
  };

  // 중복 파일 덮어쓰기 처리
  const handleDuplicateOverwrite = () => {
    if (!duplicateCheckData) return;
    const allResults = duplicateCheckData.allResults;

    // 중복 파일의 overwrite_mode를 "overwrite"로 설정
    const resultsWithOverwrite = allResults.map((r) => ({
      ...r,
      overwrite_mode: r.is_duplicate ? "overwrite" : "skip",
    }));

    setPreviewResults(resultsWithOverwrite);
    setShowDuplicateCheckModal(false);
    setUploadStep("preview");
    toast.success(
      `${allResults.length}개 파일의 미리보기가 준비되었습니다! (중복 파일은 덮어씌우기)`
    );
  };

  // 중복 파일 파일명 변경 처리
  const handleDuplicateRename = () => {
    if (!duplicateCheckData) return;
    const { duplicateFiles, uniqueFiles } = duplicateCheckData;

    // 파일명별로 그룹화 (확장자 제외)
    const fileGroups = {};
    duplicateFiles.forEach((file) => {
      const baseName = file.filename.replace(/\.[^.]+$/, "");
      if (!fileGroups[baseName]) {
        fileGroups[baseName] = [];
      }
      fileGroups[baseName].push(file);
    });

    // 각 그룹별로 복사본 번호 매김
    const renamedFiles = [];
    Object.keys(fileGroups).forEach((baseName) => {
      const group = fileGroups[baseName];
      group.forEach((file, idx) => {
        const ext = file.filename.split(".").pop();
        renamedFiles.push({
          ...file,
          filename: `${baseName}_복사본${idx + 1}.${ext}`,
          s3_path: file.s3_path.replace(
            /([^/]+)$/,
            `${baseName}_복사본${idx + 1}.${ext}`
          ),
          overwrite_mode: "skip", // 파일명 변경 완료, 백엔드는 파일명 변경 안 함
        });
      });
    });

    // 중복이 아닌 파일들도 overwrite_mode 추가
    const uniqueFilesWithMode = uniqueFiles.map((f) => ({
      ...f,
      overwrite_mode: "skip",
    }));

    const allResults = [...uniqueFilesWithMode, ...renamedFiles];
    setPreviewResults(allResults);
    setShowDuplicateCheckModal(false);
    setUploadStep("preview");
    toast.success(
      `${allResults.length}개 파일의 미리보기가 준비되었습니다! (중복 파일명 변경됨)`
    );
  };

  // 중복 파일 업로드 취소
  const handleDuplicateCancel = () => {
    if (!duplicateCheckData) return;
    const uniqueFiles = duplicateCheckData.uniqueFiles;
    setPreviewResults(uniqueFiles);
    setShowDuplicateCheckModal(false);
    if (uniqueFiles.length > 0) {
      setUploadStep("preview");
      toast.success(
        `${uniqueFiles.length}개 파일의 미리보기가 준비되었습니다! (중복 파일 제외)`
      );
    } else {
      toast.info("중복되지 않은 파일이 없습니다.");
    }
  };

  // 미리보기 가능 여부 체크
  const canPreview = selectedFiles.length > 0 && uploadStep === "select";

  return (
    <Layout>
      <div
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid var(--border)",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* 로딩 오버레이 */}
        {(isLoading || uploadState === "uploading") && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              pointerEvents: "auto",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}
            >
              <i
                className="fas fa-spinner fa-spin"
                style={{ fontSize: "2rem", color: "#3b82f6" }}
              ></i>
              <span
                style={{
                  fontSize: "0.95rem",
                  color: "#1f2937",
                  fontWeight: "500",
                }}
              >
                {isLoading ? "미리보기 준비 중..." : "업로드 중..."}
              </span>
            </div>
          </div>
        )}
        <div
          style={{
            padding: "2rem",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            overflow: "auto",
          }}
        >
          {/* 매칭 로직 설명 섹션 - select 단계에만 표시 */}
          {uploadStep === "select" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {/* 매칭 로직 설명 */}
              <details style={{ cursor: "pointer" }}>
                <summary
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "var(--muted)",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    color: "var(--foreground)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    userSelect: "none",
                  }}
                >
                  <i className="fas fa-folder-tree"></i>
                  폴더 구성 및 자동 매칭 로직 보기
                </summary>

                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "1rem",
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {/* 매칭 프로세스 */}
                  <div>
                    <h4
                      style={{
                        margin: "0 0 0.5rem 0",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "var(--foreground)",
                      }}
                    >
                      📋 매칭 프로세스
                    </h4>
                    <ol
                      style={{
                        margin: 0,
                        paddingLeft: "1.5rem",
                        fontSize: "0.8rem",
                        color: "var(--muted-foreground)",
                        lineHeight: "1.8",
                      }}
                    >
                      <li>
                        <span style={{ marginRight: "0.5rem" }}>1️⃣</span>
                        음성파일 파일명에서 <strong>전화번호</strong>(예: hunt_
                        <strong>01012345678</strong>_20250912.mp3)와{" "}
                        <strong>날짜</strong>(예: <strong>20250912</strong>)
                        추출
                      </li>
                      <li>
                        <span style={{ marginRight: "0.5rem" }}>2️⃣</span>Excel
                        파일의 상담 데이터에서 <strong>같은 전화번호</strong>{" "}
                        찾기
                      </li>
                      <li>
                        <span style={{ marginRight: "0.5rem" }}>3️⃣</span>같은
                        전화번호에 여러 기록이 있으면,{" "}
                        <strong>파일명 날짜와 일치하는 Excel 기록</strong> 찾기
                      </li>
                      <li>
                        <span style={{ marginRight: "0.5rem" }}>4️⃣</span>매칭된
                        Excel 데이터의 <strong>브랜드명과 상담원</strong> 정보를
                        폴더 구조로 생성
                      </li>
                      <li>
                        <span style={{ marginRight: "0.5rem" }}>5️⃣</span>파일을
                        S3에 저장:{" "}
                        <code
                          style={{
                            backgroundColor: "var(--muted)",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "3px",
                          }}
                        >
                          브랜드/상담원/날짜/파일명
                        </code>
                      </li>
                    </ol>
                  </div>

                  {/* 폴더 구조 예시 */}
                  <div>
                    <h4
                      style={{
                        margin: "0 0 0.5rem 0",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "var(--foreground)",
                      }}
                    >
                      📁 저장 폴더 구조 예시
                    </h4>
                    <div
                      style={{
                        backgroundColor: "var(--muted)",
                        padding: "0.75rem",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        color: "var(--foreground)",
                        lineHeight: "1.6",
                        overflow: "auto",
                      }}
                    >
                      <div>마그네핏/</div>
                      <div style={{ paddingLeft: "2rem" }}>└─ 안익선/</div>
                      <div style={{ paddingLeft: "4rem" }}>└─ 2025-09-12/</div>
                      <div style={{ paddingLeft: "6rem" }}>
                        └─ hunt_01012345678_20250912.mp3
                      </div>
                      <div style={{ marginTop: "0.5rem" }}>기타/</div>
                      <div style={{ paddingLeft: "2rem" }}>└─ 기타/</div>
                      <div style={{ paddingLeft: "4rem" }}>└─ 2025-09-13/</div>
                      <div style={{ paddingLeft: "6rem" }}>
                        └─ unknown_file.mp3
                      </div>
                    </div>
                  </div>

                  {/* 매칭 케이스 */}
                  <div>
                    <h4
                      style={{
                        margin: "0 0 0.5rem 0",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "var(--foreground)",
                      }}
                    >
                      🔍 매칭 케이스 (7가지)
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        fontSize: "0.8rem",
                      }}
                    >
                      <div
                        style={{
                          paddingLeft: "0.75rem",
                          borderLeft: "3px solid #16a34a",
                        }}
                      >
                        <strong style={{ color: "#16a34a" }}>
                          1️⃣ Excel에 전화번호 1개 기록:
                        </strong>{" "}
                        그 행의 브랜드/상담원 사용 →{" "}
                        <code
                          style={{
                            backgroundColor: "var(--card)",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "3px",
                          }}
                        >
                          브랜드/상담원/Excel날짜
                        </code>{" "}
                        폴더에 저장
                      </div>
                      <div
                        style={{
                          paddingLeft: "0.75rem",
                          borderLeft: "3px solid #16a34a",
                        }}
                      >
                        <strong style={{ color: "#16a34a" }}>
                          2️⃣ Excel에 여러 기록 + 파일명 날짜가 일치:
                        </strong>{" "}
                        일치하는 행의 브랜드/상담원 사용 →{" "}
                        <code
                          style={{
                            backgroundColor: "var(--card)",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "3px",
                          }}
                        >
                          브랜드/상담원/Excel날짜
                        </code>{" "}
                        폴더에 저장
                      </div>
                      <div
                        style={{
                          paddingLeft: "0.75rem",
                          borderLeft: "3px solid #ea580c",
                        }}
                      >
                        <strong style={{ color: "#ea580c" }}>
                          3️⃣ Excel에 여러 기록 + 날짜 불일치:
                        </strong>{" "}
                        첫 번째 행의 브랜드/상담원 사용, 날짜는 파일명 날짜 →{" "}
                        <code
                          style={{
                            backgroundColor: "var(--card)",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "3px",
                          }}
                        >
                          브랜드/상담원/파일명날짜
                        </code>{" "}
                        폴더에 저장
                      </div>
                      <div
                        style={{
                          paddingLeft: "0.75rem",
                          borderLeft: "3px solid #16a34a",
                        }}
                      >
                        <strong style={{ color: "#16a34a" }}>
                          4️⃣ Excel에 여러 기록 + 파일명에 날짜 없음:
                        </strong>{" "}
                        첫 번째 행의 브랜드/상담원 사용 →{" "}
                        <code
                          style={{
                            backgroundColor: "var(--card)",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "3px",
                          }}
                        >
                          브랜드/상담원/Excel날짜
                        </code>{" "}
                        폴더에 저장
                      </div>
                      <div
                        style={{
                          paddingLeft: "0.75rem",
                          borderLeft: "3px solid #ea580c",
                        }}
                      >
                        <strong style={{ color: "#ea580c" }}>
                          5️⃣ 전화번호 없거나 Excel에 없음:
                        </strong>{" "}
                        기타/기타 사용 →{" "}
                        <code
                          style={{
                            backgroundColor: "var(--card)",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "3px",
                          }}
                        >
                          기타/기타/파일명날짜
                        </code>{" "}
                        폴더에 저장
                      </div>
                      <div
                        style={{
                          paddingLeft: "0.75rem",
                          borderLeft: "3px solid #ea580c",
                        }}
                      >
                        <strong style={{ color: "#ea580c" }}>
                          6️⃣ Excel에 브랜드 정보가 없음:
                        </strong>{" "}
                        기타를 브랜드로 사용 →{" "}
                        <code
                          style={{
                            backgroundColor: "var(--card)",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "3px",
                          }}
                        >
                          기타/상담원/Excel날짜
                        </code>{" "}
                        폴더에 저장
                      </div>
                      <div
                        style={{
                          paddingLeft: "0.75rem",
                          borderLeft: "3px solid #ea580c",
                        }}
                      >
                        <strong style={{ color: "#ea580c" }}>
                          7️⃣ Excel에 상담원 정보가 없음:
                        </strong>{" "}
                        기타를 상담원으로 사용 →{" "}
                        <code
                          style={{
                            backgroundColor: "var(--card)",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "3px",
                          }}
                        >
                          브랜드/기타/Excel날짜
                        </code>{" "}
                        폴더에 저장
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* 중복 처리 옵션 */}
          {/* 중복 파일이 있을 때만 라디오 버튼 표시 */}
          {Array.isArray(duplicates) && duplicates.length > 0 && (
            <div
              style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}
            >
              <label
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "var(--foreground)",
                }}
              >
                중복 파일 처리:
              </label>
              <div style={{ display: "flex", gap: "1rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    value="skip"
                    checked={overwriteMode === "skip"}
                    onChange={(e) => setOverwriteMode(e.target.value)}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.85rem" }}>건너뛰기</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    value="overwrite"
                    checked={overwriteMode === "overwrite"}
                    onChange={(e) => setOverwriteMode(e.target.value)}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.85rem" }}>덮어쓰기</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    value="ask"
                    checked={overwriteMode === "ask"}
                    onChange={(e) => setOverwriteMode(e.target.value)}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.85rem" }}>확인 후 결정</span>
                </label>
              </div>
            </div>
          )}

          {/* ===== STEP 1: 파일 선택 ===== */}
          {uploadStep === "select" && (
            <>
              {/* 파일 업로드 안내 */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f0f9ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                  }}
                >
                  <i
                    className="fas fa-info-circle"
                    style={{
                      color: "#0ea5e9",
                      marginTop: "0.2rem",
                      flexShrink: 0,
                    }}
                  ></i>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <strong style={{ color: "#0369a1", fontSize: "0.95rem" }}>
                      업로드할 파일 안내
                    </strong>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#0c4a6e",
                        lineHeight: "1.6",
                      }}
                    >
                      <div>
                        ✓ <strong>음성 파일</strong> (필수): MP3, WAV, M4A 파일
                        또는 압축 파일에 포함
                      </div>
                      <div>
                        ✓ <strong>Excel 파일</strong> (필수): XLSX, XLS, CSV
                        파일 또는 압축 파일에 포함
                      </div>
                      <div>
                        ✓ <strong>압축 파일</strong> (선택): ZIP, TAR.GZ 파일
                        (음성 파일 및 Excel 파일 포함 가능)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 파일 선택 섹션 */}
              <MultiFileInput
                selectedFiles={selectedFiles}
                onFilesSelect={handleFilesSelect}
                onFileRemove={handleFileRemove}
                acceptedTypes=".mp3,.wav,.m4a,.xlsx,.xls,.csv,.zip,.gz,.tar.gz,.tgz"
              />
            </>
          )}

          {/* ===== STEP 2: 미리보기 ===== */}
          {uploadStep === "preview" && (
            <>
              <PreviewTable
                previewResults={previewResults}
                onConfirm={handleConfirmUpload}
                onCancel={handleCancel}
                selectedIndices={selectedIndices}
                setSelectedIndices={setSelectedIndices}
              />

              {/* 통계 섹션 카드 */}
              <div
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  padding: "1.5rem",
                  position: "relative",
                  paddingBottom: "6rem",
                }}
              >
                {/* 통계 내용 */}
                <div
                  style={{
                    display: "flex",
                    gap: "3rem",
                    fontSize: "0.85rem",
                    flexWrap: "wrap",
                    marginBottom: "1rem",
                  }}
                >
                  {/* 전체 개수 */}
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--foreground)",
                      fontWeight: "500",
                      marginBottom: "0.5rem",
                    }}
                  >
                    전체: {modifiedResults.length}개
                  </div>

                  {/* 완벽 매칭 그룹 */}
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        color: "#16a34a",
                        marginBottom: "0.5rem",
                      }}
                      title="Excel에 전화번호 1개 기록만 있음"
                    >
                      완벽 매칭 ✅
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        paddingLeft: "0.5rem",
                        color: "var(--foreground)",
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        <span
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#dcfce7",
                            border: "1px solid #16a34a",
                            marginRight: "0.3rem",
                            verticalAlign: "middle",
                            borderRadius: "2px",
                          }}
                        ></span>
                        완벽 매칭:{" "}
                        {
                          modifiedResults.filter(
                            (r) => r.match_status === "matched_single"
                          ).length
                        }
                        개
                      </span>
                    </div>
                  </div>

                  {/* 부분 매칭 그룹 */}
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        color: "#ea580c",
                        marginBottom: "0.5rem",
                      }}
                    >
                      부분 매칭 ⚠️
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        paddingLeft: "0.5rem",
                        color: "var(--foreground)",
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <span title="Excel에 여러 기록 중 파일명 날짜와 일치하는 기록 선택">
                        <span
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#fed7aa",
                            border: "1px solid #ea580c",
                            marginRight: "0.3rem",
                            verticalAlign: "middle",
                            borderRadius: "2px",
                          }}
                        ></span>
                        날짜 매칭:{" "}
                        {
                          modifiedResults.filter(
                            (r) => r.match_status === "matched_by_date"
                          ).length
                        }
                        개
                      </span>
                      <span title="Excel에 여러 기록 중 파일명 시간과 가장 가까운 기록 선택">
                        <span
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#fdba74",
                            border: "1px solid #d97706",
                            marginRight: "0.3rem",
                            verticalAlign: "middle",
                            borderRadius: "2px",
                          }}
                        ></span>
                        시간 매칭:{" "}
                        {
                          modifiedResults.filter(
                            (r) => r.match_status === "matched_by_time"
                          ).length
                        }
                        개
                      </span>
                      <span title="Excel에 여러 기록 중 첫 번째 기록 선택">
                        <span
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#fb923c",
                            border: "1px solid #b45309",
                            marginRight: "0.3rem",
                            verticalAlign: "middle",
                            borderRadius: "2px",
                          }}
                        ></span>
                        첫 기록:{" "}
                        {
                          modifiedResults.filter(
                            (r) => r.match_status === "matched_first_record"
                          ).length
                        }
                        개
                      </span>
                      <span title="Excel에 전화번호는 있지만 날짜 불일치">
                        <span
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#f97316",
                            border: "1px solid #92400e",
                            marginRight: "0.3rem",
                            verticalAlign: "middle",
                            borderRadius: "2px",
                          }}
                        ></span>
                        날짜 불일치:{" "}
                        {
                          modifiedResults.filter(
                            (r) => r.match_status === "unmatched_date_mismatch"
                          ).length
                        }
                        개
                      </span>
                    </div>
                  </div>

                  {/* 미매칭 그룹 */}
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        color: "#dc2626",
                        marginBottom: "0.5rem",
                      }}
                      title="Excel에 전화번호 없음 또는 매칭 불가"
                    >
                      미매칭 ❌
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        paddingLeft: "0.5rem",
                        color: "var(--foreground)",
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        <span
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#fee2e2",
                            border: "1px solid #dc2626",
                            marginRight: "0.3rem",
                            verticalAlign: "middle",
                            borderRadius: "2px",
                          }}
                        ></span>
                        미매칭:{" "}
                        {
                          modifiedResults.filter(
                            (r) => r.match_status === "unmatched"
                          ).length
                        }
                        개
                      </span>
                    </div>
                  </div>
                </div>

                {/* 픽스된 버튼 영역 */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    padding: "1rem 1.5rem",
                    backgroundColor: "var(--muted)",
                    borderTop: "1px solid var(--border)",
                    borderRadius: "0 0 12px 12px",
                    display: "flex",
                    gap: "0.75rem",
                    justifyContent: "space-between",
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {selectedIndices.size > 0 ? (
                      <span>
                        <strong>{selectedIndices.size}개</strong> 파일 선택됨
                      </span>
                    ) : (
                      <span>선택된 파일 없음</span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={handleCancel}
                      style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "var(--secondary)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#e5e7eb";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "var(--secondary)";
                      }}
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        if (selectedIndices.size === 0) {
                          handleConfirmUpload(modifiedResults);
                        } else {
                          const selectedFiles = modifiedResults.filter(
                            (_, idx) => selectedIndices.has(idx)
                          );
                          handleConfirmUpload(selectedFiles);
                        }
                      }}
                      style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "var(--accent)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                      }}
                    >
                      {selectedIndices.size === 0 ||
                      selectedIndices.size === modifiedResults.length
                        ? `전체 업로드 (${modifiedResults.length}개)`
                        : `선택한 파일 업로드 (${selectedIndices.size}개)`}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===== STEP 3: 업로드 중 ===== */}
          {uploadStep === "uploading" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  color: "var(--foreground)",
                }}
              >
                <span>업로드 진행 중... ({previewResults.length}개 파일)</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  backgroundColor: "var(--muted)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    backgroundColor: "var(--accent)",
                    borderRadius: "3px",
                    transition: "width 0.3s ease",
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* ===== STEP 4: 완료 ===== */}
          {uploadStep === "done" && (
            <>
              {uploadResults.length > 0 && (
                <ResultsTable results={uploadResults} />
              )}

              {uploadState === "success" && uploadResults.length === 0 && (
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <i
                    className="fas fa-check-circle"
                    style={{ color: "#16a34a" }}
                  ></i>
                  <span
                    style={{
                      color: "#166534",
                      fontWeight: "500",
                      fontSize: "0.9rem",
                    }}
                  >
                    업로드가 완료되었습니다!
                  </span>
                </div>
              )}

              {uploadState === "error" && (
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <i
                    className="fas fa-exclamation-circle"
                    style={{ color: "#dc2626" }}
                  ></i>
                  <span
                    style={{
                      color: "#991b1b",
                      fontWeight: "500",
                      fontSize: "0.9rem",
                    }}
                  >
                    업로드에 실패했습니다.
                  </span>
                </div>
              )}

              <div style={{ marginTop: "auto" }} />

              <button
                onClick={() => {
                  setSelectedFiles([]);
                  setPreviewResults([]);
                  setUploadResults([]);
                  setDuplicates([]);
                  setUploadState("idle");
                  setUploadProgress(0);
                  setUploadStep("select");
                }}
                style={{
                  width: "100%",
                  padding: "1rem 1.5rem",
                  backgroundColor: "var(--accent)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(255,112,67,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                확인
              </button>
            </>
          )}

          {/* 중복 파일 처리 - 중복 파일이 실제로 있을 때만 표시 */}
          {Array.isArray(duplicates) && duplicates.length > 0 && (
            <DuplicateHandler
              duplicates={duplicates}
              onResolve={handleDuplicateResolve}
            />
          )}

          {/* 중복 파일 확인 모달 */}
          {showDuplicateCheckModal && duplicateCheckData && (
            <DuplicateCheckModal
              duplicateFiles={duplicateCheckData.duplicateFiles}
              onOverwrite={handleDuplicateOverwrite}
              onCancel={handleDuplicateCancel}
              onRename={handleDuplicateRename}
            />
          )}

          {/* 여백 */}
          <div style={{ marginTop: "auto" }}></div>

          {/* STEP 1: 미리보기 버튼 */}
          {uploadStep === "select" && (
            <button
              onClick={handlePreview}
              disabled={!canPreview}
              style={{
                width: "100%",
                padding: "1rem 1.5rem",
                marginTop: "1rem",
                backgroundColor: canPreview
                  ? "var(--accent)"
                  : "var(--muted-foreground)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: canPreview ? "pointer" : "not-allowed",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                boxShadow: canPreview
                  ? "0 4px 12px rgba(255,112,67,0.25)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (canPreview) {
                  e.target.style.backgroundColor = "var(--accent)";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(255,112,67,0.35)";
                }
              }}
              onMouseLeave={(e) => {
                if (canPreview) {
                  e.target.style.backgroundColor = "var(--accent)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(255,112,67,0.25)";
                }
              }}
            >
              <i className="fas fa-eye"></i>
              미리보기 ({selectedFiles.length}개 파일)
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default FileUploadPage;
