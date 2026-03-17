import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("zcc_clinical_samples", (table) => {
    table.string("sample_id").primary().notNullable();
    table.string("patient_id").notNullable();
    table.string("zcc_sample_id").unique();
    table.string("lm_subj_id");
    table.string("hts_id");
    table.string("biomaterial");
    table.string("study");
    table.integer("age_at_sample");
    table.string("cancer_category");
    table.string("cancer_type");
    table.string("cancer_subtype", 500);
    table.string("disease", 250);
    table.string("diagnosis", 500);
    table.string("final_diagnosis", 500);
    table.string("event_type");
    table.string("tissue");
    table.double("purity");
    table.double("ploidy");
    table.string("msi_status");
    table.double("contamination");
    table.double("contamination_score");
    table.double("mut_burden_mb");
    table.integer("som_missense_snvs");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index("patient_id");

    table
      .foreign("patient_id")
      .references("zcc_clinical_patients.patient_id")
      .onDelete("RESTRICT")
      .onUpdate("RESTRICT");

    table.engine("InnoDB");
    table.charset("utf8");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("zcc_clinical_samples");
}
