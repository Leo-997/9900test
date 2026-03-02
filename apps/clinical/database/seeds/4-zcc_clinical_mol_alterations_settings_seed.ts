import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("zcc_clinical_mol_alterations_settings").del();

  // Inserts seed entries
  await knex("zcc_clinical_mol_alterations_settings").insert([
    {
      id: "1",
      clinical_version_id: "1",
      show_gene: true, 
      show_alteration: true, 
      show_rna_exp: true, 
      show_pathway: true, 
      show_reported_as: true, 
      show_targeted: false, 
      show_mutation_type: false, 
      show_frequency: false, 
      show_high_relapse_risk: false, 
    }
  ]);
};
