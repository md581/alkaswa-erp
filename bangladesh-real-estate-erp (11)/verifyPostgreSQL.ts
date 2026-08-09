import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { dbPool, isPostgresActive, readJsonFile } from './dbClient.ts';

// Map of business collections to their JSON files and SQL tables/generic repository keys
export interface VerificationMapping {
  table: string;
  json_file: string;
  sql_tables: string[];
  generic_key: string | null;
}

export const VERIFICATION_MAPPINGS: VerificationMapping[] = [
  { table: 'users', json_file: 'usersDb.json', sql_tables: ['users'], generic_key: null },
  { table: 'profiles', json_file: 'profilesDb.json', sql_tables: ['founders', 'user_profiles'], generic_key: 'customer_portal_profiles' },
  { table: 'customers', json_file: 'salesCustomersDb.json', sql_tables: ['sales_customers', 'customers', 'bre_customers'], generic_key: 'bre_customers' },
  { table: 'bookings', json_file: 'salesBookingsDb.json', sql_tables: ['sales_bookings', 'bookings', 'bre_bookings'], generic_key: 'bre_bookings' },
  { table: 'payments', json_file: 'salesPaymentsDb.json', sql_tables: ['sales_payment_collections', 'payment_collections', 'money_receipts'], generic_key: 'erp_money_receipts' },
  { table: 'investors', json_file: 'investor_profiles.json', sql_tables: ['investors', 'investor_profiles'], generic_key: 'investor_profiles' },
  { table: 'landowners', json_file: 'phase4_land_owners.json', sql_tables: ['land_owners', 'phase4_land_owners'], generic_key: 'phase4_land_owners' },
  { table: 'projects', json_file: 'erp_projects.json', sql_tables: ['projects', 'erp_projects'], generic_key: 'erp_projects' },
  { table: 'audit_logs', json_file: 'auditLogsDb.json', sql_tables: ['audit_logs', 'erp_audit_logs', 'finance_audit_logs'], generic_key: 'erp_audit_logs' },
  { table: 'booking_units', json_file: 'bookingUnitsDb.json', sql_tables: ['booking_units', 'units'], generic_key: 'erp_project_units' },
  { table: 'leads', json_file: 'leadsDb.json', sql_tables: ['leads', 'crm_leads'], generic_key: 'crm_leads' },
  { table: 'journal_vouchers', json_file: 'journalVouchersDb.json', sql_tables: ['journal_vouchers'], generic_key: 'erp_vouchers' },
  { table: 'ledger_entries', json_file: 'ledgerEntriesDb.json', sql_tables: ['ledger_entries'], generic_key: null }
];

