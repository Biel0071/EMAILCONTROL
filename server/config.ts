import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const DATA_DIR = process.env.USER_DATA_PATH 
  ? path.resolve(process.env.USER_DATA_PATH, 'data') 
  : path.resolve(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 1000;
const hasDist = fs.existsSync(path.resolve(process.cwd(), 'dist'));
const isProduction = process.env.NODE_ENV === 'production' || hasDist;

// Load optional persisted credentials from local DATA_DIR
let fileClientId = '';
let fileClientSecret = '';
const credsFile = path.join(DATA_DIR, 'credentials.json');
if (fs.existsSync(credsFile)) {
  try {
    const creds = JSON.parse(fs.readFileSync(credsFile, 'utf-8'));
    fileClientId = creds.clientId || '';
    fileClientSecret = creds.clientSecret || '';
  } catch {
    // ignore
  }
}

export const CONFIG = {
  VERSION: '1.0.0',
  BUILD_DATE: '2026-09-21',
  PORT: port,
  CLIENT_URL: process.env.CLIENT_URL || (isProduction ? `http://localhost:${port}` : 'http://localhost:5173'),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || fileClientId || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || fileClientSecret || '',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || `http://localhost:${port}/api/auth/google/callback`,
  TOKENS_FILE: path.join(DATA_DIR, 'tokens.json'),
  CACHE_FILE: path.join(DATA_DIR, 'cache.json'),
  UPDATE_MANIFEST_URL: process.env.UPDATE_MANIFEST_URL || 'https://raw.githubusercontent.com/Biel0071/EMAILCONTROL/main/version.json',
  LATEST_DOWNLOAD_URL: process.env.LATEST_DOWNLOAD_URL || 'https://github.com/Biel0071/EMAILCONTROL/releases/latest',
  hasGoogleCredentials(): boolean {
    return Boolean(this.GOOGLE_CLIENT_ID && this.GOOGLE_CLIENT_SECRET);
  }
};
