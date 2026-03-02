import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("zcc_clinical_versions", (table) => {
    table.string("id").primary().notNullable();
    table.integer("version").unsigned().defaultTo(1);
    table.string("status");
    table.integer("person_age_at_death").unsigned();
    table.string("patient_vital_status");
    table.string("clinical_history");
    table.string("cancer_category");
    table.string("cancer_type");
    table.string("diagnosis", 500);
    table.string("final_diagnosis", 500);
    table.string("patient_id").notNullable();
    table.string("sample_id").notNullable();
    table.string("clinician_id");
    table.string("clinical_reviewer_id");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.string("created_by");
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.string("updated_by");

    table.index("patient_id");
    table.index("sample_id");

    table
      .foreign("patient_id")
      .references("zcc_clinical_patients.patient_id")
      .onDelete("RESTRICT")
      .onUpdate("RESTRICT");

    table
      .foreign("sample_id")
      .references("zcc_clinical_samples.sample_id")
      .onDelete("RESTRICT")
      .onUpdate("RESTRICT");

    table.engine("InnoDB");
    table.charset("utf8");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("zcc_clinical_versions");
}
