import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Knex } from 'knex';
import { knexConnectionConfig } from '../../../knexfile';
import { connectionFactory } from './connection.provider';
import { KNEX_OPTIONS } from './constants';
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
    ], [
      KNEX_OPTIONS,
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
