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
      <main className="mx-auto w-full max-w-7xl space-y-4 p-3 sm:space-y-6 sm:p-6">
        <section aria-labelledby="movements-heading">
          <div className="mb-5">
            <h1
              id="movements-heading"
              className="flex items-center text-xl font-bold text-slate-900 sm:text-2xl"
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
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm text-slate-600">
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
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${isEntry
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
                          {movement.registered_by_name ??
                            (movement.registered_by
                              ? 'Responsable no disponible'
                              : 'Sin asignar')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-3 md:hidden">
              {loading && (
                <p className="rounded-lg border border-slate-200 p-5 text-center text-sm text-slate-600">
                  Consultando Supabase...
                </p>
              )}
              {!loading && !error && movements?.length === 0 && (
                <p className="rounded-lg border border-slate-200 p-5 text-center text-sm text-slate-600">
                  No hay movimientos registrados.
                </p>
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
                  <article
                    key={movement.id}
                    className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-800">
                          {movementDate.toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-slate-400">
                          {movementDate.toLocaleTimeString('es-MX', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isEntry
                            ? 'bg-emerald-50 text-emerald-700'
                            : movement.type === 'donation_exit'
                              ? 'bg-violet-50 text-violet-700'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <MovementIcon aria-hidden="true" className="h-3.5 w-3.5" />
                        {movementTypeLabels[movement.type]}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <h3 className="font-semibold text-slate-900">
                        {movement.medication.trade_name}{' '}
                        {movement.medication.concentration}
                      </h3>
                      <p className="font-mono text-xs text-slate-500">
                        Lote: {movement.batch_number}
                      </p>
                    </div>

                    <dl className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm">
                      <div>
                        <dt className="text-xs text-slate-400">Cantidad</dt>
                        <dd className="font-bold text-slate-900">
                          {movement.quantity} unidades
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">
                          {isEntry ? 'Donante' : 'Destino / motivo'}
                        </dt>
                        <dd className="break-words font-medium text-slate-700">
                          {contact}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-slate-400">Responsable</dt>
                        <dd className="break-words text-slate-700">
                          {movement.registered_by_name ??
                            (movement.registered_by
                              ? 'Responsable no disponible'
                              : 'Sin asignar')}
                        </dd>
                      </div>
                    </dl>
                  </article>
                );
              })}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}