import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { LoginCredential, RegisterInput, User } from "@/api/types";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  login: (data: LoginCredential) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      login: async ({ email, password }) => {
        const { data } = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
          email,
          password,
        });
        set({
          accessToken: data.accessToken,
          user: data.user,
          isAuthenticated: true,
        });
        // Fetch full profile (includes Wallet.points) and merge into store
        try {
          const profileRes = await apiClient.get(API_ENDPOINTS.USERS.PROFILE, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });
          set((state) => ({
            user: state.user ? { ...state.user, ...profileRes.data.data } : null,
          }));
        } catch {}
      },

      register: async (input) => {
        await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, input);
      },

      logout: () => {
        set({ accessToken: null, user: null, isAuthenticated: false });
      },

      updateUser: (partial) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        }));
      },
    }),
    { name: "auth-store" },
  ),
);
