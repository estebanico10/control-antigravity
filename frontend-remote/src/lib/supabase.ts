import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'antigravity_supabase_url';
const STORAGE_ANON_KEY = 'antigravity_supabase_key';
const STORAGE_LOCAL_API_KEY = 'antigravity_local_api_url';

export function getSavedConfig() {
  return {
    url: localStorage.getItem(STORAGE_URL_KEY) || import.meta.env.VITE_SUPABASE_URL || '',
    key: localStorage.getItem(STORAGE_ANON_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    localApiUrl: localStorage.getItem(STORAGE_LOCAL_API_KEY) || 'http://localhost:3001'
  };
}

export function saveConfig(url: string, key: string, localApiUrl?: string) {
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_ANON_KEY, key.trim());
  if (localApiUrl) {
    localStorage.setItem(STORAGE_LOCAL_API_KEY, localApiUrl.trim());
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSavedConfig();
  if (!url || !key) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key);
    } catch (e) {
      console.error('[SupabaseClient] Failed to initialize:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}
