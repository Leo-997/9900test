import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable('zcc_assay', (table) => {
        table.dropColumn('platform');
  });

}

export async function down(knex: Knex): Promise<void> {
}

