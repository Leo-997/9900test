import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_consequence", (table) => {
    table.string('consequence').primary();
    table.enum('impact', ['HIGH', 'MEDIUM', 'LOW']).notNullable();

    table.engine('InnoDB');
    table.charset('utf8');
  }).then(async () => {
    await knex.schema.createTable('zcc_consequence_variant', (table) => {
      table.string('consequence').notNullable();
      table.string('variant_id').notNullable();
      table.foreign('consequence').references('zcc_consequence.consequence');
      table.foreign('variant_id').references('zcc_curated_snv.variant_id');
      table.unique(['consequence', 'variant_id']);

      table.engine('InnoDB');
      table.charset('utf8');
    })
  });
}


export async function down(knex: Knex): Promise<void> {
}

