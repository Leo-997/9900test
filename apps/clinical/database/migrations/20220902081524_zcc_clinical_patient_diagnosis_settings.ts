import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(
    "zcc_clinical_patient_diagnosis_settings",
    (table) => {
      table.string("id").primary().notNullable();
      table.string("clinical_version_id").notNullable();
      table.boolean("show_oncologist").defaultTo(true);
      table.boolean("show_hospital").defaultTo(true);
      table.boolean("show_time_to_mtb").defaultTo(true);
      table.boolean("show_diagnosis").defaultTo(true);
      table.boolean("show_event").defaultTo(true);
      table.boolean("show_mutation_mtb").defaultTo(true);
      table.boolean("show_sample_type").defaultTo(true);
      table.boolean("show_tumor").defaultTo(true);
      table.boolean("show_germline").defaultTo(true);
      table.boolean("show_enrolment").defaultTo(false);
      table.boolean("show_study").defaultTo(false);
      table.boolean("show_msi_status").defaultTo(false);
      table.boolean("show_loh").defaultTo(false);
      table.boolean("show_category").defaultTo(false);
      table.boolean("show_cancer_type").defaultTo(false);
      table.boolean("show_final_diagnosis").defaultTo(false);
      table.boolean("show_contamination").defaultTo(false);
      table.boolean("show_purity").defaultTo(false);
      table.boolean("show_ploidy").defaultTo(false);
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
      table.string("updated_by").nullable();

      table.index("clinical_version_id", "clinical_version_id");

      table
        .foreign("clinical_version_id", "clinical_version_id")
        .references("zcc_clinical_versions.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");

      table.engine("InnoDB");
      table.charset("utf8");
    }
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("zcc_clinical_patient_diagnosis_settings");
}
