import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbPool } from './dbClient';

// ============================================================================
// RBAC TYPE DEFINITIONS
// ============================================================================

export interface Role {
  id: string; // FND, MD, GM, HRM, ACT, SLM, LAM, LGL, ENG, PRM, CST, LDO, INV
  nameEn: string;
  nameBn: string;
}

export interface Permission {
  code: string; // e.g., 'project:view', 'finance:approve'
  nameEn: string;
  nameBn: string;
  module: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionCode: string;
  canAccess: boolean;
}

export interface ServerAuditLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  companyId: string;
  branchId: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVAL' | 'PERMISSION_CHANGE' | 'BLOCKED_ATTEMPT';
  module: string;
  timestamp: string;
  ipAddress: string;
  detailsEn: string;
  detailsBn: string;
}

// ============================================================================
// DATABASE-DRIVEN SEED DATA
// ============================================================================

export const rolesDb: Role[] = [
  { id: 'FND', nameEn: 'Founder & Chairman', nameBn: 'প্রতিষ্ঠাতা ও চেয়ারম্যান' },
  { id: 'MD', nameEn: 'Managing Director', nameBn: 'ব্যবস্থাপনা পরিচালক' },
  { id: 'GM', nameEn: 'General Manager', nameBn: 'মহাব্যবস্থাপক' },
  { id: 'HRM', nameEn: 'HR Manager', nameBn: 'মানবসম্পদ ব্যবস্থাপক' },
  { id: 'ACT', nameEn: 'Accounts Manager', nameBn: 'হিসাবরক্ষণ ব্যবস্থাপক' },
  { id: 'SLM', nameEn: 'Sales Manager', nameBn: 'বিক্রয় ব্যবস্থাপক' },
  { id: 'LAM', nameEn: 'Land Acquisition Manager', nameBn: 'ভূমি অধিগ্রহণ ব্যবস্থাপক' },
  { id: 'LGL', nameEn: 'Legal Manager', nameBn: 'আইন কর্মকর্তা' },
  { id: 'ENG', nameEn: 'Engineering Manager', nameBn: 'প্রকৌশল ব্যবস্থাপক' },
  { id: 'PRM', nameEn: 'Procurement Manager', nameBn: 'ক্রয় ব্যবস্থাপক' },
  { id: 'CST', nameEn: 'Customer (Flat Buyer)', nameBn: 'গ্রাহক' },
  { id: 'LDO', nameEn: 'Land Owner (JV Partner)', nameBn: 'জমির মালিক' },
  { id: 'INV', nameEn: 'Strategic Investor', nameBn: 'বিনিয়োগকারী' }
];

