import { Module } from '@nestjs/common';
import { PurityClient } from 'Clients/Precuration/Purity.client';
import { PurityController } from 'Controllers/Precuration/Purity.controller';
import { PurityService } from 'Services/Precuration/Purity.service';

@Module({
  imports: [],
  controllers: [PurityController],
  providers: [PurityService, PurityClient],
  exports: [],
})
export class PurityModule {}
