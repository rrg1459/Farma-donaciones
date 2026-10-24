// app/dashboard/inventario/page.tsx
'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from '../components/Header';
import type { BatchStatus } from '../../types/inventory';
import { mockBatches, mockFEFOItems, mockLocations } from '../../lib/mockInventory';

const statusLabels: Record<BatchStatus, string> = {
  available: 'Disponible',
  expiring_soon: 'Próximo a vencer',
  expired: 'Caducado',
  out_of_stock: 'Agotado',
  quarantine: 'En cuarentena',
};

export default function InventarioPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const mockInventory = mockFEFOItems.map((item) => {
    const batch = mockBatches.find((candidate) => candidate.id === item.batch_id);
    if (!batch) {
      throw new Error(`FEFO batch ${item.batch_id} is missing from mock batches.`);
    }

    return { ...item, id: item.batch_id, status: batch.status };
  });

  const filteredInventory = mockInventory.filter((item) =>
    (item.trade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.active_ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch_number.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedLocation || item.location_code === selectedLocation) &&
    (!selectedStatus || item.status === selectedStatus)
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
            <select
              aria-label="Filtrar por ubicación"
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todas las Ubicaciones</option>
              {mockLocations.map((location) => (
                <option key={location.id} value={location.location_code}>
                  {location.location_code}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrar por estado"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todos los estados</option>
              {Object.entries(statusLabels).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
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
                <th className="px-6 py-3">Estado</th>
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
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {item.trade_name} {item.concentration}
                    </td>
                    <td className="px-6 py-4">{item.active_ingredient}</td>
                    <td className="px-6 py-4 font-mono text-xs">{item.batch_number}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-mono rounded border ${locationStyle}`}>
                        {item.location_code}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-semibold ${item.zone === 'Refrigeración' ? 'text-blue-600' : 'text-amber-600'}`}>{item.expiration_date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{item.current_quantity} unidades</td>
                    <td className="px-6 py-4">
                      {item.status ? statusLabels[item.status] : 'Sin estado'}
                    </td>
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