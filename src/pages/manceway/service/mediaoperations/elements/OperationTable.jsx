import React from 'react';
import { canEditTeamData } from "../../../api/mediaOperationsService";
import { getCurrentUser } from "../../../utils/auth";

function OperationTable({ products, medias, teamDetails, operationData, teamMediaPermissions, onStatusClick }) {
  // 팀-매체 조합에 대한 매체 권한 확인
  const hasTeamMediaAccess = (teamDetail, mediaId) => {
    const teamMediaIds = teamMediaPermissions[teamDetail] || [];
    return teamMediaIds.includes(mediaId);
  };
  
  // 셀 클릭 가능 여부 확인 (할당된 매체 + 팀 권한)
  const canClickCell = (teamDetail, mediaId) => {
    // 매체가 할당되지 않은 경우 클릭 불가
    if (!hasTeamMediaAccess(teamDetail, mediaId)) {
      return false;
    }
    
    // S등급은 모든 팀 수정 가능, 기타는 자기 팀만
    return canEditTeamData(teamDetail);
  };

  // 셀 데이터 가져오기 (ID 기반 키 사용)
  const getCellData = (productId, mediaId, teamDetail) => {
    const key = `${productId}-${mediaId}-${teamDetail}`;
    return operationData[key] || null;
  };

  // 상태 클릭 핸들러 (ID 기반)
  const handleStatusClick = (productId, mediaId, teamDetail, currentStatus) => {
    // 팀 권한 체크는 onStatusClick 내부에서 처리 (기존 로직 유지)
    if (onStatusClick) {
      onStatusClick(productId, mediaId, teamDetail, currentStatus);
    }
  };

  return (
    <div className="table-section">
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th rowSpan={2}>제품명</th>
              {medias.map((media) => (
                <th
                  key={media.id}
                  colSpan={teamDetails.length}
                >
                  {media.name}
                </th>
              ))}
            </tr>
            <tr>
              {medias.map((media) =>
                teamDetails.map((teamDetail) => (
                  <th key={`${media.id}-${teamDetail}`}>
                    {teamDetail}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                {medias.map((media) =>
                  teamDetails.map((teamDetail) => {
                    const cellData = getCellData(
                      product.id,
                      media.id,
                      teamDetail
                    );
                    const isMediaAssigned = hasTeamMediaAccess(teamDetail, media.id);
                    const isClickable = canClickCell(teamDetail, media.id);

                    // 매체가 할당되지 않은 경우 회색 배경으로 표시 (텍스트 없음)
                    if (!isMediaAssigned) {
                      return (
                        <td
                          key={`${product.id}-${media.id}-${teamDetail}`}
                          className="team-column unassigned-cell"
                        >
                          {/* 빈 회색 셀 - 텍스트 없음 */}
                        </td>
                      );
                    }

                    // 매체가 할당된 경우 정상 색깔로 표시
                    return (
                      <td
                        key={`${product.id}-${media.id}-${teamDetail}`}
                        className="team-column"
                      >
                        {cellData ? (
                          <span
                            className={`status-badge ${cellData.status === '운영중' ? 'status-active' : 'status-inactive'} ${
                              isClickable ? 'clickable' : ''
                            }`}
                            onClick={isClickable ? () => handleStatusClick(product.id, media.id, teamDetail, cellData.status) : undefined}
                          >
                            {cellData.status}
                          </span>
                        ) : (
                          <span
                            className={`empty-cell ${isClickable ? 'clickable' : ''}`}
                            onClick={isClickable ? () => handleStatusClick(product.id, media.id, teamDetail, null) : undefined}
                          >
                            {/* 할당된 매체의 빈 셀 - 클릭하면 운영중으로 설정 */}
                          </span>
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OperationTable;
