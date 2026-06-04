import { DepartmentFeature, getDefaultFeaturesForDept, AccessLevel } from "./departmentRegistry";

export type DepartmentRole = "department_head" | "team_manager" | "team_member" | "unassigned_staff";

export type DataScope = "department_wide" | "own_team" | "self_only";

export interface ResolvedRoleContext {
  role: DepartmentRole;
  managerId?: string; // If team_member, who is their manager
  teamMemberIds?: string[]; // If team_manager or department_head, who are their members
}

/**
 * Resolves a user's role within a specific department based on its hierarchy arrays.
 * 
 * 1. Is their ID in department.headIds[]?           → DEPARTMENT_HEAD
 * 2. Is their ID a managers[].managerId?            → TEAM_MANAGER
 * 3. Is their ID in any managers[].memberIds[]?     → TEAM_MEMBER
 * 4. Is their department set but not in any array?  → UNASSIGNED_STAFF
 */
export function resolveDepartmentRole(
  department: any, // The Department mongoose document / object
  employeeId: string
): ResolvedRoleContext {
  if (!department || !employeeId) {
    return { role: "unassigned_staff" };
  }

  // 1. Check if Department Head
  if (department.headIds && department.headIds.includes(employeeId)) {
    // Heads see all managers' teams, so we aggregate all memberIds + managerIds
    const allMemberIds = department.managers 
      ? department.managers.flatMap((m: any) => [m.managerId, ...(m.memberIds || [])])
      : [];
    
    return {
      role: "department_head",
      teamMemberIds: allMemberIds,
    };
  }

  if (department.managers && Array.isArray(department.managers)) {
    // 2. Check if Team Manager
    const asManager = department.managers.find((m: any) => m.managerId === employeeId);
    if (asManager) {
      return {
        role: "team_manager",
        teamMemberIds: asManager.memberIds || [],
      };
    }

    // 3. Check if Team Member under a manager
    const underManager = department.managers.find((m: any) => 
      m.memberIds && m.memberIds.includes(employeeId)
    );
    if (underManager) {
      return {
        role: "team_member",
        managerId: underManager.managerId,
      };
    }
  }

  // 4. In department but not assigned to any team
  return { role: "unassigned_staff" };
}

/**
 * Returns the access level for a specific feature given a role.
 */
export function getFeatureAccessLevel(feature: DepartmentFeature, role: DepartmentRole): AccessLevel {
  if (!feature || !feature.access) return "none";
  
  // unassigned_staff shares the same access as team_member for now
  const normalizedRole = role === "unassigned_staff" ? "team_member" : role;
  
  return feature.access[normalizedRole] || "none";
}

/**
 * Returns only the features that the given role has access to (access !== "none").
 */
export function getVisibleFeatures(departmentSlug: string, role: DepartmentRole): DepartmentFeature[] {
  const allFeatures = getDefaultFeaturesForDept(departmentSlug);
  return allFeatures.filter(feature => {
    const access = getFeatureAccessLevel(feature, role);
    return access !== "none";
  });
}

/**
 * Returns the data scope constraint for a given role.
 * Useful for filtering records in queries.
 */
export function getDataScope(role: DepartmentRole): DataScope {
  switch (role) {
    case "department_head":
      return "department_wide";
    case "team_manager":
      return "own_team";
    case "team_member":
    case "unassigned_staff":
    default:
      return "self_only";
  }
}

/**
 * Get human-readable label for the role
 */
export function getRoleLabel(role: DepartmentRole): string {
  switch (role) {
    case "department_head": return "Department Head";
    case "team_manager": return "Team Manager";
    case "team_member": return "Team Member";
    case "unassigned_staff": return "Unassigned Staff";
    default: return "Unknown Role";
  }
}
