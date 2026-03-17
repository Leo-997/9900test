import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(
        'zcc_filtered_somatic_variants',
        function setSampleIdIndexUnique(table) {
            table.unique(['sample_id']);
            table.dropIndex('sample_id','zcc_filtered_somatic_variants_sample_id_index');
        },
    );
}

export async function down(knex: Knex): Promise<void> {
}

