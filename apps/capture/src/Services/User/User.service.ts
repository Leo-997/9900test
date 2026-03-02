import { Injectable } from '@nestjs/common';
import { IUserWithMetadata } from 'Models';
import { currentUser } from './currentUser';

@Injectable()
export class UserService {
  constructor() {}

  public async getCurrentUser(): Promise<IUserWithMetadata | null> {
    return currentUser;
  }
}
