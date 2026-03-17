import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Inserts seed entries
  await knex("zcc_citations").insert([
    {
      id: "c1",
      title: "test-pubmed-citation",
      authors: "Test Author 1, Test Author 2",
      publication: "test-publication",
      year: 2001,
      link: "test-link",
      source: "PUBMED",
      externalId: "test-external-id",
      createdBy: "test-user",
    },
    {
      id: "c2",
      title: "test-journal-citation",
      authors: "Test Author 1, Test Author 2",
      publication: "test-publication",
      year: 2007,
      link: "test-link",
      source: "JOURNAL",
      externalId: "test-external-id",
      createdBy: "test-user",
    },
    {
      id: "c3",
      title: "test-book-citation",
      authors: "Test Author 1, Test Author 2",
      publication: "test-publication",
      year: 2021,
      link: "test-link",
      source: "BOOK",
      externalId: "test-external-id",
      createdBy: "test-user",
    },
  ]);
};
