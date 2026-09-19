import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface StorageProvider {
  saveFile(buffer: Buffer, originalFilename: string, mimeType: string): Promise<{ storageKey: string }>;
  getFile(storageKey: string): Promise<Buffer>;
  deleteFile(storageKey: string): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.STORAGE_PATH || 'uploads');
  }

  private async ensureDir() {
    try {
      await fs.access(this.baseDir);
    } catch {
      await fs.mkdir(this.baseDir, { recursive: true });
    }
  }

  async saveFile(buffer: Buffer, originalFilename: string, _mimeType: string): Promise<{ storageKey: string }> {
    await this.ensureDir();
    const ext = path.extname(originalFilename).toLowerCase();
    const hash = crypto.randomBytes(16).toString('hex');
    const storageKey = `${hash}${ext}`;
    const filePath = path.join(this.baseDir, storageKey);

    await fs.writeFile(filePath, buffer);
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
  // Can be extended to return S3StorageProvider when STORAGE_PROVIDER === 's3'
  return new LocalStorageProvider();
}
