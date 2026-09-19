import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

export interface StorageProvider {
  saveFile(buffer: Buffer, originalFilename: string, mimeType: string): Promise<{ storageKey: string }>;
  getFile(storageKey: string): Promise<Buffer>;
  deleteFile(storageKey: string): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    // In serverless environments like Netlify/AWS Lambda, only /tmp (os.tmpdir()) is writable
    if (process.env.STORAGE_PATH) {
      this.baseDir = path.resolve(process.env.STORAGE_PATH);
    } else if (process.env.NODE_ENV === 'production' || process.env.NETLIFY || process.env.VERCEL) {
      this.baseDir = path.join(os.tmpdir(), 'prism-uploads');
    } else {
      this.baseDir = path.resolve(process.cwd(), 'uploads');
    }
  }

  private async ensureDir() {
    try {
      await fs.access(this.baseDir);
    } catch {
      await fs.mkdir(this.baseDir, { recursive: true }).catch(() => {
        // Fallback to os.tmpdir() directly if custom directory fails
        this.baseDir = os.tmpdir();
      });
    }
  }

  async saveFile(buffer: Buffer, originalFilename: string, _mimeType: string): Promise<{ storageKey: string }> {
    const ext = path.extname(originalFilename).toLowerCase();
    const hash = crypto.randomBytes(16).toString('hex');
    const storageKey = `${hash}${ext}`;

    try {
      await this.ensureDir();
      const filePath = path.join(this.baseDir, storageKey);
      await fs.writeFile(filePath, buffer);
    } catch (err) {
      console.warn('Local storage write warning (continuing with in-memory parsed text):', err);
    }

    return { storageKey };
  }

  async getFile(storageKey: string): Promise<Buffer> {
    const sanitizedKey = path.basename(storageKey);
    const filePath = path.join(this.baseDir, sanitizedKey);
    return fs.readFile(filePath);
  }

  async deleteFile(storageKey: string): Promise<void> {
    const sanitizedKey = path.basename(storageKey);
    const filePath = path.join(this.baseDir, sanitizedKey);
    try {
      await fs.unlink(filePath);
    } catch {
      // ignore if file doesn't exist
    }
  }
}

export function getStorageProvider(): StorageProvider {
  return new LocalStorageProvider();
}
