import DataTable from '../../../components/common/DataTable';

/**
 * 판매실적 데이터 테이블 컴포넌트
 * DataTable을 감싸는 래퍼 컴포넌트
 */
const SalesDataTable = ({ columns, data, isAdmin, onCellClick, channelCount, onColumnReorder, sortConfig, onSort }) => {
  return (
    <div className="table-container">
      <DataTable
        columns={columns}
        data={data}
        isAdmin={isAdmin}
        onCellClick={onCellClick}
        channelCount={channelCount}
        onColumnReorder={onColumnReorder}
        sortConfig={sortConfig}
        onSort={onSort}
      />
    </div>
  );
};

export default SalesDataTable;
