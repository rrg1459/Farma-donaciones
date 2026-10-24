import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { Header } from '../components/Header';

type MovementType = 'Entrada' | 'Salida';

interface InventoryMovement {
  id: string;
  date: string;
  time: string;
  type: MovementType;
  medication: string;
  batch: string;
  quantity: number;
  unit: string;
  contactLabel: 'Donante' | 'Beneficiario';
  contact: string;
  responsible: string;
}

const mockMovements: InventoryMovement[] = [
  {
    id: 'mov-001',
    date: '24 oct 2026',
    time: '10:42',
    type: 'Entrada',
    medication: 'Amoxicilina 500 mg',
    batch: 'AMX-2608-A',
    quantity: 120,
    unit: 'cápsulas',
    contactLabel: 'Donante',
    contact: 'Fundación Salud para Todos',
    responsible: 'Laura Méndez',
  },
  {
    id: 'mov-002',
    date: '24 oct 2026',
    time: '09:18',
    type: 'Salida',
    medication: 'Insulina NPH 100 UI/ml',
    batch: 'INS-7741-X',
    quantity: 4,
    unit: 'frascos',
    contactLabel: 'Beneficiario',
    contact: 'Centro Comunitario San José',
    responsible: 'Carlos Rivera',
  },
  {
    id: 'mov-003',
    date: '23 oct 2026',
    time: '15:36',
    type: 'Salida',
    medication: 'Paracetamol 500 mg',
    batch: 'PAR-9902-A',
    quantity: 60,
    unit: 'tabletas',
    contactLabel: 'Beneficiario',
    contact: 'Comedor Santa María',
    responsible: 'Laura Méndez',
  },
  {
    id: 'mov-004',
    date: '23 oct 2026',
    time: '11:05',
    type: 'Entrada',
    medication: 'Losartán 50 mg',
    batch: 'LOS-3312-C',
    quantity: 200,
    unit: 'tabletas',
    contactLabel: 'Donante',
    contact: 'Farmacia San Miguel',
    responsible: 'Ana Torres',
  },
  {
    id: 'mov-005',
    date: '22 oct 2026',
    time: '14:27',
    type: 'Salida',
    medication: 'Ibuprofeno 400 mg',
    batch: 'IBU-1140-B',
    quantity: 40,
    unit: 'tabletas',
    contactLabel: 'Beneficiario',
    contact: 'Clínica Comunitaria Norte',
    responsible: 'Carlos Rivera',
  },
  {
    id: 'mov-006',
    date: '21 oct 2026',
    time: '09:52',
    type: 'Entrada',
    medication: 'Vacuna Hepatitis B',
    batch: 'VHB-6208-R',
    quantity: 50,
    unit: 'dosis',
    contactLabel: 'Donante',
    contact: 'Red Médica Solidaria',
    responsible: 'Ana Torres',
  },
];

export default function MovementPage() {
  const totalEntries = mockMovements.filter(
    (movement) => movement.type === 'Entrada',
  ).length;
  const totalExits = mockMovements.filter(
    (movement) => movement.type === 'Salida',
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
                {mockMovements.length} registros de ejemplo ordenados del más reciente.
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
                  {mockMovements.map((movement) => {
                    const isEntry = movement.type === 'Entrada';
                    const MovementIcon = isEntry ? ArrowDownLeft : ArrowUpRight;

                    return (
                      <tr
                        key={movement.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="font-medium text-slate-800">
                            {movement.date}
                          </div>
                          <div className="text-xs text-slate-400">{movement.time}</div>
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
                            {movement.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {movement.medication}
                          </div>
                          <div className="font-mono text-xs text-slate-500">
                            Lote: {movement.batch}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-900">
                          {movement.quantity} {movement.unit}
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-xs text-slate-400">
                            {movement.contactLabel}
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
