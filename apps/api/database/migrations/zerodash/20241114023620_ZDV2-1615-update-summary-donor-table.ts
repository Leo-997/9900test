import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_donor', async (table) => {
    table.string('biosample_id', 150).after('sample_id');

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex
        .update({
          biosample_id: knex.raw('sample_id'),
        })
        .from('zcc_donor')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_donor', (table) => {
        table.dropIndex(['sample_id'], 'zcc_donor_sample_id_index');
        table.dropPrimary();
        table.dropColumn('sample_id');

        table.foreign('donor_id')
          .references('biosample_id')
          .inTable('zcc_biosample')
          .onDelete('CASCADE')
          .onUpdate('CASCADE');

        table.primary(['biosample_id', 'donor_id']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_donor', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
