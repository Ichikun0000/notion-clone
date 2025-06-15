import { atom, useAtom } from 'jotai';
import { User } from '@supabase/supabase-js';

// 認証状態を管理するenum
export enum AuthState {
  LOADING = 'LOADING',
  AUTHENTICATED = 'AUTHENTICATED', 
  UNAUTHENTICATED = 'UNAUTHENTICATED'
}

export const currentUserAtom = atom<User | null>(null);
export const authStateAtom = atom<AuthState>(AuthState.LOADING);

export const useCurrentUserStore = () => {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom); 
  const [authState, setAuthState] = useAtom(authStateAtom);

  return {
    currentUser,
    authState,
    setUser: (user: User | null) => {
      setCurrentUser(user);
      setAuthState(user ? AuthState.AUTHENTICATED : AuthState.UNAUTHENTICATED);
    },
    setLoading: () => {
      setAuthState(AuthState.LOADING);
    },
    isLoading: authState === AuthState.LOADING,
    isAuthenticated: authState === AuthState.AUTHENTICATED,
    isUnauthenticated: authState === AuthState.UNAUTHENTICATED,
  };
};


// 使い方
// const currentUserStore = useCurrentUserStore();
// currentUserStore.setUser(userData);
// currentUserStore.currentUser;
// currentUserStore.isAuthenticated;