import { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import type { DropdownOption } from '../../types/sheet';
import { Badge } from '../ui/badge';
import { cn, getProductColor } from '../../lib/utils';

interface SheetDropdownProps {
  anchorEl: HTMLElement | null;
  options: DropdownOption[];
  currentValue: string;
  colKey?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function SheetDropdown({
  anchorEl,
  options,
  currentValue,
  colKey: _colKey,
  onSelect,
  onClose,
}: SheetDropdownProps) {
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number; minWidth: number; openUp: boolean } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(() => {
    const idx = options.findIndex(o => o.value === currentValue);
    return idx >= 0 ? idx : 0;
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const menuHeight = 220;
    const openUp = rect.bottom + menuHeight > window.innerHeight;
    const top = openUp ? rect.top - menuHeight - 2 : rect.bottom + 2;
    const left = Math.min(rect.left, window.innerWidth - Math.max(rect.width, 130) - 8);
    setPosition({
      top,
      left,
      minWidth: Math.max(rect.width, 130),
      openUp,
    });
  }, [anchorEl]);

  useEffect(() => {
    if (position) {
      searchRef.current?.focus();
    }
  }, [position]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'Escape') {
        onClose();
        e.stopImmediatePropagation();
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        setHighlightedIndex(i => Math.min(i + 1, filteredOptions.length - 1));
        e.stopImmediatePropagation();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setHighlightedIndex(i => Math.max(i - 1, 0));
        e.stopImmediatePropagation();
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (filteredOptions[highlightedIndex]) {
          onSelect(filteredOptions[highlightedIndex].value);
        }
        onClose();
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, [filteredOptions, highlightedIndex, onClose, onSelect]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[highlightedIndex] as HTMLElement | undefined;
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      e.nativeEvent.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      setHighlightedIndex(i => Math.min(i + 1, filteredOptions.length - 1));
      e.nativeEvent.stopImmediatePropagation();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(i => Math.max(i - 1, 0));
      e.nativeEvent.stopImmediatePropagation();
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (filteredOptions[highlightedIndex]) {
        onSelect(filteredOptions[highlightedIndex].value);
      }
      onClose();
      e.nativeEvent.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    }
  }, [filteredOptions, highlightedIndex, onClose, onSelect]);

  if (!anchorEl || !position) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        minWidth: position.minWidth,
        zIndex: 9999,
      }}
      className="bg-white border border-[#dadce0] rounded shadow-lg overflow-hidden"
    >
      <input
        ref={searchRef}
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="검색..."
        className="w-full px-2 py-1.5 text-xs border-b border-[#e0e0e0] outline-none font-[inherit]"
        onClick={e => e.stopPropagation()}
      />
      <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: 160 }}>
        {filteredOptions.map((opt, idx) => (
          <div
            key={opt.value}
            className={`px-2.5 py-1.5 text-xs cursor-pointer ${
              idx === highlightedIndex
                ? 'bg-[#e8f0fe] text-[#1a73e8]'
                : opt.value === currentValue
                  ? 'text-[#1a73e8] font-semibold bg-[#f0f4ff]'
                  : 'hover:bg-[#e8f0fe] hover:text-[#1a73e8]'
            }`}
            onMouseEnter={() => setHighlightedIndex(idx)}
            onMouseDown={e => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(opt.value);
              onClose();
            }}
          >
            {(() => {
              const colorKey = opt.colorKey ?? opt.value;
              const color = getProductColor(colorKey);
              return <Badge className={cn('text-xs px-1.5 py-0', color.bg, color.text)}>{opt.label}</Badge>;
            })()}
          </div>
        ))}
        <div
          className="px-2.5 py-1.5 text-xs cursor-pointer text-[#9aa0a6] hover:bg-[#e8f0fe]"
          onMouseDown={e => {
            e.preventDefault();
            e.stopPropagation();
            onSelect('');
            onClose();
          }}
        >
          (비움)
        </div>
      </div>
    </div>,
    document.body
  );
}
