
type Mentions = {
  fullName: string,
  id: string,
};

function getMentions(content: string) {
  const reg = /@\[([^\]]*)::([^\].]+?)\]/g;
  const matches = content.matchAll(reg);

  let mentions: Mentions[] = [];
  for (let match of matches) {
    mentions.push({
      fullName: match[1],
      id: match[2],
    });
  }

  return mentions;
}


export default getMentions;