import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccessControlModule } from 'Modules/AccessControl/AccessControl.module';
import { AnalysisSetsModule } from 'Modules/Analysis/AnalysisSets.module';
import { BiosamplesModule } from 'Modules/Analysis/Biosamples.module';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { CacheModule } from 'Modules/Cache/Cache.module';
import { CommentsModule } from 'Modules/Comments/Comments.module';
import { CnvCurationModule } from 'Modules/Curation/CNV.module';
import { ConsequencesModule } from 'Modules/Curation/Consequences.module';
import { CurationAtlasNotesModule } from 'Modules/Curation/CurationAtlasNotes.module';
import { CytogeneticsModule } from 'Modules/Curation/Cytogenetics.module';
import { GenesModule } from 'Modules/Curation/Genes.module';
import { GermlineCnvCurationModule } from 'Modules/Curation/GermlineCNV.module';
import { GermlineCytogeneticsModule } from 'Modules/Curation/GermlineCytogenetics.module';
import { GermlineSnvCurationModule } from 'Modules/Curation/GermlineSnv.module';
import { GermlineSVModule } from 'Modules/Curation/GermlineSV.module';
import { HTSModule } from 'Modules/Curation/HTS.module';
import { MethylationModule } from 'Modules/Curation/Methylation.module';
import { MutationalSignaturesModule } from 'Modules/Curation/MutationalSignatures.module';
import { PathwaysCurationModule } from 'Modules/Curation/Pathways.module';
import { RnaModule } from 'Modules/Curation/RNA.module';
import { SnvCurationModule } from 'Modules/Curation/SNV.module';
import { SVModule } from 'Modules/Curation/SV.module';
import { EvidenceModule } from 'Modules/Evidence/Evidence.module';
import { PubmedModule } from 'Modules/Evidence/Pubmed.module';
import { FileTrackerModule } from 'Modules/FileTracker/FileTracker.module';
import { IGVModule } from 'Modules/IGV/IGV.module';
import { KnexModule } from 'Modules/Knex';
import { MeetingsModule } from 'Modules/Meetings/Meetings.module';
import { NotificationsModule } from 'Modules/Notifications/Notifications.module';
import { PatientsModule } from 'Modules/Patients/Patients.module';
import { PlotsModule } from 'Modules/Plots/Plots.module';
import { CorrectionFlagsModule } from 'Modules/Precuration/CorrectionFlags.module';
import { PrecurationValidationModule } from 'Modules/Precuration/PrecurationValidation.module';
import { PurityModule } from 'Modules/Precuration/Purity.module';
import { QCMetricsModule } from 'Modules/Precuration/QCMetrics.module';
import { ReportableVariantsModule } from 'Modules/ReportableVariants/ReportableVariants.module';
import { S3Module } from 'Modules/S3/S3.module';
import { CountsModule } from 'Modules/Curation/Counts.module';
import configuration from './Config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    CacheModule,
    AccessControlModule,
    KnexModule.create(),
    S3Module,
    AuthModule,
    CountsModule,
    CurationAtlasNotesModule,
    CnvCurationModule,
    RnaModule,
    PathwaysCurationModule,
    GenesModule,
    SVModule,
    GermlineSVModule,
    CytogeneticsModule,
    GermlineCytogeneticsModule,
    GermlineCnvCurationModule,
    SnvCurationModule,
    QCMetricsModule,
    PrecurationValidationModule,
    MethylationModule,
    HTSModule,
    CorrectionFlagsModule,
    MutationalSignaturesModule,
    GermlineSnvCurationModule,
    PatientsModule,
    EvidenceModule,
    PubmedModule,
    MeetingsModule,
    PlotsModule,
    FileTrackerModule,
    IGVModule,
    ConsequencesModule,
    CommentsModule,
    ReportableVariantsModule,
    NotificationsModule,
    AnalysisSetsModule,
    BiosamplesModule,
    PurityModule,
  ],
})
export class AppModule {}
