import { useMemo, useCallback, memo } from 'react';
import { ChevronDown, ChevronRight, Users, Plus, Pencil } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../../components/ui/badge';
import type { OrgDepartment, OrgMember } from '../../types';

interface OrgDepartmentCardProps {
  department: OrgDepartment;
  members: OrgMember[];
  allMembers: OrgMember[];
  expanded: boolean;
  expandedChildren: Set<string>;
  onToggle: () => void;
  onToggleChild: (id: string) => void;
  onMemberEdit?: (member: OrgMember) => void;
  onDepartmentEdit?: (department: OrgDepartment) => void;
  onAddSubDepartment?: (parentId: string) => void;
}

const MemberCard = memo(function MemberCard({
  member,
  onEdit,
}: {
  member: OrgMember;
  onEdit?: (member: OrgMember) => void;
}) {
  return (
    <div
      data-member-id={member.id}
      onDoubleClick={(e) => { e.stopPropagation(); onEdit?.(member); }}
      className={cn(
        'flex items-center bg-white px-2 py-1.5 rounded text-xs cursor-default transition-all hover:bg-gray-50'
      )}
      title="더블클릭하여 수정"
    >
      <span className="font-medium truncate">{member.name}</span>
    </div>
  );
});

const ChildDepartmentRow = memo(function ChildDepartmentRow({
  child,
  isExpanded,
  onToggle,
  members,
  onMemberEdit,
  onDepartmentEdit,
  onAddSubDepartment,
}: {
  child: OrgDepartment;
  isExpanded: boolean;
  onToggle: () => void;
  members: OrgMember[];
  onMemberEdit?: (member: OrgMember) => void;
  onDepartmentEdit?: (department: OrgDepartment) => void;
  onAddSubDepartment?: (parentId: string) => void;
}) {
  return (
    <div
      data-dept-id={child.id}
      className="transition-colors"
    >
      <div className="w-full bg-gray-700 text-white px-2 py-1.5 flex items-center gap-1.5">
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 flex-1 hover:opacity-80 transition-opacity"
          type="button"
          title="펼치기/접기"
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <Users className="h-3 w-3" />
          <span className="text-xs font-semibold flex-1 truncate text-left">{child.name}</span>
        </button>
        <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-white/25 text-white">
          {child.members_count || 0}명
        </Badge>
        <button
          onClick={(e) => { e.stopPropagation(); onDepartmentEdit?.(child); }}
          className="hover:bg-gray-600 p-0.5 rounded transition-colors"
          type="button"
          title="하위 부서 수정"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAddSubDepartment?.(child.id); }}
          className="hover:bg-gray-600 p-0.5 rounded transition-colors"
          type="button"
          title="하위 부서 추가"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {isExpanded && (
        <div className="bg-gray-100 px-3 py-2 space-y-1 min-h-[40px] max-h-[200px] overflow-y-auto">
          {members.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-1">No members</div>
          ) : (
            members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onEdit={onMemberEdit}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
});

export const OrgDepartmentCard = memo(function OrgDepartmentCard({
  department,
  members,
  allMembers,
  expanded,
  expandedChildren,
  onToggle,
  onToggleChild,
  onMemberEdit,
  onDepartmentEdit,
  onAddSubDepartment,
}: OrgDepartmentCardProps) {
  const sortedMembers = useMemo(
    () =>
      members
        .filter((m) => m.employment_status === 1)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [members]
  );

  const getChildMembers = useCallback(
    (childId: string) =>
      allMembers
        .filter((m) => m.department_id === childId && m.employment_status === 1)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [allMembers]
  );

  return (
    <div
      data-dept-id={department.id}
      className="relative w-[200px] border rounded overflow-hidden bg-white flex flex-col"
    >
      {/* Department header */}
      <div className="bg-gray-900 text-white px-2 py-2 flex items-center gap-1.5">
        <button onClick={onToggle} type="button">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <span className="font-bold text-sm flex-1 truncate">{department.name}</span>
        <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-white/25 text-white">
          {department.members_count || 0}명
        </Badge>
        <button
          onClick={(e) => { e.stopPropagation(); onDepartmentEdit?.(department); }}
          className="hover:bg-gray-700 p-1 rounded transition-colors"
          type="button"
          title="부서 수정"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAddSubDepartment?.(department.id); }}
          className="hover:bg-gray-700 p-1 rounded transition-colors"
          type="button"
          title="하위 부서 추가"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Direct members */}
      {expanded && (
        <div className="bg-gray-50 p-2 space-y-1 min-h-[40px] max-h-[200px] overflow-y-auto">
          {sortedMembers.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-2">No members</div>
          ) : (
            sortedMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onEdit={onMemberEdit}
              />
            ))
          )}
        </div>
      )}

      {/* Child departments */}
      {department.children?.map((child) => (
        <ChildDepartmentRow
          key={child.id}
          child={child}
          isExpanded={expandedChildren.has(child.id)}
          onToggle={() => onToggleChild(child.id)}
          members={getChildMembers(child.id)}
          onMemberEdit={onMemberEdit}
          onDepartmentEdit={onDepartmentEdit}
          onAddSubDepartment={onAddSubDepartment}
        />
      ))}
    </div>
  );
});
