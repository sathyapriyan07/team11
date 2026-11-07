import { createClient, type User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);

export function isSupabaseAdmin(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === 'admin';
}

async function uploadImage(file: File, folder: 'players' | 'flags' | 'teams' | 'competitions'): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the project URL and anon key to .env.local.');
  }
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    throw new Error('Choose a JPEG, PNG, WebP, or GIF image.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Images must be 5 MB or smaller.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { data, error } = await supabase.storage
    .from('player-images')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  return supabase.storage.from('player-images').getPublicUrl(data.path).data.publicUrl;
}

export function uploadPlayerImage(file: File): Promise<string> {
  return uploadImage(file, 'players');
}

export function uploadCountryFlag(file: File): Promise<string> {
  return uploadImage(file, 'flags');
}

export function uploadTeamLogo(file: File): Promise<string> {
  return uploadImage(file, 'teams');
}

export function uploadCompetitionLogo(file: File): Promise<string> {
  return uploadImage(file, 'competitions');
}

function getPlayerImagePath(imageUrl: string): string | undefined {
  if (!supabase || !supabaseUrl) return undefined;

  try {
    const parsedUrl = new URL(imageUrl);
    const configuredOrigin = new URL(supabaseUrl).origin;
    const bucketPath = '/storage/v1/object/public/player-images/';
    if (parsedUrl.origin !== configuredOrigin || !parsedUrl.pathname.startsWith(bucketPath)) {
      return undefined;
    }

    const path = decodeURIComponent(parsedUrl.pathname.slice(bucketPath.length));
    return path || undefined;
  } catch {
    return undefined;
  }
}

export function isManagedPlayerImageUrl(imageUrl: string): boolean {
  return getPlayerImagePath(imageUrl) !== undefined;
}

export async function deletePlayerImage(imageUrl: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the project URL and anon key to .env.local.');
  }

  const path = getPlayerImagePath(imageUrl);
  if (!path) {
    throw new Error('Only images uploaded to this app’s player-images bucket can be deleted. Use Remove to unlink other images.');
  }

  const { error } = await supabase.storage.from('player-images').remove([path]);
  if (error) throw new Error(`Image deletion failed: ${error.message}`);
}
