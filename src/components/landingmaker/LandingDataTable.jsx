/**
 * 랜딩 페이지 목록 테이블 컴포넌트
 * 랜딩 페이지 데이터를 테이블 형태로 표시하며 다음 기능들을 제공:
 * - 페이지네이션 (usePagination 훅 사용)
 * - 컬럼별 정렬 및 필터링
 * - 랜딩 페이지 수정, 삭제, 복사 기능
 * - 상태 표시 (활성/비활성)
 * - 도메인별 그룹화 표시
 */
import { useId, useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronsLeft,
  ChevronsRight,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  Trash2Icon,
  FilterIcon,
  CheckCircleIcon,
  XCircleIcon,
  Copy,
  Check
} from 'lucide-react'


import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { Badge } from '@/components/landingmaker/ui/badge'
import { Button } from '@/components/landingmaker/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/landingmaker/ui/dropdown-menu'
import { Label } from '@/components/landingmaker/ui/label'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/landingmaker/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/landingmaker/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/landingmaker/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/landingmaker/ui/tooltip'

import { usePagination } from '@/pages/landingmaker/hooks/use-pagination'

import { cn } from '@/lib/utils'

/**
 * Landing Data Table Component
 * @param {Object} props
 * @param {Array} props.data - Array of landing data
 * @param {Function} props.onDelete - Delete handler function
 * @param {Function} props.onStatusChange - Status change handler function
 */
