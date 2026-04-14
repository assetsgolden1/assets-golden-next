/**
 * Fallback local photos for team members.
 * Used when photo_url from Supabase is null or broken.
 */
export const photoMap: Record<string, string> = {
  'Joan Manuel Pascual': '/assets/team-joan.png',
  'Amir Kudary': '/assets/team-amir.png',
  'Liliana Lucero': '/assets/team-liliana.avif',
}

export function getLocalPhoto(name: string): string | null {
  return photoMap[name] ?? null
}
