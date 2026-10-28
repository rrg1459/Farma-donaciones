'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import type { BatchStatus } from '../../types/inventory';
import { loadInventoryRows } from '../../lib/inventoryData';
import { useSupabaseData } from '../../lib/useSupabaseData';

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
  const { data, error, loading } = useSupabaseData(loadInventoryRows);
  const inventory = data?.rows ?? [];
  const filteredInventory = inventory.filter((item) =>
    (item.trade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.active_ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch_number.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedLocation || item.location_code === selectedLocation) &&
    (!selectedStatus || item.status === selectedStatus)
  );

  return (
    <>
      <main className="mx-auto w-full max-w-7xl space-y-4 p-3 sm:space-y-6 sm:p-6">
        {/* SECCIÓN DE BÚSQUEDA Y FILTROS */}
        <section
          aria-label="Búsqueda y filtros de inventario"
          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-4 sm:p-6 md:flex-row md:items-center md:justify-between"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por medicamento, principio activo o número de lote..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:items-center">
            <select
              aria-label="Filtrar por ubicación"
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:w-auto"
            >
              <option value="">Todas las Ubicaciones</option>
              {data?.locations.map((location) => (
                <option key={location.id} value={location.location_code}>
                  {location.location_code}
                </option>
              ))}
            </select>
            <select
              aria-label="Filtrar por estado"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:w-auto"
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
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          {error && (
            <p role="alert" className="border-b border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Medicamento</th>
                  <th className="w-[15%] px-3 py-3">Principio Activo</th>
                  <th className="px-6 py-3">Lote</th>
                  <th className="px-6 py-3">Ubicación</th>
                  <th className="px-6 py-3">Vencimiento</th>
                  <th className="px-6 py-3">Stock Disponible</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-center" colSpan={7}>
                      Cargando lotes desde Supabase...
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredInventory.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-center" colSpan={7}>
                      No se encontraron lotes con esos filtros.
                    </td>
                  </tr>
                )}
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
                      <td className="max-w-40 px-3 py-4">{item.active_ingredient}</td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm">{item.batch_number}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`whitespace-nowrap rounded border px-2 py-1 font-mono text-sm ${locationStyle}`}>
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
          </div>
          <div className="divide-y divide-slate-100 md:hidden">
            {loading && (
              <p className="p-5 text-center text-sm text-slate-600">
                Cargando lotes desde Supabase...
              </p>
            )}
            {!loading && !error && filteredInventory.length === 0 && (
              <p className="p-5 text-center text-sm text-slate-600">
                No se encontraron lotes con esos filtros.
              </p>
            )}
            {!loading && filteredInventory.map((item) => {
              const locationStyle =
                item.zone === 'Refrigeración'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <article key={item.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-semibold text-slate-900">
                        {item.trade_name} {item.concentration}
                      </h2>
                      <p className="break-words text-sm text-slate-600">
                        {item.active_ingredient}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded border px-2 py-1 text-xs font-mono ${locationStyle}`}>
                      {item.location_code}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Lote</dt>
                      <dd className="break-all font-mono text-slate-800">{item.batch_number}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Vencimiento</dt>
                      <dd className={`font-semibold ${item.zone === 'Refrigeración' ? 'text-blue-600' : 'text-amber-600'}`}>
                        {item.expiration_date}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Stock disponible</dt>
                      <dd className="font-bold text-slate-900">{item.current_quantity} unidades</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Estado</dt>
                      <dd className="text-slate-700">
                        {item.status ? statusLabels[item.status] : 'Sin estado'}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}