import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import type { OrgDepartment, CreateDepartmentRequest } from '../../types';

interface AddDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDepartmentRequest) => Promise<OrgDepartment>;
  departments: OrgDepartment[];
  mode?: 'top' | 'sub'; // top: 최상위 부서, sub: 하위 부서
  parentDepartmentId?: string | null; // mode가 'sub'일 때 상위 부서 ID
}

export function AddDepartmentDialog({
  open,
  onOpenChange,
  onSubmit,
  departments,
  mode = 'top',
  parentDepartmentId,
}: AddDepartmentDialogProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('부서명을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        parent_id: mode === 'sub' ? parentDepartmentId ?? null : null,
        display_order: 0,
      });

      // 폼 초기화
      setName('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create department:', error);
      setError('부서 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 상위 부서 정보 가져오기 (mode가 'sub'일 때만)
  const getParentDepartmentName = () => {
    if (mode !== 'sub' || !parentDepartmentId) return '';

    const findDept = (depts: OrgDepartment[]): OrgDepartment | null => {
      for (const d of depts) {
        if (d.id === parentDepartmentId) return d;
        if (d.children) {
          const found = findDept(d.children);
          if (found) return found;
        }
      }
      return null;
    };

    const parentDept = findDept(departments);
    if (!parentDept) return '';

    // 계층 경로 생성
    const buildPath = (depts: OrgDepartment[], targetId: string, path: string = ''): string => {
      for (const d of depts) {
        const currentPath = path ? `${path} > ${d.name}` : d.name;
        if (d.id === targetId) return currentPath;
        if (d.children) {
          const found = buildPath(d.children, targetId, currentPath);
          if (found) return found;
        }
      }
      return '';
    };

    return buildPath(departments, parentDepartmentId);
  };

  const dialogTitle = mode === 'sub' ? '하위 부서 추가' : '최상위 부서 추가';
  const parentDeptName = getParentDepartmentName();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {mode === 'sub' && parentDeptName && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">상위 부서:</span> {parentDeptName}
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">
                부서명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="부서명을 입력하세요"
                required
                autoFocus
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '추가 중...' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
