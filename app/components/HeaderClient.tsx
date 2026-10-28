"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, ArrowUpRight, BarChart3, Boxes, MapPin, History } from 'lucide-react';
import { logout } from "../actions/actions";
import { MedicationDelivery } from './MedicationDelivery';
import { NewDonation } from './NewDonation';
import PillsLogo from './PillsLogo';
import FaSignOutAlt from "../svg/FaSignOutAlt";
import FcSettings from "../svg/FcSettings";

type HeaderClientProps = {
  userName: string;
  userRole: string;
};

export const HeaderClient = ({ userName, userRole }: HeaderClientProps) => {
  const pathname = usePathname();
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  const navItems = [
    { nameShort: 'Dash', nameLarge: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { nameShort: 'Stock', nameLarge: 'Inventario & Stock FEFO', href: '/inventory', icon: Boxes },
    { nameShort: 'Mapa', nameLarge: 'Mapa del Almacén', href: '/map', icon: MapPin },
    { nameShort: 'Movs.', nameLarge: 'Historial de Movimientos', href: '/movements', icon: History },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-primary p-3 text-white shadow-md sm:p-4">
        <div className="mx-auto flex max-w-7xl flex-nowrap items-center justify-between gap-1 sm:gap-2">

          <Link href="/" className="flex min-w-0 items-center space-x-2 sm:space-x-3">
            <div className="shrink-0 rounded-xl bg-emerald-500 p-1 font-black text-slate-950">
              <PillsLogo size={32} />
            </div>
            <div className="hidden min-w-0 lg:block">
              <h1 className="whitespace-nowrap text-base font-bold leading-none lg:text-lg">FarmaDonaciones</h1>
              <span className="text-xs text-slate-400">Almacén Central • Panel Operativo</span>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsDonationOpen(true)}
                aria-label="Nueva Donación"
                title="Nueva Donación"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent font-bold text-primary transition hover:bg-emerald-600 sm:w-auto sm:space-x-2 sm:px-4 sm:py-2 sm:text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva Donación</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDeliveryOpen(true)}
                aria-label="Entregar Medicamento"
                title="Entregar Medicamento"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-dispense font-bold text-white transition hover:bg-purple-700 sm:w-auto sm:space-x-2 sm:px-4 sm:py-2 sm:text-sm"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span className="hidden sm:inline">Entregar Medicamento</span>
              </button>
            </div>

            {(userRole === 'admin' || userRole === 'superadmin') && (
              <Link
                href="/admin"
                aria-label="Administración de usuarios"
                title="Administración de usuarios"
                className="inline-flex h-10 w-10 items-center justify-center flex-shrink-0"
              >
                <FcSettings size={30} />
              </Link>
            )}

            <div className="hidden h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-700 text-xs font-bold text-emerald-400 sm:flex">
              {userName}
            </div>

            <form action={logout} className="flex items-center">
              <button type="submit" aria-label="Cerrar sesión" title="Cerrar sesión" className="my-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-gray-700 dark:text-zinc-200 dark:hover:bg-zinc-600">
                <FaSignOutAlt size={26} />
              </button>
            </form>

          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto sm:gap-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 items-center space-x-2 whitespace-nowrap border-b-2 py-3 text-xs font-medium transition hover:text-slate-700 sm:py-4 sm:text-sm ${isActive
                  ? 'border-accent text-emerald-600'
                  : 'border-transparent text-slate-500'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="lg:hidden">{item.nameShort}</span>
                <span className="hidden lg:inline">{item.nameLarge}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      {isDeliveryOpen && (
        <MedicationDelivery onClose={() => setIsDeliveryOpen(false)} />
      )}
      {isDonationOpen && (
        <NewDonation onClose={() => setIsDonationOpen(false)} />
      )}
    </>
  );
};