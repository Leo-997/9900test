import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_therapies").del();

  // Inserts seed entries
  await knex("zcc_clinical_therapies").insert([
    {
      id: "1",
      title: "Therapy1",
      description: "this therapy1 description",
      created_by: "test-user1",
    },
  ]);
}
