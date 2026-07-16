import { useState, useEffect } from "react";
import { updateTranscript as updateTranscriptAPI, deleteTranscript as deleteTranscriptAPI } from "../../lib/api";
import { toast } from "sonner";

function TranscriptModal({ open, onClose, file, transcript: initialTranscript, onDeleted }) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [originalText, setOriginalText] = useState(initialTranscript?.text || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (initialTranscript) {
      setTranscript(initialTranscript);
      setOriginalText(initialTranscript.text || "");
      setHasChanges(false);
      setIsEditing(false);
    }
  }, [initialTranscript]);

  if (!open) return null;

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setTranscript({ ...transcript, text: newText });
    setHasChanges(newText !== originalText);
  };

  const handleSegmentTextChange = (segmentId, newText) => {
    const updatedSegments = transcript.segments.map(seg =>
      seg.id === segmentId ? { ...seg, text: newText } : seg
    );
    const updatedTranscript = {
      ...transcript,
      segments: updatedSegments,
      text: updatedSegments.map(s => s.text).join(' ')
    };
    setTranscript(updatedTranscript);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info("변경사항이 없습니다");
      return;
    }

    try {
      setIsSaving(true);
      await updateTranscriptAPI(file.id, transcript);
      toast.success("스크립트가 저장되었습니다");
      setOriginalText(transcript.text);
      setHasChanges(false);
      setIsEditing(false);
    } catch (error) {
      console.error("스크립트 저장 오류:", error);
      toast.error(`저장 실패: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // textarea에 focus 주기 위해 다음 틱에서 실행
    setTimeout(() => {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.focus();
      }
    }, 0);
  };

  const handleCancelEdit = () => {
    setTranscript({ ...transcript, text: originalText });
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    try {
      const textToCopy = transcript?.segments && Array.isArray(transcript.segments)
        ? formatSegments(transcript.segments)
        : transcript?.text || "";
      await navigator.clipboard.writeText(textToCopy);
      toast.success("클립보드에 복사되었습니다");
    } catch (error) {
      console.error("복사 오류:", error);
      toast.error("복사 실패");
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTranscriptAPI(file.id);
      toast.success("스크립트가 삭제되었습니다");
      setShowDeleteConfirm(false);
      if (onDeleted) {
        onDeleted(file.id);
      }
      onClose();
    } catch (error) {
      console.error("스크립트 삭제 오류:", error);
      toast.error(`삭제 실패: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && isEditing) {
      if (window.confirm("변경사항이 있습니다. 저장하지 않고 닫으시겠습니까?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "알 수 없음";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}분 ${secs}초`;
  };

  const formatTimestamp = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`;
  };

  const formatSegments = (segments) => {
    if (!segments || !Array.isArray(segments)) return "";
    return segments
      .map(segment => `${formatTimestamp(segment.start)} ${segment.text}`)
      .join('\n');
  };

  const displayText = transcript?.segments
    ? formatSegments(transcript.segments)
    : transcript?.text || "";

  return (
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
        zIndex: 10000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          padding: "2rem",
          width: "90%",
          maxWidth: "900px",
          maxHeight: "90vh",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.3rem",
              fontWeight: "700",
              color: "var(--foreground)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i
              className="fas fa-file-alt"
              style={{ color: "var(--primary)" }}
            ></i>
            스크립트 보기 -
            <span style={{ fontSize: "1rem", fontWeight: "600" }}>
              {file.name}
            </span>
          </h2>
          <button
            onClick={handleClose}
            style={{
              padding: "0.5rem",
              backgroundColor: "transparent",
              color: "var(--muted-foreground)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1.2rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--muted)";
              e.target.style.color = "var(--foreground)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "var(--muted-foreground)";
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* 정보 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "0.75rem 1rem",
            backgroundColor: "var(--muted)",
            borderRadius: "8px",
            fontSize: "0.85rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="fas fa-language" style={{ color: "var(--primary)" }}></i>
            <span style={{ fontWeight: "600" }}>언어:</span>
            <span style={{ color: "var(--muted-foreground)" }}>
              {transcript?.language || "알 수 없음"}
            </span>
          </div>
          <span style={{ color: "var(--muted-foreground)" }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="fas fa-clock" style={{ color: "var(--primary)" }}></i>
            <span style={{ fontWeight: "600" }}>길이:</span>
            <span style={{ color: "var(--muted-foreground)" }}>
              {formatDuration(transcript?.duration)}
            </span>
          </div>
          {hasChanges && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginLeft: "auto",
                padding: "0.25rem 0.75rem",
                backgroundColor: "var(--accent)",
                color: "white",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "600",
              }}
            >
              <i className="fas fa-exclamation-circle"></i>
              변경사항 있음
            </div>
          )}
        </div>

        {/* 스크립트 텍스트 */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {transcript?.segments && Array.isArray(transcript.segments) ? (
            <div
              style={{
                maxHeight: "350px",
                padding: "1rem",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                backgroundColor: isEditing ? "white" : "var(--muted)",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {transcript.segments.map((segment) => (
                <div
                  key={segment.id}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#3b82f6",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      minWidth: "50px",
                      flexShrink: 0,
                      paddingTop: "0.2rem",
                    }}
                  >
                    {formatTimestamp(segment.start)}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={segment.text}
                      onChange={(e) => handleSegmentTextChange(segment.id, e.target.value)}
                      style={{
                        flex: 1,
                        padding: "0.25rem 0.5rem",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                        backgroundColor: "white",
                        outline: "none",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        flex: 1,
                        fontSize: "0.9rem",
                        color: "var(--foreground)",
                        lineHeight: "1.6",
                      }}
                    >
                      {segment.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <textarea
              value={transcript?.text || ""}
              onChange={handleTextChange}
              readOnly={!isEditing}
              style={{
                minHeight: "100px",
                maxHeight: "350px",
                padding: "1rem",
                fontSize: "0.9rem",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                backgroundColor: isEditing ? "white" : "var(--muted)",
                color: "var(--foreground)",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
                lineHeight: "1.6",
                cursor: isEditing ? "text" : "default",
              }}
              placeholder="스크립트가 없습니다"
            />
          )}
        </div>

        {/* 버튼 */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={handleCopy}
            style={{
              padding: "0.75rem 1.25rem",
              backgroundColor: "var(--secondary)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--muted)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "var(--secondary)";
            }}
          >
            <i className="fas fa-copy"></i>
            복사
          </button>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              style={{
                padding: "0.75rem 1.25rem",
                backgroundColor: "#f97316",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#ea580c";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#f97316";
              }}
            >
              <i className="fas fa-edit"></i>
              수정
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: "0.75rem 1.25rem",
                  backgroundColor: "var(--secondary)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--muted)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "var(--secondary)";
                }}
              >
                <i className="fas fa-times"></i>
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                style={{
                  padding: "0.75rem 1.25rem",
                  backgroundColor:
                    isSaving || !hasChanges ? "#9ca3af" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: isSaving || !hasChanges ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                onMouseEnter={(e) => {
                  if (!isSaving && hasChanges) {
                    e.target.style.backgroundColor = "#059669";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving && hasChanges) {
                    e.target.style.backgroundColor = "#10b981";
                  }
                }}
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    저장 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    저장
                  </>
                )}
              </button>
            </>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            style={{
              padding: "0.75rem 1.25rem",
              backgroundColor: isDeleting ? "var(--muted)" : "var(--destructive)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: isDeleting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.target.style.backgroundColor = "#b91c1c";
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.target.style.backgroundColor = "var(--destructive)";
              }
            }}
          >
            {isDeleting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                삭제 중...
              </>
            ) : (
              <>
                <i className="fas fa-trash"></i>
                삭제
              </>
            )}
          </button>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              padding: "2rem",
              maxWidth: "400px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: "var(--foreground)",
                }}
              >
                정말 삭제하시겠습니까?
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--muted-foreground)",
                  lineHeight: "1.5",
                }}
              >
                이 작업은 되돌릴 수 없습니다.
                <br />
                스크립트가 영구적으로 삭제됩니다.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: "var(--secondary)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--muted)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "var(--secondary)";
                }}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  backgroundColor: "var(--destructive)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "var(--destructive)";
                }}
              >
                예, 삭제합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TranscriptModal;
