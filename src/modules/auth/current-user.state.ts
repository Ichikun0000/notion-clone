import { atom, useAtom } from 'jotai';
import { User } from '@supabase/supabase-js';

export const currentUserAtom = atom<User | null>(null);

export const useCurrentUserStore = () => {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom); 

  return {
    currentUser,
    set: setCurrentUser,
  };
};


// 使い方
// const currentUserStore = useCurrentUserStore();
// currentUserStore.set(userData);
// currentUserStore.currentUser;