import Button from "../../../../components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

function PermissionGuide({ roles, onShowTeamStatus }) {
  return (
    <div className="permission-sidebar">
      <div className="permission-guide-fixed">
        <h3 className="guide-title">등급별 권한 안내</h3>
        <div className="permission-grid-sidebar">
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <div className="permission-item" key={role.id}>
                <span className={`grade-badge grade-${role.code.toLowerCase()}`}>
                  {role.code}
                </span>
                <div className="permission-content">
                  <h4>{role.name}</h4>
                  <p>{role.description || '권한 설명 없음'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="permission-item">
              <div className="permission-content">
                <p>권한 정보를 불러오는 중...</p>
              </div>
            </div>
          )}
        </div>

        {/* 조직도 버튼 */}
        <div className="team-status-button-container">
          <button
            className="org-chart-button"
            onClick={onShowTeamStatus}
          >
            <FontAwesomeIcon icon={faUsers} /> 조직도
          </button>
        </div>
      </div>
    </div>
  );
}

export default PermissionGuide;