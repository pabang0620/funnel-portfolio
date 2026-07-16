import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import Button from "../../../../components/ui/Button";
import PermissionWrapper from "../../../../components/PermissionWrapper";
import "./AccountTable.css";

function AccountTable({
  searchTerm,
  setSearchTerm,
  handleOpenCreateModal,
  accounts,
  isLoading,
  handleOpenEditModal,
}) {
  const [inputValue, setInputValue] = useState(searchTerm);

  const handleSearch = () => {
    setSearchTerm(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  if (isLoading) {
    return (
      <div className="loading-container">
        데이터를 로드하는 중...
      </div>
    );
  }

  return (
    <div className="accounts-section">
      <div className="section-header">
        <div className="header-content">
          <div className="search-container">
            <input
              type="text"
              placeholder="아이디 또는 이름으로 검색..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="search-input"
            />
            <button
              type="button"
              className="search-btn"
              onClick={handleSearch}
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
          <div className="action-container">
            <PermissionWrapper
              pageId="admin-account"
              groupName="create-account"
              displayName="create-btn"
            >
              <Button
                variant="primary"
                size="medium"
                onClick={handleOpenCreateModal}
              >
                <FontAwesomeIcon
                  icon={faUserPlus}
                  style={{ marginRight: "8px" }}
                />
                새 계정 생성
              </Button>
            </PermissionWrapper>
          </div>
        </div>
      </div>
      <div className="table-container">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>아이디</th>
                <th>이름</th>
                <th>팀</th>
                <th>세부팀</th>
                <th>등급</th>
                <th>상태</th>
                <th>생성일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index) => (
                <tr key={account.id || index}>
                  <td>{account.username || ""}</td>
                  <td>{account.name || ""}</td>
                  <td>{account.team || ""}</td>
                  <td>{account.subTeam || ""}</td>
                  <td>
                    <span className={`grade-badge grade-${account.roleCode?.toLowerCase()}`}>
                      {account.roleCode || ""}
                    </span>
                  </td>
                  <td>{account.status === 1 ? "활성" : account.status === 2 ? "비활성" : account.status === 3 ? "퇴사" : ""}</td>
                  <td>{account.createdAt || ""}</td>
                  <td>
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleOpenEditModal(account)}
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AccountTable;