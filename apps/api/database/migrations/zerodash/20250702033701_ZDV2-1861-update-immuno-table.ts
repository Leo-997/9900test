import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_immunoprofile', (table) => {
    table.dropForeign(['biosample_id'], 'zcc_curated_sample_immunoprofile_biosample_id_foreign');
    table.dropPrimary();
    table.float('value').nullable().defaultTo(null);
    table.string('status', 150).nullable().defaultTo(null);
  })
    .then(() => knex.schema.alterTable('zcc_curated_sample_immunoprofile', (table) => {
      table.enu('name', ['IPASS', 'M1M2', 'CD8']).notNullable().after('biosample_id');
      table.float('percentile').nullable().defaultTo(null).after('value');
      table.primary(['biosample_id', 'name']);
    }))
    .then(() => knex.schema.alterTable('zcc_curated_sample_immunoprofile', (table) => {
      table.foreign('biosample_id')
        .references('biosample_id')
        .inTable('zcc_biosample')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    }));
}

export async function down(knex: Knex): Promise<void> {
}
