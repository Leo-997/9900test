import { Module, forwardRef } from '@nestjs/common';
import { MolecularAlterationsClient } from '../../Clients/MolecularAlterations/MolecularAlterations.client';
import { MolecularAlterationsController } from '../../Controllers/MolecularAlterations/MolecularAlterations.controller';
import { MolecularAlterationsService } from '../../Services/MolecularAlterations/MolecularAlterations.service';
import { AuthModule } from '../Auth/Auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
  ],
  controllers: [MolecularAlterationsController],
  providers: [
    MolecularAlterationsClient,
    MolecularAlterationsService,
  ],
  exports: [MolecularAlterationsService, MolecularAlterationsService],
})
export class MolecularAlterationsModule {}
