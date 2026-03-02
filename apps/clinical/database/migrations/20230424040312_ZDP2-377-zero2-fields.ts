import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_clinical_samples', (table) => {
    table.string('zero2_category', 50).after('final_diagnosis');
    table.string('zero2_subcategory1', 500).after('zero2_category');
    table.string('zero2_subcategory2', 500).after('zero2_subcategory1');
    table.string('zero2_final_diagnosis', 500).after('zero2_subcategory2');
  });

  await knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.string('zero2_category', 50).after('final_diagnosis');
    table.string('zero2_subcategory1', 500).after('zero2_category');
    table.string('zero2_subcategory2', 500).after('zero2_subcategory1');
    table.string('zero2_final_diagnosis', 500).after('zero2_subcategory2');
  });

  return knex.schema.alterTable('zcc_clinical_diagnosis_recommendations', (table) => {
    table.string('recommended_zero2_category', 50).after('recommended_cancer_type');
    table.string('recommended_zero2_subcategory1', 500).after('recommended_zero2_category');
    table.string('recommended_zero2_subcategory2', 500).after('recommended_zero2_subcategory1');
    table.string('recommended_zero2_final_diagnosis', 500).after('recommended_zero2_subcategory2');
  });
}


export async function down(knex: Knex): Promise<void> {
}

