import type { Knex } from 'knex';
import { v4 as uuid } from 'uuid';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_clinical_interpretation_comment', (table) => {
    table.string('report_type', 50).after('order').notNullable().defaultTo('MTB_REPORT');
    table.setNullable('mol_alteration_group_id');
  });

  // get all clinical interpretation comments linked to preclinical report threads
  const preclinicalReportInterpretationComments = await knex
    .select({
      id: 'zcc_clinical_comment.id',
      clinicalVersionId: 'zcc_clinical_comment_thread.clinical_version_id',
      createdBy: 'zcc_clinical_comment.created_by',
      createdAt: 'zcc_clinical_comment.created_at',
    })
    .from('zcc_clinical_comment')
    .join('zcc_clinical_comment_thread_xref', 'zcc_clinical_comment_thread_xref.comment_id', 'zcc_clinical_comment.id')
    .join('zcc_clinical_comment_thread', 'zcc_clinical_comment_thread.id', 'zcc_clinical_comment_thread_xref.thread_id')
    .where('zcc_clinical_comment_thread.thread_type', 'REPORTS')
    .andWhere('zcc_clinical_comment_thread.entity_type', 'PRECLINICAL_REPORT')
    .andWhere('zcc_clinical_comment.type', 'CLINICAL_INTERPRETATION');

  // for each of these comments, create a new comment thread and interpretation
  await Promise.all(preclinicalReportInterpretationComments.map(async (comment) => {
    // unlink comment and old thread linked to preclinical report directly
    await knex
      .delete()
      .from('zcc_clinical_comment_thread_xref')
      .where('comment_id', comment.id);

    // create a new interpretation row
    const interpretationId = uuid();
    await knex
      .insert({
        id: interpretationId,
        title: '',
        clinical_version_id: comment.clinicalVersionId,
        mol_alteration_group_id: null,
        order: 1,
        report_type: 'PRECLINICAL_REPORT',
        created_by: comment.createdBy,
        created_at: comment.createdAt,
      })
      .into('zcc_clinical_interpretation_comment');

    // create a new comment thread linked to the new interpretation
    const newThreadId = uuid();
    await knex
      .insert({
        id: newThreadId,
        thread_type: 'REPORTS',
        clinical_version_id: comment.clinicalVersionId,
        entity_id: interpretationId,
        entity_type: 'INTERPRETATION',
        created_by: comment.createdBy,
        created_at: comment.createdAt,
      })
      .into('zcc_clinical_comment_thread');

    // link the comment to the new thread
    await knex
      .insert({
        thread_id: newThreadId,
        comment_id: comment.id,
        created_by: comment.createdBy,
        created_at: comment.createdAt,
      })
      .into('zcc_clinical_comment_thread_xref');
  }));
}

export async function down(knex: Knex): Promise<void> {
}
