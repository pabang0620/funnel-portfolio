"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { DayPicker, type DateRange } from "react-day-picker"
import { format, subDays } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "./button"
import { cn } from "../../lib/utils"
import "react-day-picker/src/style.css"

interface DateRangePickerProps {
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

function toStr(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

function parseStr(s: string): Date | undefined {
  if (!s) return undefined
  const d = new Date(s + "T00:00:00")
  return isNaN(d.getTime()) ? undefined : d
}

const QUICK = [
  { label: "30일", days: 30 },
  { label: "90일", days: 90 },
  { label: "180일", days: 180 },
]

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selected = React.useMemo<DateRange>(
    () => ({ from: parseStr(from), to: parseStr(to) }),
    [from, to]
  )

  function handleSelect(range: DateRange | undefined) {
    if (!range) return
    const f = range.from ? toStr(range.from) : from
    const t = range.to ? toStr(range.to) : f
    onChange(f, t)
  }

  function applyQuick(days: number) {
    const today = new Date()
    const start = subDays(today, days)
    onChange(toStr(start), toStr(today))
    setOpen(false)
  }

  const label = from && to
    ? from === to ? from : `${from} ~ ${to}`
    : "날짜 선택"

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-9 justify-start gap-2 text-sm font-normal text-foreground', selected.from ? 'w-auto min-w-[130px]' : 'w-[130px]')}
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-left truncate">{label}</span>
          {selected.from && (
            <button
              type="button"
              aria-label="날짜 초기화"
              onClick={(e) => { e.stopPropagation(); onChange('', ''); setOpen(false) }}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-auto rounded-lg border border-border bg-background shadow-lg outline-none animate-in fade-in-0 zoom-in-95"
        >
          {/* 빠른 선택 */}
          <div className="flex gap-1.5 px-3 pt-3 pb-2.5 border-b border-border">
            {QUICK.map(({ label: l, days }) => (
              <button
                key={l}
                onClick={() => applyQuick(days)}
                className="flex-1 h-7 rounded-md text-xs font-medium border border-border bg-background text-foreground hover:bg-muted transition-colors"
              >
                {l}
              </button>
            ))}
          </div>

          {/* 달력 - style을 DayPicker에 직접 적용해야 .rdp-root CSS 변수를 덮어씀 */}
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            locale={ko}
            showOutsideDays
            className="p-4 pt-3"
            style={{
              "--rdp-accent-color": "oklch(0.205 0 0)",
              "--rdp-accent-background-color": "oklch(0.97 0 0)",
              "--rdp-range_middle-background-color": "oklch(0.97 0 0)",
              "--rdp-range_start-color": "oklch(0.985 0 0)",
              "--rdp-range_end-color": "oklch(0.985 0 0)",
              "--rdp-range_start-date-background-color": "oklch(0.205 0 0)",
              "--rdp-range_end-date-background-color": "oklch(0.205 0 0)",
              "--rdp-today-color": "oklch(0.205 0 0)",
              "--rdp-day-height": "36px",
              "--rdp-day-width": "36px",
              "--rdp-day_button-height": "34px",
              "--rdp-day_button-width": "34px",
              "--rdp-day_button-border-radius": "0.4rem",
              "--rdp-selected-border": "2px solid oklch(0.205 0 0)",
              "--rdp-outside-opacity": "0.35",
            } as React.CSSProperties}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
