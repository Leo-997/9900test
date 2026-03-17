

function getRandomAvatar() {
  // first element is the background, second is the border
  const avatars: Array<string[]> = [
    ["#ED7BE0", "#DC67CE"],
    ["#D9B9F7", "#C68BFC"],
    ["#AB6EE5", "#9B51E0"],
    ["#C4BDFC", "#A297F7"],
    ["#FCE174", "#FAD74B"],
    ["#FCB874", "#F39D41"],
    ["#0EC971", "#00AB59"],
    ["#43DED3", "#27B8AF"],
    ["#B5DAFF", "#75B6FF"],
  ];

  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  return randomAvatar.join(",");
}

export default getRandomAvatar;