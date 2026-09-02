export function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z']+/g) ?? [];
  return matches
    .map((word) => word.replace(/^'+/, "").replace(/'+$/, ""))
    .map((word) => word.replace(/'s$/, ""))
    .filter((word) => word.length > 1);
}