export const permissionsDb: Permission[] = [
  { code: 'dashboard:view', nameEn: 'View Core Dashboard', nameBn: 'ড্যাশবোর্ড দর্শন', module: 'dashboard' },
  { code: 'dashboard:edit', nameEn: 'Edit Core Dashboard Configurations', nameBn: 'ড্যাশবোর্ড সম্পাদনা', module: 'dashboard' },
  
  { code: 'project:view', nameEn: 'View Projects & Units', nameBn: 'প্রকল্প ও ইউনিট দর্শন', module: 'projects' },
  { code: 'project:create', nameEn: 'Create Corporate Projects', nameBn: 'নতুন প্রকল্প তৈরি', module: 'projects' },
  { code: 'project:update', nameEn: 'Update Project Details', nameBn: 'প্রকল্প তথ্য আপডেট', module: 'projects' },
  { code: 'project:delete', nameEn: 'Delete or Archive Projects', nameBn: 'প্রকল্প মুছে ফেলা', module: 'projects' },
  
  { code: 'customer:view', nameEn: 'View Customers & Bookings', nameBn: 'গ্রাহক ও বুকিং দর্শন', module: 'sales' },
  { code: 'customer:create', nameEn: 'Register New Customers', nameBn: 'নতুন গ্রাহক নিবন্ধন', module: 'sales' },
  { code: 'customer:update', nameEn: 'Update Customer Information', nameBn: 'গ্রাহক তথ্য আপডেট', module: 'sales' },
  { code: 'customer:delete', nameEn: 'Archive Customer Records', nameBn: 'গ্রাহক রেকর্ড সংরক্ষণ', module: 'sales' },
  
  { code: 'sales:view', nameEn: 'View Sales Leads & Bookings', nameBn: 'বিক্রয় ও সিআরএম দর্শন', module: 'sales' },
  { code: 'sales:create', nameEn: 'Create Bookings & Invoices', nameBn: 'বুকিং ও চালান তৈরি', module: 'sales' },
  { code: 'sales:update', nameEn: 'Update Sales Agreements', nameBn: 'বিক্রয় চুক্তি আপডেট', module: 'sales' },
  
  { code: 'finance:view', nameEn: 'View Accounts, COA, & Ledgers', nameBn: 'হিসাবরক্ষণ ও লেজার দর্শন', module: 'payroll' },
  { code: 'finance:create', nameEn: 'Create Journal Vouchers', nameBn: 'ভাউচার তৈরি', module: 'payroll' },
  { code: 'finance:approve', nameEn: 'Approve Payments & Vouchers', nameBn: 'পেমেন্ট ও ভাউচার অনুমোদন', module: 'payroll' },
  
  { code: 'land:view', nameEn: 'View Sourced Land Bank & JVA', nameBn: 'ভূমি ব্যাংক ও জেভিএ দর্শন', module: 'land' },
  { code: 'land:create', nameEn: 'Acquire New Land Sourcing Records', nameBn: 'নতুন জমি অধিগ্রহণ', module: 'land' },
  { code: 'land:update', nameEn: 'Modify Land Sourcing & Deeds', nameBn: 'ভূমি রেকর্ড সংশোধন', module: 'land' },
  
  { code: 'legal:view', nameEn: 'View Legal Cases & Litigations', nameBn: 'আইনি মামলা ও দলিল দর্শন', module: 'legal' },
  { code: 'legal:update', nameEn: 'Update Court Filings & Deeds', nameBn: 'আইনি ফাইলিং আপডেট', module: 'legal' },
  
  { code: 'investor:view', nameEn: 'View Investor Capital Portfolios', nameBn: 'বিনিয়োগকারী পোর্টফোলিও দর্শন', module: 'investor' },
  { code: 'investor:update', nameEn: 'Update Investor Distributions', nameBn: 'বিনিয়োগকারী বন্টন আপডেট', module: 'investor' },
  
  { code: 'settings:view', nameEn: 'View ERP Access Control Settings', nameBn: 'ERP অ্যাক্সেস কন্ট্রোল দর্শন', module: 'accessControl' },
  { code: 'settings:update', nameEn: 'Modify Role-Permission Matrix', nameBn: 'অ্যাক্সেস কন্ট্রোল ম্যাট্রিক্স পরিবর্তন', module: 'accessControl' },
  
  { code: 'founder:full_access', nameEn: 'Founder High-Clearance Command', nameBn: 'প্রতিষ্ঠাতা ফুল অ্যাক্সেস', module: 'founder' }
];

export const rolePermissionsDb: RolePermission[] = [];

