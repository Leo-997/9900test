import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { IS_WRITE_ENDPOINT_KEY } from 'Models/AccessControl/AccessControl.model';

export const IsWriteEndpoint = (): CustomDecorator<string> => (
  SetMetadata(IS_WRITE_ENDPOINT_KEY, true)
);
