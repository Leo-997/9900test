/* eslint-disable max-len */
import { Knex } from 'knex';
import { KNEX_CONNECTION } from './constants';
import { KnexService } from './knex.service';

export const connectionFactory = [
  {
    provide: KNEX_CONNECTION,
    useFactory: async (knexService: KnexService): Promise<Knex> => knexService.getKnexConnection(),
    inject: [KnexService],
  },
];
