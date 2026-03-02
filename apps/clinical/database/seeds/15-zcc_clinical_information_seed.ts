import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_information").del();

  // Inserts seed entries
  await knex("zcc_clinical_information").insert([
    {
      id: "1",
      prior_genetic_test: false,
      prior_genetic_test_note: "prior genetic test note note 1",
      family_history: "Yes",
      family_history_note: "family history note 1",
      personal_history:false,
      personal_history_note:"personal history note 1",
      dysmorphic_features:"Not_Reported",
      dysmorphic_features_note:"dysmorphic features note 1",
      slide_id:"test-id1"
    },
  ]);
}
