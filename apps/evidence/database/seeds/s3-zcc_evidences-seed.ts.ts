import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Inserts seed entries
  await knex("zcc_evidences").insert([
    {
      id: "ev1",
      citationId: "c1",
      createdBy: "test-user",
    },
    {
      id: "ev2",
      citationId: "c2",
      createdBy: "test-user",
    },
    {
      id: "ev3",
      resourceId: "r1",
      createdBy: "test-user",
    },
    {
      id: "ev4",
      resourceId: "r2",
      createdBy: "test-user",
    },
  ]);
};
