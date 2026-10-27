'use client';

import Link from 'next/link';
import { logout } from "../actions/actions";
import PillsLogo from '../components/PillsLogo';
import FaSignOutAlt from "../svg/FaSignOutAlt";

export const AdminHeader = ({ userInitials }: { userInitials: string }) => {

  return (
    <>
      {/* Top Header */}
      <header className="bg-primary text-white p-4 shadow-md z-10 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-emerald-500 p-1 rounded-xl text-slate-950 font-black">
              <PillsLogo size={36} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">FarmaDonaciones</h1>
              <span className="text-xs text-slate-400">Almacén Central • Panel Operativo</span>
            </div>
          </Link>


          <div className="flex items-center space-x-4">

            <h2 className="font-bold text-lg leading-none">
              Administración de Usuarios
              </h2>

            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400 border border-slate-600">
              {userInitials}
            </div>





            <form action={logout} className="flex items-center">
              <button type="submit" className="text-zinc-300 dark:text-zinc-200 my-2 rounded-md font-semibold hover:bg-gray-700 dark:hover:bg-zinc-600 transition-colors cursor-pointer text-sm">
                <FaSignOutAlt size={30} />
              </button>
            </form>

          </div>
        </div>
      </header>



    </>
  );
};