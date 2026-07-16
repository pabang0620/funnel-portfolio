import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faChevronDown,
  faChevronUp,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

function AccountEditForm({
  editFormData,
  handleEditFormChange,
  handleEditSubmit,
  showEditPassword,
  setShowEditPassword,
  showEditTeamDropdown,
  setShowEditTeamDropdown,
  showEditSubTeamDropdown,
  setShowEditSubTeamDropdown,
  showEditGradeDropdown,
  setShowEditGradeDropdown,
  teams,
  getAvailableSubTeams,
  handleEditTeamChange,
  setEditFormData,
  roles,
  USER_STATUS_OPTIONS,
  getGradeDescription,
  showAddTeamInput,
  setShowAddTeamInput,
  newTeamInputValue,
  setNewTeamInputValue,
  handleInlineAddTeam,
  showAddSubTeamInput,
  setShowAddSubTeamInput,
  newSubTeamInputValue,
  setNewSubTeamInputValue,
  handleInlineAddSubTeam,
  handleOpenEditTeamModal,
  handleOpenDeleteTeamModal,
  removeTeamSuffix,
  userRole,
}) {
  // 선택된 role 정보 가져오기
  const selectedRole = roles?.find(r => r.id === parseInt(editFormData.roleId));
  const isExecutiveRole = selectedRole && selectedRole.code === 'S';
  return (
    <form className="signup-form" onSubmit={handleEditSubmit}>
      <div className="form-group">
        <label className="form-label">사용자 아이디</label>
        <input
          type="text"
          name="username"
          value={editFormData.username}
          onChange={handleEditFormChange}
          className="form-input"
          placeholder="영문, 숫자 조합 (4-20자)"
          required
        />
      </div>

      {/* 새 비밀번호 (선택) */}
      <div className="form-group">
        <label className="form-label">새 비밀번호 (선택)</label>
        <div className="password-input-container">
          <input
            type={showEditPassword ? "text" : "password"}
            name="password"
            value={editFormData.password}
            onChange={handleEditFormChange}
            className="form-input"
            placeholder="변경할 비밀번호를 입력하세요 (선택)"
          />
          <button
            type="button"
            className="password-visibility-toggle"
            onClick={() => setShowEditPassword(!showEditPassword)}
          >
            <FontAwesomeIcon icon={showEditPassword ? faEyeSlash : faEye} />
          </button>
        </div>
        <small style={{ color: "#6b7280", fontSize: "0.75rem" }}>
          비워두면 기존 비밀번호가 유지됩니다
        </small>
      </div>

      <div className="form-group">
        <label className="form-label">사용자 이름</label>
        <input
          type="text"
          name="name"
          value={editFormData.name}
          onChange={handleEditFormChange}
          className="form-input"
          placeholder="실제 이름을 입력하세요"
          required
        />
      </div>

      {/* 팀 선택 */}
      {!isExecutiveRole && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">팀</label>
            <div className="custom-select-wrapper">
              <div
                className={`custom-select ${showEditTeamDropdown ? "open" : ""}`}
                onClick={() => setShowEditTeamDropdown(!showEditTeamDropdown)}
              >
                <div className="selected-option">
                  {editFormData.team || "팀을 선택하세요"}
                  <FontAwesomeIcon
                    icon={showEditTeamDropdown ? faChevronUp : faChevronDown}
                    className="dropdown-arrow"
                  />
                </div>
                {showEditTeamDropdown && (
                  <div className="dropdown-options">
                    {(teams || []).map((team) => (
                      <div
                        key={team.id}
                        className="dropdown-option dropdown-option-with-actions"
                        onClick={() => {
                          handleEditTeamChange(team.name);
                          setShowEditTeamDropdown(false);
                        }}
                      >
                        <span className="option-text">{team.name}</span>
                        <div className="option-actions">
                          {(userRole === "S" || userRole === "A") && (
                            <>
                              <button
                                type="button"
                                className="option-action-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleOpenEditTeamModal(e, team, false);
                                }}
                              >
                                <FontAwesomeIcon icon={faPen} />
                              </button>
                              <button
                                type="button"
                                className="option-action-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleOpenDeleteTeamModal(e, team, false);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {/* Divider */}
                    <div className="dropdown-divider" />

                    {/* Inline add team input or add button */}
                    {showAddTeamInput ? (
                      <div
                        className="inline-add-container"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          className="new-team-input"
                          type="text"
                          placeholder="새 팀 이름 입력"
                          value={newTeamInputValue}
                          onChange={(e) =>
                            setNewTeamInputValue(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleInlineAddTeam();
                            } else if (e.key === "Escape") {
                              setShowAddTeamInput(false);
                              setNewTeamInputValue("");
                            }
                          }}
                          autoFocus
                        />
                        <div className="inline-add-actions">
                          <button
                            type="button"
                            className="btn-cancel"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setShowAddTeamInput(false);
                              setNewTeamInputValue("");
                            }}
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            className="btn-confirm"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleInlineAddTeam();
                            }}
                          >
                            추가
                          </button>
                        </div>
                      </div>
                    ) : (
                      (userRole === "S" || userRole === "A") && (
                        <div
                          className="dropdown-option add-new-option"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAddTeamInput(true);
                          }}
                        >
                          + 새 팀 추가
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 세부팀 선택 */}
          <div className="form-group">
            <label className="form-label">세부팀 (선택사항)</label>
            <div className="custom-select-wrapper">
              <div
                className={`custom-select ${showEditSubTeamDropdown ? "open" : ""} ${
                  !editFormData.team ? "disabled" : ""
                }`}
                onClick={() => {
                  editFormData.team && setShowEditSubTeamDropdown(!showEditSubTeamDropdown);
                }}
              >
                <div className="selected-option">
                  {editFormData.subTeam ||
                     (editFormData.team
                       ? "세부팀 선택"
                       : "먼저 팀을 선택하세요")}
                  <FontAwesomeIcon
                    icon={showEditSubTeamDropdown ? faChevronUp : faChevronDown}
                    className="dropdown-arrow"
                  />
                </div>
                {showEditSubTeamDropdown && editFormData.team && (
                  <div className="dropdown-options">
                    {getAvailableSubTeams(editFormData.team).map((subTeam) => (
                      <div
                        key={subTeam.id}
                        className="dropdown-option dropdown-option-with-actions"
                        onClick={() => {
                          setEditFormData((prev) => ({ ...prev, subTeam: subTeam.name }));
                          setShowEditSubTeamDropdown(false);
                        }}
                      >
                        <span className="option-text">{subTeam.name}</span>
                        <div className="option-actions">
                          {(userRole === "S" || userRole === "A") && (
                            <>
                              <button
                                type="button"
                                className="option-action-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleOpenEditTeamModal(e, subTeam, true);
                                }}
                              >
                                <FontAwesomeIcon icon={faPen} />
                              </button>
                              <button
                                type="button"
                                className="option-action-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleOpenDeleteTeamModal(e, subTeam, true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="form-row">
        {/* 역할 선택 */}
        <div className="form-group">
          <label className="form-label">역할</label>
          <div className="custom-select-wrapper">
            <div
              className={`custom-select ${showEditGradeDropdown ? "open" : ""}`}
              onClick={() => setShowEditGradeDropdown(!showEditGradeDropdown)}
            >
              <div className="selected-option">
                <div className="grade-option">
                  {selectedRole ? (
                    <>
                      <div
                        className={`grade-badge grade-${selectedRole.code.toLowerCase()}`}
                      >
                        {selectedRole.code}
                      </div>
                      <span className="grade-text">
                        {selectedRole.name} ({selectedRole.code})
                      </span>
                    </>
                  ) : (
                    "역할 선택"
                  )}
                </div>
                <FontAwesomeIcon
                  icon={showEditGradeDropdown ? faChevronUp : faChevronDown}
                  className="dropdown-arrow"
                />
              </div>
              {showEditGradeDropdown && (
                <div className="dropdown-options">
                  {(roles || []).map((role) => (
                    <div
                      key={role.id}
                      className="dropdown-option"
                      onClick={() => {
                        handleEditFormChange({ target: { name: "roleId", value: role.id } });
                        setShowEditGradeDropdown(false);
                      }}
                    >
                      <div className="grade-option">
                        <div className={`grade-badge grade-${role.code.toLowerCase()}`}>
                          {role.code}
                        </div>
                        <span>
                          {role.name} ({role.code})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 상태 선택 */}
        <div className="form-group">
          <label className="form-label">상태</label>
          <select
            name="status"
            value={editFormData.status}
            onChange={handleEditFormChange}
            className="form-select"
            required
          >
            <option value="">상태를 선택하세요</option>
            {USER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="signup-button">
        계정 정보 수정
      </button>
    </form>
  );
}

export default AccountEditForm;