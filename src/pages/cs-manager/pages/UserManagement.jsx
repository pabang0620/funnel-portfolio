import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useUser } from "../contexts/UserContext";
import {
  fetchAllUsers,
  addUser,
  updateUser,
  changePassword,
  deleteUser,
} from "../lib/api";

function UserManagement() {
  const { isAdmin } = useUser();

  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusGuideModal, setShowStatusGuideModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    team: "",
    password: "",
    status: "pending",
    admin: false,
  });

  // 관리자가 아니면 페이지 접근 제한
  if (!isAdmin) {
    return (
      <Layout>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: "1rem",
          }}
        >
          <i
            className="fas fa-lock"
            style={{ fontSize: "3rem", color: "var(--muted-foreground)" }}
          ></i>
          <h2 style={{ color: "var(--foreground)", fontSize: "1.5rem" }}>
            관리자만 접근 가능합니다
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            이 페이지는 관리자 권한이 필요합니다.
          </p>
        </div>
      </Layout>
    );
  }

  // status를 한글로 변환
  const getStatusLabel = (status) => {
    const statusMap = {
      pending: "승인 대기",
      approved: "승인됨",
      inactive: "비활성화",
      deleted: "삭제됨",
    };
    return statusMap[status] || status;
  };

  // 사용자 목록 재로드 함수
  const reloadUsers = async () => {
    try {
      setIsLoading(true);
      const apiUsers = await fetchAllUsers();

      // API 응답 데이터를 UI 형식으로 변환 (백엔드에서 이미 필터링됨)
      const formattedUsers = apiUsers.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email || "",
        team: user.team || "",
        status: user.status || "pending",
        admin: user.admin || false,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error("사용자 로드 오류:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // API에서 사용자 목록 로드 (users 테이블에서 모든 사용자 조회)
  useEffect(() => {
    reloadUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!newUser.email || !newUser.name || !newUser.password) {
      alert("이메일, 이름, 비밀번호는 필수입니다.");
      return;
    }

    if (newUser.password.length < 3) {
      alert("비밀번호는 최소 3자 이상이어야 합니다.");
      return;
    }

    // 승인됨 상태에서 이메일과 비밀번호 검증
    if (
      newUser.status === "approved" &&
      (!newUser.email || !newUser.password)
    ) {
      alert("승인됨 상태는 아이디(이메일)와 비밀번호가 필수입니다.");
      return;
    }

    try {
      const userData = {
        email: newUser.email,
        name: newUser.name,
        team: newUser.team || "",
        status: newUser.status,
        admin: newUser.admin,
        password: newUser.password,
      };

      const response = await addUser(userData);

      if (response.success || response.id) {
        alert("사용자가 추가되었습니다.");
        setShowAddModal(false);
        setNewUser({
          email: "",
          name: "",
          team: "",
          password: "",
          status: "pending",
          admin: false,
        });
        await reloadUsers();
      }
    } catch (error) {
      console.error("사용자 추가 오류:", error);
      alert(`사용자 추가 실패: ${error.message}`);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!editingUser.name) {
      alert("이름은 필수입니다.");
      return;
    }

    // 비밀번호 검증 (입력한 경우만)
    if (editingUser.newPassword) {
      if (editingUser.newPassword.length < 3) {
        alert("비밀번호는 최소 3자 이상이어야 합니다.");
        return;
      }

      if (editingUser.newPassword !== editingUser.confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    try {
      // 기본 정보 업데이트
      const updates = {
        name: editingUser.name,
        team: editingUser.team || "",
        status: editingUser.status,
        admin: editingUser.admin,
      };

      const response = await updateUser(editingUser.id, updates);

      if (response.success || response.id) {
        // 비밀번호 변경이 필요한 경우
        if (editingUser.newPassword) {
          await changePassword(editingUser.id, editingUser.newPassword);
        }

        alert("사용자 정보가 수정되었습니다.");
        setEditingUser(null);
        await reloadUsers();
      }
    } catch (error) {
      console.error("사용자 수정 오류:", error);
      alert(`사용자 수정 실패: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const confirmed = confirm(
      `Are you sure you want to delete user "${user.name}"?\n(The user will be removed from the list and will not be able to log in)`
    );
    if (!confirmed) return;

    try {
      await deleteUser(userId);
      alert("사용자가 삭제되었습니다.");
      await reloadUsers();
    } catch (error) {
      console.error("사용자 삭제 오류:", error);
      alert(`사용자 삭제 실패: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      approved: { bg: "#e8f5e8", color: "#22c55e" },
      pending: { bg: "#fef3c7", color: "#f59e0b" },
      rejected: { bg: "#fdeaea", color: "#ef4444" },
      inactive: { bg: "#f5f5f5", color: "#6b7280" },
      deleted: { bg: "#fee2e2", color: "#991b1b" },
    };
    const c = colors[status] || colors.pending;
    return (
      <span
        style={{
          fontSize: "0.7rem",
          padding: "0.2rem 0.4rem",
          backgroundColor: c.bg,
          color: c.color,
          borderRadius: "6px",
          fontWeight: "500",
        }}
      >
        {getStatusLabel(status)}
      </span>
    );
  };

  return (
    <>
      <Layout>
        <div
          style={{
            backgroundColor: "var(--card)",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid var(--border)",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "2rem",
              height: "100%",
              overflow: "auto",
            }}
          >
            {/* 헤더 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: "var(--foreground)",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <i
                  className="fas fa-users"
                  style={{ color: "var(--accent)" }}
                ></i>
                유저 목록
                {isLoading && (
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      marginLeft: "0.5rem",
                    }}
                  >
                    <i className="fas fa-spinner fa-spin"></i> 로딩 중...
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={isLoading}
                style={{
                  padding: "0.6rem 1rem",
                  backgroundColor: isLoading ? "var(--muted)" : "var(--accent)",
                  color: isLoading ? "var(--muted-foreground)" : "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = "var(--primary)";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = "var(--accent)";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                <i className="fas fa-user-plus"></i>
                유저 추가
              </button>
            </div>

            {/* 테이블 */}
            <div
              style={{
                overflow: "auto",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "800px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "var(--muted)" }}>
                    <th
                      style={{
                        padding: "0.5rem",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        color: "var(--foreground)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      이름
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        color: "var(--foreground)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      Email (ID)
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        color: "var(--foreground)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      팀
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        color: "var(--foreground)",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          justifyContent: "center",
                        }}
                      >
                        상태
                        <button
                          onClick={() => setShowStatusGuideModal(true)}
                          style={{
                            background: "none",
                            border: "none",
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            backgroundColor: "var(--primary)",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.65rem",
                            fontWeight: "bold",
                            padding: 0,
                          }}
                          title="상태 시스템 안내"
                        >
                          ?
                        </button>
                      </div>
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        color: "var(--foreground)",
                        borderBottom: "1px solid var(--border)",
                        width: "70px",
                      }}
                    >
                      관리자
                    </th>
                    <th
                      style={{
                        padding: "0.5rem",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "0.75rem",
                        color: "var(--foreground)",
                        borderBottom: "1px solid var(--border)",
                        width: "100px",
                      }}
                    >
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        backgroundColor: "var(--card)",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--muted)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--card)";
                      }}
                    >
                      <td
                        style={{
                          padding: "0.6rem 0.5rem",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <i
                            className={`fas ${
                              user.admin ? "fa-crown" : "fa-user"
                            }`}
                            style={{
                              color: user.admin
                                ? "var(--accent)"
                                : "var(--primary)",
                              fontSize: "0.9rem",
                            }}
                          ></i>
                          <span
                            style={{
                              fontWeight: "600",
                              color: "var(--foreground)",
                              fontSize: "0.8rem",
                            }}
                          >
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "0.6rem 0.5rem",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--foreground)",
                          }}
                        >
                          {user.email}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.6rem 0.5rem",
                          borderBottom: "1px solid var(--border)",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--foreground)",
                          }}
                        >
                          {user.team}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.6rem 0.5rem",
                          borderBottom: "1px solid var(--border)",
                          textAlign: "center",
                        }}
                      >
                        {getStatusBadge(user.status)}
                      </td>
                      <td
                        style={{
                          padding: "0.6rem 0.5rem",
                          borderBottom: "1px solid var(--border)",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            color: user.admin
                              ? "var(--accent)"
                              : "var(--muted-foreground)",
                          }}
                        >
                          {user.admin ? "Y" : "N"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.6rem 0.5rem",
                          borderBottom: "1px solid var(--border)",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "0.4rem",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() =>
                              setEditingUser({
                                ...user,
                                newPassword: "",
                                confirmPassword: "",
                              })
                            }
                            style={{
                              padding: "0.3rem",
                              backgroundColor: "var(--primary)",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.65rem",
                            }}
                            title="수정"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            style={{
                              padding: "0.3rem",
                              backgroundColor: "var(--destructive)",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.65rem",
                            }}
                            title="삭제"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 유저 추가 모달 */}
        {showAddModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
            }}
          >
            <div
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "12px",
                padding: "2rem",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                border: "1px solid var(--border)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "var(--foreground)",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <i
                  className="fas fa-user-plus"
                  style={{ color: "var(--accent)" }}
                ></i>
                새 유저 추가
              </h3>
              <form
                onSubmit={handleAddUser}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: "var(--foreground)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Email (ID){" "}
                    <span style={{ color: "var(--destructive)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="사용자 ID (email)를 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      backgroundColor: "var(--input)",
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: "var(--foreground)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    이름 <span style={{ color: "var(--destructive)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="이름을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      backgroundColor: "var(--input)",
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: "var(--foreground)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    팀
                  </label>
                  <input
                    type="text"
                    value={newUser.team}
                    onChange={(e) =>
                      setNewUser({ ...newUser, team: e.target.value })
                    }
                    placeholder="팀명을 입력하세요"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      backgroundColor: "var(--input)",
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: "var(--foreground)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    비밀번호 (최소 3자){" "}
                    <span style={{ color: "var(--destructive)" }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="비밀번호 (최소 3자)"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      backgroundColor: "var(--input)",
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: "var(--foreground)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    상태
                  </label>
                  <select
                    value={newUser.status}
                    onChange={(e) =>
                      setNewUser({ ...newUser, status: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      backgroundColor: "var(--input)",
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  >
                    <option value="pending">승인 대기</option>
                    <option value="approved">승인됨</option>
                    <option value="inactive">비활성화</option>
                    <option value="deleted">삭제됨</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newUser.admin}
                      onChange={(e) =>
                        setNewUser({ ...newUser, admin: e.target.checked })
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        color: "var(--foreground)",
                      }}
                    >
                      관리자 권한
                    </span>
                  </label>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      backgroundColor: "var(--accent)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                    }}
                  >
                    추가
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewUser({
                        email: "",
                        name: "",
                        team: "",
                        password: "",
                        status: "pending",
                        admin: false,
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      backgroundColor: "var(--secondary)",
                      color: "var(--secondary-foreground)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                    }}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 유저 수정 모달 */}
        {editingUser && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
            }}
          >
            <div
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "12px",
                padding: "2rem",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                border: "1px solid var(--border)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "var(--foreground)",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <i
                  className="fas fa-edit"
                  style={{ color: "var(--accent)" }}
                ></i>
                유저 수정
              </h3>
              <form
                onSubmit={handleUpdateUser}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: "var(--foreground)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Email (ID)
                  </label>
                  <input
                    type="text"
                    value={editingUser.email}
                    disabled
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      backgroundColor: "var(--muted)",
                      color: "var(--muted-foreground)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: "var(--foreground)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    이름 <span style={{ color: "var(--destructive)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      backgroundColor: "var(--input)",
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: "var(--foreground)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    팀
                  </label>
                  <input
                    type="text"
                    value={editingUser.team}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, team: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      backgroundColor: "var(--input)",
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: "var(--foreground)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    상태
                  </label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, status: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      backgroundColor: "var(--input)",
                      color: "var(--foreground)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  >
                    <option value="pending">승인 대기</option>
                    <option value="approved">승인됨</option>
                    <option value="inactive">비활성화</option>
                    <option value="deleted">삭제됨</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={editingUser.admin}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          admin: e.target.checked,
                        })
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        color: "var(--foreground)",
                      }}
                    >
                      관리자 권한
                    </span>
                  </label>
                </div>

                {/* 비밀번호 변경 섹션 */}
                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    margin: "1rem 0",
                    paddingTop: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      color: "var(--foreground)",
                      marginBottom: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <i
                      className="fas fa-key"
                      style={{ color: "var(--accent)" }}
                    ></i>
                    비밀번호 변경 (선택사항)
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    {/* 새 비밀번호 */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                          color: "var(--foreground)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        새 비밀번호
                      </label>
                      <input
                        type="password"
                        value={editingUser.newPassword || ""}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="변경하지 않으려면 비워두세요"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          backgroundColor: "var(--input)",
                          color: "var(--foreground)",
                          fontSize: "0.9rem",
                          outline: "none",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted-foreground)",
                          marginTop: "0.25rem",
                        }}
                      >
                        비밀번호를 변경하려면 8자 이상 입력하세요
                      </div>
                    </div>

                    {/* 비밀번호 확인 */}
                    {editingUser.newPassword && (
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            color: "var(--foreground)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          비밀번호 확인
                        </label>
                        <input
                          type="password"
                          value={editingUser.confirmPassword || ""}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="새 비밀번호를 다시 입력하세요"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            backgroundColor: "var(--input)",
                            color: "var(--foreground)",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      backgroundColor: "var(--accent)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                    }}
                  >
                    수정 완료
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      backgroundColor: "var(--secondary)",
                      color: "var(--secondary-foreground)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                    }}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>

      {/* 상태 시스템 안내 모달 - Layout 외부 */}
      {showStatusGuideModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--background)",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              maxWidth: "700px",
              maxHeight: "85vh",
              overflow: "hidden",
            }}
          >
            {/* 모달 헤더 - 고정 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.2rem 1.5rem",
                borderBottom: "1px solid var(--border)",
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "var(--foreground)",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <i
                  className="fas fa-info-circle"
                  style={{ color: "var(--primary)", fontSize: "1rem" }}
                ></i>
                상태 시스템 안내
              </h2>
              <button
                onClick={() => setShowStatusGuideModal(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "1.3rem",
                  cursor: "pointer",
                  color: "var(--muted-foreground)",
                }}
              >
                ×
              </button>
            </div>

            {/* 모달 내용 - 스크롤 가능 */}
            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                flex: 1,
              }}
            >
            {/* 상태 시스템 표 */}
            <div
              style={{
                marginBottom: "1.2rem",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "var(--card)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  fontSize: "0.85rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "white",
                    }}
                  >
                    <th
                      style={{
                        padding: "0.6rem",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                      }}
                    >
                      상태
                    </th>
                    <th
                      style={{
                        padding: "0.6rem",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                      }}
                    >
                      유저 목록
                    </th>
                    <th
                      style={{
                        padding: "0.6rem",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                      }}
                    >
                      로그인
                    </th>
                    <th
                      style={{
                        padding: "0.6rem",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                      }}
                    >
                      파일탐색기
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    style={{
                      backgroundColor: "#e8f5e8",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.6rem",
                        textAlign: "center",
                        fontWeight: "500",
                        fontSize: "0.8rem",
                      }}
                    >
                      승인됨
                    </td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>✅</td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>✅</td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>✅</td>
                  </tr>
                  <tr
                    style={{
                      backgroundColor: "#fef3c7",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.6rem",
                        textAlign: "center",
                        fontWeight: "500",
                        fontSize: "0.8rem",
                      }}
                    >
                      승인 대기
                    </td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>✅</td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>❌</td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>✅</td>
                  </tr>
                  <tr
                    style={{
                      backgroundColor: "#f5f5f5",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.6rem",
                        textAlign: "center",
                        fontWeight: "500",
                        fontSize: "0.8rem",
                      }}
                    >
                      비활성화
                    </td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>✅</td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>❌</td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>✅</td>
                  </tr>
                  <tr style={{ backgroundColor: "#fee2e2" }}>
                    <td
                      style={{
                        padding: "0.6rem",
                        textAlign: "center",
                        fontWeight: "500",
                        fontSize: "0.8rem",
                      }}
                    >
                      삭제됨
                    </td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>❌</td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>❌</td>
                    <td style={{ padding: "0.6rem", textAlign: "center", fontSize: "0.85rem" }}>✅</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 상태별 설명 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.8rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "var(--foreground)",
                  margin: "0 0 0.3rem 0",
                }}
              >
                상태별 설명
              </h3>

              <div
                style={{
                  padding: "0.8rem",
                  backgroundColor: "#e8f5e8",
                  borderRadius: "8px",
                  borderLeft: "4px solid #10b981",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 0.3rem 0",
                    color: "var(--foreground)",
                    fontSize: "0.85rem",
                    fontWeight: "600"
                  }}
                >
                  ✅ 승인됨
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: "var(--foreground)",
                    fontSize: "0.8rem",
                    lineHeight: "1.5",
                  }}
                >
                  로그인 가능한 활성 사용자입니다.
                  <br />
                  파일 업로드 및 모든 기능 이용 가능합니다.
                </p>
              </div>

              <div
                style={{
                  padding: "0.8rem",
                  backgroundColor: "#fef3c7",
                  borderRadius: "8px",
                  borderLeft: "4px solid #f59e0b",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 0.3rem 0",
                    color: "var(--foreground)",
                    fontSize: "0.85rem",
                    fontWeight: "600"
                  }}
                >
                  ⏳ 승인 대기
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: "var(--foreground)",
                    fontSize: "0.8rem",
                    lineHeight: "1.5",
                  }}
                >
                  파일 업로드 시 추출한 상담원이 DB에 없으면 자동으로 새 사용자가
                  생성됩니다.
                  <br />
                  무분별한 추가를 방지하기 위해 "승인 대기" 상태로 시작하며,
                  <br />
                  관리자 검증 후 "승인됨"으로 변경하면 로그인 가능합니다.
                  <br />
                  로그인이 불필요한 사용자면 삭제하면 되고,
                  <br />
                  삭제해도 파일탐색기에는 업로드 데이터가 남아있습니다.
                </p>
              </div>

              <div
                style={{
                  padding: "0.8rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  borderLeft: "4px solid #6b7280",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 0.3rem 0",
                    color: "var(--foreground)",
                    fontSize: "0.85rem",
                    fontWeight: "600"
                  }}
                >
                  🔒 비활성화
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: "var(--foreground)",
                    fontSize: "0.8rem",
                    lineHeight: "1.5",
                  }}
                >
                  로그인 불가능한 계정입니다.
                  <br />
                  휴직, 휴가, 임시 중단 등으로 계정을 일시 중단합니다.
                  <br />
                  필요시 "승인됨"으로 변경하여 복구 가능합니다.
                </p>
              </div>

              <div
                style={{
                  padding: "0.8rem",
                  backgroundColor: "#fee2e2",
                  borderRadius: "8px",
                  borderLeft: "4px solid #ef4444",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 0.3rem 0",
                    color: "var(--foreground)",
                    fontSize: "0.85rem",
                    fontWeight: "600"
                  }}
                >
                  🗑️ 삭제됨
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: "var(--foreground)",
                    fontSize: "0.8rem",
                    lineHeight: "1.5",
                  }}
                >
                  사용하지 않는 계정입니다.
                  <br />
                  로그인 및 유저 목록에 표시되지 않지만, 파일탐색기에는 업로드
                  기록이 남아있어 데이터 추적이 가능합니다.
                  <br />
                  실제 삭제가 아닌 상태 변경이므로 기록은 보존됩니다.
                </p>
              </div>
            </div>

            {/* 닫기 버튼 */}
            <div
              style={{
                marginTop: "1.2rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowStatusGuideModal(false)}
                style={{
                  padding: "0.6rem 1.2rem",
                  backgroundColor: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--primary)";
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "var(--primary)";
                  e.target.style.transform = "scale(1)";
                  e.target.style.opacity = "1";
                }}
              >
                닫기
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UserManagement
