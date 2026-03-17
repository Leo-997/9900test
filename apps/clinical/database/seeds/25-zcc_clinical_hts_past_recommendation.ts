import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_hts_past_recommendations").del();

  // Inserts seed entries
  await knex("zcc_clinical_hts_past_recommendations").insert([
    {
      hts_addendum_id: "1",
      recommendation_id: "01996ba8-9922-40db-86df-691ccc4e41f5",
    },
    {
      hts_addendum_id: "2",
      recommendation_id: "15a40c65-d242-484d-b54f-fb9a124b1843",
    },
    {
      hts_addendum_id: "3",
      recommendation_id: "1f495e91-50bd-44cf-a75e-8bb607e1663e",
    },
  ]);
};
