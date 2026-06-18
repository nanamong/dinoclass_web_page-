import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: { email: string; name: string } | null;
  login: (email: string, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, name) => set({ user: { email, name } }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'dinoclass-auth-storage',
    }
  )
);
