import { useState, useEffect, useCallback } from "react";
import { getMarketPlaceList, createMarketPlace, updateMarketPlace, deleteMarketPlace } from "../api";

export function useChannelTab(showCustomAlert) {
  const [channelList, setChannelList] = useState([]);
  const [channelForm, setChannelForm] = useState({ name: "" });
  const [editingChannelId, setEditingChannelId] = useState(null);
  const [editingChannelData, setEditingChannelData] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 판매처 목록 조회
  const fetchChannelList = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMarketPlaceList({ includeUnassigned: true });
      if (result.success && result.data) {
        const formattedList = result.data.map((mp) => ({
          id: mp.id,
          name: mp.name,
          isUnassigned: mp.isUnassigned || false,
          fileMarketPlaceCount: mp.fileMarketPlaceCount || 0,
          fileMarketPlaces: mp.fileMarketPlaces || [],
          registeredDate: mp.createdAt ? new Date(mp.createdAt).toISOString().split("T")[0] : "-",
        }));
        setChannelList(formattedList);
      }
    } catch (error) {
      console.error("판매처 목록 조회 실패:", error);
      showCustomAlert("판매처 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [showCustomAlert]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchChannelList();
  }, [fetchChannelList]);

  // 외부 클릭 핸들러
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null && !event.target.closest(".dropdown-menu-container")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleChannelSubmit = async () => {
    if (!channelForm.name.trim()) {
      showCustomAlert("판매처명을 입력해주세요.");
      return;
    }

    // 중복 체크 (isUnassigned가 아닌 것들 중에서)
    if (channelList.some((ch) => !ch.isUnassigned && ch.name === channelForm.name.trim())) {
      showCustomAlert("이미 등록된 판매처입니다.");
      return;
    }

    try {
      const result = await createMarketPlace({ name: channelForm.name.trim() });
      if (result.success) {
        setChannelForm({ name: "" });
        showCustomAlert("판매처가 등록되었습니다.");
        await fetchChannelList();
      }
    } catch (error) {
      showCustomAlert(error.message || "판매처 등록에 실패했습니다.");
    }
  };

  const handleChannelEdit = (channel) => {
    // 미지정은 수정 불가
    if (channel.isUnassigned) {
      showCustomAlert("미지정 판매처는 수정할 수 없습니다.");
      return;
    }
    setEditingChannelId(channel.id);
    setEditingChannelData({ name: channel.name });
    setOpenMenuId(null);
  };

  const handleChannelSave = async () => {
    if (!editingChannelData.name.trim()) {
      showCustomAlert("판매처명을 입력해주세요.");
      return;
    }

    // 중복 체크 (자기 자신 및 미지정 제외)
    if (channelList.some((ch) => !ch.isUnassigned && ch.id !== editingChannelId && ch.name === editingChannelData.name.trim())) {
      showCustomAlert("이미 등록된 판매처입니다.");
      return;
    }

    try {
      const result = await updateMarketPlace(editingChannelId, { name: editingChannelData.name.trim() });
      if (result.success) {
        setEditingChannelId(null);
        setEditingChannelData(null);
        showCustomAlert("판매처가 수정되었습니다.");
        await fetchChannelList();
      }
    } catch (error) {
      showCustomAlert(error.message || "판매처 수정에 실패했습니다.");
    }
  };

  const handleChannelEditCancel = () => {
    setEditingChannelId(null);
    setEditingChannelData(null);
  };

  const handleChannelDelete = async (id) => {
    const channel = channelList.find((ch) => ch.id === id);

    // 미지정은 삭제 불가
    if (channel?.isUnassigned) {
      showCustomAlert("미지정 판매처는 삭제할 수 없습니다.");
      setOpenMenuId(null);
      return;
    }

    if (window.confirm("해당 판매처를 삭제하시겠습니까?")) {
      try {
        const result = await deleteMarketPlace(id);
        if (result.success) {
          showCustomAlert("판매처가 삭제되었습니다.");
          await fetchChannelList();
        }
      } catch (error) {
        showCustomAlert(error.message || "판매처 삭제에 실패했습니다.");
      }
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  return {
    channelList,
    channelForm,
    setChannelForm,
    editingChannelId,
    editingChannelData,
    setEditingChannelData,
    openMenuId,
    loading,
    handleChannelSubmit,
    handleChannelEdit,
    handleChannelSave,
    handleChannelEditCancel,
    handleChannelDelete,
    toggleMenu,
    refreshChannelList: fetchChannelList,
  };
}
