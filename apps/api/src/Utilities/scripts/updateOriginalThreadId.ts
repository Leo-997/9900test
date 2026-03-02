/* eslint-disable no-await-in-loop */
import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

async function main(): Promise<void> {
  const zdKnex = knex(knexConnectionConfig);
  // get all the comments
  const comments = await zdKnex
    .select({
      commentId: 'id',
      originalThreadId: 'original_thread_id',
      originalThreadType: 'original_thread_type',
      createdAt: 'created_at',
    })
    .from('zcc_curation_comment')
    .whereNull('deleted_at');

  for (const comment of comments) {
    if (!comment.originalThreadId) {
      try {
        // Find the earliest thread this comment was a part of
        let thread = await zdKnex
          .select({
            id: 'thread_id',
          })
          .from('zcc_curation_comment_thread_xref')
          .where('comment_id', comment.commentId)
          .orderBy('created_at', 'asc')
          .first();

        if (!thread) {
          // find the closest thread with the correct type that the comment was added to by time
          // that is likely the original thread
          thread = await zdKnex
            .select({ id: 'id' })
            .from('zcc_curation_comment_thread')
            .where('thread_type', comment.originalThreadType)
            .where('created_at', '<=', comment.createdAt)
            .whereNull('deleted_at')
            .orderBy('created_at', 'desc')
            .first();
        }

        console.log(`Adding ${thread.id} to comment ${comment.commentId}`);
        await zdKnex
          .update({ original_thread_id: thread.id })
          .from('zcc_curation_comment')
          .where('id', comment.commentId);
      } catch (e) {
        console.log(e);
      }
    }
  }

  process.exit(0);
}

main();
