import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(
        'zcc_curated_sample_somatic_snv',
        function addSampleSomaticSnvLohField(table) {
          table.string('LOH', 20).defaultTo(null).after('biallelic').alter();
        },
    );
}


export async function down(knex: Knex): Promise<void> {
}

