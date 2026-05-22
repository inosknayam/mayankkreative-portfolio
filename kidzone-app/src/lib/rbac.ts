import type { StaffSession } from "./auth";

export const PermissionLevel = {
  CARETAKER: 1,
  EVENT_LEAD: 2,
  BRANCH_MANAGER: 3,
} as const;

export type PermissionLevel = (typeof PermissionLevel)[keyof typeof PermissionLevel];

export function canManageStaff(session: StaffSession): boolean {
  return session.permission_level >= PermissionLevel.BRANCH_MANAGER;
}

export function canManageEvents(session: StaffSession): boolean {
  return session.permission_level >= PermissionLevel.EVENT_LEAD;
}

export function canCheckIn(session: StaffSession): boolean {
  return session.permission_level >= PermissionLevel.CARETAKER;
}

export function canVerifyCheckOut(session: StaffSession): boolean {
  return session.permission_level >= PermissionLevel.CARETAKER;
}

export function canViewReports(session: StaffSession): boolean {
  return session.permission_level >= PermissionLevel.EVENT_LEAD;
}

export function getRoleColor(roleName: string): string {
  const map: Record<string, string> = {
    "Branch Manager": "purple",
    "Event Lead":     "blue",
    "Caretaker":      "pink",
  };
  return map[roleName] ?? "yellow";
}
