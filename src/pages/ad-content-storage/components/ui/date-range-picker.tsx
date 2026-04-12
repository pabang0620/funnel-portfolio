import { useState } from "react"
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, parse, isValid, isSameDay, isBefore, isAfter } from "date-fns"
import { ko } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "../../lib/utils"

export type DateRange = {
  from: Date | undefined
  to?: Date | undefined
}
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Input } from "../ui/input"

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  className?: string
  minDate?: Date // 최소 선택 가능 날짜
  maxDate?: Date // 최대 선택 가능 날짜
}

type QuickSelect = {
  label: string
  getValue: () => DateRange
}

const quickSelects: QuickSelect[] = [
  {
    label: "오늘",
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "어제",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: "지난 7일",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "지난 30일",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "이번 주",
    getValue: () => ({
      from: startOfWeek(new Date(), { locale: ko }),
      to: endOfWeek(new Date(), { locale: ko }),
    }),
  },
  {
    label: "이번 달",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "지난 주",
    getValue: () => {
      const lastWeek = subWeeks(new Date(), 1)
      return {
        from: startOfWeek(lastWeek, { locale: ko }),
        to: endOfWeek(lastWeek, { locale: ko }),
      }
    },
  },
  {
    label: "지난 달",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1)
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      }
    },
  },
]

export function DateRangePicker({ value, onChange, className, minDate, maxDate }: DateRangePickerProps) {
  const [fromInput, setFromInput] = useState(value?.from ? format(value.from, "yyyy-MM-dd") : "")
  const [toInput, setToInput] = useState(value?.to ? format(value.to, "yyyy-MM-dd") : "")

  const handleQuickSelect = (quickSelect: QuickSelect) => {
    const range = quickSelect.getValue()
    // minDate 체크
    if (minDate && range.from && isBefore(startOfDay(range.from), startOfDay(minDate))) {
      return // 최소 날짜 이전이면 무시
    }
    // maxDate 체크
    if (maxDate && range.to && isAfter(startOfDay(range.to), startOfDay(maxDate))) {
      return // 최대 날짜 이후면 무시
    }
    onChange(range)
    if (range.from) setFromInput(format(range.from, "yyyy-MM-dd"))
    if (range.to) setToInput(format(range.to, "yyyy-MM-dd"))
  }

  const isQuickSelectActive = (quickSelect: QuickSelect): boolean => {
    if (!value?.from || !value?.to) return false
    const range = quickSelect.getValue()
    if (!range.from || !range.to) return false
    return isSameDay(value.from, range.from) && isSameDay(value.to, range.to)
  }

  const parseDate = (input: string): Date | undefined => {
    const formats = ["yyyy-MM-dd", "yyyy.MM.dd"]
    for (const formatStr of formats) {
      const parsed = parse(input, formatStr, new Date())
      if (isValid(parsed)) {
        return parsed
      }
    }
    return undefined
  }

  const handleFromInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setFromInput(input)
    const parsed = parseDate(input)
    if (parsed) {
      // minDate 체크
      if (minDate && isBefore(startOfDay(parsed), startOfDay(minDate))) {
        return // 최소 날짜 이전이면 무시
      }
      // maxDate 체크
      if (maxDate && isAfter(startOfDay(parsed), startOfDay(maxDate))) {
        return // 최대 날짜 이후면 무시
      }
      onChange({ from: startOfDay(parsed), to: value?.to })
    }
  }

  const handleToInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setToInput(input)
    const parsed = parseDate(input)
    if (parsed) {
      // minDate 체크
      if (minDate && isBefore(startOfDay(parsed), startOfDay(minDate))) {
        return // 최소 날짜 이전이면 무시
      }
      // maxDate 체크
      if (maxDate && isAfter(startOfDay(parsed), startOfDay(maxDate))) {
        return // 최대 날짜 이후면 무시
      }
      onChange({ from: value?.from, to: endOfDay(parsed) })
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-[240px] justify-start text-left font-normal", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "yyyy.MM.dd", { locale: ko })} - {format(value.to, "yyyy.MM.dd", { locale: ko })}
              </>
            ) : (
              format(value.from, "yyyy.MM.dd", { locale: ko })
            )
          ) : (
            <span>날짜 선택</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-row">
          <div className="flex flex-col p-3 gap-3">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium">직접 입력:</div>
              <div className="flex gap-2">
                <Input
                  placeholder="시작일 (YYYY-MM-DD)"
                  value={fromInput}
                  onChange={handleFromInputChange}
                  className="h-8 text-xs w-36"
                />
                <span className="flex items-center text-muted-foreground">-</span>
                <Input
                  placeholder="종료일 (YYYY-MM-DD)"
                  value={toInput}
                  onChange={handleToInputChange}
                  className="h-8 text-xs w-36"
                />
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={(range) => {
                onChange(range)
                if (range?.from) setFromInput(format(range.from, "yyyy-MM-dd"))
                if (range?.to) setToInput(format(range.to, "yyyy-MM-dd"))
              }}
              numberOfMonths={2}
              locale={ko}
              disabled={(date) => {
                if (minDate && isBefore(startOfDay(date), startOfDay(minDate))) return true
                if (maxDate && isAfter(startOfDay(date), startOfDay(maxDate))) return true
                return false
              }}
            />
          </div>
          <div className="flex flex-col border-l p-3 gap-1 w-36 max-h-[400px] overflow-y-auto">
            <div className="text-sm font-medium mb-2">빠른 선택</div>
            {quickSelects.map((qs) => {
              const range = qs.getValue()
              const isDisabled =
                (minDate && range.from && isBefore(startOfDay(range.from), startOfDay(minDate))) ||
                (maxDate && range.to && isAfter(startOfDay(range.to), startOfDay(maxDate)))

              return (
                <Button
                  key={qs.label}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start text-sm",
                    isQuickSelectActive(qs) && "bg-action-button text-action-button-foreground hover:bg-action-button/90"
                  )}
                  onClick={() => handleQuickSelect(qs)}
                  disabled={isDisabled}
                >
                  {qs.label}
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
