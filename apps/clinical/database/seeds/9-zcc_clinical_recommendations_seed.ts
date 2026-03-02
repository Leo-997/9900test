import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_recommendations").del();

  // Inserts seed entries
  await knex("zcc_clinical_recommendations").insert([
    {
      id: "1",
      mol_alteration_group_id: "1",
      recommendation: "Need to take tablet",
      is_accepted: true,
      description: "Recommendation description",
      tier: "tier1",
      clinical_diagnosis_recommendation_id: "1",
      clinical_version_id: "1",
      created_by: "test-user1",
    },
  ]);
}
