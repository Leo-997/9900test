import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { domainErrorToRestResponse } from 'Utils/domainErrorResolver.util';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(catchError((err) => throwError(domainErrorToRestResponse(err))));
  }
}
