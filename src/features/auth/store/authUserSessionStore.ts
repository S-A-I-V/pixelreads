import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../lib/supabase';
import { STORAGE_KEY_AUTH_STATE } from '../../../constants/storageConstants';

const analytics = require('../../../utils/analytics');

interface AuthUserSessionStoreType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userId: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthUserSessionStore = create<AuthUserSessionStoreType>()(
  persist(
    (set, get): AuthUserSessionStoreType => ({
      isAuthenticated: false,
      userEmail: null,
      userId: null,
      displayName: null,
      avatarUrl: null,
      isLoading: false,
      error: null,

      async login(email: string, password: string): Promise<boolean> {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return false;
          }

          const user = data.user;
          set({
            isAuthenticated: true,
            userEmail: user?.email || null,
            userId: user?.id || null,
            displayName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || null,
            avatarUrl: user?.user_metadata?.avatar_url || null,
            isLoading: false,
            error: null,
          });

          analytics.trackLogin('email');
          return true;
        } catch (e: any) {
          set({ isLoading: false, error: e.message || 'Login failed' });
          return false;
        }
      },

      async signUp(email: string, password: string): Promise<{ success: boolean; message: string }> {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
          });

          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, message: error.message };
          }

          // If email confirmation is disabled, user is immediately authenticated
          if (data.session) {
            const user = data.user;
            set({
              isAuthenticated: true,
              userEmail: user?.email || null,
              userId: user?.id || null,
              displayName: user?.email?.split('@')[0] || null,
              avatarUrl: null,
              isLoading: false,
              error: null,
            });
            analytics.trackLogin('signup');
            return { success: true, message: 'Account created!' };
          }

          set({ isLoading: false });
          return { success: true, message: 'Check your email to confirm signup.' };
        } catch (e: any) {
          set({ isLoading: false, error: e.message || 'Sign up failed' });
          return { success: false, message: e.message || 'Sign up failed' };
        }
      },

      logout(): void {
        supabase.auth.signOut();
        // Clear local library data so next user starts fresh
        AsyncStorage.removeItem('pixelreads-book-library');
        set({
          isAuthenticated: false,
          userEmail: null,
          userId: null,
          displayName: null,
          avatarUrl: null,
          error: null,
        });
        analytics.trackLogout();
      },

      async restoreSession(): Promise<void> {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            set({
              isAuthenticated: true,
              userEmail: session.user.email || null,
              userId: session.user.id || null,
              displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null,
              avatarUrl: session.user.user_metadata?.avatar_url || null,
            });
          }
        } catch (e) {
          console.warn('[Auth] Failed to restore session:', e);
        }
      },

      clearError(): void {
        set({ error: null });
      },
    }),
    {
      name: STORAGE_KEY_AUTH_STATE,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userEmail: state.userEmail,
        userId: state.userId,
        displayName: state.displayName,
        avatarUrl: state.avatarUrl,
      }),
    }
  )
);

export function selectAuthUserDisplayName(state: AuthUserSessionStoreType): string {
  return state.displayName || state.userEmail?.split('@')[0] || 'Reader';
}

export function selectIsUserAuthenticated(state: AuthUserSessionStoreType): boolean {
  return state.isAuthenticated;
}

export function selectAuthUserEmail(state: AuthUserSessionStoreType): string | null {
  return state.userEmail;
}

export default useAuthUserSessionStore;
