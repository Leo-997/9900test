import type { Knex } from 'knex';
import { v4 } from 'uuid';

export async function up(knex: Knex): Promise<void> {
  const comments = await knex.select({
    comment_id: 'id',
    comment: 'comment',
    created_at: 'created_at',
    created_by: 'created_by',
  })
    .from('zcc_clinical_comment');
  if (comments.length) {
    await knex.insert(
      comments.map((c) => ({
        ...c,
        id: v4(),
      })),
    )
      .into('zcc_clinical_comment_version');
  }
  return knex.schema.alterTable('zcc_clinical_comment', (table) => {
    table.dropColumn('comment');
  });
}

export async function down(knex: Knex): Promise<void> {
}
