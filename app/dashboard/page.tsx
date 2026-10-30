import { Suspense } from 'react';
import { connection } from 'next/server';
import { Header } from '../components/Header';
import DashboardClient from './DashboardClient';

async function DashboardContent() {
  await connection();

  return (
    <>
      <Header />
      <DashboardClient />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
