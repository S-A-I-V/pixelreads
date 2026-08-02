import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          return true;
        }
        return false;
      },

      logout() {
        set({ isAuthenticated: false, userEmail: null });
      },
    }),
    {
      name: 'pixelreads-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore;
