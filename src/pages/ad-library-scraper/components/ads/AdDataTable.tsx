import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { CheckCircle2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import type { Ad } from '../../types/ad'


const columns: ColumnDef<Ad>[] = [
  {
    accessorKey: 'advertiser_name',
    header: '광고주',
    cell: ({ getValue }) => (
      <span className="font-medium">{(getValue() as string) || '-'}</span>
    ),
  },
  {
    id: 'variant_count',
    header: '대안 수',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.variants.length}개</span>
    ),
  },
  {
    id: 'landing_url',
    header: '랜딩 URL',
    cell: ({ row }) => {
      const hasUrl = row.original.variants.some(
        (v) => v.landing_page_url && v.landing_page_url.startsWith('http')
      )
      if (!hasUrl) return <span className="text-muted-foreground">-</span>
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </TooltipTrigger>
            <TooltipContent>랜딩 URL 있음</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: 'last_shown_date',
    header: '게시일',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground">
        {(getValue() as string | null) ?? '-'}
      </span>
    ),
  },
]

interface AdDataTableProps {
  ads: Ad[]
  onAdClick?: (ad: Ad) => void
}

export function AdDataTable({ ads, onAdClick }: AdDataTableProps) {
  const table = useReactTable({
    data: useMemo(() => ads, [ads]),
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-8 text-muted-foreground"
              >
                No ads collected yet
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => onAdClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
