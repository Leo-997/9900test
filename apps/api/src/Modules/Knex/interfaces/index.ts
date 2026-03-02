import { Knex } from 'knex';

/* Dependencies */
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export interface INestjsKnexOptionsFactory {
  createNestjsKnexOptions(): Promise<Knex.Config> | Knex.Config;
}

export interface INestjsKnexAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useExisting?: Type<INestjsKnexOptionsFactory>;
  useClass?: Type<INestjsKnexOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<Knex.Config> | Knex.Config;
}
