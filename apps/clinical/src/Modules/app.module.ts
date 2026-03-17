import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'Config/configuration';
import {
  AddendumModule,
  AuthModule,
  ClinicalInformationModule,
  CommentModule,
  DrugModule,
  EvidenceModule,
  MeetingsModule,
  RecommendationModule,
  SampleModule,
  TherapyModule,
} from '.';
import { AccessControlModule } from './AccessControl/AccessControl.module';
import { ArchiveModule } from './Archive/Archive.module';
import { CacheModule } from './Cache/Cache.module';
import { InterpretationsModule } from './Interpretation/Interpretation.module';
import { KnexModule } from './Knex';
import { MolecularAlterationsModule } from './MolecularAlterations/MolecularAlterations.module';
import { NotificationsModule } from './Notifications/Notifications.module';
import { SlideModule } from './Slide/Slide.module';
import { TrialsModule } from './Trials/Trials.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    CacheModule,
    KnexModule.create(),
    AuthModule,
    AccessControlModule,
    MolecularAlterationsModule,
    SlideModule,
    SampleModule,
    DrugModule,
    TherapyModule,
    RecommendationModule,
    EvidenceModule,
    ClinicalInformationModule,
    CommentModule,
    AddendumModule,
    MeetingsModule,
    TrialsModule,
    InterpretationsModule,
    ArchiveModule,
    NotificationsModule,
  ],
})
export class AppModule {}
