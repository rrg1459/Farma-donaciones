import { Suspense } from 'react';
import { connection } from 'next/server';
import { Header } from '../components/Header';
import { HeaderClient } from '../components/HeaderClient';
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
    <Suspense
      fallback={
        <>
          <HeaderClient userName="U" userRole="volunteer" />
          <div
            role="status"
            className="flex min-h-[50vh] flex-col items-center justify-center gap-3"
          >
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="text-center text-sm italic text-zinc-500 dark:text-zinc-400">
              Procesando...
            </p>
          </div>
        </>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
