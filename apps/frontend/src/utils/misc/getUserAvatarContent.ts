const getUserAvatarContent = (fullName: string): string => {
  if (!fullName) return "";
  const names = fullName.split(" ");
  if (names.length > 1) {
    return (
      names[0].charAt(0).toUpperCase() +
      names[names.length - 1].charAt(0).toUpperCase()
    );
  } else {
    return names[0].charAt(0).toUpperCase() + names[0].charAt(1).toUpperCase();
  }
};

export default getUserAvatarContent;
