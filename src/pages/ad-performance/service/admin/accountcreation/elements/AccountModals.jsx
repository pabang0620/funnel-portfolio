import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faExclamationTriangle,
  faKey,
  faPen,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../../../components/ui/Modal";
import AlertModal from "../../../../components/ui/AlertModal";
import "./AccountModals.css";

function AccountModals({
  // 비밀번호 변경 모달
  showPasswordChangeModal,
  setShowPasswordChangeModal,
  passwordChangeData,
  setPasswordChangeData,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handlePasswordChangeSubmit,

  // S등급 편집 확인 모달
  showEditConfirmModal,
  setShowEditConfirmModal,
  editCurrentUserPassword,
  setEditCurrentUserPassword,
  handleEditConfirmSubmit,

  // 계정 수정 본인 확인 모달
  showEditPasswordConfirmModal,
  setShowEditPasswordConfirmModal,
  editPasswordModalType,
  editPasswordConfirmInput,
  setEditPasswordConfirmInput,
  handleEditPasswordConfirm,
  userName,

  // 알림 모달
  alertModal,
  closeAlert,

  // 팀 액션 모달
  teamActionModal,
  closeTeamActionModal,
  setTeamActionModal,
  handleTeamActionConfirm,
}) {
  return (
    <>
      {/* 비밀번호 변경 모달 */}
      <Modal
        isOpen={showPasswordChangeModal}
        onClose={() => setShowPasswordChangeModal(false)}
        title="비밀번호 변경"
      >
        <div className="confirm-modal-content">
          <div className="modal-icon">
            <FontAwesomeIcon icon={faKey} />
          </div>
          <p className="modal-description">
            {passwordChangeData.targetUserId}님의 비밀번호를 변경합니다.
          </p>
          <div className="modal-form">
            <div className="form-field">
              <label>새 비밀번호</label>
              <div className="password-input-container">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordChangeData.newPassword}
                  onChange={(e) =>
                    setPasswordChangeData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="새 비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  className="password-visibility-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <FontAwesomeIcon
                    icon={showNewPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
            </div>
            <div className="form-field">
              <label>비밀번호 확인</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordChangeData.confirmPassword}
                  onChange={(e) =>
                    setPasswordChangeData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  className="password-visibility-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button
              className="modal-btn modal-btn-cancel"
              onClick={() => setShowPasswordChangeModal(false)}
            >
              취소
            </button>
            <button
              className="modal-btn modal-btn-confirm"
              onClick={handlePasswordChangeSubmit}
            >
              변경
            </button>
          </div>
        </div>
      </Modal>

      {/* S등급/A등급 편집시 비밀번호 확인 모달 */}
      <Modal
        isOpen={showEditConfirmModal}
        onClose={() => setShowEditConfirmModal(false)}
        title="상위 등급 계정 수정 확인"
      >
        <div className="confirm-modal-content">
          <div className="modal-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <p className="modal-description">
            {userName}님의 비밀번호를 입력해주세요.
          </p>
          <div className="modal-form">
            <div className="form-field">
              <label>비밀번호</label>
              <input
                type="password"
                value={editCurrentUserPassword}
                onChange={(e) => setEditCurrentUserPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button
              className="modal-btn modal-btn-cancel"
              onClick={() => setShowEditConfirmModal(false)}
            >
              취소
            </button>
            <button
              className="modal-btn modal-btn-confirm"
              onClick={handleEditConfirmSubmit}
            >
              확인
            </button>
          </div>
        </div>
      </Modal>

      {/* 계정 수정시 본인/관리자 확인 모달 */}
      <Modal
        isOpen={showEditPasswordConfirmModal}
        onClose={() => setShowEditPasswordConfirmModal(false)}
        title="비밀번호 확인"
      >
        <div className="alert-modal-content">
          <div className="alert-modal-header">
            <div className="alert-modal-icon">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <h3 className="alert-modal-title">비밀번호 확인</h3>
          </div>
          <p className="alert-modal-message">
            {userName}님의 비밀번호를 입력해주세요.
          </p>
          <div className="modal-form">
            <div className="form-field">
              <input
                type="password"
                value={editPasswordConfirmInput}
                onChange={(e) => setEditPasswordConfirmInput(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button
              className="modal-btn modal-btn-cancel"
              onClick={() => setShowEditPasswordConfirmModal(false)}
            >
              취소
            </button>
            <button
              className="modal-btn modal-btn-confirm"
              onClick={handleEditPasswordConfirm}
            >
              확인
            </button>
          </div>
        </div>
      </Modal>

      {/* 알림 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* 팀 액션 모달 (추가/수정/삭제 확인) */}
      <Modal
        isOpen={teamActionModal.isOpen}
        onClose={closeTeamActionModal}
        title={
          teamActionModal.action === "add"
            ? `${
                teamActionModal.type === "team" ? "팀" : "세부팀"
              } 추가 확인`
            : teamActionModal.action === "edit"
            ? `${teamActionModal.type === "team" ? "팀" : "세부팀"} 수정`
            : `${
                teamActionModal.type === "team" ? "팀" : "세부팀"
              } 삭제 확인`
        }
      >
        <div className="confirm-modal-content">
          <div className="modal-icon">
            <FontAwesomeIcon
              icon={
                teamActionModal.action === "delete"
                  ? faExclamationTriangle
                  : teamActionModal.action === "edit"
                  ? faPen
                  : faUserPlus
              }
            />
          </div>

          {teamActionModal.action === "add" && (
            <>
              <p className="modal-description">
                {teamActionModal.type === "team"
                  ? `"${teamActionModal.name}" 팀을 추가하시겠습니까?`
                  : `"${teamActionModal.parentTeamName}" 팀에 "${teamActionModal.name}" 세부팀을 추가하시겠습니까?`}
              </p>
            </>
          )}

          {teamActionModal.action === "edit" && (
            <>
              <p className="modal-description">
                {teamActionModal.type === "team" ? "팀" : "세부팀"} 이름을
                수정합니다.
              </p>
              <div className="modal-form">
                <div className="form-field">
                  <label>새 이름</label>
                  <input
                    type="text"
                    value={teamActionModal.newName}
                    onChange={(e) =>
                      setTeamActionModal((prev) => ({
                        ...prev,
                        newName: e.target.value,
                      }))
                    }
                    placeholder="새 이름을 입력하세요"
                  />
                </div>
              </div>
            </>
          )}

          {teamActionModal.action === "delete" && (
            <>
              <p className="modal-description">
                "{teamActionModal.name}"{" "}
                {teamActionModal.type === "team" ? "팀" : "세부팀"}을
                삭제하시겠습니까?
              </p>
              <p
                className="modal-warning"
                style={{
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  marginTop: "0.5rem",
                }}
              >
                {teamActionModal.type === "team"
                  ? "세부팀이 있는 경우 삭제할 수 없습니다."
                  : "팀원이 있는 경우 삭제할 수 없습니다."}
              </p>
            </>
          )}

          <div className="modal-actions">
            <button
              className="modal-btn modal-btn-cancel"
              onClick={closeTeamActionModal}
            >
              취소
            </button>
            <button
              className={`modal-btn ${
                teamActionModal.action === "delete"
                  ? "modal-btn-danger"
                  : "modal-btn-confirm"
              }`}
              onClick={handleTeamActionConfirm}
            >
              {teamActionModal.action === "add"
                ? "추가"
                : teamActionModal.action === "edit"
                ? "수정"
                : "삭제"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AccountModals;