import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_information_settings").del();

  // Inserts seed entries
  await knex("zcc_clinical_information_settings").insert([
    {
      id: "1",
      show_prior_genetic_test: true,
      show_family_history: true,
      show_personal_history: true,
      show_dysmorphic_features: true,
      slide_id: "test-id1",
    },
  ]);
}
