import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_alias', (table) => {
    table.dropForeign('biosample_id', 'zcc_alias_biosample_id');
    table.dropPrimary();
    table.primary(['biosample_id', 'alias']);
    table
      .foreign('biosample_id', 'zcc_alias_biosample')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
}
