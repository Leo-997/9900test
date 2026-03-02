import knex from 'knex';
import { knexConnectionConfig as zdConfig } from '../../../knexfile';

const zdKnex = knex(zdConfig);

async function loadComments() {
  // set all the summary comments to type curation if they are not already
  console.log('Setting summary comments to type curation');
  await zdKnex('zcc_annotation_summary')
    .where({ type: null })
    .update({ type: 'curation' });

  // set all the summary thread comments to type curation if they are not already
  console.log('Setting summary thread comments to type curation');
  await zdKnex('zcc_annotation_summary_thread')
    .where({ type: null })
    .update({ type: 'curation' });

  // populate the sample id
  console.log('Populating sample id in summary threads');
  const distinctThreadIds: { sampleId: string, threadId: string }[] = await zdKnex('zcc_annotation_summary')
    .distinct({
      threadId: 'summary_thread_id',
      sampleId: 'sample_id',
    })
    .select();

  for (const distinctThreadId of distinctThreadIds) {
    await zdKnex('zcc_annotation_summary_thread')
      .where({ summary_thread_id: distinctThreadId.threadId })
      .update({ sample_id: distinctThreadId.sampleId });
  }

  // select all distinct comment threads
  console.log('Selecting all distinct comment threads');
  const threads = await zdKnex({ a: 'zcc_annotation_comment_thread' })
    .distinct({
      threadId: 'a.comment_thread_id',
      variantType: 'a.variant_type',
      variantId: 'a.variant_id',
      createdBy: 'a.created_by',
      createdAt: 'a.created_at',
      sampleId: 'b.sample_id',
    })
    .innerJoin('zcc_annotation_comment as b', 'a.comment_thread_id', 'b.comment_thread_id');

  // insert the threads into the summary thread table
  for (const thread of threads) {
    console.log(`Inserting thread ${thread.threadId}`);
    await zdKnex('zcc_annotation_summary_thread')
      .insert({
        variant_type: thread.variantType,
        variant_id: thread.variantId,
        created_by: thread.createdBy,
        created_at: thread.createdAt,
        sample_id: thread.sampleId,
        type: 'comment',
      })
      .onConflict(
        ['variant_type', 'variant_id', 'sample_id', 'type'],
      )
      .ignore();

    // select all the comments for this thread
    console.log(`Selecting comments for thread ${thread.threadId}`);
    const comments = await zdKnex({ a: 'zcc_annotation_comment' })
      .where({ comment_thread_id: thread.threadId })
      .select({
        commentId: 'a.comment_id',
        comment: 'a.comment',
        isDeleted: 'a.is_deleted',
        isHidden: 'a.is_hidden',
        createdBy: 'a.created_by',
        createdAt: 'a.created_at',
        updatedBy: 'a.updated_by',
        updatedAt: 'a.updated_at',
        sampleId: 'a.sample_id',
      });

    // insert the comments into the summary table
    console.log(`Inserting comments for thread ${thread.threadId}`);
    await zdKnex('zcc_annotation_summary')
      .insert(comments.map((comment) => ({
        summary: comment.comment,
        is_deleted: comment.isDeleted,
        is_hidden: comment.isHidden,
        created_by: comment.createdBy,
        created_at: comment.createdAt,
        updated_by: comment.updatedBy,
        updated_at: comment.updatedAt,
        sample_id: comment.sampleId,
        type: 'comment',
        summary_thread_id: zdKnex('zcc_annotation_summary_thread').select('summary_thread_id').where({
          variant_type: thread.variantType,
          variant_id: thread.variantId,
          sample_id: thread.sampleId,
          type: 'comment',
        }).first(),
      })))
      .onConflict(
        ['summary_thread_id', 'summary', 'type'],
      )
      .ignore();
  }

  process.exit(0);
}

loadComments();
