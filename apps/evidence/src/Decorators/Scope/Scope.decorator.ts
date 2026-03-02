import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { SCOPES_KEY, Scope } from 'Models/Scope/Scope.model';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Scopes = (
  ...scopes: Scope[]
): CustomDecorator<string> => SetMetadata(SCOPES_KEY, scopes);
