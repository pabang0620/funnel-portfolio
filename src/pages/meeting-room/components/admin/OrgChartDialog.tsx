import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { toPng } from 'html-to-image';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Users, Search, X, Download } from 'lucide-react';
import { Loading } from '../../components/ui/loading';
import { OrgDepartmentCard } from './OrgDepartmentCard';
import { AddDepartmentDialog } from './AddDepartmentDialog';
import { AddMemberDialog } from './AddMemberDialog';
import { EditDepartmentDialog } from './EditDepartmentDialog';
import { EditMemberDialog } from './EditMemberDialog';
import { useOrganization } from '../../hooks/useOrganization';
import { getSlackMembers, fetchOrganizationChart } from '../../lib/api_stub';
import type { SlackMember } from '../../hooks/useSlackMembers';
import type { OrgDepartment, OrgMember } from '../../types';

function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">
      {children}
    </span>
  );
}

interface OrgChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrgChartDialog({ open, onOpenChange }: OrgChartDialogProps) {
  const {
    departments,
    members,
    loading,
    refreshOrganization,
    moveMember,
    createDepartment,
    createMember,
    updateDepartment,
    updateMember,
    deleteDepartment,
    deleteMember,
  } = useOrganization();

  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [addSubDepartmentParentId, setAddSubDepartmentParentId] = useState<string | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<OrgDepartment | null>(null);
  const [editingMember, setEditingMember] = useState<OrgMember | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const prevTopLevelIdsRef = useRef<Set<string>>(new Set());
  const chartRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const topLevelDepartments = useMemo(
    () => departments.filter((d) => !d.parent_id),
    [departments]
  );

