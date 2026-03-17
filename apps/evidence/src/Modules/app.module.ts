import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'Config/configuration';
import { KnexModule } from './Knex';
import { CitationModule } from './Citation/Citation.module';
import { EvidenceModule } from './Evidence/Evidence.module';
import { ResourceModule } from './Resource/Resource.module';
import { AuthModule } from './Auth/Auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    KnexModule.create(),
    AuthModule,
    EvidenceModule,
    CitationModule,
    ResourceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
