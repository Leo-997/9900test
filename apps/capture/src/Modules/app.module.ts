import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'Config/configuration';
import { AuthModule, CacheModule, PatientModule } from '.';
import { KnexModule } from './Knex';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    KnexModule.create(),
    CacheModule,
    AuthModule,
    PatientModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
