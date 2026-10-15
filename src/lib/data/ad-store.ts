import fs from 'fs';
import path from 'path';
import { AdCreative } from '@/types/database';
import { MOCK_AD_CREATIVES } from './mock-data';

// Global in-memory cache chia sẻ giữa các request trong cùng tiến trình Serverless
declare global {
  var __TINVANTA_ADS_STORE__: AdCreative[] | undefined;
}

function getAdsStoragePath(): string {
  if (process.env.VERCEL) {
    const tmpPath = path.join('/tmp', 'ads-store.json');
    if (!fs.existsSync(tmpPath)) {
      const bundledPath = path.join(process.cwd(), 'src', 'lib', 'data', 'ads-store.json');
      if (fs.existsSync(bundledPath)) {
        try {
          fs.copyFileSync(bundledPath, tmpPath);
        } catch {
          // Fallback
        }
      }
    }
    return tmpPath;
  }
  return path.join(process.cwd(), 'src', 'lib', 'data', 'ads-store.json');
}

/**
 * Đọc toàn bộ danh sách quảng cáo từ bộ nhớ Global hoặc file JSON
 */
export function getStoredAds(): AdCreative[] {
  // 1. Ưu tiên globalThis memory cache
  if (globalThis.__TINVANTA_ADS_STORE__ && Array.isArray(globalThis.__TINVANTA_ADS_STORE__) && globalThis.__TINVANTA_ADS_STORE__.length > 0) {
    return globalThis.__TINVANTA_ADS_STORE__;
  }

  try {
    const filePath = getAdsStoragePath();
    if (!fs.existsSync(filePath)) {
      const bundledPath = path.join(process.cwd(), 'src', 'lib', 'data', 'ads-store.json');
      if (fs.existsSync(bundledPath)) {
        const raw = fs.readFileSync(bundledPath, 'utf-8');
        const parsed = raw.trim() ? JSON.parse(raw) : MOCK_AD_CREATIVES;
        globalThis.__TINVANTA_ADS_STORE__ = parsed;
        return parsed;
      }
      globalThis.__TINVANTA_ADS_STORE__ = [...MOCK_AD_CREATIVES];
      return MOCK_AD_CREATIVES;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) {
      globalThis.__TINVANTA_ADS_STORE__ = [...MOCK_AD_CREATIVES];
      return MOCK_AD_CREATIVES;
    }
    const data = JSON.parse(raw);
    const result = Array.isArray(data) && data.length > 0 ? data : MOCK_AD_CREATIVES;
    globalThis.__TINVANTA_ADS_STORE__ = result;
    return result;
  } catch (error) {
    console.error('Lỗi đọc ads-store.json:', error);
    globalThis.__TINVANTA_ADS_STORE__ = [...MOCK_AD_CREATIVES];
    return MOCK_AD_CREATIVES;
  }
}

/**
 * Lưu danh sách quảng cáo xuống cả Global Memory và đĩa
 */
function writeAdsToDisk(ads: AdCreative[]): void {
  globalThis.__TINVANTA_ADS_STORE__ = ads;
  try {
    const filePath = getAdsStoragePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(ads, null, 2), 'utf-8');
  } catch (error) {
    console.error('Lỗi ghi ads-store.json:', error);
  }
}

/**
 * Thêm hoặc cập nhật một banner quảng cáo
 */
export function saveAdToStore(ad: AdCreative): AdCreative {
  const list = getStoredAds();
  const index = list.findIndex(a => a.id === ad.id);
  if (index >= 0) {
    list[index] = ad;
  } else {
    list.unshift(ad);
  }
  writeAdsToDisk(list);
  return ad;
}

/**
 * Cập nhật một phần nội dung banner quảng cáo (ảnh/gif, tiêu đề, link, vị trí, trạng thái)
 */
export function updateAdInStore(id: string, updates: Partial<AdCreative>): AdCreative | null {
  const list = getStoredAds();
  const index = list.findIndex(a => a.id === id);
  if (index === -1) {
    const mock = MOCK_AD_CREATIVES.find(a => a.id === id);
    if (mock) {
      const merged: AdCreative = { ...mock, ...updates };
      list.unshift(merged);
      writeAdsToDisk(list);
      return merged;
    }
    return null;
  }

  list[index] = {
    ...list[index],
    ...updates,
  };
  writeAdsToDisk(list);
  return list[index];
}

/**
 * Xóa một banner quảng cáo
 */
export function deleteAdFromStore(id: string): boolean {
  const list = getStoredAds();
  const filtered = list.filter(a => a.id !== id);
  if (filtered.length === list.length) {
    return false;
  }
  writeAdsToDisk(filtered);
  return true;
}

/**
 * Lấy toàn bộ danh sách quảng cáo hiện có
 */
export function getAllCombinedAds(): AdCreative[] {
  return getStoredAds();
}
