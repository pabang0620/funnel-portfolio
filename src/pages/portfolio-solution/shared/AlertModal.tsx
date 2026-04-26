import { createPortal } from 'react-dom'

interface AlertModalProps {
  message: string
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
}

const AlertModal = ({
  message,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
}: AlertModalProps) => {
  const content = (
    <div className="alert-modal">
      <div className="alert-modal-content">
        <p className="alert-modal-message">{message}</p>
        <div className="alert-modal-actions">
          {onCancel && (
            <button className="alert-modal-button cancel" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button className="alert-modal-button confirm" onClick={onConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default AlertModal
