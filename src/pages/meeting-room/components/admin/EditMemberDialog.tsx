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
import type { OrgDepartment, OrgMember, UpdateMemberRequest, MoveMemberRequest } from '../../types';

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: UpdateMemberRequest) => Promise<OrgMember>;
  onDelete: (id: string) => Promise<void>;
  onMove: (id: string, data: MoveMemberRequest) => Promise<void>;
  member: OrgMember | null;
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

export function EditMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  onMove,
  member,
  departments,
}: EditMemberDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setEmail(member.email || '');
      setPosition(member.position || '');
      setDepartmentId(member.department_id);
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!member) return;

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!departmentId) {
      setError('소속부서를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(member.id, {
        name: name.trim(),
        email: email.trim() || undefined,
        position: position.trim() || undefined,
      });

      // 부서가 변경된 경우 이동
      if (departmentId !== member.department_id) {
        await onMove(member.id, {
          target_department_id: departmentId,
          display_order: 0,
        });
      }

      onOpenChange(false);
    } catch (err) {
      console.error('Failed to update member:', err);
      setError('구성원 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!member) return;
    setError(null);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!member) return;

    setIsDeleting(true);
    try {
      await onDelete(member.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete member:', error);
      setError('구성원 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const flatDepartments = flattenDepartmentsWithPath(departments);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>구성원 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-member-name">
                이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-member-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-email">이메일</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-position">직급</Label>
              <Input
                id="edit-position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="예: 과장, 대리, 사원"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-department">
                소속 부서 <span className="text-red-500">*</span>
              </Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger id="edit-department">
                  <SelectValue placeholder="부서를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {flatDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.displayPath}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                부서를 선택하거나 드래그앤드롭으로 이동할 수 있습니다
              </p>
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
          <AlertDialogTitle>구성원 삭제</AlertDialogTitle>
          <AlertDialogDescription>{member?.name} 구성원을 삭제하시겠습니까?</AlertDialogDescription>
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
