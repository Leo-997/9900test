import { IClinicalComment } from '../../types/Comments/ClinicalComments.types';
import { ICurationComment } from '../../types/Comments/CurationComments.types';
import { IUser } from '../../types/Auth/User.types';

const getCommenter = (
  comment: IClinicalComment | ICurationComment,
  commenter?: IUser,
  currentUserId?: string,
  isUpdater = false,
):string => {
  if (commenter) {
    if (
      (currentUserId === commenter?.id)
      || (isUpdater && currentUserId === comment.updatedBy)
    ) return 'Me';

    return `${commenter.givenName} ${commenter.familyName}`;
  }

  return 'Unknown user';
};

export default getCommenter;
