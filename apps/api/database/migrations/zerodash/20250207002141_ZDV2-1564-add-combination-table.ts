import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_hts_drug_combinations', (table) => {
    table.uuid('id').primary();
    table.uuid('biosample_id')
      .notNullable()
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.uuid('screen_id_1').notNullable();
    table.uuid('screen_id_2').notNullable();
    table.string('combination_effect', 50).notNullable();
    table.float('effect_cmax_screen_1');
    table.float('effect_css_screen_1');
    table.float('effect_cmax_screen_2');
    table.float('effect_css_screen_2');
    table.float('combination_effect_cmax');
    table.float('combination_effect_css');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
