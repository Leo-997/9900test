import { Injectable } from '@nestjs/common';
import { IUserWithMetadata } from 'Models/User/User.model';
import { UserService } from '../User/User.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
  ) {}

  async findUser(): Promise<IUserWithMetadata | null> {
    const user = await this.userService.getCurrentUser();

    if (!user) {
      return null;
    }

    return user;
  }
}
