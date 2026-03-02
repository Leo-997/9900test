import {
    ConflictException,
    HttpException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { DomainError, DomainErrorKey } from 'Errors/Domain.error';

export function domainErrorToRestResponse(err: Error): HttpException {
  if (err instanceof HttpException) {
    return err;
  }
  if (err instanceof DomainError) {
    switch (err.errorKey) {
      case DomainErrorKey.NOT_FOUND:
        return new NotFoundException(err.message);
      case DomainErrorKey.CONFLICT:
        return new ConflictException(err.message);
      case DomainErrorKey.INTERNAL:
        return new InternalServerErrorException(err.message);
      default:
        return new InternalServerErrorException(err.message);
    }
  }

  console.error(err);
  return new InternalServerErrorException();
}
