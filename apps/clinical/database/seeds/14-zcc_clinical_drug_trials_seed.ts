import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_drug_trials").del();

  // Inserts seed entries
  await knex("zcc_clinical_drug_trials").insert([
    {
      id: "1",
      drug_id: "1",
      trial_id: "1",
      internal_trial_id: "1",
      trial_name: "trial1",
      trial_phase_id: "1",
      trial_phase: 1,
      trial_phase_name: "phase1",
      requires_approval: true,
      note: "this is trial 1",
    },
  ]);
}
