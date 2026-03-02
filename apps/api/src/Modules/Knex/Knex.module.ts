import { Knex } from 'knex';

import {
  DynamicModule,
  Global,
  Module,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { knexConnectionConfig, knexConnectionConfigFileTracker } from '../../../knexfile';
import { connectionFactory } from './connection.provider';
import { FILE_TRACKER_KNEX_OPTIONS, KNEX_OPTIONS } from './constants';
import { createKnexProviders } from './knex.provider';
import { KnexService } from './knex.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [KnexService, ...connectionFactory],
  exports: [KnexService, ...connectionFactory],
})
export class KnexModule {
  public static create(): DynamicModule {
    return this.register([
      {
        ...knexConnectionConfig,
      },
      {
        ...knexConnectionConfigFileTracker,
      },
    ], [
      KNEX_OPTIONS,
      FILE_TRACKER_KNEX_OPTIONS,
    ]);
  }

  /**
   * Registers a configured NestjsKnex Module for import into the current module
   */
  private static register(options: Knex.Config[], constants?: string[]): DynamicModule {
    return {
      module: KnexModule,
      providers: createKnexProviders(options, constants),
    };
  }
}
