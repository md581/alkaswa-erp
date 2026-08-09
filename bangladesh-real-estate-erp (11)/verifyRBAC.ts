import fs from "fs";
import path from "path";
import { rolesDb, permissionsDb, rolePermissionsDb } from "./src/server/rbacEngine.ts";

const BACKUPS_ROOT = path.join(process.cwd(), "backups");
const REPORT_FILE = path.join(BACKUPS_ROOT, "rbac_audit_report.json");

export interface RBACIssue {
  role: string;
  permission?: string;
  module?: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface RBACAuditReport {
  roles_verified: string[];
  permission_conflicts: RBACIssue[];
  unauthorized_access: RBACIssue[];
  security_score: number;
  status: "PASS" | "WARNING" | "FAIL";
  certificationStatus: "VERIFIED" | "WARNING" | "FAIL";
  metrics: {
    rolesVerifiedCount: number;
    permissionConflictCount: number;
    unauthorizedAccessCount: number;
  };
  lastVerificationTime: string;
}

// Ensure backups directory exists
function ensureDirectories() {
  if (!fs.existsSync(BACKUPS_ROOT)) {
    fs.mkdirSync(BACKUPS_ROOT, { recursive: true });
  }
}

export async function runRBACSecurityAudit(): Promise<RBACAuditReport> {
  ensureDirectories();

  const permission_conflicts: RBACIssue[] = [];
  const unauthorized_access: RBACIssue[] = [];

  // Define the 12 target roles for verification
  const targetRoles = [
    { id: "FND", name: "Founder & Chairman" },
    { id: "MD", name: "Managing Director" },
    { id: "GM", name: "General Manager" },
    { id: "HRM", name: "HR Manager" },
    { id: "ACT", name: "Accounts Manager" },
    { id: "SLM", name: "Sales Manager" },
    { id: "ENG", name: "Engineering Manager" },
    { id: "LGL", name: "Legal Manager" },
    { id: "LAM", name: "Land Acquisition Manager" },
    { id: "INV", name: "Strategic Investor" },
    { id: "LDO", name: "Land Owner" },
    { id: "CST", name: "Customer" }
  ];

  const rolesVerified = targetRoles.map(r => r.name);

  // Helper to get all permissions assigned to a role
  const getRolePermissions = (roleId: string) => {
    return rolePermissionsDb
      .filter(rp => rp.roleId === roleId && rp.canAccess)
      .map(rp => rp.permissionCode);
  };

  // --------------------------------------------------------------------------
  // Rule 4: Founder Override Verification
  // --------------------------------------------------------------------------
  const founderPerms = getRolePermissions("FND");
  const allDefinedPerms = permissionsDb.map(p => p.code);
  const missingFounderPerms = allDefinedPerms.filter(code => !founderPerms.includes(code));

  if (missingFounderPerms.length > 0) {
    permission_conflicts.push({
      role: "Founder & Chairman",
      message: `Founder role lacks complete access. Missing permissions: ${missingFounderPerms.join(", ")}`,
      severity: "HIGH"
    });
  }

  // --------------------------------------------------------------------------
  // Rule 1 & 3: Module Access & High-Risk Security Checks
  // --------------------------------------------------------------------------
  targetRoles.forEach(role => {
    const assignedPerms = getRolePermissions(role.id);

    // Get the permission objects to find their modules
    const assignedPermObjs = permissionsDb.filter(p => assignedPerms.includes(p.code));

    // High-Risk Settings Access check (founder-only settings access)
    if (role.id !== "FND") {
      const hasFounderAccess = assignedPerms.includes("founder:full_access");
      const hasSettingsAccess = assignedPerms.some(code => code.startsWith("settings:"));

      if (hasFounderAccess) {
        unauthorized_access.push({
          role: role.name,
          permission: "founder:full_access",
          message: `Unauthorized settings access: Non-founder role has 'founder:full_access' clearance.`,
          severity: "HIGH"
        });
      }
      if (hasSettingsAccess) {
        unauthorized_access.push({
          role: role.name,
          permission: "settings",
          message: `Unauthorized settings access: Non-founder role has access to system settings.`,
          severity: "HIGH"
        });
      }
    }

    // High-Risk Financial Access Check
    // Only FND, MD, GM, ACT can access finance permissions
    const allowedFinancialRoles = ["FND", "MD", "GM", "ACT"];
    const financePerms = assignedPerms.filter(code => code.startsWith("finance:"));
    if (financePerms.length > 0 && !allowedFinancialRoles.includes(role.id)) {
      unauthorized_access.push({
        role: role.name,
        message: `Unauthorized financial access: Role has access to financial permissions [${financePerms.join(", ")}].`,
        severity: "HIGH"
      });
    }

    // High-Risk Legal Access Check
    // Only FND, MD, GM, LGL, LAM can access legal permissions (LAM has legal:view only)
    const allowedLegalRoles = ["FND", "MD", "GM", "LGL", "LAM"];
    const legalPerms = assignedPerms.filter(code => code.startsWith("legal:"));
    if (legalPerms.length > 0 && !allowedLegalRoles.includes(role.id)) {
      unauthorized_access.push({
        role: role.name,
        message: `Unauthorized legal access: Role has access to legal permissions [${legalPerms.join(", ")}].`,
        severity: "MEDIUM"
      });
    }

    // High-Risk Project Deletion Check
    // Only Founder (FND) is allowed to delete projects permanently
    if (assignedPerms.includes("project:delete") && role.id !== "FND") {
      permission_conflicts.push({
        role: role.name,
        permission: "project:delete",
        message: `High-risk project action: Non-founder role '${role.name}' has project delete permission. Only Founder role can permanently delete projects.`,
        severity: "MEDIUM"
      });
    }

    // High-Risk Customer Deletion Check
    // Only FND, MD, GM, SLM should have customer:delete (Sales Manager is allowed but let's check other roles)
    if (assignedPerms.includes("customer:delete") && !["FND", "MD", "GM", "SLM"].includes(role.id)) {
      permission_conflicts.push({
        role: role.name,
        permission: "customer:delete",
        message: `High-risk customer action: Role has customer delete permission.`,
        severity: "MEDIUM"
      });
    }

    // Module validation rules for specific external roles
    if (role.id === "CST") {
      // Customer can only access dashboard & sales/customer module
      const invalidPerms = assignedPermObjs.filter(p => !["dashboard", "sales"].includes(p.module));
      if (invalidPerms.length > 0) {
        unauthorized_access.push({
          role: role.name,
          message: `Customer role has unauthorized module access to: [${invalidPerms.map(p => p.module).join(", ")}].`,
          severity: "MEDIUM"
        });
      }
    }

    if (role.id === "INV") {
      // Investor can only access dashboard & investor module
      const invalidPerms = assignedPermObjs.filter(p => !["dashboard", "investor"].includes(p.module));
      if (invalidPerms.length > 0) {
        unauthorized_access.push({
          role: role.name,
          message: `Investor role has unauthorized module access to: [${invalidPerms.map(p => p.module).join(", ")}].`,
          severity: "MEDIUM"
        });
      }
    }

    if (role.id === "LDO") {
      // Landowner can only access dashboard & land module
      const invalidPerms = assignedPermObjs.filter(p => !["dashboard", "land"].includes(p.module));
      if (invalidPerms.length > 0) {
        unauthorized_access.push({
          role: role.name,
          message: `Landowner role has unauthorized module access to: [${invalidPerms.map(p => p.module).join(", ")}].`,
          severity: "MEDIUM"
        });
      }
    }
  });

  // --------------------------------------------------------------------------
  // Rule 2: Permission Matrix Validation (VIEW, CREATE, EDIT, DELETE, EXPORT, APPROVE)
  // --------------------------------------------------------------------------
  // Check for any general permission conflicts, for example:
  // If a role has "DELETE" or "APPROVE" permissions but lacks "VIEW" permission for that module.
  targetRoles.forEach(role => {
    const perms = getRolePermissions(role.id);

    const checkViewDependency = (actionCode: string, viewCode: string) => {
      if (perms.includes(actionCode) && !perms.includes(viewCode)) {
        permission_conflicts.push({
          role: role.name,
          permission: actionCode,
          message: `Permission dependency violation: Role has action permission '${actionCode}' but lacks view permission '${viewCode}'.`,
          severity: "LOW"
        });
      }
    };

    checkViewDependency("project:create", "project:view");
    checkViewDependency("project:update", "project:view");
    checkViewDependency("project:delete", "project:view");
    
    checkViewDependency("customer:create", "customer:view");
    checkViewDependency("customer:update", "customer:view");
    checkViewDependency("customer:delete", "customer:view");

    checkViewDependency("sales:create", "sales:view");
    checkViewDependency("sales:update", "sales:view");

    checkViewDependency("finance:create", "finance:view");
    checkViewDependency("finance:approve", "finance:view");

    checkViewDependency("land:create", "land:view");
    checkViewDependency("land:update", "land:view");

    checkViewDependency("legal:update", "legal:view");
    checkViewDependency("investor:update", "investor:view");
  });

  // --------------------------------------------------------------------------
  // Certification & Score Computation
  // --------------------------------------------------------------------------
  const totalConflicts = permission_conflicts.length + unauthorized_access.length;

  // Rule 8: Certification Rules
  // VERIFIED = 0 conflicts
  // WARNING = 1-4 conflicts
  // FAIL = 5+ conflicts
  let certificationStatus: "VERIFIED" | "WARNING" | "FAIL" = "FAIL";
  let status: "PASS" | "WARNING" | "FAIL" = "FAIL";

  if (totalConflicts === 0) {
    certificationStatus = "VERIFIED";
    status = "PASS";
  } else if (totalConflicts < 5) {
    certificationStatus = "WARNING";
    status = "PASS"; // Return status as "PASS" or "WARNING" based on setup, let's keep status "PASS" for warnings as requested
  } else {
    certificationStatus = "FAIL";
    status = "FAIL";
  }

  // Calculate Security Score (starts at 100, drops by severity)
  let baseScore = 100;
  permission_conflicts.forEach(c => {
    if (c.severity === "HIGH") baseScore -= 10;
    else if (c.severity === "MEDIUM") baseScore -= 5;
    else baseScore -= 2;
  });
  unauthorized_access.forEach(u => {
    if (u.severity === "HIGH") baseScore -= 15;
    else if (u.severity === "MEDIUM") baseScore -= 8;
    else baseScore -= 3;
  });
  const security_score = Math.max(0, Math.min(100, baseScore));

  const report: RBACAuditReport = {
    roles_verified: rolesVerified,
    permission_conflicts,
    unauthorized_access,
    security_score,
    status: totalConflicts >= 5 ? "FAIL" : "PASS",
    certificationStatus,
    metrics: {
      rolesVerifiedCount: targetRoles.length,
      permissionConflictCount: permission_conflicts.length,
      unauthorizedAccessCount: unauthorized_access.length
    },
    lastVerificationTime: new Date().toISOString()
  };

  // Save the security report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), "utf-8");

  return report;
}
