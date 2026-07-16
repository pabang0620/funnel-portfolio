import { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import Breadcrumb from "../../../components/Breadcrumb";
import { useAuth } from "../../../contexts/AuthContext";
import { usePermissions } from "../../../hooks/usePermissions";
import PermissionWrapper from "../../../components/PermissionWrapper";
import AccountForm from "./elements/AccountForm";
import AccountTable from "./elements/AccountTable";
import AccountModals from "./elements/AccountModals";
import AccountEditForm from "./elements/AccountEditForm";
import PermissionGuide from "./elements/PermissionGuide";
import TeamStatusModal from "./elements/TeamStatusModal";
import Modal from "../../../components/ui/Modal";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import "../../executiveReport/ExecutiveReport.css";
import "./AccountCreation.css";

// API 서비스 및 상수
import * as accountService from "../../../api/accountService";
import * as teamService from "../../../api/teamService";
import * as roleService from "../../../api/roleService";
import { transformTeamsToFrontendFormat } from "../../../api/teamService";
import {
  USER_STATUS,
  USER_STATUS_TEXT,
  USER_STATUS_OPTIONS,
  getStatusText,
  getStatusCode,
} from "../../../constants/userStatus";

function AccountCreation() {
  const { userRole, userId, userTeam, userName } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // 권한 관리
  const { hasPermission, isLoading: permissionsLoading, roleCode } = usePermissions("admin-account");
  const isAdmin = roleCode === "S" || roleCode === "A";

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    team: "",
    subTeam: "",
    roleId: "",
  });

  // 편집 폼 데이터 상태
  const [editFormData, setEditFormData] = useState({
    id: null,
    username: "",
    name: "",
    team: "",
    subTeam: "",
    roleId: "",
    status: 1,
  });

  // UI 상태들
  const [showPassword, setShowPassword] = useState(false);
  const [showAccountCreateModal, setShowAccountCreateModal] = useState(false);
  const [showAccountEditModal, setShowAccountEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [showEditPasswordConfirmModal, setShowEditPasswordConfirmModal] =
    useState(false);
  const [showTeamStatusModal, setShowTeamStatusModal] = useState(false);

  // 드롭다운 상태들
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showSubTeamDropdown, setShowSubTeamDropdown] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showEditTeamDropdown, setShowEditTeamDropdown] = useState(false);
  const [showEditSubTeamDropdown, setShowEditSubTeamDropdown] = useState(false);
  const [showEditGradeDropdown, setShowEditGradeDropdown] = useState(false);

  // 팀 관리 상태들
  const [showAddTeamInput, setShowAddTeamInput] = useState(false);
  const [showAddSubTeamInput, setShowAddSubTeamInput] = useState(false);
  const [newTeamInputValue, setNewTeamInputValue] = useState("");
  const [newSubTeamInputValue, setNewSubTeamInputValue] = useState("");

  // 데이터 상태들
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [teamManagement, setTeamManagement] = useState({
    teams: [],
    subTeams: {},
  });
  const [roles, setRoles] = useState([]);

  // 편집 관련 상태들
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);

  // 비밀번호 관리 상태들
  const [passwordChangeData, setPasswordChangeData] = useState({
    userId: null,
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentUserPassword, setCurrentUserPassword] = useState("");
  const [editCurrentUserPassword, setEditCurrentUserPassword] = useState("");
  const [editPasswordModalType, setEditPasswordModalType] = useState("self");
  const [editPasswordConfirmInput, setEditPasswordConfirmInput] = useState("");

  // 모달 상태들
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const [teamActionModal, setTeamActionModal] = useState({
    isOpen: false,
    action: "",
    type: "",
    teamId: null,
    name: "",
    newName: "",
    parentTeamName: "",
    context: "",
  });

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 데이터 로딩 함수들
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadAccounts(), loadTeams(), loadRoles()]);
    } catch (error) {
      console.error("초기 데이터 로딩 실패:", error);
      showAlert("오류", "데이터 로딩에 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await accountService.getUsers();
      if (response.success) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error("계정 목록 로딩 실패:", error);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await teamService.getTeams();
      if (response.success) {
        // API 응답을 프론트엔드 형태로 변환
        const transformedData = transformTeamsToFrontendFormat(response);
        console.log("변환된 팀 데이터:", transformedData);
        setTeamManagement(transformedData);
      }
    } catch (error) {
      console.error("팀 목록 로딩 실패:", error);
      showAlert("오류", "팀 목록을 불러오는데 실패했습니다.", "error");
    }
  };

  const loadRoles = async () => {
    try {
      const response = await roleService.getAllRoles();
      if (response.success) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error("역할 목록 로딩 실패:", error);
      showAlert("오류", "역할 목록을 불러오는데 실패했습니다.", "error");
    }
  };

  // 유틸리티 함수들
  const showAlert = (title, message, type = "info", onConfirm = null) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  // 등급 설명 함수
  const getGradeDescription = (grade) => {
    const descriptions = {
      'S': '임원',
      'A': '팀장', 
      'B': '중간관리자',
      'C': '팀원'
    };
    return descriptions[grade] || '';
  };

  const closeAlert = () => {
    setAlertModal({
      isOpen: false,
      title: "",
      message: "",
      type: "info",
      onConfirm: null,
    });
  };

  const getAvailableSubTeams = (selectedTeam) => {
    return teamManagement.subTeams[selectedTeam] || [];
  };

  const removeTeamSuffix = (teamName) => {
    return teamName.trim().replace(/팀$/, "");
  };

  // 폼 핸들러들
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // roleId 변경 시 해당 role의 code가 S인지 확인하여 팀/세부팀 초기화
    if (name === "roleId") {
      const selectedRole = roles.find(r => r.id === parseInt(value));
      if (selectedRole && selectedRole.code === "S") {
        setFormData((prev) => ({ ...prev, team: "", subTeam: "" }));
      }
    }
  };

  const handleTeamChange = (teamName) => {
    setFormData((prev) => ({
      ...prev,
      team: teamName,
      subTeam: "", // 팀 변경시 세부팀 초기화
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 입력 유효성 검사
    const selectedRole = roles.find(r => r.id === parseInt(formData.roleId));
    if (
      !formData.username ||
      !formData.password ||
      !formData.name ||
      !formData.roleId ||
      (selectedRole && selectedRole.code !== "S" && !formData.team)
    ) {
      showAlert("입력 오류", "필수 필드를 모두 입력해주세요.", "error");
      return;
    }

    // S등급 선택시 비밀번호 확인 필요
    if (selectedRole && selectedRole.code === "S") {
      setShowConfirmModal(true);
      return;
    }

    // 계정 생성 처리
    createAccount();
  };

  // 계정 생성/수정 함수들
  const createAccount = async () => {
    try {
      // 팀 ID 찾기
      let teamId = null;
      if (formData.team) {
        teamId = formData.subTeam
          ? teamService.findSubTeamIdByName(
              teamManagement.subTeams,
              formData.team,
              formData.subTeam
            )
          : teamService.findTeamIdByName(teamManagement.teams, formData.team);

        if (!teamId) {
          showAlert("오류", "선택한 팀을 찾을 수 없습니다.", "error");
          return;
        }
      }

      const response = await accountService.createUser({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        teamId,
        roleId: parseInt(formData.roleId),
      });

      if (response.success) {
        await loadAccounts();
        handleCloseCreateModal();
        showAlert("성공", "계정이 성공적으로 생성되었습니다.", "success");
      }
    } catch (error) {
      console.error("계정 생성 실패:", error);
      showAlert(
        "오류",
        error.message || "계정 생성 중 오류가 발생했습니다.",
        "error"
      );
    }
  };

  // 모달 핸들러들
  const handleOpenCreateModal = () => {
    setShowAccountCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowAccountCreateModal(false);
    setFormData({
      username: "",
      password: "",
      name: "",
      team: "",
      subTeam: "",
      roleId: "",
    });
    setCurrentUserPassword("");
    setShowConfirmModal(false);
  };

  // S등급 확인 핸들러
  const handleConfirmSubmit = async () => {
    if (!currentUserPassword) {
      showAlert("입력 오류", "현재 비밀번호를 입력해주세요.", "error");
      return;
    }

    try {
      const response = await accountService.verifyPassword(currentUserPassword);
      if (response.success && response.isValid) {
        setShowConfirmModal(false);
        setCurrentUserPassword("");
        createAccount();
      } else {
        showAlert("인증 실패", "비밀번호가 일치하지 않습니다.", "error");
      }
    } catch (error) {
      showAlert(
        "오류",
        error.message || "비밀번호 확인 중 오류가 발생했습니다.",
        "error"
      );
    }
  };

  // 팀 관리 함수들
  const handleInlineAddTeam = async () => {
    if (!newTeamInputValue.trim()) {
      showAlert("입력 오류", "팀 이름을 입력해주세요.", "error");
      return;
    }

    try {
      const response = await teamService.createTeam({
        name: newTeamInputValue.trim()
      });
      
      if (response.success) {
        await loadTeams();
        setShowAddTeamInput(false);
        setNewTeamInputValue("");
        showAlert("성공", "팀이 추가되었습니다.", "success");
      }
    } catch (error) {
      console.error("팀 추가 실패:", error);
      showAlert("오류", error.message || "팀 추가 중 오류가 발생했습니다.", "error");
    }
  };

  const handleInlineAddSubTeam = async () => {
    if (!newSubTeamInputValue.trim()) {
      showAlert("입력 오류", "세부팀 이름을 입력해주세요.", "error");
      return;
    }

    if (!formData.team) {
      showAlert("입력 오류", "먼저 팀을 선택해주세요.", "error");
      return;
    }

    try {
      const parentTeamId = teamService.findTeamIdByName(teamManagement.teams, formData.team);
      if (!parentTeamId) {
        showAlert("오류", "상위 팀을 찾을 수 없습니다.", "error");
        return;
      }

      const response = await teamService.createSubTeam({
        name: newSubTeamInputValue.trim(),
        parentTeamId
      });
      
      if (response.success) {
        await loadTeams();
        setShowAddSubTeamInput(false);
        setNewSubTeamInputValue("");
        showAlert("성공", "세부팀이 추가되었습니다.", "success");
      }
    } catch (error) {
      console.error("세부팀 추가 실패:", error);
      showAlert("오류", error.message || "세부팀 추가 중 오류가 발생했습니다.", "error");
    }
  };

  const handleOpenEditTeamModal = (e, team, isSubTeam) => {
    e.stopPropagation();
    e.preventDefault();
    setTeamActionModal({
      isOpen: true,
      action: "edit",
      type: isSubTeam ? "subteam" : "team",
      teamId: team.id,
      name: team.name,
      newName: team.name,
      parentTeamName: isSubTeam ? formData.team : "",
      context: "form"
    });
  };

  const handleOpenDeleteTeamModal = (e, team, isSubTeam) => {
    e.stopPropagation();
    e.preventDefault();
    setTeamActionModal({
      isOpen: true,
      action: "delete",
      type: isSubTeam ? "subteam" : "team", 
      teamId: team.id,
      name: team.name,
      newName: "",
      parentTeamName: isSubTeam ? formData.team : "",
      context: "form"
    });
  };


  // 수정 폼 모달 열기 헬퍼 함수
  const openEditFormModal = (account) => {
    setEditFormData({
      username: account.username,
      name: account.name,
      team: account.team,
      subTeam: account.subTeam,
      roleId: account.roleId || "",
      status:
        typeof account.status === "string"
          ? getStatusCode(account.status)
          : (typeof account.status === "number" ? account.status : USER_STATUS.ACTIVE),
      password: "",
    });
    setShowAccountEditModal(true);
  };

  // 편집 모달 열기
  const handleOpenEditModal = (account) => {
    // 권한 확인: edit-account 권한 체크
    const canEditAccount = isAdmin || hasPermission('admin-account_edit-account_edit-account');
    if (!canEditAccount && userId !== account.id) {
      showAlert(
        "권한 없음",
        "계정 수정 권한이 없습니다.",
        "warning"
      );
      return;
    }

    setEditingAccount(account);

    // 다른 사람 계정이면 관리자 확인 모달 먼저 표시
    const isOwnAccount = userId === account.id;
    if (!isOwnAccount) {
      setEditPasswordModalType("admin");
      setShowEditPasswordConfirmModal(true);
    } else {
      // 본인 계정이면 바로 수정 모달 열기
      openEditFormModal(account);
    }
  };

  // 편집 모달 닫기
  const handleCloseEditModal = () => {
    setShowAccountEditModal(false);
    setEditingAccount(null);
    setShowEditPassword(false);
    setEditFormData({
      username: "",
      name: "",
      team: "",
      subTeam: "",
      roleId: "",
      status: "",
      password: "",
    });
  };

  // 편집 폼 변경 핸들러
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === "status") {
      const numValue = parseInt(value, 10);
      processedValue = isNaN(numValue) ? "" : numValue;
    }

    setEditFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // roleId 변경 시 해당 role의 code가 S인지 확인하여 팀/세부팀 초기화
    if (name === "roleId") {
      const selectedRole = roles.find(r => r.id === parseInt(value));
      if (selectedRole && selectedRole.code === "S") {
        setEditFormData((prev) => ({ ...prev, team: "", subTeam: "" }));
      }
    }
  };

  // 편집 폼 팀 변경
  const handleEditTeamChange = (teamName) => {
    setEditFormData((prev) => ({
      ...prev,
      team: teamName,
      subTeam: "", // 팀 변경시 세부팀 초기화
    }));
  };

  // 편집 폼 제출
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // 입력 유효성 검사
    const selectedRole = roles.find(r => r.id === parseInt(editFormData.roleId));
    if (
      !editFormData.username ||
      !editFormData.name ||
      !editFormData.roleId ||
      (selectedRole && selectedRole.code !== "S" && !editFormData.team)
    ) {
      showAlert("입력 오류", "필수 필드를 모두 입력해주세요.", "error");
      return;
    }

    // S등급 또는 A등급으로 변경시 확인 모달 표시
    const currentRole = roles.find(r => r.id === editingAccount?.roleId);
    if (selectedRole && (selectedRole.code === "S" || selectedRole.code === "A") && currentRole && currentRole.code !== "S" && currentRole.code !== "A") {
      setShowEditConfirmModal(true);
      return;
    }

    // 본인 확인 모달 표시
    setEditPasswordModalType("self");
    setShowEditPasswordConfirmModal(true);
  };

  // 계정 정보 업데이트 실행
  const updateAccount = async () => {
    try {
      // 팀 ID 찾기
      let teamId = null;
      if (editFormData.team) {
        teamId = editFormData.subTeam
          ? teamService.findSubTeamIdByName(
              teamManagement.subTeams,
              editFormData.team,
              editFormData.subTeam
            )
          : teamService.findTeamIdByName(teamManagement.teams, editFormData.team);

        if (!teamId) {
          showAlert("오류", "선택한 팀을 찾을 수 없습니다.", "error");
          return;
        }
      }

      // 업데이트할 데이터 준비
      const updateData = {
        username: editFormData.username,
        name: editFormData.name,
        teamId,
        roleId: parseInt(editFormData.roleId),
        status: editFormData.status,
      };

      let response;
      
      // 비밀번호가 입력된 경우 비밀번호도 함께 변경
      if (editFormData.password && editFormData.password.trim()) {
        response = await accountService.updateUser(editingAccount.id, updateData);
        
        // 계정 정보 업데이트 성공 후 비밀번호 변경
        if (response.success) {
          const passwordResponse = await accountService.changePassword(
            editingAccount.id, 
            editFormData.password.trim()
          );
          
          if (!passwordResponse.success) {
            showAlert(
              "경고", 
              "계정 정보는 수정되었지만 비밀번호 변경에 실패했습니다.", 
              "warning"
            );
          }
        }
      } else {
        // 비밀번호 변경 없이 계정 정보만 업데이트
        response = await accountService.updateUser(editingAccount.id, updateData);
      }

      if (response.success) {
        await loadAccounts();
        handleCloseEditModal();
        showAlert(
          "성공",
          response.message || "계정 정보가 수정되었습니다.",
          "success"
        );
      }
    } catch (error) {
      console.error("계정 수정 실패:", error);
      showAlert(
        "오류",
        error.message || "계정 수정 중 오류가 발생했습니다.",
        "error"
      );
    }
  };

  // 기타 핸들러들
  const handlePasswordChangeSubmit = () => {
    console.log("비밀번호 변경");
  };

  const handleEditConfirmSubmit = async () => {
    if (!editCurrentUserPassword) {
      showAlert("입력 오류", "현재 비밀번호를 입력해주세요.", "error");
      return;
    }

    try {
      const response = await accountService.verifyPassword(editCurrentUserPassword);
      if (response.success && response.isValid) {
        setShowEditConfirmModal(false);
        setEditCurrentUserPassword("");
        
        // 본인 확인 모달 표시
        setEditPasswordModalType("self");
        setShowEditPasswordConfirmModal(true);
      } else {
        showAlert("인증 실패", "비밀번호가 일치하지 않습니다.", "error");
      }
    } catch (error) {
      showAlert(
        "오류",
        error.message || "비밀번호 확인 중 오류가 발생했습니다.",
        "error"
      );
    }
  };

  const handleEditPasswordConfirm = async () => {
    if (!editPasswordConfirmInput) {
      showAlert("입력 오류", "비밀번호를 입력해주세요.", "error");
      return;
    }

    try {
      const response = await accountService.verifyPassword(editPasswordConfirmInput);
      if (response.success && response.isValid) {
        setShowEditPasswordConfirmModal(false);
        setEditPasswordConfirmInput("");

        if (editPasswordModalType === "admin") {
          // 관리자 확인 모달에서 확인 버튼 클릭 시 → 수정 모달 열기
          openEditFormModal(editingAccount);
        } else {
          // 본인 확인 (저장 시) → 저장 실행
          updateAccount();
        }
      } else {
        showAlert("인증 실패", "비밀번호가 올바르지 않습니다.", "error");
      }
    } catch (error) {
      console.error("비밀번호 확인 실패:", error);
      showAlert(
        "오류",
        error.message || "비밀번호 확인 중 오류가 발생했습니다.",
        "error"
      );
    }
  };

  const closeTeamActionModal = () => {
    setTeamActionModal({
      isOpen: false,
      action: "",
      type: "",
      teamId: null,
      name: "",
      newName: "",
      parentTeamName: "",
      context: "",
    });
  };

  const handleTeamActionConfirm = async () => {
    const { action, type, teamId, newName } = teamActionModal;
    
    try {
      if (action === "add") {
        // 추가는 handleInlineAdd 함수들에서 처리
        return;
      } else if (action === "edit") {
        if (!newName.trim()) {
          showAlert("입력 오류", "새 이름을 입력해주세요.", "error");
          return;
        }
        
        const response = type === "team" 
          ? await teamService.updateTeam(teamId, { name: newName.trim() })
          : await teamService.updateSubTeam(teamId, { name: newName.trim() });
          
        if (response.success) {
          await loadTeams();
          closeTeamActionModal();
          showAlert("성공", `${type === "team" ? "팀" : "세부팀"}이 수정되었습니다.`, "success");
        }
      } else if (action === "delete") {
        const response = type === "team"
          ? await teamService.deleteTeam(teamId)
          : await teamService.deleteSubTeam(teamId);
          
        if (response.success) {
          await loadTeams();
          closeTeamActionModal();
          showAlert("성공", `${type === "team" ? "팀" : "세부팀"}이 삭제되었습니다.`, "success");
        }
      }
    } catch (error) {
      console.error(`팀 ${action} 실패:`, error);
      showAlert("오류", error.message || `팀 ${action} 중 오류가 발생했습니다.`, "error");
    }
  };

  // 테이블 설정
  const { teams, subTeams } = teamManagement;

  const filteredAccounts = accounts.filter(
    (account) =>
      account.status !== 3 &&
      (account.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 오른쪽 패널 컴포넌트 - 모든 등급에게 표시
  const rightPanel = () => (
    <PermissionGuide
      roles={roles}
      onShowTeamStatus={() => setShowTeamStatusModal(true)}
    />
  );

  return (
    <Layout rightPanel={rightPanel()}>
      <div className="account-creation-container">
        <Breadcrumb />

        <AccountTable
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleOpenCreateModal={handleOpenCreateModal}
          accounts={filteredAccounts}
          isLoading={isLoading}
          handleOpenEditModal={handleOpenEditModal}
        />

        {/* 계정 생성 모달 */}
        <PermissionWrapper
          pageId="admin-account"
          groupName="create-account"
          displayName="account-form"
        >
          {showAccountCreateModal && (
            <div className="modal-overlay" onClick={handleCloseCreateModal}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2 className="modal-title">새 계정 생성</h2>
                  <button
                    type="button"
                    onClick={handleCloseCreateModal}
                    aria-label="닫기"
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "1.5rem",
                      cursor: "pointer",
                      color: "#64748b",
                      padding: "0.25rem",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
                <div
                  className="account-form-container"
                  style={{ width: "450px", margin: 0, padding: "1.5rem" }}
                >
                  <AccountForm
                    formData={formData}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    showTeamDropdown={showTeamDropdown}
                    setShowTeamDropdown={setShowTeamDropdown}
                    showSubTeamDropdown={showSubTeamDropdown}
                    setShowSubTeamDropdown={setShowSubTeamDropdown}
                    showGradeDropdown={showGradeDropdown}
                    setShowGradeDropdown={setShowGradeDropdown}
                    showAddTeamInput={showAddTeamInput}
                    setShowAddTeamInput={setShowAddTeamInput}
                    showAddSubTeamInput={showAddSubTeamInput}
                    setShowAddSubTeamInput={setShowAddSubTeamInput}
                    newTeamInputValue={newTeamInputValue}
                    setNewTeamInputValue={setNewTeamInputValue}
                    newSubTeamInputValue={newSubTeamInputValue}
                    setNewSubTeamInputValue={setNewSubTeamInputValue}
                    teams={teams || []}
                    getAvailableSubTeams={getAvailableSubTeams}
                    userRole={userRole}
                    userTeam={userTeam}
                    handleInputChange={handleInputChange}
                    handleTeamChange={handleTeamChange}
                    handleSubmit={handleSubmit}
                    handleOpenEditTeamModal={handleOpenEditTeamModal}
                    handleOpenDeleteTeamModal={handleOpenDeleteTeamModal}
                    handleInlineAddTeam={handleInlineAddTeam}
                    handleInlineAddSubTeam={handleInlineAddSubTeam}
                    roles={roles}
                  />
                </div>
              </div>
            </div>
          )}
        </PermissionWrapper>

        {/* 계정 편집 모달 */}
        {showAccountEditModal && (
          <div className="modal-overlay" onClick={handleCloseEditModal}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">계정 정보 수정</h2>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  aria-label="닫기"
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: "0.25rem",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              <div
                className="account-form-container"
                style={{ width: "450px", margin: 0, padding: "1.5rem" }}
              >
                <AccountEditForm
                  editFormData={editFormData}
                  handleEditFormChange={handleEditFormChange}
                  handleEditSubmit={handleEditSubmit}
                  showEditPassword={showEditPassword}
                  setShowEditPassword={setShowEditPassword}
                  showEditTeamDropdown={showEditTeamDropdown}
                  setShowEditTeamDropdown={setShowEditTeamDropdown}
                  showEditSubTeamDropdown={showEditSubTeamDropdown}
                  setShowEditSubTeamDropdown={setShowEditSubTeamDropdown}
                  showEditGradeDropdown={showEditGradeDropdown}
                  setShowEditGradeDropdown={setShowEditGradeDropdown}
                  teams={teams}
                  getAvailableSubTeams={getAvailableSubTeams}
                  handleEditTeamChange={handleEditTeamChange}
                  setEditFormData={setEditFormData}
                  roles={roles}
                  USER_STATUS_OPTIONS={USER_STATUS_OPTIONS}
                  getGradeDescription={getGradeDescription}
                  showAddTeamInput={showAddTeamInput}
                  setShowAddTeamInput={setShowAddTeamInput}
                  newTeamInputValue={newTeamInputValue}
                  setNewTeamInputValue={setNewTeamInputValue}
                  handleInlineAddTeam={handleInlineAddTeam}
                  showAddSubTeamInput={showAddSubTeamInput}
                  setShowAddSubTeamInput={setShowAddSubTeamInput}
                  newSubTeamInputValue={newSubTeamInputValue}
                  setNewSubTeamInputValue={setNewSubTeamInputValue}
                  handleInlineAddSubTeam={handleInlineAddSubTeam}
                  handleOpenEditTeamModal={handleOpenEditTeamModal}
                  handleOpenDeleteTeamModal={handleOpenDeleteTeamModal}
                  removeTeamSuffix={removeTeamSuffix}
                  userRole={userRole}
                />
              </div>
            </div>
          </div>
        )}

        <AccountModals
          // S등급 확인 모달
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          currentUserPassword={currentUserPassword}
          setCurrentUserPassword={setCurrentUserPassword}
          handleConfirmSubmit={handleConfirmSubmit}
          // 비밀번호 변경 모달
          showPasswordChangeModal={showPasswordChangeModal}
          setShowPasswordChangeModal={setShowPasswordChangeModal}
          passwordChangeData={passwordChangeData}
          setPasswordChangeData={setPasswordChangeData}
          showNewPassword={showNewPassword}
          setShowNewPassword={setShowNewPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          handlePasswordChangeSubmit={handlePasswordChangeSubmit}
          // S등급 편집 확인 모달
          showEditConfirmModal={showEditConfirmModal}
          setShowEditConfirmModal={setShowEditConfirmModal}
          editCurrentUserPassword={editCurrentUserPassword}
          setEditCurrentUserPassword={setEditCurrentUserPassword}
          handleEditConfirmSubmit={handleEditConfirmSubmit}
          // 계정 수정 본인 확인 모달
          showEditPasswordConfirmModal={showEditPasswordConfirmModal}
          setShowEditPasswordConfirmModal={setShowEditPasswordConfirmModal}
          editPasswordModalType={editPasswordModalType}
          editPasswordConfirmInput={editPasswordConfirmInput}
          setEditPasswordConfirmInput={setEditPasswordConfirmInput}
          handleEditPasswordConfirm={handleEditPasswordConfirm}
          userName={userName}
          // 알림 모달
          alertModal={alertModal}
          closeAlert={closeAlert}
          // 팀 액션 모달
          teamActionModal={teamActionModal}
          closeTeamActionModal={closeTeamActionModal}
          setTeamActionModal={setTeamActionModal}
          handleTeamActionConfirm={handleTeamActionConfirm}
        />

        {/* 팀 및 팀원 현황 모달 */}
        <TeamStatusModal
          isOpen={showTeamStatusModal}
          onClose={() => setShowTeamStatusModal(false)}
          teams={teamManagement}
          users={accounts}
        />
      </div>
    </Layout>
  );
}

export default AccountCreation;
