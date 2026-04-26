import React, { useState, useRef } from 'react';
import './ImageDropZone.css';

const ImageDropZone = ({
  imageKey,
  currentImage,
  onImageChange,
  maxSize = 2 * 1024 * 1024, // 2MB 기본값
  accept = 'image/*,video/*',
  altText = '',
  onAltChange = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // 파일 타입 검증
  const validateFile = (file) => {
    // 크기 검증
    if (file.size > maxSize) {
      alert('파일 크기는 2MB를 초과할 수 없습니다.');
      return false;
    }

    // 포맷 검증
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        '지원하지 않는 파일 형식입니다.\n지원 형식: JPEG, PNG, GIF, WebP, MP4, WebM, OGG'
      );
      return false;
    }

    return true;
  };

  // 파일 처리
  const handleFile = (file) => {
    if (file && validateFile(file)) {
      onImageChange(imageKey, file);

      // 미리보기 URL 생성
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // 파일 input 변경 핸들러
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  // 드래그 진입
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  // 드래그 오버
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 드래그 벗어남
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragging(false);
      }
      return newCounter;
    });
  };

  // 파일 드롭
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files.length > 1) {
        alert('한 번에 하나의 파일만 업로드할 수 있습니다.');
        return;
      }
      const file = files[0];
      handleFile(file);
    }
  };

  // 파일 선택 버튼 클릭
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 미리보기 URL 결정
  const getPreviewUrl = () => {
    if (previewUrl) return previewUrl;
    if (currentImage) {
      // File 객체인 경우
      if (currentImage instanceof File) {
        return URL.createObjectURL(currentImage);
      }
      // URL 문자열인 경우 (CloudFront URL)
      return currentImage;
    }
    return null;
  };

  // 파일 타입 확인 (비디오인지 이미지인지)
  const isVideo = () => {
    if (currentImage instanceof File) {
      return currentImage.type.startsWith('video/');
    }
    if (typeof currentImage === 'string') {
      return currentImage.match(/\.(mp4|webm|ogg)$/i);
    }
    return false;
  };

  const displayUrl = getPreviewUrl();
  const hasImage = !!displayUrl;
  const isVideoFile = isVideo();


  return (
    <div className="image-drop-zone-wrapper">
      <div
        className={`image-drop-zone ${isDragging ? 'dragging' : ''} ${
          hasImage ? 'has-image' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {hasImage ? (
          <div className="preview-container">
            {isVideoFile ? (
              <video
                src={displayUrl}
                controls
                className="preview-video"
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              >
                브라우저가 비디오 태그를 지원하지 않습니다.
              </video>
            ) : (
              <img
                src={displayUrl}
                alt="Preview"
                className="preview-image"
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
              />
            )}
            <button
              type="button"
              className="change-file-button"
              onClick={handleButtonClick}
            >
              파일 변경
            </button>
          </div>
        ) : (
          <div className="drop-zone-content">
            {isDragging ? (
              <div className="drag-message">
                <span className="drop-icon">📁</span>
                <p>파일을 여기에 놓으세요</p>
              </div>
            ) : (
              <div className="upload-message">
                <span className="upload-icon">📤</span>
                <p>이미지 또는 비디오를 드래그하거나</p>
                <button
                  type="button"
                  className="select-file-button"
                  onClick={handleButtonClick}
                >
                  파일 선택
                </button>
                <p className="file-info">
                  지원 형식: JPEG, PNG, GIF, WebP, MP4, WebM, OGG
                  <br />
                  최대 크기: 2MB
                </p>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          id={`file-input-${imageKey}`}
        />
      </div>

      {onAltChange && (
        <div className="alt-text-input-wrapper">
          {isVideoFile ? (
            <div>
              <label htmlFor={`video-loop-${imageKey}`}>
                <input
                  type="checkbox"
                  id={`video-loop-${imageKey}`}
                  checked={altText === "false"}
                  onChange={(e) => onAltChange(imageKey, e.target.checked ? "false" : "")}
                  className="mr-2"
                />
                한번만 재생
              </label>
            </div>
          ) : (
            <div>
              <label htmlFor={`alt-text-${imageKey}`}>
                ALT 텍스트 (접근성):
              </label>
              <input
                type="text"
                id={`alt-text-${imageKey}`}
                value={altText}
                onChange={(e) => onAltChange(imageKey, e.target.value)}
                placeholder="이미지 설명 입력"
                className="alt-text-input"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageDropZone;
