import { createClient, type User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);

export function isSupabaseAdmin(user: User | null | undefined): boolean {
  return user?.app_metadata?.role === 'admin';
}

export async function uploadPlayerImage(file: File): Promise<string> {
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
  const path = `players/${crypto.randomUUID()}-${safeName}`;
  const { data, error } = await supabase.storage
    .from('player-images')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  return supabase.storage.from('player-images').getPublicUrl(data.path).data.publicUrl;
}
