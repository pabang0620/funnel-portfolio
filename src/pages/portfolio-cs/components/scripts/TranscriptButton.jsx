import { useState } from "react";
import { extractTranscript } from "../../lib/api";
import { toast } from "sonner";

function TranscriptButton({ file, onExtracted }) {
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtract = async (e) => {
    e.stopPropagation();

    if (isExtracting) return;

    try {
      setIsExtracting(true);
      toast.loading("스크립트 추출 중...", { id: "extract" });

      const result = await extractTranscript(file.id);

      toast.success(
        result.already_extracted
          ? "이미 추출된 스크립트입니다"
          : "스크립트 추출이 완료되었습니다",
        { id: "extract" }
      );

      // 부모 컴포넌트에 추출된 데이터 전달
      if (onExtracted && result.transcript) {
        onExtracted(file.id, result.transcript);
      }
    } catch (error) {
      console.error("스크립트 추출 오류:", error);
      toast.error(`스크립트 추출 실패: ${error.message}`, { id: "extract" });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleView = (e) => {
    e.stopPropagation();
    if (onExtracted) {
      onExtracted(file.id, file.transcript);
    }
  };

  // 이미 스크립트가 있으면 "보기" 버튼
  if (file.transcript) {
    return (
      <button
        onClick={handleView}
        style={{
          padding: "0.4rem",
          backgroundColor: "#10b981",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "0.7rem",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#059669")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#10b981")}
        title="스크립트 보기"
      >
        <i className="fas fa-file-alt"></i>
      </button>
    );
  }

  // 추출 중이면 로딩 버튼
  if (isExtracting) {
    return (
      <button
        disabled
        style={{
          padding: "0.4rem",
          backgroundColor: "var(--muted)",
          color: "var(--muted-foreground)",
          border: "none",
          borderRadius: "4px",
          cursor: "not-allowed",
          fontSize: "0.7rem",
        }}
        title="추출 중..."
      >
        <i className="fas fa-spinner fa-spin"></i>
      </button>
    );
  }

  // 스크립트 없으면 "추출" 버튼
  return (
    <button
      onClick={handleExtract}
      style={{
        padding: "0.4rem",
        backgroundColor: "var(--primary)",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "0.7rem",
      }}
      title="스크립트 추출하기"
    >
      <i className="fas fa-file-export"></i>
    </button>
  );
}

export default TranscriptButton;
