import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackLogin, trackLogout } from '../utils/analytics';

const ALLOWED_EMAIL = 'saideep.verma01@gmail.com';

const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      userEmail: null,

      login(email) {
        const trimmed = email.trim().toLowerCase();
        if (trimmed === ALLOWED_EMAIL) {
          set({ isAuthenticated: true, userEmail: trimmed });
          trackLogin('email');
          console.log(`[Auth] Login successful: ${trimmed}`);
          return true;
        }
        console.log(`[Auth] Login failed: ${trimmed} (not allowed)`);
        return false;
      },

      logout() {
        set({ isAuthenticated: false, userEmail: null });
        trackLogout();
        console.log('[Auth] User logged out');
      },
    }),
    {
      name: 'pixelreads-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore;
