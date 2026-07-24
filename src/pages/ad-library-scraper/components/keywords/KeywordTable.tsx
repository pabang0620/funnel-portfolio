import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { Keyword } from '../../types/keyword'

interface KeywordTableProps {
  keywords: Keyword[]
  onEdit: (keyword: Keyword) => void
  onDelete: (id: string) => void
}

export function KeywordTable({ keywords, onEdit, onDelete }: KeywordTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR')
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>키워드</TableHead>
            <TableHead className="w-[100px]">플랫폼</TableHead>
            <TableHead className="w-[180px]">등록일</TableHead>
            <TableHead className="w-[140px] text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No keywords registered yet
              </TableCell>
            </TableRow>
          ) : (
            keywords.map((kw) => (
              <TableRow key={kw.id}>
                <TableCell className="font-medium">{kw.keyword}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    kw.sources === 'meta' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    kw.sources === 'both' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {kw.sources === 'meta' ? 'Meta' : kw.sources === 'both' ? '구글+메타' : 'Google'}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(kw.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(kw)}
                      title="수정"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(kw.id)}
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
