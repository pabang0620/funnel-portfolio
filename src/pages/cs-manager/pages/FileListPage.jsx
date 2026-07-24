import Layout from "../components/Layout";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { toast } from "sonner";
import { useUser } from "../contexts/UserContext";
import { useProduct } from "../contexts/ProductContext";
import {
  fetchScripts,
  getPresignedUrl,
  fetchUsers,
  fetchProducts,
  fetchAllUsers,
  deleteScript,
  getTotalCount,
} from "../lib/api";
import TranscriptButton from "../components/scripts/TranscriptButton";
import TranscriptModal from "../components/scripts/TranscriptModal";

function FileListPage() {
  const { selectedUser, isAdmin } = useUser();
  const { products: contextProducts } = useProduct();
  const [products, setProducts] = useState([]);
  const [filesByProduct, setFilesByProduct] = useState({}); // product_id -> files 맵핑
  const [allUsers, setAllUsers] = useState([]);
  const [dbUsers, setDbUsers] = useState([]); // DB의 모든 사용자
  const [expandedFolders, setExpandedFolders] = useState(new Set(["root"]));
  const [loadingProducts, setLoadingProducts] = useState(new Set()); // 로딩 중인 product_id
  const [nameMap, setNameMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingFileId, setPlayingFileId] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  // 필터 상태
  const [filterProduct, setFilterProduct] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");
  const [filterFileName, setFilterFileName] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 삭제 모달 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetFile, setDeleteTargetFile] = useState(null);

  // 로딩 상태 (담당자별)
  const [loadingUsers, setLoadingUsers] = useState(new Set());

  // 전체 파일 개수
  const [totalCount, setTotalCount] = useState(0);

  // 스크립트 모달 상태
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTranscript, setSelectedTranscript] = useState(null);

  // 초기 로드: 제품 목록만 가져오기
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("[FileListPage] 제품 목록 로드 시작");
        const prods = await fetchProducts();
        console.log("[FileListPage] 제품 목록 로드 완료:", prods);
        setProducts(prods);
      } catch (err) {
        console.error("[FileListPage] 제품 목록 로드 오류:", err);
        setError(err.message || "제품 목록을 불러오는 중 오류가 발생했습니다.");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // 전체 파일 개수 로드
  useEffect(() => {
    const loadTotalCount = async () => {
      try {
        const count = await getTotalCount();
        setTotalCount(count);
      } catch (err) {
        console.error("전체 파일 개수 조회 실패:", err);
      }
    };
    loadTotalCount();
  }, []);

  // 폴더 펼침 시 해당 제품의 파일 가져오기 (Lazy Loading)
  const loadProductFiles = useCallback(
    async (productId) => {
      console.log("[FileListPage] loadProductFiles 시작:", productId);

      // 이미 로드된 파일이 있으면 스킵
      if (filesByProduct[productId]) {
        console.log("[FileListPage] 이미 로드됨:", productId);
        return;
      }

      // 이미 로딩 중이면 스킵
      if (loadingProducts.has(productId)) {
        console.log("[FileListPage] 로딩 중:", productId);
        return;
      }

      try {
        setLoadingProducts((prev) => new Set([...prev, productId]));

        // 제품 ID로만 필터링 (나머지는 프론트엔드에서 처리)
        const filters = { s3_id: productId };

        console.log("[FileListPage] API 호출:", filters);
        const result = await fetchScripts(filters);
        console.log("[FileListPage] API 응답:", result);

        if (result.success && result.data) {
          console.log("[FileListPage] 파일 변환 시작:", result.data.length);
          const convertedFiles = result.data.map((script) => {
            const s3KeyParts = script.s3_key.split("/");
            const extractedProductId = s3KeyParts[0];

            return {
              id: script.id,
              name: script.file_name,
              file_name: script.file_name,
              calling_date: script.calling_date,
              path: script.s3_key,
              product: extractedProductId,
              productName: script.brand_name,
              user: script.user_id,
              user_id: script.user_id,
              userName: script.consultant_name,
              uploadedAt: script.calling_date,
              file_size: script.file_size || 0,
              s3_key: script.s3_key,
              brand_name: script.brand_name,
              consultant_name: script.consultant_name,
              phone_number: script.phone_number,
              consultation_date: script.consultation_date,
              category_1: script.category_1,
              category_2: script.category_2,
              category_3: script.category_3,
              match_status: script.match_status,
            };
          });

          setFilesByProduct((prev) => ({
            ...prev,
            [productId]: convertedFiles,
          }));
        }
      } catch (err) {
        console.error(`제품 ${productId} 파일 로드 오류:`, err);
      } finally {
        setLoadingProducts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    },
    [filesByProduct, loadingProducts]
  );

  // API에서 사용자 목록 가져오기 (스크립트 기반)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await fetchUsers();
        setAllUsers(users);
      } catch (err) {
        console.error("사용자 목록 로드 오류:", err);
      }
    };

    loadUsers();
  }, []);

  // DB에서 모든 사용자 가져오기 (새로운 사용자 포함)
  useEffect(() => {
    const loadDbUsers = async () => {
      try {
        const users = await fetchAllUsers();
        setDbUsers(users);
      } catch (err) {
        console.error("DB 사용자 목록 로드 오류:", err);
      }
    };

    loadDbUsers();
  }, []);

  // 이름 매핑 생성 (제품명과 사용자명)
  useEffect(() => {
    const map = {};

    // 제품 매핑 (id → name, name → name) - api.js에서 반환하는 id 필드 사용
    products.forEach((product) => {
      if (product.id && product.name) {
        map[product.id] = product.name;
        map[product.name] = product.name;
      }
    });

    // 스크립트 기반 사용자 매핑 (id → name)
    allUsers.forEach((user) => {
      if (user.id && user.name) {
        map[user.id] = user.name;
      }
    });

    // DB 사용자 매핑 (새로운 사용자 포함)
    dbUsers.forEach((user) => {
      if (user.id && user.name) {
        map[user.id] = user.name;
      }
    });

    setNameMap(map);
    console.log("이름 매핑 생성:", map);
  }, [products, allUsers, dbUsers]);

  // 현재 폴더를 펼칠 때 파일 로드
  const toggleFolder = useCallback(
    (folderPath) => {
      console.log(
        "[FileListPage] toggleFolder:",
        folderPath,
        "loaded:",
        !!filesByProduct[folderPath]
      );

      // 제품 폴더를 펼칠 때 파일 로드
      if (folderPath !== "root" && !filesByProduct[folderPath]) {
        console.log("[FileListPage] loadProductFiles 호출:", folderPath);
        // 담당자 폴더 펼칠 때 로딩 상태 표시
        setLoadingUsers((prev) => new Set([...prev, folderPath]));
        loadProductFiles(folderPath).finally(() => {
          setLoadingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(folderPath);
            return newSet;
          });
        });
      }

      setExpandedFolders((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(folderPath)) {
          newSet.delete(folderPath);
        } else {
          newSet.add(folderPath);
        }
        return newSet;
      });
    },
    [filesByProduct, loadProductFiles]
  );

  // 필터 초기화
  const clearFilters = () => {
    setFilterProduct("");
    setFilterUser("");
    setFilterDateStart("");
    setFilterDateEnd("");
    setFilterFileName("");
    setExpandedFolders(new Set(["root"]));
  };

  // 로드된 전체 파일 계산
  const uploadedFiles = useMemo(() => {
    return Object.values(filesByProduct).flat();
  }, [filesByProduct]);

  // 필터 적용된 파일 계산
  const filteredFiles = useMemo(() => {
    return uploadedFiles.filter((file) => {
      // 제품 필터
      if (filterProduct) {
        const s3KeyParts = file.s3_key.split("/");
        const fileProductId = s3KeyParts[0];
        if (fileProductId !== filterProduct) {
          return false;
        }
      }

      // 파일명 필터
      if (
        filterFileName &&
        !file.file_name.toLowerCase().includes(filterFileName.toLowerCase())
      ) {
        return false;
      }

      // 날짜 필터
      if (
        filterDateStart &&
        new Date(file.calling_date) < new Date(filterDateStart)
      ) {
        return false;
      }

      if (
        filterDateEnd &&
        new Date(file.calling_date) > new Date(filterDateEnd)
      ) {
        return false;
      }

      // 사용자 필터
      if (filterUser) {
        const user = allUsers.find(
          (u) => u.name === filterUser || u.id === filterUser
        );
        if (user && file.user_id !== user.id) {
          return false;
        }
      }

      return true;
    });
  }, [
    uploadedFiles,
    filterProduct,
    filterFileName,
    filterDateStart,
    filterDateEnd,
    filterUser,
    allUsers,
  ]);

  // 제품 필터 변경 시 자동으로 폴더 열고 파일 로드
  useEffect(() => {
    if (filterProduct) {
      // 제품 폴더 자동 펼침
      setExpandedFolders((prev) => new Set([...prev, filterProduct]));
      // 파일 로드
      loadProductFiles(filterProduct);
    }
  }, [filterProduct, loadProductFiles]);

  // 담당자 필터 변경 시 해당 담당자의 파일이 있는 제품 로드 및 폴더 열기
  useEffect(() => {
    const loadUserFiles = async () => {
      if (!filterUser) return;

      // 담당자의 user_id 찾기
      const user = [...allUsers, ...dbUsers].find((u) => u.name === filterUser);
      if (!user) return;

      try {
        // 담당자의 파일 조회
        const result = await fetchScripts({ user_id: user.id, limit: 500 });

        if (result.success && result.data) {
          // 파일이 속한 제품들 찾기
          const productIds = new Set();
          result.data.forEach((script) => {
            const s3KeyParts = script.s3_key.split("/");
            productIds.add(s3KeyParts[0]);
          });

          // 각 제품의 파일 로드 (병렬)
          await Promise.all(
            Array.from(productIds).map((productId) =>
              loadProductFiles(productId)
            )
          );
        }
      } catch (err) {
        console.error("담당자 파일 로드 오류:", err);
      }
    };

    loadUserFiles();
  }, [filterUser, allUsers, dbUsers, loadProductFiles]);

  // 파일명 검색 시 필요한 제품 파일 로드
  useEffect(() => {
    const loadFilesForSearch = async () => {
      if (!filterFileName) return;

      // 현재 로드되지 않은 제품 중에서 로드 필요
      const productsToLoad = products.filter((p) => !filesByProduct[p.id]);

      if (productsToLoad.length > 0) {
        // 모든 제품 파일 로드 (병렬)
        await Promise.all(
          productsToLoad.map((product) => loadProductFiles(product.id))
        );
      }
    };

    loadFilesForSearch();
  }, [filterFileName, products, filesByProduct, loadProductFiles]);

  // 날짜 필터 변경 시 필요한 제품 파일 로드
  useEffect(() => {
    const loadFilesForDateRange = async () => {
      if (!filterDateStart && !filterDateEnd) return;

      // 현재 로드되지 않은 제품 중에서 로드 필요
      const productsToLoad = products.filter((p) => !filesByProduct[p.id]);

      if (productsToLoad.length > 0) {
        // 모든 제품 파일 로드 (병렬)
        await Promise.all(
          productsToLoad.map((product) => loadProductFiles(product.id))
        );
      }
    };

    loadFilesForDateRange();
  }, [filterDateStart, filterDateEnd, products, filesByProduct, loadProductFiles]);

  // filesByProduct 변경 시 필터에 맞는 폴더 자동 펼침
  useEffect(() => {
    // 필터가 없으면 자동 펼침 안함
    if (
      !filterFileName &&
      !filterUser &&
      !filterDateStart &&
      !filterDateEnd
    ) {
      return;
    }

    // 필터링된 파일이 없으면 폴더 펼치지 않음
    if (filteredFiles.length === 0) return;

    // 필터링된 파일들의 모든 폴더 경로 추출
    const foldersToExpand = new Set(["root"]);
    filteredFiles.forEach((file) => {
      const s3KeyParts = file.s3_key.split("/");
      const productId = s3KeyParts[0];
      const userId = s3KeyParts[1];
      const date = s3KeyParts[2];

      // 모든 상위 폴더 경로 추가
      foldersToExpand.add(productId);
      foldersToExpand.add(`${productId}/${userId}`);
      foldersToExpand.add(`${productId}/${userId}/${date}`);
    });

    setExpandedFolders(foldersToExpand);
  }, [
    filesByProduct,
    filteredFiles,
    filterFileName,
    filterUser,
    filterDateStart,
    filterDateEnd,
  ]);

  // 폴더 트리 구조 생성 (필터링된 파일 기반)
  const folderTree = useMemo(() => {
    const tree = { name: "root", type: "folder", children: {} };

    // 1단계: 제품 폴더 생성
    // 제품 필터가 있으면 해당 제품만, 없으면 모든 제품
    const productsToShow = filterProduct
      ? products.filter((p) => p.id === filterProduct)
      : products;

    productsToShow.forEach((product) => {
      const productId = product.id;
      const productName = product.name || productId;

      tree.children[productId] = {
        name: productName,
        type: "folder",
        path: productId,
        isLoading: loadingProducts.has(productId),
        children: {},
      };
    });

    // 2단계: 필터링된 파일들로 서브 폴더 구조 생성
    filteredFiles.forEach((file) => {
      const s3KeyParts = file.s3_key.split("/");
      const productId = s3KeyParts[0];
      const userId = s3KeyParts[1];
      const date = s3KeyParts[2];

      // 제품 폴더가 없으면 생성 (혹시 모르니)
      if (!tree.children[productId]) {
        const product = products.find((p) => p.id === productId);
        const productName = product?.name || productId;

        tree.children[productId] = {
          name: productName,
          type: "folder",
          path: productId,
          isLoading: loadingProducts.has(productId),
          children: {},
        };
      }

      // 사용자 폴더
      if (!tree.children[productId].children[userId]) {
        tree.children[productId].children[userId] = {
          name: nameMap[userId] || userId,
          type: "folder",
          path: `${productId}/${userId}`,
          children: {},
        };
      }

      // 날짜 폴더
      const userFolder = tree.children[productId].children[userId];
      if (!userFolder.children[date]) {
        userFolder.children[date] = {
          name: date,
          type: "folder",
          path: `${productId}/${userId}/${date}`,
          children: {},
        };
      }

      // 파일
      const dateFolder = userFolder.children[date];
      dateFolder.children[file.file_name] = {
        name: file.file_name,
        type: "file",
        path: file.s3_key,
        data: file,
      };
    });

    return tree;
  }, [products, filteredFiles, loadingProducts, nameMap]);

  // 파일 삭제 모달 열기
  const openDeleteModal = (file) => {
    if (!file || !file.id) {
      toast.error("Could not find file information.");
      return;
    }
    setDeleteTargetFile(file);
    setDeleteModalOpen(true);
  };

  // 파일 삭제 확인
  const confirmDeleteFile = async () => {
    if (!deleteTargetFile) return;

    try {
      toast.loading(`파일 삭제 중...`);
      setDeleteModalOpen(false);

      // API 호출
      const result = await deleteScript(deleteTargetFile.id);

      if (result.success) {
        toast.success(`파일이 삭제되었습니다.`);

        // 삭제된 파일 제거하기 위해 재로드
        // 제품의 캐시된 파일 목록 초기화
        setFilesByProduct((prev) => {
          const updated = { ...prev };
          if (deleteTargetFile.product) {
            updated[deleteTargetFile.product] = (
              updated[deleteTargetFile.product] || []
            ).filter((f) => f.id !== deleteTargetFile.id);
          }
          return updated;
        });

        // 전체 파일 개수 업데이트
        setTotalCount((prev) => Math.max(0, prev - 1));
      } else {
        toast.error(`파일 삭제 실패: ${result.msg || "알 수 없는 오류"}`);
      }
    } catch (error) {
      console.error("파일 삭제 오류:", error);
      toast.error(`파일 삭제 실패: ${error.message}`);
    } finally {
      setDeleteTargetFile(null);
    }
  };

  // 파일 삭제 취소
  const cancelDeleteFile = () => {
    setDeleteModalOpen(false);
    setDeleteTargetFile(null);
  };

  // 스크립트 추출 완료 핸들러
  const handleTranscriptExtracted = (fileId, transcript) => {
    // 파일 데이터에 transcript 추가
    setFilesByProduct((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((productId) => {
        updated[productId] = updated[productId].map((file) =>
          file.id === fileId ? { ...file, transcript } : file
        );
      });
      return updated;
    });

    // 모달 열기
    const file = Object.values(filesByProduct)
      .flat()
      .find((f) => f.id === fileId);
    if (file) {
      setSelectedFile({ ...file, transcript });
      setSelectedTranscript(transcript);
      setTranscriptModalOpen(true);
    }
  };

  // 스크립트 삭제 완료 핸들러
  const handleTranscriptDeleted = (fileId) => {
    // 파일 데이터에서 transcript 제거
    setFilesByProduct((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((productId) => {
        updated[productId] = updated[productId].map((file) =>
          file.id === fileId ? { ...file, transcript: null } : file
        );
      });
      return updated;
    });
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // UUID를 한글명으로 변환
  const getDisplayName = useCallback(
    (name) => {
      return nameMap[name] || name;
    },
    [nameMap]
  );

  // 트리 노드 렌더링
  const renderTreeNode = (node, level = 0, parentPath = "") => {
    const currentPath =
      node.path || (parentPath ? `${parentPath}/${node.name}` : node.name);
    const isExpanded = expandedFolders.has(currentPath);
    const displayName = getDisplayName(node.name);

    if (node.type === "folder") {
      const children = Object.values(node.children || {});
      const hasChildren = children.length > 0;

      return (
        <div
          key={currentPath}
          style={{
            marginLeft: `${level * 0.75}rem`,
            position: "relative",
          }}
        >
          {/* 트리 연결선 */}
          {level > 0 && (
            <div
              style={{
                position: "absolute",
                left: "-0.5rem",
                top: 0,
                bottom: 0,
                width: "1px",
                backgroundColor: "var(--border)",
                opacity: 0.5,
              }}
            ></div>
          )}
          {level > 0 && (
            <div
              style={{
                position: "absolute",
                left: "-0.5rem",
                top: "50%",
                width: "0.75rem",
                height: "1px",
                backgroundColor: "var(--border)",
                opacity: 0.5,
              }}
            ></div>
          )}

          <div
            onClick={() => toggleFolder(currentPath)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              cursor: "pointer",
              borderRadius: "6px",
              backgroundColor: "transparent",
              border: "1px solid transparent",
              margin: "0.1rem 0",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--muted)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <i
              className={`fas ${isExpanded ? "fa-folder-open" : "fa-folder"}`}
              style={{
                color: isExpanded ? "#FDB900" : "var(--muted-foreground)",
                fontSize: "1.1rem",
                transition: "color 0.2s ease",
              }}
            ></i>
            <span
              style={{
                fontWeight: "600",
                color: "var(--foreground)",
                fontSize: "0.95rem",
              }}
            >
              {displayName}
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--muted-foreground)",
                marginLeft: "auto",
              }}
            >
              {node.isLoading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <i className="fas fa-spinner fa-spin"></i>
                  로딩 중...
                </span>
              ) : isExpanded && children.length > 0 ? (
                `(${children.length})`
              ) : null}
            </span>
          </div>

          {isExpanded && hasChildren && (
            <div>
              {children
                .sort((a, b) => {
                  if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
                  return a.name.localeCompare(b.name);
                })
                .map((child) => renderTreeNode(child, level + 1, currentPath))}
            </div>
          )}
        </div>
      );
    } else {
      // 파일 렌더링

      return (
        <div
          key={node.path}
          style={{
            marginLeft: `${(level + 1) * 0.75}rem`,
            position: "relative",
          }}
        >
          {/* 파일 연결선 */}
          <div
            style={{
              position: "absolute",
              left: "-0.5rem",
              top: 0,
              bottom: 0,
              width: "1px",
              backgroundColor: "var(--border)",
              opacity: 0.3,
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              left: "-0.5rem",
              top: "50%",
              width: "0.75rem",
              height: "1px",
              backgroundColor: "var(--border)",
              opacity: 0.3,
            }}
          ></div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              backgroundColor: "transparent",
              border: "1px solid transparent",
              margin: "0.1rem 0",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <i
              className="fas fa-file-audio"
              style={{ color: "var(--accent)", fontSize: "1rem" }}
            ></i>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontWeight: "500",
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {playingFileId === node.path && (
                  <i
                    className="fas fa-play"
                    style={{
                      color: "var(--primary)",
                      fontSize: "0.75rem",
                      animation: "pulse 1s infinite",
                    }}
                  ></i>
                )}
                {node.name}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginLeft: "1rem",
                  marginRight: "1.5rem",
                  whiteSpace: "nowrap",
                }}
              >
                {/* 파일 크기 표시 비활성화 - 성능 최적화 */}
                {/* <span>{formatFileSize(node.data.file_size || 0)}</span> */}
                <span>
                  {new Date(node.data.uploadedAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const url = await getPresignedUrl(node.data.s3_key);
                    setPlayingFileId(
                      node.path === playingFileId ? null : node.path
                    );
                    setAudioUrl(url);
                  } catch (err) {
                    alert(`음성 재생 오류: ${err.message}`);
                  }
                }}
                style={{
                  padding: "0.4rem",
                  backgroundColor: "var(--accent)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                }}
                title="재생"
              >
                <i
                  className={`fas ${
                    playingFileId === node.path ? "fa-pause" : "fa-play"
                  }`}
                ></i>
              </button>
              <TranscriptButton
                file={node.data}
                onExtracted={handleTranscriptExtracted}
              />
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const url = await getPresignedUrl(node.data.s3_key);
                    window.open(url, "_blank");
                  } catch (err) {
                    alert(`다운로드 URL 생성 실패: ${err.message}`);
                  }
                }}
                style={{
                  padding: "0.4rem",
                  backgroundColor: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                }}
                title="다운로드"
              >
                <i className="fas fa-download"></i>
              </button>
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(node.data);
                  }}
                  style={{
                    padding: "0.4rem",
                    backgroundColor: "var(--destructive)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                  }}
                  title="삭제 (관리자만)"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )}
            </div>
          </div>

          {/* 재생 중인 파일의 오디오 플레이어 */}
          {playingFileId === node.path && audioUrl && (
            <div
              style={{
                marginLeft: "0.75rem",
                marginTop: "0.5rem",
                padding: "0.75rem",
                backgroundColor: "var(--muted)",
                borderRadius: "6px",
                border: "1px solid var(--border)",
              }}
            >
              <audio
                controls
                src={audioUrl}
                style={{
                  width: "100%",
                  height: "32px",
                }}
                autoPlay
              />
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <Layout>
      <div
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid var(--border)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          overflow: "hidden",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: "700",
                margin: 0,
                color: "var(--foreground)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <i
                className="fas fa-folder-tree"
                style={{ color: "var(--accent)" }}
              ></i>
              파일 탐색기
            </h3>
            <span
              style={{
                fontSize: "0.8rem",
                padding: "0.25rem 0.5rem",
                backgroundColor: "var(--muted)",
                color: "var(--muted-foreground)",
                borderRadius: "6px",
                fontWeight: "500",
              }}
            >
              {isLoading ? "로딩 중..." : `전체 ${totalCount}개`}
            </span>
          </div>

          {/* 상태 표시 */}
          {error && (
            <div
              style={{
                padding: "0.5rem 0.75rem",
                fontSize: "0.8rem",
                fontWeight: "500",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                backgroundColor: "var(--destructive)",
                color: "white",
              }}
            >
              <i
                className="fas fa-exclamation-circle"
                style={{ marginRight: "0.25rem" }}
              ></i>
              {error}
            </div>
          )}
        </div>

        {/* 필터 섹션 */}
        <div
          style={{
            backgroundColor: "var(--muted)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {/* 필터 헤더 (토글) */}
          <div
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <i
              className="fas fa-filter"
              style={{ color: "var(--accent)", fontSize: "0.9rem" }}
            ></i>
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "var(--foreground)",
              }}
            >
              필터
            </span>
            {(filterProduct ||
              filterUser ||
              filterDateStart ||
              filterDateEnd ||
              filterFileName) && (
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.2rem 0.4rem",
                  backgroundColor: "var(--accent)",
                  color: "white",
                  borderRadius: "4px",
                  fontWeight: "500",
                }}
              >
                적용중
              </span>
            )}
            {(filterProduct ||
              filterUser ||
              filterDateStart ||
              filterDateEnd ||
              filterFileName) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  backgroundColor: "var(--secondary)",
                  color: "var(--secondary-foreground)",
                  cursor: "pointer",
                }}
              >
                <i
                  className="fas fa-times"
                  style={{ marginRight: "0.25rem" }}
                ></i>
                초기화
              </button>
            )}
            <i
              className={`fas fa-chevron-${isFilterOpen ? "down" : "right"}`}
              style={{
                color: "var(--muted-foreground)",
                fontSize: "0.75rem",
                transition: "transform 0.2s ease",
                marginLeft: "auto",
              }}
            ></i>
          </div>

          {/* 필터 내용 */}
          {isFilterOpen && (
            <div
              style={{
                padding: "1rem",
                borderTop: "1px solid var(--border)",
                backgroundColor: "var(--card)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "0.75rem",
                }}
              >
                {/* 제품 필터 */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "var(--muted-foreground)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    제품
                  </label>
                  <select
                    value={filterProduct}
                    onChange={(e) => setFilterProduct(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      fontSize: "0.85rem",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      color: "var(--foreground)",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">전체</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 담당자 필터 */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "var(--muted-foreground)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    담당자
                  </label>
                  <select
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      fontSize: "0.85rem",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      color: "var(--foreground)",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">전체</option>
                    {Array.from(
                      new Map(
                        [...allUsers, ...dbUsers].map((user) => [user.id, user])
                      ).values()
                    ).map((user) => (
                      <option key={user.id} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 시작일 필터 */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "var(--muted-foreground)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    시작일
                  </label>
                  <input
                    type="date"
                    value={filterDateStart}
                    onChange={(e) => setFilterDateStart(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      fontSize: "0.85rem",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      color: "var(--foreground)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* 종료일 필터 */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "var(--muted-foreground)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    종료일
                  </label>
                  <input
                    type="date"
                    value={filterDateEnd}
                    onChange={(e) => setFilterDateEnd(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      fontSize: "0.85rem",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      color: "var(--foreground)",
                      outline: "none",
                    }}
                  />
                </div>

                {/* 파일명 필터 */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "var(--muted-foreground)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    파일명
                  </label>
                  <input
                    type="text"
                    value={filterFileName}
                    onChange={(e) => setFilterFileName(e.target.value)}
                    placeholder="파일명 검색..."
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      fontSize: "0.85rem",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      color: "var(--foreground)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <div>
            {isLoading ? (
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                }}
              >
                <i
                  className="fas fa-spinner fa-spin"
                  style={{
                    fontSize: "2rem",
                    marginBottom: "1rem",
                    display: "block",
                  }}
                ></i>
                <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                  로딩 중...
                </div>
              </div>
            ) : Object.values(folderTree.children || {}).length === 0 ? (
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                  backgroundColor: "var(--muted)",
                  borderRadius: "12px",
                  border: "1px dashed var(--border)",
                }}
              >
                <i
                  className="fas fa-folder-open"
                  style={{
                    fontSize: "3rem",
                    marginBottom: "1rem",
                    display: "block",
                  }}
                ></i>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  No files uploaded
                </div>
                <div style={{ fontSize: "0.9rem" }}>
                  파일을 업로드하면 여기에 폴더 구조로 표시됩니다.
                </div>
              </div>
            ) : (
              <div>
                {Object.values(folderTree.children)
                  .sort((a, b) => {
                    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
                    return a.name.localeCompare(b.name);
                  })
                  .map((node) => renderTreeNode(node, 0, ""))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 파일 삭제 확인 모달 */}
      {deleteModalOpen && deleteTargetFile && (
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
            zIndex: 10000,
          }}
        >
          <div
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              padding: "2rem",
              maxWidth: "500px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* 경고 아이콘 */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  fontSize: "3rem",
                  color: "var(--destructive)",
                  marginBottom: "1rem",
                }}
              >
                ⚠️
              </div>
              <h2
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  color: "var(--foreground)",
                }}
              >
                정말로 삭제하시겠습니까?
              </h2>
            </div>

            {/* 경고 메시지 */}
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.95rem",
                  color: "var(--foreground)",
                  lineHeight: "1.6",
                  marginBottom: "1rem",
                }}
              >
                <strong>⚠️ 주의</strong>
                <br />
                다음 항목이{" "}
                <strong style={{ color: "var(--destructive)" }}>
                  영구적으로 삭제
                </strong>
                됩니다:
              </div>

              <div
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <div>
                    <strong>📁 파일명:</strong>
                    <div
                      style={{
                        marginLeft: "1rem",
                        color: "var(--muted-foreground)",
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      {deleteTargetFile.name}
                    </div>
                  </div>
                  <div>
                    <strong>🗄️ 저장 위치:</strong>
                    <div
                      style={{
                        marginLeft: "1rem",
                        color: "var(--muted-foreground)",
                        fontSize: "0.9rem",
                        wordBreak: "break-all",
                      }}
                    >
                      {deleteTargetFile.brand_name || "기타"} /{" "}
                      {deleteTargetFile.consultant_name || "기타"} /{" "}
                      {deleteTargetFile.calling_date || "날짜없음"} /{" "}
                      {deleteTargetFile.name}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  padding: "1rem",
                  backgroundColor: "#fef2f2",
                  borderRadius: "6px",
                  border: "1px solid #fecaca",
                }}
              >
                <div style={{ fontSize: "1.2rem", marginTop: "-0.2rem" }}>
                  ❌
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#991b1b",
                    lineHeight: "1.5",
                  }}
                >
                  <strong>This action cannot be undone!</strong>
                  <br />
                  어디에도 해당 파일은 저장되어 있지 않으며 정말로 삭제됩니다.
                  <br />
                  Without a backup, this data cannot be recovered.
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={cancelDeleteFile}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "var(--secondary)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "var(--secondary)";
                }}
              >
                취소
              </button>
              <button
                onClick={confirmDeleteFile}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "var(--destructive)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "var(--destructive)";
                }}
              >
                예, 삭제합니다
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 스크립트 모달 */}
      <TranscriptModal
        open={transcriptModalOpen}
        onClose={() => setTranscriptModalOpen(false)}
        file={selectedFile}
        transcript={selectedTranscript}
        onDeleted={handleTranscriptDeleted}
      />
    </Layout>
  );
}

export default FileListPage;
