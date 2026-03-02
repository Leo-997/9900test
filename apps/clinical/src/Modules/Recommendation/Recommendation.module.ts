import { Module } from '@nestjs/common';
import { RecommendationClient } from '../../Clients';
import { RecommendationController } from '../../Controllers';
import { RecommendationService } from '../../Services';
import { TherapyModule } from '../Therapy/Therapy.module';
import { TrialsModule } from '../Trials/Trials.module';
import { MolecularAlterationsModule } from '../MolecularAlterations/MolecularAlterations.module';
import { AuthModule } from '../Auth/Auth.module';
import { EvidenceModule } from '../Evidence/Evidence.module';
import { InterpretationsModule } from '../Interpretation/Interpretation.module';

@Module({
  imports: [
    TherapyModule,
    TrialsModule,
    MolecularAlterationsModule,
    EvidenceModule,
    AuthModule,
    InterpretationsModule,
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService, RecommendationClient],
  exports: [RecommendationService],
})
export class RecommendationModule {}
