import type { Knex } from 'knex';
import { v4 as uuid } from 'uuid';

export async function up(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    await trx.schema.createTable('zcc_curation_comment_version', (table) => {
      table.uuid('id').primary();
      table.uuid('comment_id').notNullable();
      table.text('comment').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by').notNullable();

      table.foreign('comment_id')
        .references('id')
        .inTable('zcc_curation_comment')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    });

    const existingCountRow = await trx('zcc_curation_comment_version')
      .count<{ count: string }[]>({ count: '*' });
    const existingCount = Number(existingCountRow[0]?.count ?? 0);
    if (existingCount > 0) return; // zcc_curation_comment_version has already been backfilled

    const allComments = await trx
      .select({
        commentId: 'id',
        comment: 'comment',
        createdAt: 'created_at',
        createdBy: 'created_by',
      })
      .from('zcc_curation_comment');
    if (!allComments.length) return;

    const rows = allComments.map((comment) => ({
      id: uuid(),
      comment_id: comment.commentId,
      comment: comment.comment,
      created_at: comment.createdAt,
      created_by: comment.createdBy,
    }));

    await trx.batchInsert('zcc_curation_comment_version', rows, 1000);
  });
}

export async function down(knex: Knex): Promise<void> {
}


