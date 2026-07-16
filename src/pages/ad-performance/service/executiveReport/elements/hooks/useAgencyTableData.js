import { useMemo } from 'react';

/**
 * 대행 모드 테이블 데이터 생성 Hook
 * @param {Array} agencyTableData - API에서 받은 대행 데이터
 * @param {string} viewMode - 'team' | 'media'
 * @param {Array} teamList - 팀 목록 (팀별 보기용)
 * @param {Array} mediaList - 매체 목록 (매체별 보기용)
 * @param {Array} selectedTeams - 선택된 팀 ID
 * @param {Array} selectedMedia - 선택된 매체 ID
 */
export const useAgencyTableData = ({
  agencyTableData,
  viewMode,
  teamList,
  mediaList,
  selectedTeams,
  selectedMedia,
  selectedProducts,
}) => {
  // 컬럼 생성 (2행 헤더)
  const tableColumns = useMemo(() => {
    const firstRow = [
      { title: "제품", rowSpan: 2 },
      { title: "광고비", rowSpan: 2, className: "ad-cost" },
    ];

    const secondRow = [];

    if (viewMode === 'team') {
      // 팀별 보기
      selectedTeams.forEach(teamId => {
        const team = teamList.find(t => t.id === teamId);
        firstRow.push({ title: team?.name || '', colSpan: 2, isParent: true });
        secondRow.push({ title: "광고비", isParentCell: true });
        secondRow.push({ title: "비율", isParentCell: true });
      });
    } else {
      // 매체별 보기
      selectedMedia.forEach(mediaId => {
        const media = mediaList.find(m => m.id === mediaId);
        firstRow.push({ title: media?.name || '', colSpan: 2, isParent: true });
        secondRow.push({ title: "광고비", isParentCell: true });
        secondRow.push({ title: "비율", isParentCell: true });
      });
    }

    firstRow.push({ title: "대행료", rowSpan: 2, className: "commission" });

    return [firstRow, secondRow];
  }, [viewMode, teamList, mediaList, selectedTeams, selectedMedia]);

  // 데이터 행 생성
  const renderTableData = useMemo(() => {
    if (!agencyTableData || agencyTableData.length === 0) {
      return [];
    }

    const filteredData = selectedProducts && selectedProducts.length > 0
      ? agencyTableData.filter(product => selectedProducts.includes(product.productId))
      : agencyTableData;

    const dataRows = filteredData.map(product => {
      // 선택된 팀/매체의 광고비만 합산
      let selectedAdCostSum = 0;

      if (viewMode === 'team') {
        selectedTeams.forEach(teamId => {
          const teamData = product.teams?.find(t => t.teamId === teamId);
          selectedAdCostSum += teamData?.adCost || 0;
        });
      } else {
        selectedMedia.forEach(mediaId => {
          const mediaData = product.media?.find(m => m.mediaId === mediaId);
          selectedAdCostSum += mediaData?.adCost || 0;
        });
      }

      const cells = [
        product.productName,
        selectedAdCostSum > 0 ? selectedAdCostSum.toLocaleString() + '원' : '-'
      ];

      if (viewMode === 'team') {
        selectedTeams.forEach(teamId => {
          const teamData = product.teams?.find(t => t.teamId === teamId);
          cells.push(teamData?.adCost ? teamData.adCost.toLocaleString() + '원' : '-');
          // 비율은 선택된 광고비 합계 기준으로 재계산
          const ratio = selectedAdCostSum > 0 ? (teamData?.adCost || 0) / selectedAdCostSum * 100 : 0;
          cells.push(ratio > 0 ? `${ratio.toFixed(1)}%` : '-');
        });
      } else {
        selectedMedia.forEach(mediaId => {
          const mediaData = product.media?.find(m => m.mediaId === mediaId);
          cells.push(mediaData?.adCost ? mediaData.adCost.toLocaleString() + '원' : '-');
          // 비율은 선택된 광고비 합계 기준으로 재계산
          const ratio = selectedAdCostSum > 0 ? (mediaData?.adCost || 0) / selectedAdCostSum * 100 : 0;
          cells.push(ratio > 0 ? `${ratio.toFixed(1)}%` : '-');
        });
      }

      // 대행료는 선택된 광고비 기준으로 재계산 (10%)
      const selectedAgencyFee = Math.round(selectedAdCostSum * 0.1);
      cells.push(selectedAgencyFee > 0 ? selectedAgencyFee.toLocaleString() + '원' : '-');

      return { cells };
    });

    // 합계 행 계산
    const totalRow = calculateTotalRow(filteredData, viewMode, selectedTeams, selectedMedia);
    dataRows.push(totalRow);

    return dataRows;
  }, [agencyTableData, viewMode, selectedTeams, selectedMedia, selectedProducts]);

  return { tableColumns, renderTableData };
};

// 합계 행 계산 함수
function calculateTotalRow(data, viewMode, selectedTeams, selectedMedia) {
  const cells = ["합계"];

  let totalAdCostSum = 0;

  // 선택된 팀/매체의 광고비만 합산
  data.forEach(product => {
    if (viewMode === 'team') {
      selectedTeams.forEach(teamId => {
        const teamData = product.teams?.find(t => t.teamId === teamId);
        totalAdCostSum += teamData?.adCost || 0;
      });
    } else {
      selectedMedia.forEach(mediaId => {
        const mediaData = product.media?.find(m => m.mediaId === mediaId);
        totalAdCostSum += mediaData?.adCost || 0;
      });
    }
  });

  cells.push(totalAdCostSum > 0 ? totalAdCostSum.toLocaleString() + '원' : '-');

  if (viewMode === 'team') {
    selectedTeams.forEach(teamId => {
      let teamAdCostSum = 0;
      data.forEach(product => {
        const teamData = product.teams?.find(t => t.teamId === teamId);
        teamAdCostSum += teamData?.adCost || 0;
      });
      cells.push(teamAdCostSum > 0 ? teamAdCostSum.toLocaleString() + '원' : '-');
      cells.push('-'); // 비율은 합계에서 표시 안함
    });
  } else {
    selectedMedia.forEach(mediaId => {
      let mediaAdCostSum = 0;
      data.forEach(product => {
        const mediaData = product.media?.find(m => m.mediaId === mediaId);
        mediaAdCostSum += mediaData?.adCost || 0;
      });
      cells.push(mediaAdCostSum > 0 ? mediaAdCostSum.toLocaleString() + '원' : '-');
      cells.push('-');
    });
  }

  // 대행료는 선택된 광고비 기준으로 계산 (10%)
  const totalAgencyFeeSum = totalAdCostSum * 0.1;

  cells.push(totalAgencyFeeSum > 0 ? Math.round(totalAgencyFeeSum).toLocaleString() + '원' : '-');

  return { cells, isTotal: true };
}
