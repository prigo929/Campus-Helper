'use client';

import { type Session, type AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { toast } from 'sonner';

type GetSessionResult = {
  session: Session | null;
  error: AuthError | null;
};

const isInvalidRefreshToken = (error?: unknown) => {
  const message = error instanceof Error ? error.message : '';
  return /invalid refresh token|refresh token not found/i.test(message);
};

export async function getSafeSession(options: { silent?: boolean } = {}): Promise<GetSessionResult> {
  if (!supabase) return { session: null, error: null };

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      if (isInvalidRefreshToken(error)) {
        await supabase.auth.signOut();
        if (!options.silent) {
          toast.error('Your session expired. Please sign in again.');
        }
      } else if (!options.silent) {
        toast.error(error.message);
      }

      return { session: data?.session ?? null, error };
    }

    return { session: data?.session ?? null, error: null };
  } catch (err) {
    const error = err as AuthError;

    if (isInvalidRefreshToken(error)) {
      await supabase.auth.signOut();
      if (!options.silent) {
        toast.error('Your session expired. Please sign in again.');
      }
    } else if (!options.silent && error?.message) {
      toast.error(error.message);
    }

    return { session: null, error };
  }
}
