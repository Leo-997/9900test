import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('zcc_biosample', (table) => {
      table.enum('specimen_state', [
        'fresh',
        'snap_frozen',
        'cryopreserved',
        'ffpe_block',
        'ffpe_slides',
        'other',
      ])
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}

