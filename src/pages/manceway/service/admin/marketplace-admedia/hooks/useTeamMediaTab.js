import { useState, useEffect, useCallback } from "react";
import { getTeams, getMediaList, saveMediaAssignment } from "../api";

function useTeamMediaTab() {
  // 상태 관리
  const [teams, setTeams] = useState([]);           // 계층형 팀 목록
  const [medias, setMedias] = useState([]);         // 계층형 매체 목록
  const [selectedTeam, setSelectedTeam] = useState(null);  // 선택된 팀
  const [localMediaIds, setLocalMediaIds] = useState([]);  // 로컬 매체 선택 상태
  const [hasChanges, setHasChanges] = useState(false);     // 변경사항 여부
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 초기 데이터 로드
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [teamsResponse, mediasResponse] = await Promise.all([
        getTeams(),
        getMediaList(),
      ]);

      setTeams(teamsResponse.data || []);
      setMedias(mediasResponse.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 팀 선택 핸들러
  const handleTeamSelect = (team, isParent = false) => {
    setSelectedTeam({
      ...team,
      isParent
    });
    
    if (isParent || !team.ownMediaIds) {
      // 부모팀이거나 ownMediaIds가 없는 경우 기존 로직
      setLocalMediaIds(team.mediaIds || []);
    } else {
      // 자식팀인 경우 ownMediaIds만 로컬 상태에 설정 (부모 할당은 수정 불가)
      setLocalMediaIds(team.ownMediaIds || []);
    }
    
    setHasChanges(false);
  };

  // 세부 매체 토글 핸들러 (로컬 상태만 변경)
  const handleMediaToggle = (mediaId) => {
    if (!selectedTeam) return;

    setLocalMediaIds(prev => {
      let newMediaIds;
      if (prev.includes(mediaId)) {
        newMediaIds = prev.filter(id => id !== mediaId);
      } else {
        newMediaIds = [...prev, mediaId];
      }
      return newMediaIds;
    });
    setHasChanges(true);
  };

  // 부모 매체 토글 핸들러 (세부 매체 일괄 선택/해제)
  const handleParentMediaToggle = (parentMediaId) => {
    if (!selectedTeam) return;

    // 해당 부모 매체의 세부 매체 ID 목록 찾기
    const parentMedia = medias.find(m => m.id === parentMediaId);
    if (!parentMedia || !parentMedia.children) return;

    const childIds = parentMedia.children.map(child => child.id);

    // 모든 세부 매체가 선택되어 있는지 확인
    const allSelected = childIds.every(id => localMediaIds.includes(id));

    setLocalMediaIds(prev => {
      if (allSelected) {
        // 모두 선택됨 → 모두 해제
        return prev.filter(id => !childIds.includes(id));
      } else {
        // 일부 또는 전부 미선택 → 모두 선택
        const newIds = new Set([...prev, ...childIds]);
        return Array.from(newIds);
      }
    });
    setHasChanges(true);
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!selectedTeam) return;

    try {
      setSaving(true);

      await saveMediaAssignment({
        teamId: selectedTeam.id,
        mediaIds: localMediaIds
      });

      // 데이터 다시 로드
      await loadData();

      // 선택된 팀 정보 업데이트
      setSelectedTeam(prev => ({
        ...prev,
        mediaIds: localMediaIds
      }));

      setHasChanges(false);
      alert("저장되었습니다.");

    } catch (error) {
      console.error("Failed to save media assignment:", error);
      alert("매체 할당 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 선택된 팀의 매체 할당 여부 및 출처 확인
  const isMediaAssignedToSelectedTeam = (mediaId) => {
    if (!selectedTeam) return { assigned: false, source: null };
    
    const isInLocal = localMediaIds.includes(mediaId);
    const isFromParent = selectedTeam.parentMediaIds && selectedTeam.parentMediaIds.includes(mediaId);
    const childTeamsWithMedia = selectedTeam.childrenMediaInfo && selectedTeam.childrenMediaInfo[mediaId];
    
    if (selectedTeam.isParent) {
      // 부모팀인 경우
      if (isInLocal && childTeamsWithMedia) {
        return { assigned: true, source: 'both', childTeams: childTeamsWithMedia }; // 부모+자식 둘 다
      } else if (isInLocal) {
        return { assigned: true, source: 'parent' }; // 부모팀에서 설정
      } else if (childTeamsWithMedia) {
        return { assigned: true, source: 'child', childTeams: childTeamsWithMedia }; // 자식팀에서만 설정
      } else {
        return { assigned: false, source: null }; // 미할당
      }
    } else {
      // 자식팀인 경우 (기존 로직 유지)
      if (isFromParent && isInLocal) {
        return { assigned: true, source: 'both' }; // 부모+자식 둘 다
      } else if (isFromParent) {
        return { assigned: true, source: 'parent' }; // 부모로부터 할당
      } else if (isInLocal) {
        return { assigned: true, source: 'own' }; // 자식팀 고유 선택
      } else {
        return { assigned: false, source: null }; // 미할당
      }
    }
  };

  // 매체가 수정 불가능한지 확인
  const isMediaReadOnly = (mediaId) => {
    if (!selectedTeam) return false;

    if (selectedTeam.isParent) {
      // 부모팀인 경우: 자식팀만 단독 선택한 매체(부모는 미선택)만 잠금
      // 부모+자식 모두 선택한 경우(both)는 부모가 직접 해제 가능
      const childTeamsWithMedia = selectedTeam.childrenMediaInfo && selectedTeam.childrenMediaInfo[mediaId];
      const isParentSelected = selectedTeam.mediaIds && selectedTeam.mediaIds.includes(mediaId);
      return !!childTeamsWithMedia && !isParentSelected;
    } else {
      // 자식팀인 경우: 부모만 단독 할당한 매체(자식 자신은 미선택)만 잠금
      // 부모+자식 모두 선택한 경우(both)는 자식이 직접 해제 가능
      const isFromParent = selectedTeam.parentMediaIds && selectedTeam.parentMediaIds.includes(mediaId);
      const isOwnSelection = selectedTeam.ownMediaIds && selectedTeam.ownMediaIds.includes(mediaId);
      return isFromParent && !isOwnSelection;
    }
  };

  // 기존 함수명도 유지 (호환성)
  const isMediaFromParent = (mediaId) => {
    return selectedTeam && selectedTeam.parentMediaIds && selectedTeam.parentMediaIds.includes(mediaId);
  };

  // 부모 매체의 세부 매체가 모두 선택되었는지 확인
  const isParentMediaFullySelected = (parentMediaId) => {
    const parentMedia = medias.find(m => m.id === parentMediaId);
    if (!parentMedia || !parentMedia.children || parentMedia.children.length === 0) {
      return false;
    }
    return parentMedia.children.every(child => {
      const mediaInfo = isMediaAssignedToSelectedTeam(child.id);
      return mediaInfo.assigned;
    });
  };

  // 부모 매체의 세부 매체가 일부만 선택되었는지 확인
  const isParentMediaPartiallySelected = (parentMediaId) => {
    const parentMedia = medias.find(m => m.id === parentMediaId);
    if (!parentMedia || !parentMedia.children || parentMedia.children.length === 0) {
      return false;
    }
    const selectedCount = parentMedia.children.filter(child => {
      const mediaInfo = isMediaAssignedToSelectedTeam(child.id);
      return mediaInfo.assigned;
    }).length;
    return selectedCount > 0 && selectedCount < parentMedia.children.length;
  };

  // 부모팀 선택 시 자식팀 중 해당 매체를 가진 팀 목록 반환
  const getChildTeamsWithMedia = (mediaId) => {
    if (!selectedTeam || !selectedTeam.isParent) return [];

    return (selectedTeam.children || [])
      .filter(child => (child.mediaIds || []).includes(mediaId))
      .map(child => child.name);
  };

  return {
    // 상태
    teams,
    medias,
    selectedTeam,
    loading,
    saving,
    hasChanges,

    // 핸들러
    handleTeamSelect,
    handleMediaToggle,
    handleParentMediaToggle,
    handleSave,
    isMediaAssignedToSelectedTeam,
    isMediaFromParent,
    isMediaReadOnly,
    isParentMediaFullySelected,
    isParentMediaPartiallySelected,
    getChildTeamsWithMedia,
    reloadData: loadData
  };
}

export default useTeamMediaTab;
