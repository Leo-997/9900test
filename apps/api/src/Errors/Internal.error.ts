import { DomainError, DomainErrorKey } from './Domain.error';

export class InternalError extends DomainError {
  error: any;

  public constructor(message: string, err?: any) {
    super(message, DomainErrorKey.INTERNAL);

    this.error = err;
  }
}
