import { DomainError, DomainErrorKey } from './Domain.error';

export class NotFoundError extends DomainError {
  public constructor(message: string) {
    super(message, DomainErrorKey.NOT_FOUND);
  }
}
