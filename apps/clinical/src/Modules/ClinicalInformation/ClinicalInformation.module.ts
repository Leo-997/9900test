import { forwardRef, Module } from '@nestjs/common';
import { ClinicalInformationClient } from '../../Clients/ClinicalInformation/ClinicalInformation.client';
import { ClinicalInformationController } from '../../Controllers';
import { ClinicalInformationService } from '../../Services';
import { AuthModule } from '../Auth/Auth.module';
import { SampleModule } from '../Sample/Sample.module';
import { SlideModule } from '../Slide/Slide.module';

@Module({
  imports: [AuthModule, SampleModule, forwardRef(() => SlideModule)],
  controllers: [ClinicalInformationController],
  providers: [ClinicalInformationService, ClinicalInformationClient],
  exports: [ClinicalInformationService],
})
export class ClinicalInformationModule { }
