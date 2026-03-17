export default function md5ToUUID(hash: string): string {
  const regexExp = /^[a-f0-9]{32}$/gi;
  if (regexExp.test(hash)) {
    const parts = [
      hash.substring(0, 8),
      hash.substring(8, 12),
      hash.substring(12, 16),
      hash.substring(16, 20),
      hash.substring(20),
    ];
    return parts.join('-');
  }

  throw new Error('Invalid MD5 string received');
}
