import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(
      'zcc_curated_sample_somatic_sv',
      function changeCuratedSampleSomaticSvFields(table) {
      table.string('inframe').defaultTo(null).alter();
        },
    );
}

export async function down(knex: Knex): Promise<void> {
}

