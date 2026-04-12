import { useState, useCallback } from 'react';
import {
  mockFetchOrganization,
  mockFetchOrgMembers,
} from '@/data/meeting-room/mockService';
import type {
  OrgDepartment,
  OrgMember,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  CreateMemberRequest,
  UpdateMemberRequest,
  MoveMemberRequest,
} from '../types';

export function useOrganization() {
  const [departments, setDepartments] = useState<OrgDepartment[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrganization = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [depts, mems] = await Promise.all([
        mockFetchOrganization(),
        mockFetchOrgMembers(),
      ]);
      setDepartments(depts);
      setMembers(mems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization');
    } finally {
      setLoading(false);
    }
  }, []);

  // Demo stubs — in portfolio we just log these actions
  const createDepartment = async (data: CreateDepartmentRequest): Promise<OrgDepartment> => {
    console.log('[Demo] createDepartment', data);
    const newDept: OrgDepartment = {
      id: `dept-${Date.now()}`,
      name: data.name,
      parent_id: data.parent_id ?? null,
      display_order: data.display_order ?? 99,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setDepartments((prev) => [...prev, newDept]);
    return newDept;
  };

  const updateDepartment = async (id: string, data: UpdateDepartmentRequest): Promise<OrgDepartment> => {
    console.log('[Demo] updateDepartment', id, data);
    let updated!: OrgDepartment;
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.id === id) { updated = { ...d, ...data }; return updated; }
        return d;
      })
    );
    return updated;
  };

  const deleteDepartment = async (id: string): Promise<void> => {
    console.log('[Demo] deleteDepartment', id);
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  const reorderDepartments = async (_reordered: OrgDepartment[]): Promise<void> => {
    console.log('[Demo] reorderDepartments');
  };

  const createMember = async (data: CreateMemberRequest): Promise<OrgMember> => {
    console.log('[Demo] createMember', data);
    const newMember: OrgMember = {
      id: `member-${Date.now()}`,
      department_id: data.department_id,
      name: data.name,
      email: data.email,
      position: data.position,
      display_order: data.display_order ?? 99,
      employment_status: data.employment_status ?? 1,
      created_at: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  const updateMember = async (id: string, data: UpdateMemberRequest): Promise<OrgMember> => {
    console.log('[Demo] updateMember', id, data);
    let updated!: OrgMember;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) { updated = { ...m, ...data }; return updated; }
        return m;
      })
    );
    return updated;
  };

  const deleteMember = async (id: string): Promise<void> => {
    console.log('[Demo] deleteMember', id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const moveMember = async (id: string, data: MoveMemberRequest): Promise<void> => {
    console.log('[Demo] moveMember', id, data);
    let updated!: OrgMember;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          updated = { ...m, department_id: data.target_department_id, display_order: data.display_order };
          return updated;
        }
        return m;
      })
    );
  };

  return {
    departments,
    members,
    loading,
    error,
    refreshOrganization: loadOrganization,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    reorderDepartments,
    createMember,
    updateMember,
    deleteMember,
    moveMember,
  };
}
