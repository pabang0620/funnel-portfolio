import { useState } from 'react';
import { Star, Link2 } from 'lucide-react';
import type { SidebarItem } from '../../types/sheet';
import { Badge } from '../ui/badge';
import { cn, getProductColor } from '../../lib/utils';

interface SheetSidebarProps {
  items: SidebarItem[];
  activeProductId: string | null;
  activeMediaId: string | null;
  favorites: Set<string>;
  width?: number;
  onSelectContext: (productId: string, mediaId: string) => void;
  onToggleFavorite: (key: string) => void;
}

export function SheetSidebar({
  items,
  activeProductId,
  activeMediaId,
  favorites,
  width = 240,
  onSelectContext,
  onToggleFavorite,
}: SheetSidebarProps) {
  const [search, setSearch] = useState('');

  const q = search.toLowerCase();
  const filtered = items
    .filter(item =>
      !q ||
      (item.productName || '').toLowerCase().includes(q) ||
      (item.mediaName || '').toLowerCase().includes(q) ||
      (item.brandName || '').toLowerCase().includes(q)
    )
    .sort((a, b) => {
      if (!q) return 0;
      const score = (item: SidebarItem) => {
        if ((item.productName || '').toLowerCase().includes(q)) return 0;
        if ((item.brandName || '').toLowerCase().includes(q)) return 1;
        return 2;
      };
      return score(a) - score(b);
    });

  const favItems = filtered.filter(i => favorites.has(i.key));
  const restItems = filtered.filter(i => !favorites.has(i.key));

  function renderItem(item: SidebarItem) {
    const isActive = item.productId === activeProductId && item.mediaId === activeMediaId;
    const isFav = favorites.has(item.key);

    return (
      <div
        key={item.key}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer text-xs rounded-none ${
          isActive
            ? 'bg-[#e8f0fe] text-[#1a73e8] font-semibold'
            : 'hover:bg-[#f5f5f5] text-[var(--foreground)]'
        }`}
        onClick={() => onSelectContext(item.productId, item.mediaId)}
      >
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap min-w-0 flex items-center gap-1">
          <Badge className={cn(getProductColor(item.productId).bg, getProductColor(item.productId).text)}>{item.productName}</Badge>
          <Link2 className="w-2.5 h-2.5 text-[#9aa0a6] shrink-0" />
          <Badge className={cn(getProductColor(item.mediaId).bg, getProductColor(item.mediaId).text)}>{item.mediaName}</Badge>
        </span>
        <button
          className={`shrink-0 p-0.5 border-none bg-transparent cursor-pointer ${
            isFav ? 'text-amber-400' : 'text-[#d1d5db]'
          } hover:text-amber-400 transition-colors`}
          title="즐겨찾기"
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite(item.key);
          }}
        >
          <Star className="w-3 h-3" fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ width, minWidth: width, borderRight: '1px solid var(--border)', background: 'white' }}>
      <div className="px-2.5 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <input
          type="text"
          placeholder="제품 또는 매체 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full text-xs px-2 py-1 border border-[var(--border)] rounded outline-none font-[inherit]"
        />
      </div>
      <div className="flex-1 overflow-y-auto py-1 relative">
        {favItems.length > 0 && (
          <>
            <div className="px-2.5 py-1 text-[10px] font-bold text-[#9aa0a6] uppercase tracking-wider mt-1">
              즐겨찾기
            </div>
            {favItems.map(renderItem)}
            <div className="my-1 mx-0" style={{ height: 1, background: 'var(--border)' }} />
          </>
        )}
        {restItems.length > 0 && (
          <>
            {favItems.length > 0 && (
              <div className="px-2.5 py-1 text-[10px] font-bold text-[#9aa0a6] uppercase tracking-wider">
                전체
              </div>
            )}
            {restItems.map(renderItem)}
          </>
        )}
        {filtered.length === 0 && (
          <div className="px-4 py-4 text-center text-[#9aa0a6] text-xs">
            검색 결과 없음
          </div>
        )}
      </div>
    </div>
  );
}
