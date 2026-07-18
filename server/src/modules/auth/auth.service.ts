import jwt from 'jsonwebtoken';
import { UserService } from '../users/user.service';
import { env } from '../../config/env';
import { User } from '../users/user.model';

export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(email: string, password: string, displayName: string): Promise<User> {
    return this.userService.createUser(email, password, displayName);
  }

  async login(email: string, password: string): Promise<User> {
    return this.userService.verifyCredentials(email, password);
  }

  issueToken(user: User): string {
    return jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    } as jwt.SignOptions);
  }
}
