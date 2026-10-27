import { connection } from 'next/server';
import { Header } from '../components/Header';
import MovementsClient from './MovementsClient';

export const instant = false;

export default async function MovementsPage() {
  await connection();

  return (
    <>
      <Header />
      <MovementsClient />
    </>
  );
}
