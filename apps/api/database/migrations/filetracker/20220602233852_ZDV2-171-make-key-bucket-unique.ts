import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('netapp', (table) => {
    table.dropPrimary();
    table.uuid('file_id').notNullable().primary().alter();
    table.string('bucket', 45).notNullable().alter();
    table.dropUnique(['key'], 'key_UNIQUE');
    table.unique([ 'key', 'bucket' ]);
  });
}


export async function down(knex: Knex): Promise<void> {
}