const LandingDataTable = ({ data, onDelete, onStatusChange }) => {
  const navigate = useNavigate()
  const [columnFilters, setColumnFilters] = useState([])

  // Initialize showFilters from localStorage, default to true (open)
  const [showFilters, setShowFilters] = useState(() => {
    const saved = localStorage.getItem('landing-table-filters-visible')
    return saved !== null ? JSON.parse(saved) : true
  })


  // 정렬 state (기본값: 랜딩번호 내림차순)
  const [sorting, setSorting] = useState([
    {
      id: 'adNumber',
      desc: true // 내림차순 (높은 숫자 → 낮은 숫자)
    }
  ])

  // Save showFilters state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('landing-table-filters-visible', JSON.stringify(showFilters))
  }, [showFilters])

  const pageSize = 20

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize
  })

  // 미리보기 팝업창 열기 함수
  const handleOpenPreview = (adNumber) => {
    // 새 창으로 미리보기 페이지 열기
    const width = 1200
    const height = 800
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2

    window.open(
      `/portfolio/landingmaker/preview/${adNumber}`,
      `preview_${adNumber}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    )
  }

  // Define columns
  const columns = useMemo(() => [
    {
      header: '랜딩번호',
      accessorKey: 'adNumber',
      cell: ({ row }) => <AdNumberCell adNumber={row.getValue('adNumber')} />,
      filterFn: 'includesString',
      sortingFn: (rowA, rowB, columnId) => {
        // A를 제거하고 숫자로 변환하여 비교 (예: "A001" → 1, "A123" → 123)
        const numA = parseInt(rowA.getValue(columnId).replace('A', ''), 10)
        const numB = parseInt(rowB.getValue(columnId).replace('A', ''), 10)
        return numA - numB
      },
      enableSorting: true,
      size: 110
    },
    {
      header: '도메인',
      accessorKey: 'domain',
      cell: ({ row }) => {
        const domain = row.getValue('domain')
        const accountName = row.original.accountName
        return (
          <span className='text-muted-foreground'>
            {domain}{accountName ? ` (${accountName})` : ''}
          </span>
        )
      },
      size: 150
    },
    {
      header: '개인정보 수집 주체',
      accessorKey: 'privacyOwner',
      cell: ({ row }) => (
        <span className='text-muted-foreground'>{row.getValue('privacyOwner')}</span>
      ),
      size: 170
    },
    {
      header: '생성일',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span className='text-muted-foreground'>{row.getValue('createdAt')}</span>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true
        const { from, to } = filterValue
        const cellValue = row.getValue(columnId)

        // 날짜+시간 형식에서 날짜 부분만 추출 (예: "2025-01-24 14:30" -> "2025-01-24")
        const cellDate = cellValue ? cellValue.split(' ')[0] : ''

        if (!from && !to) return true
        if (from && !to) return cellDate >= from
        if (!from && to) return cellDate <= to
        return cellDate >= from && cellDate <= to
      },
      sortingFn: (rowA, rowB, columnId) => {
        // 날짜 문자열 비교 (예: "2025-01-24 14:30")
        const dateA = rowA.getValue(columnId) || ''
        const dateB = rowB.getValue(columnId) || ''
        return dateA.localeCompare(dateB)
      },
      enableSorting: true,
      size: 150
    },
    {
      header: '제작자',
      accessorKey: 'createdBy',
      cell: ({ row }) => (
        <span>{row.getValue('createdBy')}</span>
      ),
      size: 90
    },
    {
      header: '최종 수정일',
      accessorKey: 'lastModifiedAt',
      cell: ({ row }) => (
        <span className='text-muted-foreground'>{row.getValue('lastModifiedAt')}</span>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        // 날짜 문자열 비교 (예: "2025-01-24 14:30")
        const dateA = rowA.getValue(columnId) || ''
        const dateB = rowB.getValue(columnId) || ''
        return dateA.localeCompare(dateB)
      },
      enableSorting: true,
      size: 150
    },
    {
      header: '최종 수정자',
      accessorKey: 'modifiedBy',
      cell: ({ row }) => (
        <span>{row.getValue('modifiedBy')}</span>
      ),
      size: 90
    },
    {
      header: '상태',
      accessorKey: 'status',
      cell: () => null,
      filterFn: (row, columnId, filterValue) => {
        // 필터 값이 없으면 모두 표시
        if (filterValue === undefined || filterValue === null) return true

        const cellValue = row.getValue(columnId)
        // 숫자로 비교 (엄격한 동등성)
        return Number(cellValue) === Number(filterValue)
      },
      enableHiding: true,
      size: 0
    },
    {
      id: 'actions',
      header: () => '관리',
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <RowActions row={row} navigate={navigate} onDelete={onDelete} onStatusChange={onStatusChange} onPreview={handleOpenPreview} />
        </div>
      ),
      enableHiding: false,
      size: 80
    }
  ], [navigate, onDelete, handleOpenPreview])

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination,
      sorting
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination
  })

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: table.getState().pagination.pageIndex + 1,
    totalPages: table.getPageCount(),
    paginationItemsToDisplay: 10
  })

  return (
    <div className='w-full'>
      <div className='border-b'>
        <div className='p-6 pb-0'>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center justify-between text-base font-semibold transition-colors mb-4 w-full'
          >
            <div className='flex items-center gap-2'>
              <FilterIcon className='size-3.5 text-purple-600' />
              <span>필터</span>
            </div>
            {showFilters ? (
              <ChevronUpIcon className='size-4 shrink-0 transition-transform duration-200' />
            ) : (
              <ChevronDownIcon className='size-4 shrink-0 transition-transform duration-200' />
            )}
          </button>
        </div>

        {showFilters && (
          <div className='flex flex-col gap-4 px-6 pb-6'>
            {/* 첫 번째 줄: 도메인, 생성일 시작일, 종료일 */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              <Filter column={table.getColumn('domain')} />
              <Filter column={table.getColumn('createdAt')} filterType='dateRangeInline' filterLabel='시작일' />
              <Filter column={table.getColumn('createdAt')} filterType='dateRangeInlineEnd' filterLabel='종료일' />
            </div>
            {/* 두 번째 줄: 랜딩번호, 제작자, 상태 */}
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3'>
              <Filter column={table.getColumn('adNumber')} filterType='input' />
              <Filter column={table.getColumn('createdBy')} />
              <Filter column={table.getColumn('status')} />
            </div>

            {/* 도메인별 일괄수정 버튼 */}
            {table.getColumn('domain')?.getFilterValue() &&
             table.getColumn('domain').getFilterValue() !== 'all' && (
              <div className='flex justify-end pt-2'>
                <Button
                  onClick={() => {
                    const selectedDomain = table.getColumn('domain').getFilterValue()
                    navigate(`/portfolio/landingmaker/bulk-edit/${encodeURIComponent(selectedDomain)}`)
                  }}
                  className='bg-purple-600 hover:bg-purple-700 text-white'
                  size='sm'
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  도메인별 일괄수정
                </Button>
              </div>
            )}
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className='h-12 border-t bg-gray-50'>
                {headerGroup.headers.map(header => {
                  // status 컬럼은 렌더링하지 않음
                  if (header.column.id === 'status') return null

                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className='text-muted-foreground last:px-4 text-center bg-gray-50'
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              'flex h-full cursor-pointer items-center justify-center gap-2 select-none'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={e => {
                            if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault()
                              header.column.getToggleSortingHandler()?.(e)
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                          role={header.column.getCanSort() ? 'button' : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUpIcon className='shrink-0 opacity-60' size={16} aria-hidden='true' />,
                            desc: <ChevronDownIcon className='shrink-0 opacity-60' size={16} aria-hidden='true' />
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => {
                const isInactive = row.original.status === 2
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'hover:bg-gray-50',
                      isInactive && 'opacity-40 bg-gray-100/50'
                    )}
                  >
                    {row.getVisibleCells().map(cell => {
                      // status 컬럼은 렌더링하지 않음
                      if (cell.column.id === 'status') return null

                      return (
                        <TableCell key={cell.id} className='h-10 last:w-29 last:px-4 text-center p-0'>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between gap-3 px-6 py-4 max-sm:flex-col md:max-lg:flex-col'>
        <p className='text-muted-foreground text-sm whitespace-nowrap' aria-live='polite'>
          전체 <span>{table.getRowCount()}개</span> 중{' '}
          <span>
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} ~{' '}
            {Math.min(
              Math.max(
                table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                  table.getState().pagination.pageSize,
                0
              ),
              table.getRowCount()
            )}
          </span>{' '}
          표시
        </p>

        <div>
          <Pagination>
            <PaginationContent className='gap-2'>
              <PaginationItem>
                <Button
                  size='icon'
                  className='disabled:pointer-events-none disabled:opacity-50 border border-gray-300 text-gray-700 w-9 h-9'
                  variant='ghost'
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  aria-label='Go to first page'
                >
                  <ChevronsLeft size={14} aria-hidden='true' />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size='icon'
                  className='disabled:pointer-events-none disabled:opacity-50 border border-gray-300 text-gray-700 w-9 h-9'
                  variant='ghost'
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  aria-label='Go to previous page'
                >
                  <ChevronLeftIcon size={14} aria-hidden='true' />
                </Button>
              </PaginationItem>

              {showLeftEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {pages.map(page => {
                const isActive = page === table.getState().pagination.pageIndex + 1

                return (
                  <PaginationItem key={page}>
                    <Button
                      size='icon'
                      variant='ghost'
                      onClick={() => table.setPageIndex(page - 1)}
                      aria-current={isActive ? 'page' : undefined}
                      className={isActive ? 'bg-white border border-gray-300 w-9 h-9' : 'w-9 h-9'}
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                )
              })}

              {showRightEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <Button
                  size='icon'
                  className='disabled:pointer-events-none disabled:opacity-50 border border-gray-300 text-gray-700 w-9 h-9'
                  variant='ghost'
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  aria-label='Go to next page'
                >
                  <ChevronRightIcon size={14} aria-hidden='true' />
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  size='icon'
                  className='disabled:pointer-events-none disabled:opacity-50 border border-gray-300 text-gray-700 w-9 h-9'
                  variant='ghost'
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  aria-label='Go to last page'
                >
                  <ChevronsRight size={14} aria-hidden='true' />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

export default LandingDataTable

// Filter component
function Filter({ column, filterType = 'select', filterLabel }) {
  const id = useId()
  const columnFilterValue = column?.getFilterValue()
  const { filterVariant } = column?.columnDef?.meta ?? {}
  const columnHeader = typeof column?.columnDef?.header === 'string' ? column.columnDef.header : ''
  const displayLabel = filterLabel || columnHeader

  const sortedUniqueValues = useMemo(() => {
    if (!column || filterVariant === 'range') return []

    const values = Array.from(column.getFacetedUniqueValues().keys())

    const flattenedValues = values.reduce((acc, curr) => {
      if (Array.isArray(curr)) {
        return [...acc, ...curr]
      }

      return [...acc, curr]
    }, [])

    // 빈 문자열 제거 (Radix UI Select는 빈 문자열을 value로 허용하지 않음)
    return Array.from(new Set(flattenedValues))
      .filter(value => value !== '' && value !== null && value !== undefined)
      .sort()
  }, [column, filterVariant])

  // 상태 값 한글 변환
  const getStatusLabel = (value) => {
    const statusLabels = {
      1: '활성',
      2: '비활성'
    }
    return statusLabels[value] || value
  }

  // 상태 아이콘 및 색상 렌더링
  const renderStatusWithIcon = (value) => {
    if (value === 1) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircleIcon className="size-4" />
          <span>활성</span>
        </div>
      )
    } else if (value === 2) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <XCircleIcon className="size-4" />
          <span>비활성</span>
        </div>
      )
    }
    return value
  }

  if (!column) return null

  // Date Range Inline - 시작일
  if (filterType === 'dateRangeInline') {
    const dateValue = columnFilterValue || { from: '', to: '' }

    return (
      <div className='w-full space-y-2'>
        <Label htmlFor={`${id}-from`}>
          생성일 <span className='text-xs text-muted-foreground font-normal'>{displayLabel}</span>
        </Label>
        <input
          id={`${id}-from`}
          type='date'
          value={dateValue.from || ''}
          onChange={e => {
            column.setFilterValue({
              from: e.target.value || undefined,
              to: dateValue.to
            })
          }}
          placeholder='시작일'
          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>
    )
  }

  // Date Range Inline - 종료일
  if (filterType === 'dateRangeInlineEnd') {
    const dateValue = columnFilterValue || { from: '', to: '' }

    return (
      <div className='w-full space-y-2'>
        <Label htmlFor={`${id}-to`}>
          <span className='text-xs text-muted-foreground font-normal'>{displayLabel}</span>
        </Label>
        <input
          id={`${id}-to`}
          type='date'
          value={dateValue.to || ''}
          onChange={e => {
            column.setFilterValue({
              from: dateValue.from,
              to: e.target.value || undefined
            })
          }}
          placeholder='종료일'
          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>
    )
  }

  // Input 타입 필터 (랜딩번호)
  if (filterType === 'input') {
    return (
      <div className='w-full space-y-2'>
        <Label htmlFor={`${id}-input`}>{columnHeader}</Label>
        <input
          id={`${id}-input`}
          type='text'
          value={columnFilterValue?.toString() ?? ''}
          onChange={e => {
            column.setFilterValue(e.target.value || undefined)
          }}
          placeholder={`${columnHeader} 검색...`}
          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        />
      </div>
    )
  }

  // Select 타입 필터 (도메인, 개인정보 수집 주체, 제작자, 상태)
  const isStatusColumn = column?.id === 'status'

  // 현재 선택된 값 (상태는 숫자를 문자열로, 아니면 그대로)
  const currentValue = columnFilterValue !== undefined
    ? String(columnFilterValue)
    : 'all'

  return (
    <div className='w-full space-y-2'>
      <Label htmlFor={`${id}-select`}>{columnHeader}</Label>
      <Select
        value={currentValue}
        onValueChange={value => {
          if (value === 'all') {
            column.setFilterValue(undefined)
          } else {
            // 상태 컬럼은 숫자로 변환
            column.setFilterValue(isStatusColumn ? Number(value) : value)
          }
        }}
      >
        <SelectTrigger id={`${id}-select`} className='w-full'>
          <SelectValue>
            {currentValue === 'all'
              ? '전체'
              : isStatusColumn
                ? renderStatusWithIcon(Number(currentValue))
                : currentValue}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>전체</SelectItem>
          {sortedUniqueValues.map(value => (
            <SelectItem key={String(value)} value={String(value)}>
              {isStatusColumn ? renderStatusWithIcon(value) : String(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Row actions component
function RowActions({ row, navigate, onDelete, onStatusChange, onPreview }) {
  const currentStatus = row.original.status
  const isActive = currentStatus === 1

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='flex'>
          <Button size='icon' variant='ghost' className='rounded-full p-2' aria-label='More actions'>
            <EllipsisVerticalIcon className='size-4.5' aria-hidden='true' />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuGroup>
          {isActive && (
            <>
              <DropdownMenuItem
                onClick={() => {
                  if (onPreview) {
                    onPreview(row.original.adNumber)
                  }
                }}
              >
                <EyeIcon className='mr-2 size-4' />
                <span>미리보기</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (navigate) {
                    navigate(`/portfolio/landingmaker/create/template/${row.original.adNumber}`)
                  }
                }}
              >
                <PencilIcon className='mr-2 size-4' />
                <span>수정</span>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem
            onClick={() => {
              if (onStatusChange) {
                const newStatus = isActive ? 2 : 1
                onStatusChange(row.original.adNumber, newStatus)
              }
            }}
            className={isActive ? 'text-red-600 focus:text-red-600 focus:bg-red-50' : 'text-green-600 focus:text-green-600 focus:bg-green-50'}
          >
            {isActive ? (
              <>
                <XCircleIcon className='mr-2 size-4' />
                <span>비활성화</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className='mr-2 size-4' />
                <span>활성화</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// AdNumber Cell with Copy functionality
function AdNumberCell({ adNumber }) {
  const [showCopy, setShowCopy] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(adNumber)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('복사 실패:', err)
    }
  }

  return (
    <div
      className='relative flex items-center justify-center gap-2'
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
    >
      <span>{adNumber}</span>
      {showCopy && (
        <button
          onClick={handleCopy}
          className='text-gray-500 hover:text-gray-700 transition-colors'
        >
          {copied ? (
            <Check className='size-3.5 text-green-600' />
          ) : (
            <Copy className='size-3.5' />
          )}
        </button>
      )}
    </div>
  )
}
