interface SheetFormulaBarProps {
  value: string;
}

export function SheetFormulaBar({ value }: SheetFormulaBarProps) {
  return (
    <div
      className="flex items-center gap-1.5 px-2 shrink-0"
      style={{
        height: 32,
        minHeight: 32,
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: '#f8f9fa',
      }}
    >
      <span className="text-xs font-semibold text-[#5f6368] w-5 text-center shrink-0">fx</span>
      <input
        type="text"
        readOnly
        value={value}
        placeholder="셀을 선택하면 UTM 코드가 표시됩니다"
        className="flex-1 text-xs border-none bg-transparent outline-none text-[#1a73e8] font-mono"
      />
    </div>
  );
}
