import fs from "fs";
import path from "path";
import { dbPool } from "./dbClient.ts";

const BACKUP_DIR = path.join(process.cwd(), "backups");
const DATA_DIR = path.resolve(process.cwd(), "data");
const METADATA_FILE = path.join(BACKUP_DIR, "backup_metadata.json");

export interface BackupStatus {
  lastDaily: string | null;
  lastWeekly: string | null;
  lastMonthly: string | null;
  lastEmergency?: string | null;
  history: Array<{
    id: string;
    timestamp: string;
    interval: "daily" | "weekly" | "monthly" | "emergency";
    filesCount: number;
    sizeBytes: number;
    status: "success" | "failed";
    error?: string;
  }>;
}

// Ensure backup directories exist
export function initBackupDirectories() {
  const intervals = ["daily", "weekly", "monthly", "emergency"];
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  for (const interval of intervals) {
    const dir = path.join(BACKUP_DIR, interval);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  if (!fs.existsSync(METADATA_FILE)) {
    const initialMetadata: BackupStatus = {
      lastDaily: null,
      lastWeekly: null,
      lastMonthly: null,
      lastEmergency: null,
      history: []
    };
    fs.writeFileSync(METADATA_FILE, JSON.stringify(initialMetadata, null, 2), "utf-8");
  }
}

// Get current backup metadata
export function getBackupStatus(): BackupStatus {
  initBackupDirectories();
  try {
    if (fs.existsSync(METADATA_FILE)) {
      return JSON.parse(fs.readFileSync(METADATA_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Failed to read backup metadata:", err);
  }
  return { lastDaily: null, lastWeekly: null, lastMonthly: null, history: [] };
}

// Update backup metadata
function updateBackupMetadata(updater: (metadata: BackupStatus) => void) {
  const metadata = getBackupStatus();
  updater(metadata);
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write backup metadata:", err);
  }
}

// Recursively find all files under a directory
export function getFilesRecursively(dir: string, baseDir: string = dir): Array<{ relativePath: string; absolutePath: string }> {
  let results: Array<{ relativePath: string; absolutePath: string }> = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath, baseDir));
    } else if (file.endsWith(".json")) {
      const relativePath = path.relative(baseDir, filePath);
      results.push({ relativePath, absolutePath: filePath });
    }
  }
  return results;
}

// Helper to count records inside a JSON string
export function countRecordsInJson(content: string): number {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.length;
    }
    if (parsed && typeof parsed === "object") {
      let maxArrayLength = 0;
      let hasArray = false;
      for (const val of Object.values(parsed)) {
        if (Array.isArray(val)) {
          hasArray = true;
          if (val.length > maxArrayLength) {
            maxArrayLength = val.length;
          }
        }
      }
      if (hasArray) {
        return maxArrayLength;
      }
      return 1;
    }
  } catch (e) {
    // ignore parse errors
  }
  return 0;
}

