'use client';

import { useEffect, useState } from 'react';

interface SupabaseDataState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useSupabaseData<T>(
  loadData: () => Promise<T>,
): SupabaseDataState<T> {
  const [state, setState] = useState<SupabaseDataState<T>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    loadData()
      .then((data) => {
        if (active) {
          setState({ data, error: null, loading: false });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            data: null,
            error:
              error instanceof Error
                ? error.message
                : 'Ocurrió un error inesperado al consultar Supabase.',
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [loadData]);

  return state;
}
