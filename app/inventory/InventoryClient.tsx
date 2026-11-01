'use client';

import { useState, type FormEvent } from 'react';
import { FileText, Search, Snowflake } from 'lucide-react';
import {
  adminUpdateBatch,
  type BatchEditInput,
} from '../actions/admin-actions';
import type { BatchStatus } from '../../types/inventory';
import {
  getMinimumExpirationDate,
  getMinimumInitialQuantity,
  isValidExpirationDate,
  MIN_EXPIRATION_DAYS,
} from '../../lib/batchValidation';
import {
  INVENTORY_UPDATED_EVENT,
  loadInventoryRows,
  type InventoryRow,
} from '../../lib/inventoryData';
import { useSupabaseData } from '../../lib/useSupabaseData';

const statusLabels: Record<BatchStatus, string> = {
  available: 'Disponible',
  expiring_soon: 'Próximo a vencer',
  expired: 'Caducado',
  out_of_stock: 'Agotado',
  quarantine: 'En cuarentena',
};

export default function InventarioPage({
  canEditBatches,
}: {
  canEditBatches: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [editingBatch, setEditingBatch] = useState<InventoryRow | null>(null);
  const [editExpirationDate, setEditExpirationDate] = useState('');
  const [editInitialQuantity, setEditInitialQuantity] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [savingBatch, setSavingBatch] = useState(false);
  const { data, error, loading } = useSupabaseData(loadInventoryRows);
  const inventory = data?.rows ?? [];
  const minimumExpirationDate = getMinimumExpirationDate();
  const minimumInitialQuantity = editingBatch
    ? getMinimumInitialQuantity(
        editingBatch.initial_quantity,
        editingBatch.current_quantity,
      )
    : 1;
  const filteredInventory = inventory.filter((item) =>
    (item.trade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.active_ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedLocation || item.location_code === selectedLocation) &&
    (!selectedStatus || item.status === selectedStatus)
  );

  function startEditingBatch(batch: InventoryRow) {
    setEditingBatch(batch);
    setEditExpirationDate(batch.expiration_date ?? '');
    setEditInitialQuantity(String(batch.initial_quantity));
    setEditError(null);
  }

  async function saveBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingBatch) return;

    const input: BatchEditInput = {
      expiration_date: editExpirationDate,
      initial_quantity: Number(editInitialQuantity),
    };
    if (!isValidExpirationDate(input.expiration_date)) {
      setEditError(
        `La fecha de caducidad debe ser al menos ${MIN_EXPIRATION_DAYS} días a partir de hoy.`,
      );
      return;
    }
    if (
      !Number.isSafeInteger(input.initial_quantity) ||
      input.initial_quantity < minimumInitialQuantity
    ) {
      setEditError(
        `La cantidad inicial no puede ser menor que ${minimumInitialQuantity} (cantidad inicial registrada o stock actual).`,
      );
      return;
    }

    setSavingBatch(true);
    setEditError(null);
    const result = await adminUpdateBatch(editingBatch.id, input);
    setSavingBatch(false);

    if (!result.success) {
      setEditError(result.error);
      return;
    }

    setEditingBatch(null);
    window.dispatchEvent(new Event(INVENTORY_UPDATED_EVENT));
  }

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
              placeholder="Buscar por artículo, principio activo o lote..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:items-center">
            <select
              aria-label="Filtrar por ubicación"
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:w-auto sm:text-sm"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 md:w-auto sm:text-sm"
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
          className="md:overflow-hidden md:rounded-xl md:border md:border-slate-200 md:bg-white md:shadow-sm"
        >
          {error && (
            <p role="alert" className="border-b border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1080px] table-fixed text-left text-xs text-slate-600">
              <colgroup>
                <col className="w-[15%]" />
                <col className="w-[13%]" />
                <col className="w-[9%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className={canEditBatches ? 'w-[9%]' : 'w-[17%]'} />
                {canEditBatches && <col className="w-[8%]" />}
              </colgroup>
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-medium border-b border-slate-200">
                <tr>
                  <th className="px-2 py-3">Artículo</th>
                  <th className="px-2 py-3">Tipo / Principio activo</th>
                  <th className="px-2 py-3">Lote</th>
                  <th className="px-2 py-3">Ubicación</th>
                  <th className="px-2 py-3">Refrigerado</th>
                  <th className="px-2 py-3">Requiere receta</th>
                  <th className="px-2 py-3">Vencimiento</th>
                  <th className="px-2 py-3">Stock Disponible</th>
                  <th className="px-2 py-3">Estado</th>
                  {canEditBatches && (
                    <th className="px-2 py-3">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td className="px-2 py-6 text-center" colSpan={canEditBatches ? 10 : 9}>
                      Cargando inventario desde Supabase...
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredInventory.length === 0 && (
                  <tr>
                    <td className="px-2 py-6 text-center" colSpan={canEditBatches ? 10 : 9}>
                      No se encontraron lotes con esos filtros.
                    </td>
                  </tr>
                )}
                {filteredInventory.map((item) => {
                  // Lógica visual para la etiqueta de ubicación
                  const isExpired = item.days_until_expiration !== null && item.days_until_expiration < 0;
                  const locationStyle =
                    item.zone === 'Refrigeración'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200';
                  const expirationTextStyle =
                    isExpired
                      ? 'text-red-600'
                      : item.zone === 'Refrigeración'
                        ? 'text-blue-600'
                        : 'text-amber-600';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className={`break-words px-2 py-4 font-semibold text-slate-900 ${isExpired ? 'line-through decoration-red-600' : ''}`}>
                        {item.trade_name} {item.concentration}
                      </td>
                      <td className={`break-words px-2 py-4 ${isExpired ? 'line-through decoration-red-600' : ''}`}>
                        {item.item_type === 'medication'
                          ? item.active_ingredient
                          : item.item_type === 'supply' ? 'Insumo médico' : 'Equipo médico'}
                      </td>
                      <td className={`break-all px-2 py-4 font-mono ${isExpired ? 'line-through decoration-red-600' : ''}`}>{item.batch_number ?? '—'}</td>
                      <td className="break-all px-2 py-4">
                        <span className={`rounded border px-1 py-1 font-mono ${locationStyle}`}>
                          {item.location_code}
                        </span>
                      </td>
                      <td className="px-2 py-4">
                        <span className={`inline-flex flex-wrap items-center gap-1 rounded-full border px-1.5 py-1 font-semibold ${item.requires_refrigeration ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                          <Snowflake aria-hidden="true" className="h-3.5 w-3.5" />
                          {item.item_type !== 'medication'
                            ? 'No aplica'
                            : item.requires_refrigeration ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-2 py-4">
                        <span className={`inline-flex flex-wrap items-center gap-1 rounded-full border px-1.5 py-1 font-semibold ${item.requires_prescription ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                          <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                          {item.item_type !== 'medication'
                            ? 'No aplica'
                            : item.requires_prescription ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className={`break-words px-2 py-4 font-semibold ${expirationTextStyle}`}>{item.expiration_date ?? 'No aplica'}</td>
                      <td className={`break-words px-2 py-4 font-bold text-slate-900 ${isExpired ? 'line-through decoration-red-600' : ''}`}>{item.current_quantity} {item.unit ?? 'unidades'}</td>
                      <td className="break-words px-2 py-4">
                        {item.status ? statusLabels[item.status] : 'Sin estado'}
                      </td>
                      {canEditBatches && (
                        <td className="px-2 py-4">
                          {item.item_type === 'medication' && <button
                            type="button"
                            onClick={() => startEditingBatch(item)}
                            aria-label={`Editar lote ${item.batch_number ?? ''}`}
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            Editar
                          </button>}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 lg:hidden">
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
              const isExpired = item.days_until_expiration !== null && item.days_until_expiration < 0;
              const locationStyle =
                item.zone === 'Refrigeración'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';
              const expirationTextStyle =
                isExpired
                  ? 'text-red-600'
                  : item.zone === 'Refrigeración'
                    ? 'text-blue-600'
                    : 'text-amber-600';

              return (
                <article key={item.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className={`break-words font-semibold text-slate-900 ${isExpired ? 'line-through decoration-red-600' : ''}`}>
                        {item.trade_name} {item.concentration}
                      </h2>
                      <p className={`break-words text-sm text-slate-600 ${isExpired ? 'line-through decoration-red-600' : ''}`}>
                        {item.item_type === 'medication'
                          ? item.active_ingredient
                          : item.item_type === 'supply' ? 'Insumo médico' : 'Equipo médico'}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-xs text-slate-500">Ubicación</span>
                      <span className={`rounded border px-2 py-1 text-xs font-mono ${locationStyle}`}>
                        {item.location_code}
                      </span>
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Lote</dt>
                      <dd className={`break-all font-mono text-slate-800 ${isExpired ? 'line-through decoration-red-600' : ''}`}>{item.batch_number ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Vencimiento</dt>
                      <dd className={`font-semibold ${expirationTextStyle}`}>
                        {item.expiration_date ?? 'No aplica'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Refrigerado</dt>
                      <dd>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${item.requires_refrigeration ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                          <Snowflake aria-hidden="true" className="h-3.5 w-3.5" />
                          {item.item_type === 'medication' ? item.requires_refrigeration ? 'Sí' : 'No' : 'No aplica'}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Requiere receta</dt>
                      <dd>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${item.requires_prescription ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                          <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                          {item.item_type === 'medication' ? item.requires_prescription ? 'Sí' : 'No' : 'No aplica'}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Stock disponible</dt>
                      <dd className={`font-bold text-slate-900 ${isExpired ? 'line-through decoration-red-600' : ''}`}>{item.current_quantity} {item.unit ?? 'unidades'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Estado</dt>
                      <dd className="text-slate-700">
                        {item.status ? statusLabels[item.status] : 'Sin estado'}
                      </dd>
                    </div>
                  </dl>
                  {canEditBatches && item.item_type === 'medication' && (
                    <button
                      type="button"
                      onClick={() => startEditingBatch(item)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      Editar lote
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-batch-heading"
            className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl"
          >
            <h2 id="edit-batch-heading" className="text-lg font-bold text-slate-900">
              Editar lote {editingBatch.batch_number}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {editingBatch.trade_name} {editingBatch.concentration}
            </p>
            <form onSubmit={saveBatch} className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">
                  Fecha de caducidad
                </span>
                <input
                  required
                  type="date"
                  min={minimumExpirationDate}
                  value={editExpirationDate}
                  onChange={(event) => setEditExpirationDate(event.target.value)}
                  disabled={savingBatch}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                />
                <span className="block text-xs text-slate-500">
                  La fecha debe ser al menos {MIN_EXPIRATION_DAYS} días a partir de hoy.
                </span>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">
                  Cantidad inicial
                </span>
                <input
                  required
                  type="number"
                  min={minimumInitialQuantity}
                  step={1}
                  value={editInitialQuantity}
                  onChange={(event) => setEditInitialQuantity(event.target.value)}
                  disabled={savingBatch}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                />
                <span className="block text-xs text-slate-500">
                  Mínimo {minimumInitialQuantity}; no puede ser menor que la cantidad inicial registrada ni que el stock actual ({editingBatch.current_quantity}).
                </span>
              </label>
              {editError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {editError}
                </p>
              )}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  disabled={savingBatch}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingBatch}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingBatch ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}