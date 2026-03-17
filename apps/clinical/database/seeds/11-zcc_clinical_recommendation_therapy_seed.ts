import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_recommendation_therapy").del();

  // Inserts seed entries
  await knex("zcc_clinical_recommendation_therapy").insert([
    { recommendation_id: "1", mol_alteration_id: "1", therapy_id: "1" },
  ]);
}
