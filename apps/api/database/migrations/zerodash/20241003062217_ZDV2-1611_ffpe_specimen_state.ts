import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('zcc_biosample', (table) => {
      table.enum('specimen_state', [
        'acd_plasma',
        'buffy_coat',
        'cell_plug',
        'cells',
        'cryopreserved',
        'dna',
        'ffpe_block',
        'fresh',
        'frozen',
        'granulocytes',
        'lysed_pellet',
        'mnc',
        'pbmc',
        'pellet',
        'plasma',
        'primary_cell_culture',
        'protein',
        'rbc_lysed_pellet',
        'rna',
        'serum',
        'sst_plasma',
        'sst_serum',
        'supernatant',
        'unstained_slides',
        'whole',
        'xenograft',
        'xenograft_cell_plug',
        'xenograft_cells',
        'xenograft_whole',
        'snap_frozen',
        'ffpe_slides',
        'ffpe',
        'other',
      ])
        .alter()
        .nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
}
