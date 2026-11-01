import { connection } from 'next/server';
import { Header } from '../components/Header';
import { createClient } from '../utils/supabase';
import InventoryClient from './InventoryClient';

export const instant = false;

export default async function InventoryPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let canEditBatches = false;
  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(`No se pudo verificar el rol del usuario: ${error.message}`);
    }

    canEditBatches = profile.role === 'admin' || profile.role === 'superadmin';
  }

  return (
    <>
      <Header />
      <InventoryClient canEditBatches={canEditBatches} />
    </>
  );
}
