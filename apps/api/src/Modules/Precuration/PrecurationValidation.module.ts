import { Module } from '@nestjs/common';

import { PrecurationValidationController } from 'Controllers/Precuration/PrecurationValidation.controller';
import { PrecurationValidationClient } from 'Clients/Precuration/PrecurationValidation.client';
import { PrecurationValidationService } from 'Services/Precuration/PrecurationValidation.service';
import { AuthModule } from 'Modules/Auth/Auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PrecurationValidationController],
  providers: [PrecurationValidationClient, PrecurationValidationService],
})
export class PrecurationValidationModule {}
