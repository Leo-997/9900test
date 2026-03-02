import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_patient_diagnosis_settings").del();

  // Inserts seed entries
  await knex("zcc_clinical_patient_diagnosis_settings").insert([
    {
      id: "1",
      clinical_version_id: "1",
      show_oncologist: true,
      show_hospital: true,
      show_time_to_mtb: true,
      show_diagnosis: true,
      show_event: true,
      show_mutation_mtb: true,
      show_sample_type: true,
      show_tumour: true,
      show_germline: true,
      show_study: false,
      show_msi_status: false,
      show_loh: false,
      show_category: false,
      show_cancer_type: false,
      show_final_diagnosis: false,
      show_contamination: false,
      show_purity: false,
      show_ploidy: false,
    }
  ]);
};
