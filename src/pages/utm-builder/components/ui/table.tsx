import * as React from "react"
import { cn } from "../../lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = React.useState(false)

  React.useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let scrollEl: HTMLElement | null = wrapper.parentElement
    while (scrollEl) {
      const { overflowY, overflow } = getComputedStyle(scrollEl)
      if (overflowY === 'auto' || overflowY === 'scroll' || overflow === 'auto' || overflow === 'scroll') break
      scrollEl = scrollEl.parentElement
    }
    if (!scrollEl) return

    const handleScroll = () => setStuck(scrollEl!.scrollTop > 0)
    scrollEl.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollEl!.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full" data-stuck={stuck}>
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm border-separate border-spacing-0", className)}
        {...props}
      />
    </div>
  )
})
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "sticky top-0 z-20 bg-card shadow-[inset_0_-1px_0_hsl(var(--border))]",
      "[[data-stuck=true]_&]:shadow-[inset_0_1px_0_hsl(var(--border)),inset_0_-1px_0_hsl(var(--border))]",
      className
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child>td]:border-b-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-11 px-8 text-left align-middle font-medium text-muted-foreground border-b [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-8 py-1.5 align-middle border-b [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
