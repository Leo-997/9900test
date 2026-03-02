import { DomainError, DomainErrorKey } from './Domain.error';

export class BadRequestError extends DomainError {
  public constructor(message: string) {
    super(message, DomainErrorKey.BAD_REQUEST);
  }
}
