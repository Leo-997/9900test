import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Inserts seed entries
  await knex("zcc_resources").insert([
    {
      id: "r1",
      name: "test-pdf-resource",
      type: "PDF",
      fileId: "test-pdf-id",
      createdBy: "test-user"
    },
    {
      id: "r2",
      name: "test-img-resource",
      type: "IMG",
      fileId: "test-pdf-id",
      createdBy: "test-user"
    },
    {
      id: "r3",
      name: "test-link-resource",
      type: "LINK",
      url: "test-link-url",
      createdBy: "test-user"
    },
  ]);
};