// Export database records to a file
export async function performBackup(interval: "daily" | "weekly" | "monthly" | "emergency"): Promise<{
  success: boolean;
  timestamp: string;
  filesCount: number;
  sizeBytes: number;
  error?: string;
}> {
  initBackupDirectories();
  const timestamp = new Date().toISOString();
  const backupId = `backup_${interval}_${Date.now()}`;
  const targetDir = path.join(BACKUP_DIR, interval, backupId);

  try {
    fs.mkdirSync(targetDir, { recursive: true });
    let totalSize = 0;
    let filesCount = 0;

    // 1. PostgreSQL DB Pool backup (if active)
    if (dbPool) {
      const client = await dbPool.connect();
      try {
        // Automatically discover all table names inside the public schema
        const tablesCheck = await client.query(
          `SELECT table_name 
           FROM information_schema.tables 
           WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
        );
        const tables = tablesCheck.rows.map((r: any) => r.table_name);

        for (const table of tables) {
          try {
            const res = await client.query(`SELECT * FROM ${table}`);
            const dataStr = JSON.stringify(res.rows, null, 2);
            const filename = `${table}.json`;
            const filePath = path.join(targetDir, "postgres_tables", filename);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, dataStr, "utf-8");
            totalSize += dataStr.length;
            filesCount++;
          } catch (tableErr: any) {
            console.error(`Failed to backup table ${table} from PG:`, tableErr);
          }
        }
      } finally {
        client.release();
      }
    }

    // 2. JSON Fallback DB backup: Automatically discover and backup every JSON file inside data/ including nested folders
    const jsonFiles = getFilesRecursively(DATA_DIR, DATA_DIR);
    for (const fileInfo of jsonFiles) {
      try {
        const content = fs.readFileSync(fileInfo.absolutePath, "utf-8");
        const relativeDest = fileInfo.relativePath;
        const targetPath = path.join(targetDir, relativeDest);

        // Ensure subdirectories exist in target backup dir
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, content, "utf-8");

        totalSize += content.length;
        filesCount++;
      } catch (err: any) {
        console.error(`Failed to backup JSON file ${fileInfo.relativePath}:`, err.message);
      }
    }

    // Update metadata on success
    updateBackupMetadata((meta) => {
      if (interval === "daily") meta.lastDaily = timestamp;
      if (interval === "weekly") meta.lastWeekly = timestamp;
      if (interval === "monthly") meta.lastMonthly = timestamp;
      if (interval === "emergency") meta.lastEmergency = timestamp;
      meta.history.unshift({
        id: backupId,
        timestamp,
        interval,
        filesCount,
        sizeBytes: totalSize,
        status: "success"
      });
      // Cap history at 50 records
      if (meta.history.length > 50) {
        meta.history.pop();
      }
    });

    console.log(`[BACKUP ENGINE] ${interval} backup successfully completed. Saved ${filesCount} files.`);

    // PHASE 2 - Automatic Cloud Replication Hook
    try {
      const { replicateLocalBackupToCloud } = await import("./cloudBackupEngine.ts");
      await replicateLocalBackupToCloud(backupId, targetDir);
    } catch (repErr) {
      console.error("[BACKUP ENGINE] Failed to replicate backup to offsite cloud storage:", repErr);
    }

    return { success: true, timestamp, filesCount, sizeBytes: totalSize };
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    console.error(`[BACKUP ENGINE] ${interval} backup failed:`, err);

    updateBackupMetadata((meta) => {
      meta.history.unshift({
        id: backupId,
        timestamp,
        interval,
        filesCount: 0,
        sizeBytes: 0,
        status: "failed",
        error: errorMsg
      });
      if (meta.history.length > 50) {
        meta.history.pop();
      }
    });

    return { success: false, timestamp, filesCount: 0, sizeBytes: 0, error: errorMsg };
  }
}

// Restore a backup from source directory into target directory
export function restoreBackup(backupIdOrPath: string, targetRestoreDir: string): { success: boolean; filesCount: number; error?: string } {
  try {
    let backupDirToRestore = backupIdOrPath;
    if (!path.isAbsolute(backupIdOrPath)) {
      const intervals = ["daily", "weekly", "monthly", "emergency"];
      let found = false;
      for (const interval of intervals) {
        const testPath = path.join(BACKUP_DIR, interval, backupIdOrPath);
        if (fs.existsSync(testPath)) {
          backupDirToRestore = testPath;
          found = true;
          break;
        }
      }
      if (!found) {
        backupDirToRestore = path.resolve(BACKUP_DIR, backupIdOrPath);
      }
    }

    if (!fs.existsSync(backupDirToRestore)) {
      throw new Error(`Backup source path does not exist: ${backupDirToRestore}`);
    }

    if (fs.existsSync(targetRestoreDir)) {
      fs.rmSync(targetRestoreDir, { recursive: true, force: true });
    }
    fs.mkdirSync(targetRestoreDir, { recursive: true });

    const backupFiles = getFilesRecursively(backupDirToRestore, backupDirToRestore);
    let restoredCount = 0;

    for (const fileInfo of backupFiles) {
      // Exclude metadata configuration and PG folders from standard JSON data restores if present
      if (fileInfo.relativePath.startsWith("postgres_tables")) {
        continue;
      }
      const destPath = path.join(targetRestoreDir, fileInfo.relativePath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(fileInfo.absolutePath, destPath);
      restoredCount++;
    }

    return { success: true, filesCount: restoredCount };
  } catch (err: any) {
    return { success: false, filesCount: 0, error: err.message };
  }
}

// Backups scheduling manager
export function startBackupScheduler() {
  initBackupDirectories();

  // Run a quick backup on startup (within 1 second for instant availability)
  setTimeout(() => {
    console.log("[BACKUP ENGINE] Running automatic daily backup on startup verification...");
    performBackup("daily").catch(console.error);
  }, 1000);

  // Interval timers:
  // Daily: Every 24 hours
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    console.log("[BACKUP ENGINE] Running scheduled Daily Backup...");
    performBackup("daily").catch(console.error);

    // Also check if monthly backup is due (every 30 days) to avoid 32-bit setTimeout overflow
    try {
      const status = getBackupStatus();
      const now = Date.now();
      if (!status.lastMonthly || (now - new Date(status.lastMonthly).getTime() >= 30 * ONE_DAY_MS)) {
        console.log("[BACKUP ENGINE] Monthly backup interval reached. Running scheduled Monthly Backup...");
        performBackup("monthly").catch(console.error);
      }
    } catch (err) {
      console.error("[BACKUP ENGINE] Error checking monthly backup status:", err);
    }
  }, ONE_DAY_MS);

  // Weekly: Every 7 days
  const ONE_WEEK_MS = 7 * ONE_DAY_MS;
  setInterval(() => {
    console.log("[BACKUP ENGINE] Running scheduled Weekly Backup...");
    performBackup("weekly").catch(console.error);
  }, ONE_WEEK_MS);
}

// Run a complete Backup, Restore and Integrity Test Audit
export async function runFullDisasterRecoveryAudit(): Promise<any> {
  initBackupDirectories();

  const backupRes = await performBackup("daily");
  if (!backupRes.success) {
    throw new Error("Active backup failed: " + backupRes.error);
  }
  
  const history = getBackupStatus().history;
  const latestBackupId = history[0]?.id;
  if (!latestBackupId) {
    throw new Error("No backup history found after performing backup");
  }

  const latestBackupPath = path.join(BACKUP_DIR, "daily", latestBackupId);

  // Phase 1 Report: Active Users vs Backed Up Users
  const liveUsersPath = path.join(DATA_DIR, "usersDb.json");
  const backedUpUsersPath = path.join(latestBackupPath, "usersDb.json");

  let activeUsersCount = 0;
  let backedUpUsersCount = 0;

  if (fs.existsSync(liveUsersPath)) {
    activeUsersCount = JSON.parse(fs.readFileSync(liveUsersPath, "utf-8")).length;
  }
  if (fs.existsSync(backedUpUsersPath)) {
    backedUpUsersCount = JSON.parse(fs.readFileSync(backedUpUsersPath, "utf-8")).length;
  }

  const diffCount = activeUsersCount - backedUpUsersCount;
  const phase1Match = (diffCount === 0);

  // Phase 2 Report: Discovered & Protected files
  const discoveredFiles = getFilesRecursively(DATA_DIR, DATA_DIR);
  const totalFilesDiscovered = discoveredFiles.length;
  const totalFilesBackedUp = backupRes.filesCount;

  // Count records in backup
  let totalRecordsProtected = 0;
  const backedUpFiles = getFilesRecursively(latestBackupPath, latestBackupPath);
  for (const f of backedUpFiles) {
    try {
      const content = fs.readFileSync(f.absolutePath, "utf-8");
      totalRecordsProtected += countRecordsInJson(content);
    } catch (e) {}
  }

  // Phase 4 Restore Simulation
  const testRestoreDir = path.join(BACKUP_DIR, "test_restore_temp");
  const restoreRes = restoreBackup(latestBackupPath, testRestoreDir);
  if (!restoreRes.success) {
    throw new Error("Restore simulation failed: " + restoreRes.error);
  }

  // Compare file counts, record counts, and verify integrity
  const restoredFiles = getFilesRecursively(testRestoreDir, testRestoreDir);
  const restoreFileCount = restoredFiles.length;
  const fileCountsMatch = (totalFilesDiscovered === restoreFileCount);

  let restoreRecordCount = 0;
  let jsonIntegrityPassed = true;

  for (const f of restoredFiles) {
    try {
      const content = fs.readFileSync(f.absolutePath, "utf-8");
      JSON.parse(content); // Check JSON validity
      restoreRecordCount += countRecordsInJson(content);
    } catch (err) {
      jsonIntegrityPassed = false;
    }
  }

  const recordsMatch = (totalRecordsProtected === restoreRecordCount);
  const restoreValidationPassed = fileCountsMatch && recordsMatch && jsonIntegrityPassed;

  // Clean up test restore folder
  try {
    fs.rmSync(testRestoreDir, { recursive: true, force: true });
  } catch (err) {
    console.error("Failed to clean up test restore dir:", err);
  }

  return {
    phase1: {
      activeUsers: activeUsersCount,
      backedUpUsers: backedUpUsersCount,
      difference: diffCount,
      match: phase1Match,
      backupPath: latestBackupPath
    },
    phase2: {
      totalFilesDiscovered,
      totalFilesBackedUp,
      totalRecordsProtected
    },
    phase4: {
      restorePassed: restoreValidationPassed,
      fileCountsMatch,
      recordsMatch,
      jsonIntegrityPassed
    }
  };
}

/**
 * ====================================================
 *             FOUNDER RESTORE UTILITIES
 * ====================================================
 */

/**
 * Finds the latest verified cloud or local backup snapshot and restores it to the active /data directory.
 */
export async function restoreLatestBackup(): Promise<{ success: boolean; filesCount: number; backupId?: string; error?: string }> {
  try {
    const { readBackupManifest, downloadBackupFromGCS, decompressBackupSnapshot } = await import("./cloudBackupEngine.ts");
    const manifest = readBackupManifest();
    const latestVerified = manifest.find(m => m.verificationStatus === "VERIFIED");
    
    if (latestVerified) {
      console.log(`[RESTORE UTILITY] Restoring latest verified cloud backup: ${latestVerified.backupId}`);
      const downloadRes = await downloadBackupFromGCS(latestVerified.backupId);
      if (downloadRes.success && downloadRes.buffer) {
        const stats = decompressBackupSnapshot(downloadRes.buffer, DATA_DIR);
        return { success: true, filesCount: stats.fileCount, backupId: latestVerified.backupId };
      }
    }

    // Fallback to local backup history if no cloud backup is found
    const status = getBackupStatus();
    const latestLocal = status.history.find(h => h.status === "success");
    if (latestLocal) {
      console.log(`[RESTORE UTILITY] Restoring latest local backup: ${latestLocal.id}`);
      const restoreRes = restoreBackup(latestLocal.id, DATA_DIR);
      if (restoreRes.success) {
        return { success: true, filesCount: restoreRes.filesCount, backupId: latestLocal.id };
      }
      return { success: false, filesCount: 0, error: restoreRes.error };
    }

    return { success: false, filesCount: 0, error: "No healthy backups found to restore." };
  } catch (err: any) {
    return { success: false, filesCount: 0, error: err.message };
  }
}

/**
 * Restores a specific backup (cloud gzip archive or local snapshot folder) into the active /data directory.
 */
export async function restoreSpecificBackup(backupId: string): Promise<{ success: boolean; filesCount: number; error?: string }> {
  try {
    // Try cloud backup decompression first
    const { downloadBackupFromGCS, decompressBackupSnapshot } = await import("./cloudBackupEngine.ts");
    const downloadRes = await downloadBackupFromGCS(backupId);
    if (downloadRes.success && downloadRes.buffer) {
      console.log(`[RESTORE UTILITY] Restoring specific cloud backup: ${backupId}`);
      const stats = decompressBackupSnapshot(downloadRes.buffer, DATA_DIR);
      return { success: true, filesCount: stats.fileCount };
    }

    // Fallback to local backup directory copy
    console.log(`[RESTORE UTILITY] Restoring specific local backup: ${backupId}`);
    const restoreRes = restoreBackup(backupId, DATA_DIR);
    return restoreRes;
  } catch (err: any) {
    return { success: false, filesCount: 0, error: err.message };
  }
}

/**
 * Downloads or retrieves a backup archive and verifies that its computed SHA-256 checksum matches the expected value.
 */
export async function verifyBackupIntegrity(backupId: string, expectedChecksum?: string): Promise<boolean> {
  try {
    const { verifyBackupIntegrity: verifyCloudIntegrity, readBackupManifest } = await import("./cloudBackupEngine.ts");
    let checksum = expectedChecksum;
    if (!checksum) {
      const manifest = readBackupManifest();
      const entry = manifest.find(m => m.backupId === backupId);
      if (entry) {
        checksum = entry.checksum;
      }
    }
    if (!checksum) {
      console.warn(`[RESTORE UTILITY] No expected checksum provided or found in manifest for ${backupId}.`);
      return false;
    }
    return await verifyCloudIntegrity(backupId, checksum);
  } catch (err) {
    console.error(`[RESTORE UTILITY] Integrity verification failed for ${backupId}:`, err);
    return false;
  }
}
