import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_culture', (table) => {
    table
      .string('qc_submitted_by', 255)
      .nullable()
      .defaultTo(null)
      .after('qc_comment');
    table
      .timestamp('qc_submitted_on')
      .defaultTo(null)
      .after('qc_submitted_by');
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .after('qc_submitted_on')
      .alter();
    table
      .string('created_by')
      .notNullable()
      .defaultTo('sysadmin')
      .after('created_at')
      .alter();
    table
      .timestamp('updated_at')
      .nullable()
      .defaultTo(null)
      .after('created_by')
      .alter();
    table
      .string('updated_by')
      .nullable()
      .defaultTo(null)
      .after('updated_at')
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
