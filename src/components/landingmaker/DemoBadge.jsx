const DemoBadge = ({ projectName = "Portfolio" }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full shadow-lg font-semibold text-sm">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      <span>{projectName} Demo</span>
    </div>
  );
};

export default DemoBadge;
