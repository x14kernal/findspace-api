export function slugify(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/^-|-$/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
