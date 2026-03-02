// tslint:disable: variable-name
import { Inject, Injectable } from '@nestjs/common';

import { Knex, knex } from 'knex';
import { FILE_TRACKER_KNEX_OPTIONS, KNEX_OPTIONS } from './constants';

interface IKnexService {
  getKnexConnection(): Knex;
  getFileTrackerKnexConnection(): Knex;
}

@Injectable()
export class KnexService implements IKnexService {
  private connection: Knex;

  private fileTrackerConnection: Knex;

  constructor(
    @Inject(KNEX_OPTIONS) private knexOptions: Knex.Config,
    @Inject(FILE_TRACKER_KNEX_OPTIONS) private fileTrackerKnexOptions: Knex.Config,
  ) {
  }

  getKnexConnection(): Knex {
    if (!this.connection) {
      this.connection = new (knex as any)(this.knexOptions);
    }
    return this.connection;
  }

  closeKnexConnection(): void {
    if (this.connection) {
      this.connection.destroy();
    }
  }

  getFileTrackerKnexConnection(): Knex {
    if (!this.fileTrackerConnection) {
      this.fileTrackerConnection = new (knex as any)(this.fileTrackerKnexOptions);
    }
    return this.fileTrackerConnection;
  }

  closeFileTrackerKnexConnection(): void {
    if (this.fileTrackerConnection) {
      this.fileTrackerConnection.destroy();
    }
  }
}