// Seed the initial Role Permissions Matrix based on security rules
const seedPermissions = () => {
  let idCounter = 1;
  const addMap = (roleId: string, permissionCode: string) => {
    rolePermissionsDb.push({
      id: `rp-srv-${idCounter++}`,
      roleId,
      permissionCode,
      canAccess: true
    });
  };

  // 1. Founder: full_access + all permissions
  addMap('FND', 'founder:full_access');
  permissionsDb.forEach(p => addMap('FND', p.code));

  // 2. Managing Director: All business modules except settings/system ownership and permanent project deletion
  permissionsDb.forEach(p => {
    if (p.code !== 'founder:full_access' && !p.code.startsWith('settings:') && p.code !== 'project:delete') {
      addMap('MD', p.code);
    }
  });

  // 3. General Manager: Almost everything, except settings, full access, finance approval, or project deletion
  permissionsDb.forEach(p => {
    if (p.code !== 'founder:full_access' && !p.code.startsWith('settings:') && p.code !== 'finance:approve' && p.code !== 'project:delete') {
      addMap('GM', p.code);
    }
  });

  // 4. Finance Manager (ACT): Finance Only
  addMap('ACT', 'dashboard:view');
  addMap('ACT', 'finance:view');
  addMap('ACT', 'finance:create');
  addMap('ACT', 'finance:approve');

  // 5. Sales Manager (SLM): Sales + Customers
  addMap('SLM', 'dashboard:view');
  addMap('SLM', 'customer:view');
  addMap('SLM', 'customer:create');
  addMap('SLM', 'customer:update');
  addMap('SLM', 'customer:delete');
  addMap('SLM', 'sales:view');
  addMap('SLM', 'sales:create');
  addMap('SLM', 'sales:update');

  // 6. Land Manager (LAM): Land + JVA + Mutation
  addMap('LAM', 'dashboard:view');
  addMap('LAM', 'land:view');
  addMap('LAM', 'land:create');
  addMap('LAM', 'land:update');
  addMap('LAM', 'legal:view');

  // 7. Legal Manager (LGL): Legal + Litigation
  addMap('LGL', 'dashboard:view');
  addMap('LGL', 'legal:view');
  addMap('LGL', 'legal:update');

  // 8. HR Manager (HRM): HR Only (Dashboard and limited access)
  addMap('HRM', 'dashboard:view');

  // 9. Customer (CST): Own records only (dashboard + customer view)
  addMap('CST', 'dashboard:view');
  addMap('CST', 'customer:view');

  // 10. Investor (INV): Own portfolio only (dashboard + investor view)
  addMap('INV', 'dashboard:view');
  addMap('INV', 'investor:view');

  // 11. Land Owner (LDO): Own land only (dashboard + land view)
  addMap('LDO', 'dashboard:view');
  addMap('LDO', 'land:view');

  // 12. Site Engineer (ENG): Engineering/Project tracking
  addMap('ENG', 'dashboard:view');
  addMap('ENG', 'project:view');
  addMap('ENG', 'project:create');
  addMap('ENG', 'project:update');

  // 13. Procurement Manager (PRM): Procurement and view projects
  addMap('PRM', 'dashboard:view');
  addMap('PRM', 'project:view');
};

seedPermissions();

// In-Memory Audit Logs
export const auditLogsDb: ServerAuditLog[] = [
  {
    id: 'log-srv-1',
    userId: 'u-fnd',
    userName: 'Md Nazrul Islam',
    role: 'FND',
    companyId: 'c1',
    branchId: 'b1',
    action: 'LOGIN',
    module: 'authentication',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ipAddress: '127.0.0.1',
    detailsEn: 'User Md Nazrul Islam successfully authenticated under clearance FND.',
    detailsBn: 'ব্যবহারকারী মোঃ নজরুল ইসলাম এফএনডি ক্লিয়ারেন্সের অধীনে সফলভাবে প্রমাণীকরণ সম্পন্ন করেছেন।'
  }
];

// ============================================================================
// SECURITY EVENT LOGGER ENGINE
// ============================================================================

export function logSecurityEvent(
  userId: string,
  userName: string,
  role: string,
  companyId: string,
  branchId: string,
  action: ServerAuditLog['action'],
  module: string,
  ipAddress: string,
  detailsEn: string,
  detailsBn: string
): ServerAuditLog {
  const newLog: ServerAuditLog = {
    id: `log-srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userName,
    role,
    companyId: companyId || 'c1',
    branchId: branchId || 'b1',
    action,
    module,
    timestamp: new Date().toISOString(),
    ipAddress: ipAddress || '127.0.0.1',
    detailsEn,
    detailsBn
  };

  auditLogsDb.unshift(newLog);

  if (dbPool) {
    dbPool.query(
      `INSERT INTO erp_audit_logs (id, user_id, user_name, role, company_id, branch_id, action, module, timestamp, ip_address, details_en, details_bn)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [newLog.id, newLog.userId, newLog.userName, newLog.role, newLog.companyId, newLog.branchId, newLog.action, newLog.module, newLog.timestamp, newLog.ipAddress, newLog.detailsEn, newLog.detailsBn]
    ).catch((err: any) => console.error("PostgreSQL logSecurityEvent error:", err));
  }

  return newLog;
}

import { getJwtSecret } from '../../startup/securityValidation.ts';

// ============================================================================
// SECURITY MIDDLEWARES
// ============================================================================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    fullName: string;
    companyId?: string;
    branchId?: string;
  };
}

