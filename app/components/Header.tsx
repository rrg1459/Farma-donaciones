'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, ArrowUpRight, BarChart3, Boxes, MapPin, History } from 'lucide-react';
import { MedicationDelivery } from './MedicationDelivery';
import { NewDonation } from './NewDonation';
import PillsLogo from './PillsLogo';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Inventario & Stock FEFO', href: '/inventory', icon: Boxes },
    { name: 'Mapa del Almacén', href: '/map', icon: MapPin },
    { name: 'Historial de Movimientos', href: '/movements', icon: History },
  ];

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
            <button
              type="button"
              onClick={() => setIsDonationOpen(true)}
              className="bg-accent hover:bg-emerald-600 text-primary font-bold px-4 py-2 rounded-xl text-sm flex items-center space-x-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Donación</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDeliveryOpen(true)}
              className="bg-dispense hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center space-x-2 transition"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Entregar Medicamento</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400 border border-slate-600">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 whitespace-nowrap border-b-2 py-4 text-sm font-medium transition hover:text-slate-700 ${isActive
                  ? 'border-accent text-emerald-600'
                  : 'border-transparent text-slate-500'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
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