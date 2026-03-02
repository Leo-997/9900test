import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'Config/configuration';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApprovalsModule } from './Approvals/Approvals.module';
import { AuthModule } from './Auth/Auth.module';
import { CacheModule } from './Cache/Cache.module';
import { GeneListsModule } from './GeneLists/GeneLists.module';
import { KnexModule } from './Knex';
import { NotificationsModule } from './Notifications/Notifications.module';
import { ReportsModule } from './Reports/Reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    CacheModule,
    KnexModule.create(),
    AuthModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      path: '/reports/graphql',
      autoSchemaFile: {
        path: join(process.cwd(), 'src/GraphQL/schema.gql'),
        federation: 2,
      },
    }),
    GeneListsModule,
    ApprovalsModule,
    NotificationsModule,
    ReportsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
