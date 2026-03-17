import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { SCOPES_KEY, Scope } from 'Models/Scope/Scope.model';

export const Scopes = (
  ...scopes: Scope[]
): CustomDecorator<string> => SetMetadata(SCOPES_KEY, scopes);
