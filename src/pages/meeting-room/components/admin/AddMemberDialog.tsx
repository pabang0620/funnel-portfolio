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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import type { OrgDepartment, OrgMember, CreateMemberRequest } from '../../types';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateMemberRequest) => Promise<OrgMember>;
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

export function AddMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  departments,
}: AddMemberDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      await onSubmit({
        name: name.trim(),
        email: email.trim() || undefined,
        position: position.trim() || undefined,
        department_id: departmentId,
        display_order: 0,
        employment_status: 1,
      });

      // 폼 초기화
      setName('');
      setEmail('');
      setPosition('');
      setDepartmentId('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create member:', error);
      setError('구성원 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const flatDepartments = flattenDepartmentsWithPath(departments);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>구성원 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="member-name">
                이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="member-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position">직급</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="예: 과장, 대리, 사원"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">
                소속 부서 <span className="text-red-500">*</span>
              </Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger id="department">
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
