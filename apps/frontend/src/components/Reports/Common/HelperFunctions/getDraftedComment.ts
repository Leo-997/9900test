import { localStorageKey } from '@/constants/Reports/reports';

export function getDraftedCommentId(
  defaultId: string,
  commentId?: string,
): string {
  const savedCommentsString = localStorage.getItem(localStorageKey);
  const savedComments = savedCommentsString ? JSON.parse(savedCommentsString) : {};
  if (commentId && savedComments[commentId]) {
    // for backwards compatibility, we need to keep the old drafts, but save to the new id
    const oldDraft = savedComments[commentId];
    delete savedComments[commentId];
    const newSavedComments = {
      ...savedComments,
      [defaultId]: oldDraft,
    };
    localStorage.setItem(localStorageKey, JSON.stringify(newSavedComments));
  }
  return defaultId;
}
