import { connection } from 'next/server';
import { Header } from '../components/Header';
import InventoryClient from './InventoryClient';

export const instant = false;

export default async function InventoryPage() {
  await connection();

  return (
    <>
      <Header />
      <InventoryClient />
    </>
  );
}
