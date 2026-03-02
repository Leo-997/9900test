import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("zcc_clinical_hts_drug_screening", (table) => {
    table.string("hts_drug_id").primary();
    table.string("drug_id").notNullable();
    table.string("dose_pk").nullable();
    table.string("dose_schedule").nullable();
    table.string("dose_paediatric").nullable();
    table.string("dose_tolerance").nullable();
    table.double("cmax_ng_ml").nullable();
    table.double("cmax_uM").nullable();
    table.double("css_ng_ml").nullable();
    table.double("css_uM").nullable();
    table.string("css_peak").nullable();
    table.string("max_response").nullable();
    table.string("tumour_type").nullable();
    table.double("crpc_uM").nullable();
    table.double("crpc_nM").nullable();
    table.string("paed_cancer_trial").nullable();
    table.string("include_reason").nullable();
    table.text("notes").nullable();
    table.string("blood_brain_barrier").nullable();
    table.boolean("fda_approved").nullable();
    table.boolean("tga_approved").nullable();

    table.charset("utf8");
    table.engine("InnoDB");
  });
}


export async function down(knex: Knex): Promise<void> {
}

