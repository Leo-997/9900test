import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_hts_drug_hits").del();

  // Inserts seed entries
  await knex("zcc_clinical_hts_drug_hits").insert([
    {
      hts_addendum_id: "1",
      hts_drug_id: "1",
      description: "Test description 1",
      tier: "Test tier 1"
    },
    {
      hts_addendum_id: "2",
      hts_drug_id: "2",
      description: "Test description 2",
      tier: "Test tier 2"
    },
    {
      hts_addendum_id: "3",
      hts_drug_id: "3",
      description: "Test description 3",
      tier: "Test tier 3"
    },
  ]);
};
