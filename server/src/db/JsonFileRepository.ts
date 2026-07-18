import fs from 'fs/promises';
import path from 'path';
import { Entity, Repository } from './Repository';

/**
 * Simple JSON-file-backed repository.
 *
 * This exists so the sample app runs out of the box with zero external
 * database setup or credentials. Each entity type gets its own JSON file
 * (e.g. data/users.json, data/events.json). Writes are serialized through
 * an internal queue so concurrent requests can't corrupt the file.
 *
 * Swap this out for a real database adapter by implementing `Repository<T>`
 * against your DB of choice and constructing that instead - every module's
 * service layer only ever talks to the `Repository<T>` interface.
 */
export class JsonFileRepository<T extends Entity> implements Repository<T> {
  private filePath: string;
  private cache: T[] | null = null;
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(dataDir: string, collectionName: string) {
    this.filePath = path.join(dataDir, `${collectionName}.json`);
  }

  private async ensureLoaded(): Promise<T[]> {
    if (this.cache) return this.cache;

    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const raw = await fs.readFile(this.filePath, 'utf-8');
      this.cache = JSON.parse(raw) as T[];
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        this.cache = [];
        await this.persist();
      } else {
        throw err;
      }
    }
    return this.cache!;
  }

  private async persist(): Promise<void> {
    const data = this.cache ?? [];
    const tmpPath = `${this.filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmpPath, this.filePath);
  }

  /** Serializes writes so concurrent requests don't clobber each other. */
  private enqueueWrite<R>(fn: () => Promise<R>): Promise<R> {
    const result = this.writeQueue.then(fn);
    // Swallow errors here so one failed write doesn't permanently jam the
    // queue for subsequent operations; the caller still sees the rejection.
    this.writeQueue = result.catch(() => undefined);
    return result;
  }

  async findAll(): Promise<T[]> {
    const items = await this.ensureLoaded();
    return [...items];
  }

  async findById(id: string): Promise<T | undefined> {
    const items = await this.ensureLoaded();
    return items.find((item) => item.id === id);
  }

  async findOneWhere(predicate: (item: T) => boolean): Promise<T | undefined> {
    const items = await this.ensureLoaded();
    return items.find(predicate);
  }

  async findWhere(predicate: (item: T) => boolean): Promise<T[]> {
    const items = await this.ensureLoaded();
    return items.filter(predicate);
  }

  async create(item: T): Promise<T> {
    return this.enqueueWrite(async () => {
      const items = await this.ensureLoaded();
      items.push(item);
      await this.persist();
      return item;
    });
  }

  async update(id: string, updates: Partial<T>): Promise<T | undefined> {
    return this.enqueueWrite(async () => {
      const items = await this.ensureLoaded();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return undefined;
      const updated = { ...items[index], ...updates, id } as T;
      items[index] = updated;
      await this.persist();
      return updated;
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.enqueueWrite(async () => {
      const items = await this.ensureLoaded();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return false;
      items.splice(index, 1);
      await this.persist();
      return true;
    });
  }
}
