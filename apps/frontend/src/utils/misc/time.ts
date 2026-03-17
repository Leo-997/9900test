export function getDaysSince(date: string) {
  let daysBetween = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) /
      (1000 * 3600 * 24)
  );
  return `${daysBetween} days ago`;
};
