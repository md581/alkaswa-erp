import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Parse local .env file manually if it exists during development
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const index = trimmed.indexOf('=');
        const key = trimmed.slice(0, index).trim();
        let val = trimmed.slice(index + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (err) {
  console.warn('⚠️  Security Alert: Failed to parse local .env file.', err);
}

// Development fallback key generator - cryptographically secure, persistent across dev session
let devJwtSecretFallback: string | null = null;
let devJwtRefreshSecretFallback: string | null = null;

export function getJwtSecret(): string {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable must be set in production mode!');
  }
  if (!devJwtSecretFallback) {
    devJwtSecretFallback = `dev_secret_${crypto.randomBytes(32).toString('hex')}`;
    console.warn('⚠️  DEV MODE: process.env.JWT_SECRET is missing. Generated cryptographically random development key.');
  }
  return devJwtSecretFallback;
}

export function getJwtRefreshSecret(): string {
  if (process.env.JWT_REFRESH_SECRET) {
    return process.env.JWT_REFRESH_SECRET;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL SECURITY ERROR: JWT_REFRESH_SECRET environment variable must be set in production mode!');
  }
  if (!devJwtRefreshSecretFallback) {
    devJwtRefreshSecretFallback = `dev_refresh_${crypto.randomBytes(32).toString('hex')}`;
    console.warn('⚠️  DEV MODE: process.env.JWT_REFRESH_SECRET is missing. Generated cryptographically random development refresh key.');
  }
  return devJwtRefreshSecretFallback;
}

/**
 * Validates that all required security environment variables are present and secure.
 * Refuses startup in production mode if required secrets are missing.
 */
export function validateStartupSecurity(): void {
  const nodeEnv = process.env.NODE_ENV;
  const dbUrl = process.env.DATABASE_URL;

  console.log('🔒 Running enterprise startup security validation...');

  const missing: string[] = [];

  if (!nodeEnv) {
    console.warn('⚠️  Security Warning: NODE_ENV is not defined. Defaulting to development.');
  }

  if (!dbUrl) {
    missing.push('DATABASE_URL');
  }

  if (nodeEnv === 'production') {
    if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
    if (!process.env.JWT_REFRESH_SECRET) missing.push('JWT_REFRESH_SECRET');

    if (missing.length > 0) {
      console.error('❌ CRITICAL SECURITY ERROR: Required secrets are missing in PRODUCTION environment!');
      console.error(`Missing variables: ${missing.join(', ')}`);
      console.error('Halting application startup immediately to protect system integrity.');
      process.exit(1);
    }

    const secret = process.env.JWT_SECRET || '';
    if (secret.includes('alkaswa-super-secret') || secret.includes('super-secret-key-change-in-production')) {
      console.error('❌ CRITICAL SECURITY ERROR: JWT_SECRET is set to a default insecure value in PRODUCTION!');
      process.exit(1);
    }
  } else {
    // In development mode, load/initialize dev secrets
    getJwtSecret();
    getJwtRefreshSecret();
    console.log('✅ Development startup security verification passed with cryptographically secure key management.');
  }
}

