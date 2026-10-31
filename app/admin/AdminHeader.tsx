'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pill } from 'lucide-react';
import { logout } from "../actions/actions";
import PillsLogo from '../components/PillsLogo';
import FaSignOutAlt from "../svg/FaSignOutAlt";

export const AdminHeader = ({ userInitials }: { userInitials: string }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-primary p-3 text-white shadow-md sm:p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">

          <div
            className="flex min-w-0 items-center space-x-2 sm:space-x-3"
          >
            <div className="shrink-0 rounded-xl bg-emerald-500 p-1 font-black text-slate-950">
              <PillsLogo size={32} />
            </div>
            <div className="min-w-0">
              <h1 className="mb-1 whitespace-nowrap text-base font-bold leading-none sm:text-lg">FarmaDonaciones</h1>
              <span className="block text-xs text-slate-400">Panel Administrativo</span>
            </div>
          </div>


          <div className="flex shrink-0 items-center gap-2 sm:gap-4">

            {/* <h2 className="sr-only font-bold leading-none sm:not-sr-only sm:block sm:text-lg">
              Panel de Administración
            </h2>

            <div aria-label={`Usuario ${userInitials}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-700 text-xs font-bold text-emerald-400">
              {userInitials}
            </div> */}

            <Link href="/dashboard" onClick={() => setIsNavigating(true)}>
              <Pill size={26} />
            </Link>

            <form action={logout} className="flex items-center">
              <button type="submit" aria-label="Cerrar sesión" title="Cerrar sesión" className="my-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-gray-700 dark:text-zinc-200 dark:hover:bg-zinc-600">
                <FaSignOutAlt size={26} />
              </button>
            </form>

          </div>
        </div>
      </header>
    </>
  );
};