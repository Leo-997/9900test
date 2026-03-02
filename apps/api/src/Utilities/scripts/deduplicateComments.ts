/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/naming-convention */
import knex from 'knex';
import { Node } from 'slate';
import { IComment } from 'Models/Comments/Comments.model';
import { knexConnectionConfig } from '../../../knexfile';



const commentsTable = 'zcc_curation_comment';
const commentThreadsXrefTable = 'zcc_curation_comment_thread_xref';
const zdKnex = knex(knexConnectionConfig);

async function deduplicateComments(): Promise<void> {
  const commentsByType: Record<string, Record<string, IComment[]>> = {};

  const comments = await zdKnex.select({
    id: 'id',
    comment: 'comment',
    type: 'type',
    originalThreadType: 'original_thread_type',
    isHiddenInArchive: 'is_hidden',
    originalCreatedAt: 'created_at',
    originalCreatedBy: 'created_by',
    updatedAt: 'updated_at',
    updatedBy: 'updated_by',
    deletedAt: 'deleted_at',
    deletedBy: 'deleted_by',
  })
    .from(commentsTable)
    .orderBy('created_at', 'desc');

  for (const comment of comments) {
    let sanitisedComment = { ...comment };
    try {
      const slate: Node[] = JSON.parse(sanitisedComment.comment);
      sanitisedComment = {
        ...sanitisedComment,
        comment: slate.map((n) => Node.string(n)).join('\n'),
      };
    } catch {
      // Comment is not in slate fromat and does not need to be updated
    }

    if (!commentsByType[sanitisedComment.type]) {
      commentsByType[sanitisedComment.type] = {};
    }

    if (!commentsByType[sanitisedComment.type][sanitisedComment.comment]) {
      commentsByType[sanitisedComment.type][sanitisedComment.comment] = [];
    }

    commentsByType[sanitisedComment.type][sanitisedComment.comment].push(sanitisedComment);
  }

  for (const [, commentsOfType] of Object.entries(commentsByType)) {
    for (const [, matchingComments] of Object.entries(commentsOfType)) {
      const [representative, ...rest] = matchingComments;
      if (rest.length) {
        console.log(`Replacing the following comments with ${JSON.stringify(representative)}: ${JSON.stringify(rest)}`);

        // get all threads that the representative is a part of
        const threadsForRep = await zdKnex.select('thread_id')
          .from(commentThreadsXrefTable)
          .where('comment_id', representative.id);

        // update all threads that the rest are a part of the use the representative
        // except the ones that the representative is already a part of as that would cause conflict
        const updateQuery = zdKnex.update({
          comment_id: representative.id,
        })
          .whereIn('comment_id', rest.map((c) => c.id))
          .from(commentThreadsXrefTable)
          .whereNotIn(
            'thread_id',
            threadsForRep.map((thread) => thread.thread_id),
          );

        console.log(`Update query: ${updateQuery.toString()}`);

        await updateQuery;

        // delete remaining xref records that would have caused conflict
        const xrefDeleteQuery = zdKnex.delete()
          .from(commentThreadsXrefTable)
          .whereIn('comment_id', rest.map((c) => c.id));

        console.log(`Xref delete query: ${xrefDeleteQuery.toString()}`);

        // delete the duplicate comments
        const deleteQuery = zdKnex.update({
          deleted_at: zdKnex.fn.now(),
          deleted_by: 'sysadmin',
        })
          .whereIn('id', rest.map((c) => c.id))
          .from(commentsTable);

        console.log(`Delete query: ${deleteQuery.toString()}`);

        await deleteQuery;
      }
    }
  }

  process.exit(0);
}

deduplicateComments();
