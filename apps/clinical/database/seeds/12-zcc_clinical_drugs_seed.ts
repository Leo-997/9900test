import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_drugs").del();

  // Inserts seed entries
  await knex("zcc_clinical_drugs").insert([
    {
      id: "1",
      external_id: "1-1",
      name: "Lorlatinib",
      has_paediatric_dose: true,
      company_id: "1",
      company_name: "Telstra",
      class: "paracetamol"
    },
    {
      id: "2",
      external_id: "1-2",
      name: "Crizonib",
      has_paediatric_dose: true,
      company_id: "2",
      company_name: "Daiichi Sankyo",
      class:"paracetamol"
    },
    {
      id: "3",
      external_id: "1-3",
      name: "Ceritinib",
      has_paediatric_dose: true,
      company_id: "2",
      company_name: "Daiichi Sankyo",
      class: "paracetamol"
    },
    {
      id: "4",
      external_id: "1-4",
      name: "Madeuptinib",
      has_paediatric_dose: true,
      company_id: "3",
      company_name: "Microsoft",
      class: "paracetamol"
    },
  ]);
}