export interface VerificationResult {
  table: string;
  json_count: number;
  postgres_count: number;
  difference: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export interface PostgresAuditOutput {
  error?: string;
  connected: boolean;
  db_now: string | null;
  db_version: string | null;
  db_name: string | null;
  tables: VerificationResult[];
  totals: {
    total_tables: number;
    total_records: number;
    certification_status: 'CONNECTED' | 'DISCONNECTED' | 'PARTIAL' | 'VERIFIED';
    migration_match_percentage: number;
    last_verification_time: string;
  };
}

/**
 * Executes a SELECT COUNT(*) on potential SQL tables one by one.
 * Returns null if all queries fail.
 */
async function getSqlTableCount(client: any, tableNames: string[]): Promise<number | null> {
  for (const table of tableNames) {
    try {
      const res = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
      if (res && res.rows && res.rows[0]) {
        return parseInt(res.rows[0].count, 10);
      }
    } catch (_) {
      // Keep trying next table name
    }
  }
  return null;
}

/**
 * Queries key-value data inside generic_repositories if available.
 */
async function getGenericRepositoryCount(client: any, key: string): Promise<number | null> {
  try {
    const res = await client.query('SELECT data FROM generic_repositories WHERE key = $1', [key]);
    if (res && res.rows && res.rows[0]) {
      const dataVal = res.rows[0].data;
      if (typeof dataVal === 'string') {
        const parsed = JSON.parse(dataVal);
        return Array.isArray(parsed) ? parsed.length : 0;
      } else if (Array.isArray(dataVal)) {
        return dataVal.length;
      }
    }
  } catch (_) {
    // Fail silently to let standard checks run
  }
  return null;
}

/**
 * Runs PostgreSQL Verification & Certification Audit.
 * Saves results to /backups/postgresql_verification_report.json
 */
export async function runPostgreSQLVerificationAudit(): Promise<PostgresAuditOutput> {
  const output: PostgresAuditOutput = {
    connected: false,
    db_now: null,
    db_version: null,
    db_name: null,
    tables: [],
    totals: {
      total_tables: 0,
      total_records: 0,
      certification_status: 'DISCONNECTED',
      migration_match_percentage: 0,
      last_verification_time: new Date().toISOString()
    }
  };

  const isConnected = !!(isPostgresActive && dbPool);
  output.connected = isConnected;

  let client: any = null;
  let pgVersion: string | null = null;
  let pgName: string | null = null;
  let pgNow: string | null = null;

  if (isConnected) {
    try {
      client = await dbPool.connect();
      
      // Requirement 2: SELECT NOW(), SELECT version(), SELECT current_database()
      const nowRes = await client.query('SELECT NOW() as now');
      const versionRes = await client.query('SELECT version() as version');
      const dbRes = await client.query('SELECT current_database() as db');

      pgNow = nowRes?.rows?.[0]?.now || new Date().toISOString();
      pgVersion = versionRes?.rows?.[0]?.version || 'PostgreSQL 16 (Emulated)';
      pgName = dbRes?.rows?.[0]?.db || 'alkaswa_prod';

      output.db_now = pgNow;
      output.db_version = pgVersion;
      output.db_name = pgName;
    } catch (err: any) {
      console.error('⚠️ Failed to connect to PostgreSQL or execute metadata queries:', err.message);
      output.connected = false;
    }
  }

  let matchedTablesCount = 0;
  let partialTablesCount = 0;
  let failedTablesCount = 0;
  let totalJsonRecords = 0;
  let totalPostgresRecords = 0;

  for (const mapping of VERIFICATION_MAPPINGS) {
    const jsonCount = readJsonFile<any[]>(mapping.json_file, []).length;
    let postgresCount = 0;
    let querySuccessful = false;

    if (output.connected && client) {
      // 1. Try to query directly from the SQL tables
      const sqlCountResult = await getSqlTableCount(client, mapping.sql_tables);
      if (sqlCountResult !== null) {
        postgresCount = sqlCountResult;
        querySuccessful = true;
      }
      
      // 2. If SQL table check didn't succeed, try generic_repositories
      if (!querySuccessful && mapping.generic_key) {
        const genCountResult = await getGenericRepositoryCount(client, mapping.generic_key);
        if (genCountResult !== null) {
          postgresCount = genCountResult;
          querySuccessful = true;
        }
      }
    }

    // Compute difference and determine certification state
    const difference = Math.abs(jsonCount - postgresCount);
    let status: 'PASS' | 'WARNING' | 'FAIL' = 'FAIL';

    // Certification Rules:
    // PASS = exact match
    // WARNING = mismatch < 5
    // FAIL = mismatch >= 5
    if (difference === 0) {
      status = 'PASS';
      matchedTablesCount++;
    } else if (difference < 5) {
      status = 'WARNING';
      partialTablesCount++;
    } else {
      status = 'FAIL';
      failedTablesCount++;
    }

    totalJsonRecords += jsonCount;
    totalPostgresRecords += postgresCount;

    output.tables.push({
      table: mapping.table,
      json_count: jsonCount,
      postgres_count: postgresCount,
      difference,
      status
    });
  }

  if (client) {
    try {
      client.release();
    } catch (_) {}
  }

  // Calculate stats
  const totalTables = VERIFICATION_MAPPINGS.length;
  output.totals.total_tables = totalTables;
  output.totals.total_records = totalPostgresRecords;

  // Migration Match Percentage (Percentage of tables that have matched EXACTLY / PASS)
  const matchPercentage = totalTables > 0 ? Math.round((matchedTablesCount / totalTables) * 100) : 100;
  output.totals.migration_match_percentage = matchPercentage;

  // Determine Certification Status: Display CONNECTED, DISCONNECTED, PARTIAL, VERIFIED
  let certification_status: 'CONNECTED' | 'DISCONNECTED' | 'PARTIAL' | 'VERIFIED' = 'DISCONNECTED';
  if (output.connected) {
    if (matchPercentage === 100) {
      certification_status = 'VERIFIED';
    } else if (matchPercentage >= 50) {
      certification_status = 'CONNECTED';
    } else {
      certification_status = 'PARTIAL';
    }
  }

  output.totals.certification_status = certification_status;

  // Generate the backups directory if it doesn't exist
  const backupsDir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  // Write exact table objects into /backups/postgresql_verification_report.json
  // We save the main flat array of verification tables as required, or a structured report
  fs.writeFileSync(
    path.join(backupsDir, 'postgresql_verification_report.json'),
    JSON.stringify(output.tables, null, 2),
    'utf-8'
  );

  return output;
}
