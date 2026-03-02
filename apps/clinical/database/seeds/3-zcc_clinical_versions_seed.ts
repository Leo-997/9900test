import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_versions").del();

  // Inserts seed entries
  await knex("zcc_clinical_versions").insert([
    {
      id: "1",
      version: "1",
      status: "In Progress",
      patient_vital_status: "Alive",
      cancer_category: "Solid tumour",
      cancer_type: "Sarcoma",
      diagnosis: "OST",
      final_diagnosis: "Osteosarcoma",
      patient_id: "P009102",
      sample_id: "LKCGP-P009102-326840-01-04-01-D1",
      mtb_date: "2022-09-13 14:28:50",
      created_by: "test_user",
      updated_by: "test_user"
    }
  ]);
};
