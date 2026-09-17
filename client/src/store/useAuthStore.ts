import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'CATALOG_MANAGER' | 'SALES_STAFF';
  mustChangePassword?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  logout: () => void;
  validateSession: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user) =>
        set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      validateSession: async () => {
        // If the user appears authenticated from localStorage, verify with the server
        if (!get().isAuthenticated) return;
        try {
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
          const res = await fetch(`${baseURL}/auth/profile`, {
            credentials: 'include',
          });
          if (!res.ok) {
            // Server rejected — clear stale/forged auth state
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          // Network error — clear auth state to be safe
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'talukder-admin-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;

