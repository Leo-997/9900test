import { DomainError, DomainErrorKey } from './Domain.error';

export class ConflictError extends DomainError {
  public constructor(message: string) {
    super(message, DomainErrorKey.CONFLICT);
  }
}
