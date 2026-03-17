import { IMentionedUser } from 'Models/Users/Users.model';

function prepSlackMentions(content: string, mentionedUsers: IMentionedUser[]): string {
  let updatedContent = content;
  for (const user of mentionedUsers) {
    const reg = new RegExp(`@\\[${user.fullName}::${user.id}\\]`, 'g');
    updatedContent = content.replace(reg, `<@${user.slackId}>`);
  }

  return updatedContent;
}

export default prepSlackMentions;
