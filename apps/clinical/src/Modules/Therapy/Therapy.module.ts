import { Module } from '@nestjs/common';
import { TherapyClient } from '../../Clients/Therapy/Therapy.client';
import { TherapyController } from '../../Controllers';
import { TherapyService } from '../../Services';
import { DrugModule } from '../Drug/Drug.module';
import { TrialsModule } from '../Trials/Trials.module';
import { MolecularAlterationsModule } from '../MolecularAlterations/MolecularAlterations.module';
import { AuthModule } from '../Auth/Auth.module';

@Module({
  imports: [
    DrugModule,
    TrialsModule,
    MolecularAlterationsModule,
    AuthModule,
  ],
  controllers: [TherapyController],
  providers: [TherapyService, TherapyClient],
  exports: [TherapyService],
})
export class TherapyModule { }
