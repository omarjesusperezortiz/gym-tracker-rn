import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Gym Trainer Supabase client.
// Publishable (anon) key only — safe on the client; RLS locks data per user.
const SUPABASE_URL = 'https://rpigemrnxlagywzzsxnm.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_J5-8Ks0QAV-l3chD-0wT6Q_Dd0cZ9dq';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
