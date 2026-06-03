/** Returns a stable anonymous browser ID stored in localStorage */
export function getFingerprint(): string {
  const key = "flowbotiq_fp";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem(key, fp);
  }
  return fp;
}
