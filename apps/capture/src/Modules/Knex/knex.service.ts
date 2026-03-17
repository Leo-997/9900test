// tslint:disable: variable-name
import { Inject, Injectable, Logger } from '@nestjs/common';

import { Knex, knex } from 'knex';
import { KNEX_OPTIONS } from './constants';

interface IKnexService {
  getUserKnexConnection(): Knex;
}

@Injectable()
export class KnexService implements IKnexService {
  private readonly logger: Logger;

  private userConnection: any;

  constructor(
    @Inject(KNEX_OPTIONS) private userKnexOptions: Knex.Config,
  ) {
    this.logger = new Logger('KnexService');
    this.logger.log(`Setting up Knex Service`);
  }

  getUserKnexConnection(): Knex {
    if (!this.userConnection) {
      this.userConnection = new (knex as any)(this.userKnexOptions);
    }
    return this.userConnection;
  }

}