  const filteredMembers = useMemo(() => {
    if (!submittedQuery.trim()) return members;
    const q = submittedQuery.trim().toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.position?.toLowerCase().includes(q)
    );
  }, [members, submittedQuery]);

  // Reload data whenever the dialog opens
  useEffect(() => {
    if (open) refreshOrganization();
  }, [open, refreshOrganization]);

  // Auto-expand newly added top-level departments
  useEffect(() => {
    const currentIds = new Set(topLevelDepartments.map((d) => d.id));
    const newIds = [...currentIds].filter((id) => !prevTopLevelIdsRef.current.has(id));
    if (newIds.length > 0) {
      setExpandedDepts((prev) => new Set([...prev, ...newIds]));
    }
    prevTopLevelIdsRef.current = currentIds;
  }, [topLevelDepartments]);

  // Expand all departments when searching
  useEffect(() => {
    if (!submittedQuery.trim()) return;
    const allIds = new Set<string>();
    const collect = (depts: OrgDepartment[]) => {
      depts.forEach((d) => {
        allIds.add(d.id);
        if (d.children) collect(d.children);
      });
    };
    collect(departments);
    setExpandedDepts(allIds);
  }, [submittedQuery, departments]);

  const handleToggleDept = useCallback((id: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const getMembersByDept = useCallback(
    (deptId: string) => filteredMembers.filter((m) => m.department_id === deptId),
    [filteredMembers]
  );

  const handleSaveImage = async () => {
    if (!chartRef.current) return;
    setIsSaving(true);
    try {
      const dataUrl = await toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `조직도_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to save image:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportSlackMembers = async () => {
    setImportMessage(null);
    setIsImporting(true);
    try {
      const slackMembers: SlackMember[] = await getSlackMembers();

      if (slackMembers.length === 0) {
        setImportMessage({ type: 'error', text: 'No Slack members to import.' });
        return;
      }

      const flatten = (depts: OrgDepartment[]): OrgDepartment[] => {
        const result: OrgDepartment[] = [];
        const walk = (d: OrgDepartment) => { result.push(d); d.children?.forEach(walk); };
        depts.forEach(walk);
        return result;
      };

      const latestDepts = await fetchOrganizationChart();
      const allDepts = flatten(latestDepts);
      let etcDept = allDepts.find((d) => d.name === '기타');

      if (!etcDept) {
        etcDept = await createDepartment({ name: '기타', parent_id: null, display_order: 0 });
      }

      let importedCount = 0;
      for (const slackMember of slackMembers) {
        if (members.find((m) => m.email === slackMember.email)) continue;
        try {
          await createMember({
            department_id: etcDept.id,
            name: slackMember.real_name || slackMember.name,
            email: slackMember.email,
            position: '',
            display_order: 0,
            employment_status: 1,
          });
          importedCount++;
        } catch {
          // skip failed imports
        }
      }

      setImportMessage({ type: 'success', text: `${importedCount}명의 Slack 멤버를 "기타" 부서에 추가했습니다.` });
    } catch {
      setImportMessage({ type: 'error', text: 'Slack 멤버 가져오기에 실패했습니다.' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-[1600px] h-[85vh] flex flex-col">
          <VisuallyHidden>
            <DialogTitle>조직도</DialogTitle>
            <DialogDescription>회사 조직 구조 및 구성원 관리</DialogDescription>
          </VisuallyHidden>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loading size="lg" text="조직도를 불러오는 중..." />
            </div>
          ) : (
            <div className="flex-1 overflow-auto pt-4">
              {/* Search */}
              <div className="px-4 pb-3">
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="구성원 검색 (이름, 이메일, 직급) - Enter"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSubmittedQuery(searchQuery); }}
                    className="pl-8 h-8 text-sm pr-8"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setSubmittedQuery(''); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {submittedQuery && (
                  <p className="text-xs text-muted-foreground mt-1">
                    "{submittedQuery}" 검색 결과: {filteredMembers.length}명
                  </p>
                )}
              </div>

              <div ref={chartRef} className="flex flex-row gap-4 flex-wrap p-4 items-start">
                {topLevelDepartments.map((dept) => (
                  <OrgDepartmentCard
                    key={dept.id}
                    department={dept}
                    members={getMembersByDept(dept.id)}
                    allMembers={filteredMembers}
                    expanded={expandedDepts.has(dept.id)}
                    expandedChildren={expandedDepts}
                    onToggle={() => handleToggleDept(dept.id)}
                    onToggleChild={handleToggleDept}
                    onMemberEdit={setEditingMember}
                    onDepartmentEdit={setEditingDepartment}
                    onAddSubDepartment={setAddSubDepartmentParentId}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t pt-3">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsDepartmentDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                최상위 부서 추가
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsMemberDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                구성원 추가
              </Button>
              <Button variant="outline" size="sm" onClick={handleImportSlackMembers} disabled={isImporting}>
                <Users className="h-4 w-4 mr-2" />
                {isImporting ? 'Slack 멤버 가져오는 중...' : 'Slack 멤버 가져오기'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSaveImage} disabled={isSaving}>
                <Download className="h-4 w-4 mr-2" />
                {isSaving ? '저장 중...' : '이미지 저장'}
              </Button>
            </div>
            {importMessage && (
              <p className={`text-sm ${importMessage.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                {importMessage.text}
              </p>
            )}
          </div>
        </DialogContent>

        <AddDepartmentDialog
          open={isDepartmentDialogOpen}
          onOpenChange={setIsDepartmentDialogOpen}
          onSubmit={createDepartment}
          departments={departments}
          mode="top"
        />

        <AddDepartmentDialog
          open={!!addSubDepartmentParentId}
          onOpenChange={(open) => !open && setAddSubDepartmentParentId(null)}
          onSubmit={createDepartment}
          departments={departments}
          mode="sub"
          parentDepartmentId={addSubDepartmentParentId}
        />

        <AddMemberDialog
          open={isMemberDialogOpen}
          onOpenChange={setIsMemberDialogOpen}
          onSubmit={createMember}
          departments={departments}
        />

        <EditDepartmentDialog
          open={!!editingDepartment}
          onOpenChange={(open) => !open && setEditingDepartment(null)}
          onSubmit={updateDepartment}
          onDelete={deleteDepartment}
          department={editingDepartment}
          departments={departments}
        />

        <EditMemberDialog
          open={!!editingMember}
          onOpenChange={(open) => !open && setEditingMember(null)}
          onSubmit={updateMember}
          onDelete={deleteMember}
          onMove={moveMember}
          member={editingMember}
          departments={departments}
        />
      </Dialog>
    </>
  );
}
