import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faChevronDown,
  faChevronUp,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import "./AccountForm.css";

function AccountForm({
  formData,
  showPassword,
  setShowPassword,
  showTeamDropdown,
  setShowTeamDropdown,
  showSubTeamDropdown,
  setShowSubTeamDropdown,
  showGradeDropdown,
  setShowGradeDropdown,
  showAddTeamInput,
  setShowAddTeamInput,
  showAddSubTeamInput,
  setShowAddSubTeamInput,
  newTeamInputValue,
  setNewTeamInputValue,
  newSubTeamInputValue,
  setNewSubTeamInputValue,
  teams,
  getAvailableSubTeams,
  userRole,
  userTeam,
  handleInputChange,
  handleTeamChange,
  handleSubmit,
  handleOpenEditTeamModal,
  handleOpenDeleteTeamModal,
  handleInlineAddTeam,
  handleInlineAddSubTeam,
  roles,
}) {
  // 선택된 role 정보 가져오기
  const selectedRole = roles?.find(r => r.id === parseInt(formData.roleId));
  const isExecutiveRole = selectedRole && selectedRole.code === 'S';

  // 팀 이름에서 끝의 '팀' 텍스트 제거 함수
  const removeTeamSuffix = (teamName) => {
    return teamName.trim().replace(/팀$/, '');
  };
  return (
    <div className="account-form-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">사용자 아이디</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="form-input"
            placeholder="영문, 숫자 조합 (4-20자)"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">비밀번호</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="8자 이상, 영문/숫자/특수문자 포함"
              required
            />
            <button
              type="button"
              className="password-visibility-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">사용자 이름</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="실제 이름을 입력하세요"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">팀</label>
            <div className="custom-select-wrapper">
              <div
                className={`custom-select ${showTeamDropdown ? "open" : ""} ${isExecutiveRole ? "disabled" : ""}`}
                onClick={() => {
                  // S등급일 때는 드롭다운 열지 않음
                  if (isExecutiveRole) return;
                  setShowTeamDropdown(!showTeamDropdown);
                }}
              >
                <div className="selected-option">
                  {isExecutiveRole ? "S등급은 팀 설정 불가" : (formData.team || "팀 선택")}
                  <FontAwesomeIcon
                    icon={showTeamDropdown ? faChevronUp : faChevronDown}
                    className="dropdown-arrow"
                  />
                </div>
                {showTeamDropdown && !isExecutiveRole && (
                  <div className="dropdown-options">
                    {(teams || []).map((team) => (
                      <div
                        key={team.id}
                        className="dropdown-option dropdown-option-with-actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTeamChange(team.name);
                          setShowTeamDropdown(false);
                        }}
                      >
                        <span className="option-text">{team.name}</span>
                        <div className="option-actions">
                          {(userRole === "S" || userRole === "A") && (
                            <button
                              type="button"
                              className="option-action-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenEditTeamModal(e, team, false);
                              }}
                              title="수정"
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                          )}
                          {(userRole === "S" || userRole === "A") && (
                            <button
                              type="button"
                              className="option-action-btn option-action-btn-danger"
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenDeleteTeamModal(e, team, false);
                              }}
                              title="삭제"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(userRole === "S" || userRole === "A") && <div className="dropdown-divider"></div>}
                    {showAddTeamInput ? (
                      <div
                        className="new-team-form"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          className="new-team-input"
                          type="text"
                          placeholder="새 팀 이름 입력"
                          value={newTeamInputValue}
                          onChange={(e) => setNewTeamInputValue(e.target.value)}
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
                        <div className="new-team-buttons">
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

          <div className="form-group">
            <label className="form-label">세부팀 (선택사항)</label>
            <div className="custom-select-wrapper">
              <div
                className={`custom-select ${showSubTeamDropdown ? "open" : ""} ${
                  !formData.team || isExecutiveRole ? "disabled" : ""
                }`}
                onClick={() => {
                  // S등급일 때는 드롭다운 열지 않음
                  if (isExecutiveRole) return;
                  formData.team && setShowSubTeamDropdown(!showSubTeamDropdown);
                }}
              >
                <div className="selected-option">
                  {isExecutiveRole
                    ? "S등급은 세부팀 설정 불가"
                    : (formData.subTeam ||
                       (formData.team
                         ? "세부팀 선택"
                         : "먼저 팀을 선택하세요"))
                  }
                  <FontAwesomeIcon
                    icon={showSubTeamDropdown ? faChevronUp : faChevronDown}
                    className="dropdown-arrow"
                  />
                </div>
                {showSubTeamDropdown && formData.team && !isExecutiveRole && (
                  <div className="dropdown-options">
                    {getAvailableSubTeams(formData.team).map((subTeam) => (
                      <div
                        key={subTeam.id}
                        className="dropdown-option dropdown-option-with-actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInputChange({
                            target: { name: "subTeam", value: subTeam.name },
                          });
                          setShowSubTeamDropdown(false);
                        }}
                      >
                        <span className="option-text">{subTeam.name}</span>
                        <div className="option-actions">
                          {(userRole === "S" || userRole === "A") && (
                            <button
                              type="button"
                              className="option-action-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenEditTeamModal(e, subTeam, true);
                              }}
                              title="수정"
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                          )}
                          {(userRole === "S" || userRole === "A") && (
                            <button
                              type="button"
                              className="option-action-btn option-action-btn-danger"
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenDeleteTeamModal(e, subTeam, true);
                              }}
                              title="삭제"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(userRole === "S" || userRole === "A") && <div className="dropdown-divider"></div>}
                    {showAddSubTeamInput ? (
                      <div
                        className="new-team-form"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          className="new-team-input"
                          type="text"
                          placeholder="새 세부팀 이름 입력"
                          value={newSubTeamInputValue}
                          onChange={(e) =>
                            setNewSubTeamInputValue(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleInlineAddSubTeam();
                            } else if (e.key === "Escape") {
                              setShowAddSubTeamInput(false);
                              setNewSubTeamInputValue("");
                            }
                          }}
                          autoFocus
                        />
                        <div className="new-team-buttons">
                          <button
                            type="button"
                            className="btn-cancel"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setShowAddSubTeamInput(false);
                              setNewSubTeamInputValue("");
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
                              handleInlineAddSubTeam();
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
                            setShowAddSubTeamInput(true);
                          }}
                        >
                          + 새 세부팀 추가
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">역할</label>
          <div className="custom-select-wrapper">
            <div
              className={`custom-select ${showGradeDropdown ? "open" : ""}`}
              onClick={() => setShowGradeDropdown(!showGradeDropdown)}
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
                  icon={showGradeDropdown ? faChevronUp : faChevronDown}
                  className="dropdown-arrow"
                />
              </div>
              {showGradeDropdown && (
                <div className="dropdown-options">
                  {(roles || []).map((role) => (
                    <div
                      key={role.id}
                      className="dropdown-option"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInputChange({
                          target: { name: "roleId", value: role.id },
                        });
                        setShowGradeDropdown(false);
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

        <button type="submit" className="signup-button">
          계정 생성
        </button>
      </form>
    </div>
  );
}

export default AccountForm;