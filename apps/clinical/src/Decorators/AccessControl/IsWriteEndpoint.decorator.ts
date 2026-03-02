import { SetMetadata } from '@nestjs/common';
import { IS_WRITE_ENDPOINT_KEY } from 'Models/AccessControl/AccessControl.model';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const IsWriteEndpoint = (): MethodDecorator => SetMetadata(IS_WRITE_ENDPOINT_KEY, true);
