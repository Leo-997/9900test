import { KNEX_CONNECTION } from './constants';
import { KnexService } from './knex.service';

export const connectionFactory = [
  {
    provide: KNEX_CONNECTION,
    useFactory: async (knexService: KnexService) => {
      return knexService.getUserKnexConnection();
    },
    inject: [KnexService],
  },
];