// Token Verification Middleware
export function verifySessionToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Bearer token missing.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, getJwtSecret()) as any;
    
    // We attach user info to request - Removing trust of incoming x-company-id and x-branch-id headers completely.
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName || 'Enterprise Session User',
      companyId: payload.companyId || 'c1',
      branchId: payload.branchId || 'b1'
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session token has expired or is invalid.' });
  }
}

// Permission Gate Middleware
export function requirePermission(permissionCode: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { id: userId, fullName, role, companyId, branchId } = req.user;
    const ipAddress = (req.ip || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');

    // 1. Founder overrides everything
    if (role === 'FND') {
      return next();
    }

    // 2. Check if the role has this permission code mapped and active
    const hasPermission = rolePermissionsDb.some(
      rp => rp.roleId === role && rp.permissionCode === permissionCode && rp.canAccess
    );

    if (hasPermission) {
      return next();
    }

    // Blocked attempt security logging
    const permissionObj = permissionsDb.find(p => p.code === permissionCode);
    const permissionLabel = permissionObj ? permissionObj.nameEn : permissionCode;

    logSecurityEvent(
      userId,
      fullName,
      role,
      companyId || 'c1',
      branchId || 'b1',
      'BLOCKED_ATTEMPT',
      permissionObj?.module || 'system',
      ipAddress,
      `Blocked unauthorized access request to [${permissionLabel}] requiring permission code: [${permissionCode}]`,
      `অনুমতি কোড: [${permissionCode}] প্রয়োজনীয় [${permissionLabel}]-এ অননুমোদিত অ্যাক্সেস প্রচেষ্টা অবরুদ্ধ করা হয়েছে`
    );

    // Uniform 403 Access Denied Payload
    return res.status(403).json({
      error: 'Security clearance insufficient',
      code: '403_DENIED',
      requiredPermission: permissionCode,
      activeRole: role,
      requestedNode: req.originalUrl,
      timestamp: new Date().toISOString()
    });
  };
}

// Role Gate Middleware
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { id: userId, fullName, role, companyId, branchId } = req.user;
    const ipAddress = (req.ip || req.socket.remoteAddress || '127.0.0.1').replace('::ffff:', '');

    if (role === 'FND' || allowedRoles.includes(role)) {
      return next();
    }

    logSecurityEvent(
      userId,
      fullName,
      role,
      companyId || 'c1',
      branchId || 'b1',
      'BLOCKED_ATTEMPT',
      'system',
      ipAddress,
      `Blocked unauthorized access to endpoint requiring roles: [${allowedRoles.join(', ')}]`,
      `ভূমিকা প্রয়োজন: [${allowedRoles.join(', ')}] এন্ডপয়েন্টে অননুমোদিত অ্যাক্সেস অবরুদ্ধ করা হয়েছে`
    );

    return res.status(403).json({
      error: 'Access restricted to authorized roles.',
      code: '403_DENIED',
      allowedRoles,
      activeRole: role,
      timestamp: new Date().toISOString()
    });
  };
}

// ============================================================================
// MULTI-LEVEL TENANCY ACCESS SCOPE ENGINE (Company, Branch, Project)
// ============================================================================

export function checkResourceScope(
  userRole: string,
  userProfile: any,
  resource: { companyId?: string; branchId?: string; projectId?: string; ownerId?: string }
): boolean {
  // 1. Founder / MD / GM possess global tenant clearance
  if (['FND', 'MD', 'GM'].includes(userRole)) {
    return true;
  }

  // 2. Customers can only view their own records (ownerId matches or mapped)
  if (userRole === 'CST') {
    return resource.ownerId === userProfile.userId;
  }

  // 3. Investors can only view their own portfolio
  if (userRole === 'INV') {
    return resource.ownerId === userProfile.userId;
  }

  // 4. Land Owners can only view their own land records
  if (userRole === 'LDO') {
    return resource.ownerId === userProfile.userId;
  }

  // 5. Standard employee: must check company/branch alignment if specified
  if (resource.companyId && userProfile.companyId && resource.companyId !== userProfile.companyId) {
    return false;
  }

  if (resource.branchId && userProfile.branchId && resource.branchId !== userProfile.branchId) {
    return false;
  }

  return true;
}
