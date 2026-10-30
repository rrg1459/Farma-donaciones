import { connection } from 'next/server';
import { Suspense } from 'react';
import { Header } from '../components/Header';
import DashboardClient from './DashboardClient';
import { DashboardHeaderLoading } from './DashboardLoading';

export default async function DashboardPage() {
  await connection();

  return (
    <>
      <Suspense fallback={<DashboardHeaderLoading />}>
        <Header />
      </Suspense>
      <DashboardClient />
    </>
  );
}
