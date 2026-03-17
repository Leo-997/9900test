import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Adding new columns
  const hasTitle = await knex.schema.hasColumn('zcc_gene_list', 'title_abbreviation');
  const hasCode = await knex.schema.hasColumn('zcc_gene_list', 'code_abbreviation');

  await knex.schema.alterTable('zcc_gene_list', async (table) => {
    if (!hasTitle) table.string('title_abbreviation');
    if (!hasCode) table.string('code_abbreviation');
  });

  // Populating with hardcoded mappings
  const updates = [
    { gene_panel: 'Neuroblastoma', title_abbreviation: 'Neuroblastoma', code_abbreviation: 'NBL' },
    { gene_panel: 'CNS', title_abbreviation: 'CNS', code_abbreviation: 'CNS' },
    { gene_panel: 'Hepatoblastoma and Hepatocellular Carcinoma', title_abbreviation: 'HB/HCC', code_abbreviation: 'HB/HCC' },
    { gene_panel: 'Leukaemia and lymphoma', title_abbreviation: 'Hematological', code_abbreviation: 'HM' },
    { gene_panel: 'Wilms tumour', title_abbreviation: 'Wilms', code_abbreviation: 'WT' },
    { gene_panel: 'Sarcoma', title_abbreviation: 'Sarcoma', code_abbreviation: 'SARC' },
    { gene_panel: 'Thyroid tumour', title_abbreviation: 'Thyroid', code_abbreviation: 'THY' },
    { gene_panel: 'No panel', title_abbreviation: null, code_abbreviation: null },
    { gene_panel: null, title_abbreviation: null, code_abbreviation: null },
  ];

  // Updating database
  await Promise.all(updates.map(async (row) => {
    const count = await knex({ list: 'zcc_gene_list' })
      .innerJoin({ version: 'zcc_gene_list_version' }, 'list.id', 'version.gene_list_id')
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .where({ 'version.gene_panel': row.gene_panel })
      .update({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'list.title_abbreviation': row.title_abbreviation,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'list.code_abbreviation': row.code_abbreviation,
      });

    // Check for whether or not the names are matching
    if (count === 0) {
      console.warn(`No matching row for gene_panel: ${row.gene_panel}`);
    }
  }));
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_gene_list', (table) => {
    table.dropColumn('title_abbreviation');
    table.dropColumn('code_abbreviation');
  });
}
