import { connection } from 'next/server';
import DashboardPage from './dashboard/page';

export const instant = false;

export default async function Home() {
  await connection();

  return (
    <DashboardPage />
  );
}