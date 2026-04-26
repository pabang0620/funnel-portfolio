const DashSubBar = ({ setEditMode, editMode }) => {
  return (
    <div className="w-full h-12 px-6 flex items-center gap-3 border-b border-gray-300 bg-gray-100">
      <h2 className="text-base font-bold">대시보드</h2>

      {/* 편집 모드 토글 버튼 */}
      <button
        onClick={() => setEditMode(!editMode)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          editMode
            ? 'bg-[#124946] text-white'
            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        {editMode ? '편집 완료' : '레이아웃 편집'}
      </button>

      {editMode && (
        <span className="text-xs text-gray-500">
          드래그하여 위젯을 이동하고, 모서리를 드래그하여 크기를 조절하세요
        </span>
      )}
    </div>
  );
};

export default DashSubBar;
