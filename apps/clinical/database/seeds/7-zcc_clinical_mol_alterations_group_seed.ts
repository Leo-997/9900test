import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_mol_alterations_group").del();

  // Inserts seed entries
  await knex("zcc_clinical_mol_alterations_group").insert([
    {
      group_id: "1",
      mol_alteration_id: "1",
      created_by: "test-user",
    },
    {
      group_id: "1",
      mol_alteration_id: "2",
      created_by: "test-user",
    },
    {
      group_id: "2",
      mol_alteration_id: "3",
      created_by: "test-user",
    },
    {
      group_id: "2",
      mol_alteration_id: "4",
      created_by: "test-user",
    },
    {
      group_id: "3",
      mol_alteration_id: "5",
      created_by: "test-user",
    },
    {
      group_id: "4",
      mol_alteration_id: "6",
      created_by: "test-user",
    },
  ]);
};
