/**
 * Generic repository contract used by every module's service layer.
 *
 * The rest of the application only depends on this interface, never on the
 * concrete storage implementation. That means swapping the JSON-file-backed
 * `JsonFileRepository` for a real database (Postgres, Mongo, etc.) later on
 * is a matter of writing one new class that implements this interface and
 * changing where it's constructed - no other module needs to change.
 */
export interface Entity {
  id: string;
}

export interface Repository<T extends Entity> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  findOneWhere(predicate: (item: T) => boolean): Promise<T | undefined>;
  findWhere(predicate: (item: T) => boolean): Promise<T[]>;
  create(item: T): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T | undefined>;
  delete(id: string): Promise<boolean>;
}
