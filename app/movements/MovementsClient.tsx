'use client';

import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import {
  loadMovementRows,
  movementTypeLabels,
} from '../../lib/inventoryData';
import { useSupabaseData } from '../../lib/useSupabaseData';

export default function MovementPage() {
  const { data: movements, error, loading } =
    useSupabaseData(loadMovementRows);
  const totalEntries =
    movements?.filter((movement) => movement.type === 'donation_entry').length ?? 0;
  const totalExits =
    movements?.filter((movement) => movement.type === 'donation_exit').length ?? 0;

  return (
    <>
      <main className="mx-auto w-full max-w-7xl space-y-6 p-6">
        <section aria-labelledby="movements-heading">
          <div className="mb-5">
            <h1
              id="movements-heading"
              className="flex items-center text-2xl font-bold text-slate-900"
            >
              <History className="mr-2 h-6 w-6 text-emerald-600" />
              Historial de Movimientos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Registro de entradas por donación y entregas de medicamentos.
            </p>
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Entradas registradas
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {loading ? '—' : totalEntries}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Salidas registradas
                </p>
                <p className="mt-1 text-2xl font-bold text-violet-600">
                  {loading ? '—' : totalExits}
                </p>
              </div>
              <div className="rounded-lg bg-violet-50 p-3 text-violet-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
          </div>

          <section
            aria-label="Movimientos recientes"
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-bold text-slate-900">Movimientos recientes</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {loading
                  ? 'Cargando movimientos desde Supabase...'
                  : `${movements?.length ?? 0} registros ordenados del más reciente.`}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3">Fecha</th>
                    <th scope="col" className="px-5 py-3">Movimiento</th>
                    <th scope="col" className="px-5 py-3">Medicamento / Lote</th>
                    <th scope="col" className="px-5 py-3">Cantidad</th>
                    <th scope="col" className="px-5 py-3">Donante / Destino</th>
                    <th scope="col" className="px-5 py-3">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && (
                    <tr>
                      <td className="px-5 py-6 text-center" colSpan={6}>
                        Consultando Supabase...
                      </td>
                    </tr>
                  )}
                  {!loading && !error && movements?.length === 0 && (
                    <tr>
                      <td className="px-5 py-6 text-center" colSpan={6}>
                        No hay movimientos registrados.
                      </td>
                    </tr>
                  )}
                  {!loading && !error && movements?.map((movement) => {
                    const isEntry = movement.type === 'donation_entry';
                    const MovementIcon = isEntry ? ArrowDownLeft : ArrowUpRight;
                    const movementDate = new Date(movement.created_at);
                    const contact = isEntry
                      ? movement.donor?.name_or_company ?? 'Donante no registrado'
                      : movement.destination_or_beneficiary ??
                        movement.motive_or_observation ??
                        'Sin destino registrado';

                    return (
                      <tr
                        key={movement.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="font-medium text-slate-800">
                            {movementDate.toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-xs text-slate-400">
                            {movementDate.toLocaleTimeString('es-MX', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isEntry
                                ? 'bg-emerald-50 text-emerald-700'
                                : movement.type === 'donation_exit'
                                  ? 'bg-violet-50 text-violet-700'
                                  : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <MovementIcon className="h-3.5 w-3.5" />
                            {movementTypeLabels[movement.type]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {movement.medication.trade_name}{' '}
                            {movement.medication.concentration}
                          </div>
                          <div className="font-mono text-xs text-slate-500">
                            Lote: {movement.batch_number}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-900">
                          {movement.quantity} unidades
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs text-slate-400">
                            {isEntry ? 'Donante' : 'Destino / motivo'}
                          </div>
                          <div className="font-medium text-slate-700">
                            {contact}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          {movement.registered_by
                            ? 'Usuario registrado'
                            : 'Sin asignar'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
