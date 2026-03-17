import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable(
        'zcc_curated_sample_somatic_snv',
        function addOutlier(table) {
            table.boolean('outlier').defaultTo(false);
        },
    ).then(() =>
      knex.schema.alterTable(
        'zcc_curated_sample_germline_snv',
        function addOutlier(table) {
          table.boolean('outlier').defaultTo(false);
        },
      ),
    );
}

export async function down(knex: Knex): Promise<void> {
}
