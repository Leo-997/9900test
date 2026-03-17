import { HttpStatus } from '@nestjs/common';

// eslint-disable-next-line no-shadow
export enum DomainErrorKey {
  BAD_REQUEST = HttpStatus.BAD_REQUEST,
  NOT_FOUND = HttpStatus.NOT_FOUND,
  INTERNAL = HttpStatus.INTERNAL_SERVER_ERROR,
  CONFLICT = HttpStatus.CONFLICT,
}

export interface IDomainError {
  message: string;
  errorKey: DomainErrorKey;
}

export class DomainError implements IDomainError {
  public message: string;

  public errorKey: DomainErrorKey;

  public constructor(message: string, errorKey?: DomainErrorKey) {
    this.message = message;
    this.errorKey = errorKey;
  }
}
