import { useState, useEffect } from "react";
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";
import TeamStatusTable from "./TeamStatusTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import * as accountService from "../../../../api/accountService";
import * as teamService from "../../../../api/teamService";
import { transformTeamsToFrontendFormat } from "../../../../api/teamService";
import "./TeamStatusModal.css";

function TeamStatusModal({ isOpen, onClose, teams: initialTeams, users: initialUsers }) {
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState({ hierarchy: [], allTeams: [] });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // 부모 컴포넌트에서 받은 데이터를 사용
  useEffect(() => {
    if (isOpen && initialTeams && initialUsers) {
      // teamManagement 데이터를 hierarchy 형태로 변환
      const hierarchy = initialTeams.teams.map((team) => ({
        id: team.id,
        name: team.name,
        children: (initialTeams.subTeams[team.name] || []).map((subTeam) => ({
          id: subTeam.id,
          name: subTeam.name,
        })),
      }));

      setTeams({
        hierarchy,
        allTeams: initialTeams.allTeams || [],
      });
      setUsers(initialUsers);
    }
  }, [isOpen, initialTeams, initialUsers]);

  // 새로고침 - 부모에서 새로 데이터 가져오도록 요청 (선택사항)
  const handleRefresh = () => {
    // 부모 컴포넌트에 데이터 새로고침 요청 가능
    window.location.reload();
  };

  return (
    <Modal isOpen={isOpen} maxWidth="1400px">
      {/* 닫기 버튼 */}
      <button className="modal-close-btn-top" onClick={onClose}>
        <FontAwesomeIcon icon={faTimes} />
      </button>

      {/* 모달 바디 */}
      <div className="team-status-modal-body">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <Button onClick={handleRefresh}>다시 시도</Button>
          </div>
        ) : (
          <TeamStatusTable teams={teams} users={users} />
        )}
      </div>
    </Modal>
  );
}

export default TeamStatusModal;
