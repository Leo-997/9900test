import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.string('zero2_category', 50).nullable().after('final_diagnosis');
    table.string('zero2_subcategory1', 500).nullable().after('zero2_category');
    table.string('zero2_subcategory2', 500).nullable().after('zero2_subcategory1');
    table.string('zero2_final_diagnosis', 500).nullable().after('zero2_subcategory2');
    table.string('who_grade', 5).nullable().after('zero2_final_diagnosis');
    table.string('histology', 200).nullable().after('who_grade');
    table.boolean('molecular_confirmation').nullable().after('histology');
    table.string('pri_site', 50).nullable().after('molecular_confirmation');
    table.string('sample_site', 50).nullable().after('pri_site');
  });
}


export async function down(knex: Knex): Promise<void> {
}

