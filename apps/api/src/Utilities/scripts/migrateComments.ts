/* eslint-disable no-await-in-loop */
import knex from 'knex';
import { v4 as uuid } from 'uuid';
import { knexConnectionConfig } from '../../../knexfile';



const zdKnex = knex(knexConnectionConfig);

const commentThreadsTable = 'zcc_curation_comment_thread';
const commentsTable = 'zcc_curation_comment';
const commentsThreadsXrefTable = 'zcc_curation_comment_thread_xref';

interface IAnnotation {
  createdAt: string | null;
  createdBy: string | null;
  isDeleted: boolean | null;
  isHidden: boolean | null;
  reportOrder: number | null;
  sampleId: string;
  summary: string;
  summaryId: string;
  summaryThreadId: string;
  type: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  threadCreatedAt: string;
  threadCreatedBy: string;
  threadSampleId: string;
  threadId: string;
  threadType: string | null;
  variantId: string;
  variantType: string | null;
}

async function getMatchingComment(
  annotation: { summary: string; type: string | null },
): Promise<{ id: string | null; }> {
  return zdKnex.select({
    id: 'id',
  })
    .from(commentsTable)
    .where({
      comment: annotation.summary,
      type: annotation.type || 'COMMENT',
    })
    .first();
}

async function migrateComments(): Promise<void> {
  // get all unique comments
  const annotations = await zdKnex.select({
    createdAt: 'comment.created_at',
    createdBy: 'comment.created_by',
    isDeleted: 'comment.is_deleted',
    isHidden: 'comment.is_hidden',
    reportOrder: 'comment.report_order',
    sampleId: 'comment.sample_id',
    summary: 'comment.summary',
    summaryId: 'comment.summary_id',
    summaryThreadId: 'comment.summary_thread_id',
    type: 'comment.type',
    updatedAt: 'comment.updated_at',
    updatedBy: 'comment.updated_by',
    threadCreatedAt: 'thread.created_at',
    threadCreatedBy: 'thread.created_by',
    threadSampleId: 'thread.sample_id',
    threadId: 'thread.summary_thread_id',
    threadType: 'thread.type',
    variantId: 'thread.variant_id',
    variantType: 'thread.variant_type',
  })
    .from<IAnnotation[], IAnnotation[]>({ comment: 'zcc_annotation_summary' })
    .innerJoin({ thread: 'zcc_annotation_summary_thread' }, 'comment.summary_thread_id', 'thread.summary_thread_id')
    // only care about annotations that are not deleted
    .whereNot('comment.is_deleted', true)
    .orderBy([{
      column: 'createdAt',
      order: 'asc',
    }]);

  console.log(`Found ${annotations.length} annotations`);

  for (const annotation of annotations) {
    // need these to happen in order so that
    // we preserve the oldest copy of the comment
    await getMatchingComment(annotation)
      .then((result) => (
        // insert ignore the comment
        zdKnex.insert({
          id: result?.id || uuid(),
          comment: annotation.summary,
          type: annotation.type?.toUpperCase() || 'COMMENT',
          created_by: annotation.createdBy,
          created_at: annotation.createdAt,
          updated_by: annotation.updatedBy,
          updated_at: annotation.updatedAt,
          deleted_by: annotation.isDeleted ? annotation.createdBy : null,
          deleted_at: annotation.isDeleted ? annotation.createdAt : null,
        })
          .into(commentsTable)
          .onConflict()
          .ignore()
      ))
      .then(() => (
        // insert ignore the thread
        zdKnex.insert({
          id: uuid(),
          thread_type: annotation.threadType?.toUpperCase() || 'COMMENT',
          sample_id: annotation.sampleId,
          entity_type: annotation.variantType,
          entity_id: annotation.variantId,
          created_at: annotation.threadCreatedAt,
          created_by: annotation.threadCreatedBy,
        })
          .into(commentThreadsTable)
          .onConflict([
            'thread_type',
            'sample_id',
            'entity_type',
            'entity_id',
          ])
          .ignore()
      ))
      .then(() => (
        // insert the link
        zdKnex.insert({
          thread_id: zdKnex.select('id')
            .from(commentThreadsTable)
            .where({
              thread_type: annotation.threadType?.toUpperCase() || 'COMMENT',
              sample_id: annotation.sampleId,
              entity_type: annotation.variantType,
              entity_id: annotation.variantId,
            })
            .first(),
          comment_id: zdKnex.select('id')
            .from(commentsTable)
            .where({
              comment: annotation.summary,
              type: annotation.type?.toUpperCase() || 'COMMENT',
            })
            .first(),
          is_hidden: annotation.isHidden,
          report_order: annotation.reportOrder,
          created_at: annotation.createdAt,
          created_by: annotation.createdBy,
        })
          .into(commentsThreadsXrefTable)
          .onConflict(['thread_id', 'comment_id'])
          .ignore()
      ));
  }

  // get sample comments
  const sampleComments = await zdKnex.select({
    commentId: 'comment.comment_id',
    threadId: 'comment.comment_thread_id',
    comment: 'comment.comment',
    createdAt: 'comment.created_at',
    createdBy: 'comment.created_by',
    updatedAt: 'comment.updated_at',
    updatedBy: 'comment.updated_by',
    sampleId: 'sample.sample_id',
  })
    .from({ comment: 'zcc_comment' })
    .innerJoin(
      { sample: 'zcc_sample' },
      'sample.comment_thread_id',
      'comment.comment_thread_id',
    )
    // only care about annotations that are not deleted
    .whereNot('comment.is_deleted', true)
    .orderBy([{
      column: 'createdAt',
      order: 'asc',
    }]);

  console.log(`Found ${sampleComments.length} sample comments`);

  for (const sampleComment of sampleComments) {
    // need these to happen in order so that
    // we preserve the oldest copy of the comment
    await getMatchingComment({ summary: sampleComment.comment, type: 'SAMPLE' })
      .then((result) => (
        // insert ignore the comment
        zdKnex.insert({
          id: result?.id || uuid(),
          comment: sampleComment.comment,
          type: 'SAMPLE',
          created_by: sampleComment.createdBy,
          created_at: sampleComment.createdAt,
          updated_by: sampleComment.updatedBy,
          updated_at: sampleComment.updatedAt,
        })
          .into(commentsTable)
          .onConflict()
          .ignore()
      ))
      .then(() => (
        // insert ignore the thread
        zdKnex.insert({
          id: uuid(),
          thread_type: 'SAMPLE',
          sample_id: sampleComment.sampleId,
          created_at: sampleComment.createdAt,
          created_by: sampleComment.createdBy,
        })
          .into(commentThreadsTable)
          .onConflict([
            'thread_type',
            'sample_id',
            'entity_type',
            'entity_id',
          ])
          .ignore()
      ))
      .then(() => (
        // insert the link
        zdKnex.insert({
          thread_id: zdKnex.select('id')
            .from(commentThreadsTable)
            .where({
              thread_type: 'SAMPLE',
              sample_id: sampleComment.sampleId,
              entity_type: null,
              entity_id: null,
            })
            .first(),
          comment_id: zdKnex.select('id')
            .from(commentsTable)
            .where({
              comment: sampleComment.comment,
              type: 'SAMPLE',
            })
            .first(),
          created_at: sampleComment.createdAt,
          created_by: sampleComment.createdBy,
        })
          .into(commentsThreadsXrefTable)
          .onConflict(['thread_id', 'comment_id'])
          .ignore()
      ));
  }

  process.exit(0);
}

migrateComments();
