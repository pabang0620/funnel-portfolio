import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import type { OrgDepartment, UpdateDepartmentRequest } from '../../types';

interface EditDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: UpdateDepartmentRequest) => Promise<OrgDepartment>;
  onDelete: (id: string) => Promise<void>;
  department: OrgDepartment | null;
  departments: OrgDepartment[];
}

// 계층 구조를 평탄화하고 계층 경로를 포함하는 함수
function flattenDepartmentsWithPath(depts: OrgDepartment[], parentPath = ''): Array<OrgDepartment & { displayPath: string }> {
  const result: Array<OrgDepartment & { displayPath: string }> = [];

  const flatten = (dept: OrgDepartment, path: string) => {
    const displayPath = path ? `${path} > ${dept.name}` : dept.name;
    result.push({ ...dept, displayPath });

    if (dept.children) {
      dept.children.forEach(child => flatten(child, displayPath));
    }
  };

  depts.forEach(dept => flatten(dept, parentPath));
  return result;
}

export function EditDepartmentDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  department,
  departments,
}: EditDepartmentDialogProps) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (department) {
      setName(department.name);
      setParentId(department.parent_id || 'none');
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!department) return;

    if (!name.trim()) {
      setError('부서명을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(department.id, {
        name: name.trim(),
        parent_id: parentId === 'none' ? null : parentId,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update department:', error);
      setError('부서 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!department) return;
    setError(null);

    // 하위 부서가 있는지 확인
    if (department.children && department.children.length > 0) {
      setError('Cannot delete a department that has sub-departments. Please delete or move them first.');
      return;
    }

    // 구성원이 있는지 확인
    if (department.members_count && department.members_count > 0) {
      setError('Cannot delete a department that has members. Please move them to another department first.');
      return;
    }

    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!department) return;

    setIsDeleting(true);
    try {
      await onDelete(department.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete department:', error);
      setError('부서 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 현재 수정 중인 부서와 그 하위 부서들은 상위부서로 선택할 수 없음
  const getAvailableParents = () => {
    if (!department) return flattenDepartmentsWithPath(departments);

    const flatDepts = flattenDepartmentsWithPath(departments);
    const excludeIds = new Set<string>();

    // 현재 부서와 모든 하위 부서 ID 수집
    const collectDescendants = (dept: OrgDepartment) => {
      excludeIds.add(dept.id);
      if (dept.children) {
        dept.children.forEach(collectDescendants);
      }
    };

    // 원본 departments에서 현재 부서 찾기
    const findDept = (depts: OrgDepartment[], id: string): OrgDepartment | null => {
      for (const d of depts) {
        if (d.id === id) return d;
        if (d.children) {
          const found = findDept(d.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const currentDept = findDept(departments, department.id);
    if (currentDept) {
      collectDescendants(currentDept);
    }

    return flatDepts.filter(d => !excludeIds.has(d.id));
  };

  const availableParents = getAvailableParents();

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>부서 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                부서명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="부서명을 입력하세요"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-parent">상위 부서 변경</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="edit-parent">
                  <SelectValue placeholder="상위 부서 없음 (최상위)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">상위 부서 없음 (최상위)</SelectItem>
                  {availableParents.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.displayPath}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isDeleting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || isDeleting}>
              {isSubmitting ? '수정 중...' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>부서 삭제</AlertDialogTitle>
          <AlertDialogDescription>{department?.name} 부서를 삭제하시겠습니까?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
