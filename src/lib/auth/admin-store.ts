import fs from 'fs';
import path from 'path';

export interface AdminCredentials {
  email: string;
  passwordHash: string; // Plaintext or hashed password
  fullName: string;
  role: string;
  lastLogin?: string;
  updatedAt: string;
}

// Global in-memory cache
declare global {
  var __TINVANTA_ADMIN_CREDENTIALS__: AdminCredentials | undefined;
}

const DEFAULT_ADMIN: AdminCredentials = {
  email: process.env.ADMIN_EMAIL || 'admin@tinvanta.vn',
  passwordHash: process.env.ADMIN_PASSWORD || 'TinVanta@Admin2026!',
  fullName: 'Tổng Quản Trị Viên (Super Admin)',
  role: 'super_admin',
  updatedAt: new Date().toISOString(),
};

function getStoragePath(): string {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'admin-credentials.json');
  }
  return path.join(process.cwd(), 'src', 'lib', 'data', 'admin-credentials.json');
}

/**
 * Lấy thông tin tài khoản ADMIN hiện tại
 */
export function getAdminCredentials(): AdminCredentials {
  if (globalThis.__TINVANTA_ADMIN_CREDENTIALS__) {
    return globalThis.__TINVANTA_ADMIN_CREDENTIALS__;
  }

  try {
    const filePath = getStoragePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        if (parsed.email && parsed.passwordHash) {
          globalThis.__TINVANTA_ADMIN_CREDENTIALS__ = parsed;
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('Lỗi đọc admin credentials:', e);
  }

  globalThis.__TINVANTA_ADMIN_CREDENTIALS__ = { ...DEFAULT_ADMIN };
  return DEFAULT_ADMIN;
}

/**
 * Cập nhật thông tin tài khoản hoặc mật khẩu ADMIN
 */
export function updateAdminCredentials(email?: string, password?: string): AdminCredentials {
  const current = getAdminCredentials();
  const updated: AdminCredentials = {
    ...current,
    email: (email || current.email).trim().toLowerCase(),
    passwordHash: password ? password.trim() : current.passwordHash,
    updatedAt: new Date().toISOString(),
  };

  globalThis.__TINVANTA_ADMIN_CREDENTIALS__ = updated;

  try {
    const filePath = getStoragePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (e) {
    console.error('Lỗi ghi admin credentials:', e);
  }

  return updated;
}

/**
 * Kiểm tra xác thực thông tin đăng nhập ADMIN
 */
export function authenticateAdmin(email: string, password: string): boolean {
  if (!email || !password) return false;
  const admin = getAdminCredentials();
  const cleanInputEmail = email.trim().toLowerCase();
  const cleanAdminEmail = admin.email.trim().toLowerCase();

  return cleanInputEmail === cleanAdminEmail && password.trim() === admin.passwordHash;
}

/**
 * Tạo token phiên đăng nhập
 */
export function generateAdminSessionToken(): string {
  const admin = getAdminCredentials();
  const payload = {
    email: admin.email,
    role: 'super_admin',
    timestamp: Date.now(),
    secret: 'tinvanta-secure-admin-token-2026',
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Xác thực token phiên đăng nhập
 */
export function verifyAdminSessionToken(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const jsonStr = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonStr);
    if (payload.secret !== 'tinvanta-secure-admin-token-2026') return false;
    
    // Giới hạn phiên 30 ngày
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.timestamp > maxAge) return false;

    const admin = getAdminCredentials();
    return payload.email === admin.email;
  } catch {
    return false;
  }
}
