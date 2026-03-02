import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("zcc_clinical_patients", (table) => {
    table.string("patient_id").primary().notNullable();
    table.string("zcc_subject_id");
    table.string("internal_id");
    table.string("sex");
    table.integer("age_at_diagnosis").unsigned();
    table.integer("age_at_death").unsigned();
    table.string("viral_status");
    table.string("hospital", 500);
    table.timestamp("enrolment_date");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.engine("InnoDB");
    table.charset("utf8");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("zcc_clinical_patients");
}
