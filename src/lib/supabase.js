import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yhxdkpuivcfgudtemwtr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeGRrcHVpdmNmZ3VkdGVtd3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTM3NTgsImV4cCI6MjEwMzM4OTc1OH0.sN0ciU92473_x2RxSJu-ema-IPq75KdlzgwbcafMVcM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
