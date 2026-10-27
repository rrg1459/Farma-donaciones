import { connection } from 'next/server';
import { Header } from '../components/Header';
import DashboardClient from './DashboardClient';

export const instant = false;

export default async function DashboardPage() {
  await connection();

  return (
    <>
      <Header />
      <DashboardClient />
    </>
  );
}
