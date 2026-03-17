import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_therapy_drugs").del();

  // Inserts seed entries
  await knex("zcc_clinical_therapy_drugs").insert([
    { id: "1", therapy_id: "1", drug_id: "1", alt_drug_id: "11" },
  ]);
}
