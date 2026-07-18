import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import { Repository } from '../../db/Repository';
import { DEFAULT_PREFERENCES, User, UserPreferences } from './user.model';
import { ApiError } from '../../utils/ApiError';

const SALT_ROUNDS = 10;

export class UserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const normalized = email.trim().toLowerCase();
    return this.userRepository.findOneWhere((u) => u.email === normalized);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findById(id);
  }

  async createUser(email: string, password: string, displayName: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.findByEmail(normalizedEmail);
    if (existing) {
      throw ApiError.conflict('An account with that email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const now = new Date().toISOString();

    const user: User = {
      id: uuid(),
      email: normalizedEmail,
      passwordHash,
      displayName: displayName.trim() || normalizedEmail.split('@')[0],
      preferences: { ...DEFAULT_PREFERENCES },
      createdAt: now,
      updatedAt: now,
    };

    return this.userRepository.create(user);
  }

  async verifyCredentials(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    return user;
  }

  async updateProfile(
    id: string,
    updates: { displayName?: string }
  ): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found');

    const updated = await this.userRepository.update(id, {
      displayName: updates.displayName?.trim() || user.displayName,
      updatedAt: new Date().toISOString(),
    });
    return updated!;
  }

  async updatePreferences(id: string, updates: Partial<UserPreferences>): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found');

    const mergedPreferences: UserPreferences = {
      ...user.preferences,
      ...updates,
    };

    const updated = await this.userRepository.update(id, {
      preferences: mergedPreferences,
      updatedAt: new Date().toISOString(),
    });
    return updated!;
  }
}
