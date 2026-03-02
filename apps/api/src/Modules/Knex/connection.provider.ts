import { Knex } from 'knex';
import { FILE_TRACKER_KNEX_CONNECTION, KNEX_CONNECTION } from './constants';
import { KnexService } from './knex.service';

export const connectionFactory = [
  {
    provide: KNEX_CONNECTION,
    useFactory: async (knexService: KnexService): Promise<Knex> => (
      knexService.getKnexConnection()
    ),
    inject: [KnexService],
  },
  {
    provide: FILE_TRACKER_KNEX_CONNECTION,
    useFactory: async (knexService: KnexService): Promise<Knex> => (
      knexService.getFileTrackerKnexConnection()
    ),
    inject: [KnexService],
  },
];
