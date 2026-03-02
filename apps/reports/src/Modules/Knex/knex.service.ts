// tslint:disable: variable-name
import { Inject, Injectable, Logger } from '@nestjs/common';

import { Knex, knex } from 'knex';
import { KNEX_OPTIONS } from './constants';

interface IKnexService {
  getKnexConnection(): Knex;
}

@Injectable()
export class KnexService implements IKnexService {
  private readonly logger: Logger;

  private connection: any;

  constructor(
    @Inject(KNEX_OPTIONS) private knexOptions: Knex.Config,
  ) {
    this.logger = new Logger('KnexService');
    this.logger.log('Setting up Knex Service');
  }

  getKnexConnection(): Knex {
    if (!this.connection) {
      this.connection = new (knex as any)(this.knexOptions);
    }
    return this.connection;
  }
}
