import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_curated_sample_somatic_snv', table => {
    table.boolean('in_germline').notNullable().defaultTo(false).after('LOH');
  })
}


export async function down(knex: Knex): Promise<void> {
}

