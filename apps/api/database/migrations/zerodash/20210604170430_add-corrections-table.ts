import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_flag_for_corrections', (table) => {
    table.increments('flag_id');
    table
      .enum('reason', [
        'CHANGE_DIAG',
        'PURITY_FIT_WRONG',
        'MISSING_INFO',
        'WRONG_INFO',
        'ADD_NEW_INFO',
        'MODIFY_INFO',
      ])
      .notNullable();
    table.string('reason_note', 250).nullable().defaultTo(null);
    table.boolean('is_corrected').notNullable().defaultTo(false);
    table.string('correction_note', 250).nullable().defaultTo(null);
    table.string('flagged_by', 255).notNullable();
    table.string('corrected_by', 255);
    table.timestamp('corrected_At');
    table.timestamp('flagged_At').notNullable().defaultTo(knex.fn.now());
    table.string('sample_id', 150);

    table
      .foreign('sample_id')
      .references('zcc_sample.sample_id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
