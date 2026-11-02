export function createKey(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}