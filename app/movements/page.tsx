import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { Header } from '../components/Header';
import {
  mockBatches,
  mockDonors,
  mockMedications,
  mockMovements,
  mockRegisteredUsers,
} from '../../lib/mockInventory';

const movementTypeLabels = {
  donation_entry: 'Entrada por donación',
  donation_exit: 'Salida por donación',
  inventory_adjustment: 'Ajuste de inventario',
  expired_discard: 'Descarte por caducidad',
} as const;

const movementRows = [...mockMovements]
  .sort((first, second) => second.created_at.localeCompare(first.created_at))
  .map((movement) => {
    const batch = mockBatches.find((item) => item.id === movement.batch_id);
    if (!batch) {
      throw new Error(`Mock movement ${movement.id} has no related batch.`);
    }

    const medication = mockMedications.find(
      (item) => item.id === batch.medication_id,
    );
    if (!medication) {
      throw new Error(`Mock batch ${batch.id} has no related medication.`);
    }

    const donor = batch.donor_id
      ? mockDonors.find((item) => item.id === batch.donor_id)
      : undefined;
    const isEntry = movement.type === 'donation_entry';

    return {
      ...movement,
      medication: `${medication.trade_name} ${medication.concentration}`,
      batch_number: batch.batch_number,
      type_label: movementTypeLabels[movement.type],
      contact_label: isEntry ? 'Donante' : 'Destino / beneficiario',
      contact: isEntry
        ? donor?.name_or_company ?? 'Donante no registrado'
        : movement.destination_or_beneficiary ?? 'Sin destino registrado',
      responsible: movement.registered_by
        ? mockRegisteredUsers[movement.registered_by] ?? 'Usuario sin nombre'
        : 'Usuario sin nombre',
    };
  });

export default function MovementPage() {
  const totalEntries = movementRows.filter(
    (movement) => movement.type === 'donation_entry',
  ).length;
  const totalExits = movementRows.filter(
    (movement) => movement.type === 'donation_exit',
  ).length;

  return (
    <>
      <Header />
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

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Entradas registradas
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">
                  {totalEntries}
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
                  {totalExits}
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
                {movementRows.length} registros de ejemplo ordenados del más reciente.
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
                  {movementRows.map((movement) => {
                    const isEntry = movement.type === 'donation_entry';
                    const MovementIcon = isEntry ? ArrowDownLeft : ArrowUpRight;
                    const movementDate = new Date(movement.created_at);

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
                                : 'bg-violet-50 text-violet-700'
                            }`}
                          >
                            <MovementIcon className="h-3.5 w-3.5" />
                            {movement.type_label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {movement.medication}
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
                            {movement.contact_label}
                          </div>
                          <div className="font-medium text-slate-700">
                            {movement.contact}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          {movement.responsible}
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
