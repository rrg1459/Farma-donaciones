// app/dashboard/inventario/page.tsx
'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '../components/Header';

// Tipos tipados para el inventario completo
interface InventoryItem {
  id: string;
  trade_name: string;
  active_ingredient: string;
  batch_number: string;
  location_code: string;
  zone: string;
  expiration_date: string;
  current_quantity: number;
  unit: string;
}

// Datos de prueba completos tipados
const mockInventory: InventoryItem[] = [
  { id: 'i-1', trade_name: 'Amoxicilina 500mg', active_ingredient: 'Amoxicilina', batch_number: 'LOT-2024-089', location_code: 'PAS-A-SH2-T1', zone: 'Pasillo A', expiration_date: '2026-11-10', current_quantity: 45, unit: 'caps' },
  { id: 'i-2', trade_name: 'Insulina NPH 100 UI', active_ingredient: 'Insulina Humana', batch_number: 'INS-7741-X', location_code: 'REF-1-T2', zone: 'Refrigeración', expiration_date: '2026-11-24', current_quantity: 12, unit: 'frascos' },
  { id: 'i-3', trade_name: 'Paracetamol 500mg', active_ingredient: 'Acetaminofén', batch_number: 'PAR-9902-A', location_code: 'PAS-B-SH1-T3', zone: 'Pasillo B', expiration_date: '2027-01-16', current_quantity: 300, unit: 'tabs' },
  { id: 'i-4', trade_name: 'Losartán Potásico 50mg', active_ingredient: 'Losartán', batch_number: 'LOS-3312-C', location_code: 'PAS-A-SH1-T2', zone: 'Pasillo A', expiration_date: '2027-03-15', current_quantity: 150, unit: 'tabs' },
  { id: 'i-5', trade_name: 'Salbutamol Inhalador', active_ingredient: 'Salbutamol 100mcg', batch_number: 'SAL-8810-D', location_code: 'PAS-C-SH4-T1', zone: 'Pasillo C', expiration_date: '2027-08-20', current_quantity: 28, unit: 'frascos' },
];

export default function InventarioPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Lógica de filtrado dinámico
  const filteredInventory = mockInventory.filter((item) =>
    item.trade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.active_ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {/* SECCIÓN DE BÚSQUEDA Y FILTROS */}
        <section
          aria-label="Búsqueda y filtros de inventario"
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por medicamento, principio activo o número de lote..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm foclexoutline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Todas las Ubicaciones</option>
              <option>Pasillo A</option>
              <option>Pasillo B</option>
              <option>Refrigerador 1</option>
            </select>
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Todos los estados</option>
              <option>Disponibles</option>
              <option>Próximos a vencer</option>
            </select>
          </div>
        </section>

        {/* TABLA DE INVENTARIO COMPLETO */}
        <section
          aria-label="Inventario completo"
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Medicamento</th>
                <th className="px-6 py-3">Principio Activo</th>
                <th className="px-6 py-3">Lote</th>
                <th className="px-6 py-3">Ubicación</th>
                <th className="px-6 py-3">Vencimiento</th>
                <th className="px-6 py-3">Stock Disponible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                // Lógica visual para la etiqueta de ubicación
                const locationStyle =
                  item.zone === 'Refrigeración'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.trade_name}</td>
                    <td className="px-6 py-4">{item.active_ingredient}</td>
                    <td className="px-6 py-4 font-mono text-xs">{item.batch_number}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-mono rounded border ${locationStyle}`}>
                        {item.location_code}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-semibold ${item.zone === 'Refrigeración' ? 'text-blue-600' : 'text-amber-600'}`}>{item.expiration_date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{item.current_quantity} {item.unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}