import { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';

// 컬럼 정의
const COLUMN_DEFINITIONS = [
  { key: '총매출', label: '총매출', className: 'total-sales' },
  { key: '직접매출', label: '직접 매출', className: 'direct-revenue' },
  { key: '직접ROAS', label: '직접 ROAS', className: 'direct-roas' },
  { key: '간접매출', label: '간접 매출', className: 'indirect-revenue' },
  { key: '판매마진', label: '판매마진', className: 'margin' },
  { key: '공헌이익', label: '공헌이익', className: 'profit' },
  { key: '이익률', label: '이익률', className: 'profit-rate' },
  { key: '광고비', label: '광고비', className: 'ad-cost' },
  { key: 'ROAS', label: 'ROAS', className: 'roas' },
  { key: '대행료', label: '대행료', className: 'commission' },
];

/**
 * 컬럼 표시/숨김 설정 모달
 * S등급: 모든 컬럼 선택 가능
 * A등급: 광고비, ROAS만 선택 가능
 */
const ColumnSettingsModal = ({
  isOpen,
  onClose,
  columnVisibility,
  onSave,
  isAdmin,
  hasPermission,
  isSaving,
  selectedChannels = [],        // 현재 선택된 판매처 목록 (배열)
  selectedFileChannels = [],    // 현재 선택된 파일판매처 목록 (배열)
  viewMode = 'channel',         // 'channel' | 'fileChannel'
}) => {
  const [localSettings, setLocalSettings] = useState({});

  // 초기값 설정
  useEffect(() => {
    if (isOpen) {
      if (columnVisibility && columnVisibility.기본컬럼) {
        // 새 구조 - 현재 선택된 판매처의 기본값 설정
        const merged = {
          기본컬럼: { ...columnVisibility.기본컬럼 },
          판매처: { ...columnVisibility.판매처 },
          파일판매처: { ...columnVisibility.파일판매처 }
        };

        // 현재 선택된 판매처 중 설정에 없는 것은 true로 초기화
        selectedChannels?.forEach(ch => {
          if (merged.판매처[ch.name] === undefined) {
            merged.판매처[ch.name] = true;
          }
        });

        // 현재 선택된 파일판매처 중 설정에 없는 것은 true로 초기화
        selectedFileChannels?.forEach(ch => {
          if (merged.파일판매처[ch.name] === undefined) {
            merged.파일판매처[ch.name] = true;
          }
        });

        setLocalSettings(merged);
      } else if (columnVisibility) {
        // 기존 구조 → 새 구조로 마이그레이션
        const migrated = {
          기본컬럼: { ...columnVisibility },
          판매처: {},
          파일판매처: {}
        };
        selectedChannels?.forEach(ch => {
          migrated.판매처[ch.name] = true;
        });
        selectedFileChannels?.forEach(ch => {
          migrated.파일판매처[ch.name] = true;
        });
        setLocalSettings(migrated);
      } else {
        // 기본값
        const defaultSettings = {
          기본컬럼: {},
          판매처: {},
          파일판매처: {}
        };
        COLUMN_DEFINITIONS.forEach(col => {
          defaultSettings.기본컬럼[col.key] = true;
        });
        selectedChannels?.forEach(ch => {
          defaultSettings.판매처[ch.name] = true;
        });
        selectedFileChannels?.forEach(ch => {
          defaultSettings.파일판매처[ch.name] = true;
        });
        setLocalSettings(defaultSettings);
      }
    }
  }, [isOpen, columnVisibility, selectedChannels, selectedFileChannels]);

  // A등급 권한: 광고비, ROAS만 체크 가능
  const isColumnEnabled = (columnKey) => {
    if (isAdmin) return true;

    // A등급: 광고비, ROAS만 활성화
    const allowedColumns = ['광고비', 'ROAS'];
    return allowedColumns.includes(columnKey);
  };

  // 기본 컬럼 개별 체크박스 토글
  const handleToggle = (columnKey) => {
    if (!isColumnEnabled(columnKey)) return;

    setLocalSettings(prev => ({
      ...prev,
      기본컬럼: {
        ...prev.기본컬럼,
        [columnKey]: !(prev.기본컬럼?.[columnKey] ?? true),
      },
    }));
  };

  // 판매처 체크박스 토글
  const handleToggleChannel = (channelName) => {
    setLocalSettings(prev => ({
      ...prev,
      판매처: {
        ...prev.판매처,
        [channelName]: !(prev.판매처?.[channelName] ?? true),
      },
    }));
  };

  // 파일판매처 체크박스 토글
  const handleToggleFileChannel = (channelName) => {
    setLocalSettings(prev => ({
      ...prev,
      파일판매처: {
        ...prev.파일판매처,
        [channelName]: !(prev.파일판매처?.[channelName] ?? true),
      },
    }));
  };

  // 기본 컬럼 전체 선택/해제 (권한 있는 컬럼만)
  const handleSelectAllBasic = (checked) => {
    const newBasicSettings = {};
    COLUMN_DEFINITIONS.forEach(col => {
      if (isColumnEnabled(col.key)) {
        newBasicSettings[col.key] = checked;
      } else {
        newBasicSettings[col.key] = localSettings.기본컬럼?.[col.key] || false;
      }
    });
    setLocalSettings(prev => ({
      ...prev,
      기본컬럼: newBasicSettings,
    }));
  };

  // 판매처 전체 선택/해제
  const handleSelectAllChannels = (checked) => {
    const newChannelSettings = {};
    selectedChannels.forEach(ch => {
      newChannelSettings[ch.name] = checked;
    });
    setLocalSettings(prev => ({
      ...prev,
      판매처: newChannelSettings,
    }));
  };

  // 파일판매처 전체 선택/해제
  const handleSelectAllFileChannels = (checked) => {
    const newFileChannelSettings = {};
    selectedFileChannels.forEach(ch => {
      newFileChannelSettings[ch.name] = checked;
    });
    setLocalSettings(prev => ({
      ...prev,
      파일판매처: newFileChannelSettings,
    }));
  };

  // 기본 컬럼 전체 선택 상태 계산
  const isAllBasicSelected = () => {
    return COLUMN_DEFINITIONS
      .filter(col => isColumnEnabled(col.key))
      .every(col => localSettings.기본컬럼?.[col.key]);
  };

  // 판매처 전체 선택 상태 계산
  const isAllChannelsSelected = () => {
    if (selectedChannels.length === 0) return false;
    return selectedChannels.every(ch => localSettings.판매처?.[ch.name] !== false);
  };

  // 파일판매처 전체 선택 상태 계산
  const isAllFileChannelsSelected = () => {
    if (selectedFileChannels.length === 0) return false;
    return selectedFileChannels.every(ch => localSettings.파일판매처?.[ch.name] !== false);
  };

  // 저장 핸들러
  const handleSave = () => {
    onSave(localSettings);
  };

  // 취소 핸들러
  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} maxWidth="500px">
      <div style={{ padding: '1.5rem' }}>
        {/* 헤더 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            borderBottom: '2px solid #e4e4e7',
            paddingBottom: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
            컬럼 표시 설정
          </h2>
          <button
            onClick={handleCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#71717a',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* 컬럼 목록 */}
        <div
          style={{
            maxHeight: '500px',
            overflowY: 'auto',
            marginBottom: '1.5rem',
          }}
        >
          {/* 기본 컬럼 섹션 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #e4e4e7',
              }}
            >
              <input
                type="checkbox"
                checked={isAllBasicSelected()}
                onChange={(e) => handleSelectAllBasic(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#3b82f6',
                }}
              />
              <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#18181b' }}>
                기본 컬럼
              </span>
            </div>

            {COLUMN_DEFINITIONS
              .filter((column) => isColumnEnabled(column.key))
              .map((column) => {
                const checked = localSettings.기본컬럼?.[column.key] !== false;

                return (
                  <label
                    key={column.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontSize: '0.9375rem',
                      backgroundColor: checked ? '#f0f9ff' : 'transparent',
                      borderRadius: '6px',
                      marginBottom: '0.5rem',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!checked) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!checked) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggle(column.key)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#3b82f6',
                      }}
                    />
                    <span style={{ color: '#374151' }}>
                      {column.label}
                    </span>
                  </label>
                );
              })}
          </div>

          {/* 판매처 섹션 (channel 모드일 때만) */}
          {viewMode === 'channel' && selectedChannels.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #e4e4e7',
                }}
              >
                <input
                  type="checkbox"
                  checked={isAllChannelsSelected()}
                  onChange={(e) => handleSelectAllChannels(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6',
                  }}
                />
                <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#18181b' }}>
                  판매처
                </span>
              </div>

              {selectedChannels.map((channel) => {
                const checked = localSettings.판매처?.[channel.name] !== false;

                return (
                  <label
                    key={channel.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontSize: '0.9375rem',
                      backgroundColor: checked ? '#f0f9ff' : 'transparent',
                      borderRadius: '6px',
                      marginBottom: '0.5rem',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!checked) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!checked) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleChannel(channel.name)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#3b82f6',
                      }}
                    />
                    <span style={{ color: '#374151' }}>
                      {channel.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* 파일판매처 섹션 (fileChannel 모드일 때만) */}
          {viewMode === 'fileChannel' && selectedFileChannels.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #e4e4e7',
                }}
              >
                <input
                  type="checkbox"
                  checked={isAllFileChannelsSelected()}
                  onChange={(e) => handleSelectAllFileChannels(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6',
                  }}
                />
                <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#18181b' }}>
                  파일판매처
                </span>
              </div>

              {selectedFileChannels.map((channel) => {
                const checked = localSettings.파일판매처?.[channel.name] !== false;

                return (
                  <label
                    key={channel.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontSize: '0.9375rem',
                      backgroundColor: checked ? '#f0f9ff' : 'transparent',
                      borderRadius: '6px',
                      marginBottom: '0.5rem',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!checked) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!checked) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleFileChannel(channel.name)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#3b82f6',
                      }}
                    />
                    <span style={{ color: '#374151' }}>
                      {channel.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e4e4e7',
          }}
        >
          <button
            onClick={handleCancel}
            disabled={isSaving}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              border: '1px solid #e4e4e7',
              borderRadius: '6px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              backgroundColor: '#fff',
              color: '#374151',
              fontWeight: '500',
              transition: 'all 0.15s ease',
              opacity: isSaving ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#d4d4d8';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.target.style.backgroundColor = '#fff';
                e.target.style.borderColor = '#e4e4e7';
              }
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              border: 'none',
              borderRadius: '6px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              backgroundColor: isSaving ? '#93c5fd' : '#3b82f6',
              color: '#fff',
              fontWeight: '600',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSaving) {
                e.target.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ColumnSettingsModal;
