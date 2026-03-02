import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_samples").del();

  // Inserts seed entries
  await knex("zcc_clinical_samples").insert([
    {
      sample_id: "LKCGP-P009102-326840-01-04-01-D1",
      patient_id: "P009102",
      zcc_sample_id: "zcc563",
      lm_subj_id: "P009102",
      biomaterial: "TT 326840-1",
      study: "PRISM",
      age_at_sample: 14,
      cancer_category: "Solid tumour",
      cancer_type: "Sarcoma",
      disease: "Bone - Osteosarcoma",
      diagnosis: "OST",
      final_diagnosis: "Osteosarcoma",
      event_type: "D1",
      tissue: "TT",
      purity: "0.87",
      ploidy: "1.96",
      msi_status: "MSS",
      contamination: 0,
      mut_burden_mb: 1.499849891,
      som_missense_snvs: 14
    }
  ]);
};
