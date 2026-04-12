import React, { useState, useEffect, useRef, type ReactNode } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "../lib/utils";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  displayLabel?: string; // 선택된 값으로 표시할 텍스트 (없으면 label 사용)
  disabled?: boolean;
}

interface SearchableSelectProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  highlight?: boolean;
  onFocusNext?: () => void;
  onFocusPrev?: () => void;
  onFocusDown?: () => void;
  onFocusUp?: () => void;
  renderOption?: (option: SelectOption) => ReactNode;
  renderSelected?: (option: SelectOption) => ReactNode;
}

export function SearchableSelect({
  label,
  placeholder = "선택하세요...",
  options,
  value,
  onChange,
  required = false,
  disabled = false,
  error = false,
  highlight = false,
  onFocusNext,
  onFocusPrev,
  onFocusDown,
  onFocusUp,
  renderOption,
  renderSelected,
}: SearchableSelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex]);

  // 드롭다운 열릴 때 검색 입력창에 포커스 (preventScroll: true로 스크롤 방지)
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // 검색어 변경 시 첫 번째 활성화 항목 자동 하이라이트
  useEffect(() => {
    if (isOpen && filteredOptions.length > 0) {
      const firstEnabled = filteredOptions.findIndex(opt => !opt.disabled);
      setHighlightedIndex(firstEnabled >= 0 ? firstEnabled : -1);
    } else {
      setHighlightedIndex(-1);
    }
  }, [search, isOpen, filteredOptions.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          onFocusNext?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          onFocusPrev?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          onFocusDown?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          onFocusUp?.();
          break;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => {
          let next = prev + 1;
          while (next < filteredOptions.length && filteredOptions[next].disabled) next++;
          return next < filteredOptions.length ? next : prev;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => {
          let next = prev - 1;
          while (next >= 0 && filteredOptions[next].disabled) next--;
          return next >= 0 ? next : prev;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const highlighted = filteredOptions[highlightedIndex];
          if (!highlighted.disabled) {
            onChange(highlighted.value);
            setIsOpen(false);
            setSearch("");
            triggerRef.current?.focus({ preventScroll: true });
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label className="text-sm">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            !selectedOption && "text-muted-foreground",
            error && "border-red-500 focus:ring-red-500",
            highlight && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onKeyDown={handleKeyDown}
          onClick={() => {
            if (disabled) return;
            const newOpen = !isOpen;
            setIsOpen(newOpen);
            if (newOpen) {
              setSearch("");
            }
          }}
        >
          <span className="flex-1 text-left truncate">
            {selectedOption
              ? (renderSelected ? renderSelected(selectedOption) : (selectedOption.displayLabel || selectedOption.label))
              : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 min-w-full w-max max-w-xs rounded-md border bg-popover shadow-md">
            <div className="p-2">
              <Input
                ref={searchInputRef}
                placeholder="검색..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="max-h-60 overflow-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-3 text-center text-xs text-muted-foreground">
                  검색 결과가 없습니다.
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    ref={(el) => { optionRefs.current[index] = el; }}
                    type="button"
                    className={cn(
                      "relative flex w-full select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                      option.disabled
                        ? "opacity-40 cursor-not-allowed"
                        : "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                      option.value === value && "bg-accent",
                      highlightedIndex === index && !option.disabled && "bg-muted"
                    )}
                    onClick={() => {
                      if (option.disabled) return;
                      onChange(option.value);
                      setIsOpen(false);
                      setSearch("");
                      triggerRef.current?.focus({ preventScroll: true });
                    }}
                  >
                    <span className="flex-1 text-left">{renderOption ? renderOption(option) : option.label}</span>
                    {option.value === value && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
