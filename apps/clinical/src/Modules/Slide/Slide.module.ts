import { forwardRef, Module } from '@nestjs/common';
import { SlideClient } from 'Clients/Slide/Slide.client';
import { SlideController } from 'Controllers/Slide/Slide.controller';
import { SlideService } from 'Services/Slide/Slide.service';
import { AuthModule } from '../Auth/Auth.module';
import { MolecularAlterationsModule } from '../MolecularAlterations/MolecularAlterations.module';
import { RecommendationModule } from '../Recommendation/Recommendation.module';
import { ClinicalInformationModule } from '../ClinicalInformation/ClinicalInformation.module';
import { InterpretationsModule } from '../Interpretation/Interpretation.module';

@Module({
  imports: [
    RecommendationModule,
    MolecularAlterationsModule,
    AuthModule,
    forwardRef(() => ClinicalInformationModule),
    InterpretationsModule,
  ],
  controllers: [SlideController],
  providers: [SlideService, SlideClient],
  exports: [SlideService],
})
export class SlideModule { }
