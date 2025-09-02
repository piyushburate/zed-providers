export function verifyProvider(value: string): boolean {
  const validProviders = ["vegamovies", "rogmovies"];
  return validProviders.includes(value.toLowerCase());
}
