'use client';

import { useState } from 'react';
import { KpiCard } from '../components/KpiCard';
import { Pill, AlertTriangle, XCircle, HeartHandshake, Clock, Snowflake, MapPin } from 'lucide-react';
import { loadDashboardData } from '../../lib/inventoryData';
import { useSupabaseData } from '../../lib/useSupabaseData';
import { MedicationDelivery } from '../components/MedicationDelivery';

export default function DashboardPage() {
  const { data, error, loading } = useSupabaseData(loadDashboardData);
  const [deliveryBatchId, setDeliveryBatchId] = useState<string | null>(null);

  return (
    <>
      <main className="mx-auto w-full max-w-7xl space-y-4 p-3 sm:space-y-6 sm:p-6">
        {/* SECCIÓN DE KPIS */}
        <section
          aria-label="Indicadores principales"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <KpiCard icon={<Pill className="w-6 h-6" />} subtitle="Unidades registradas en lotes" title="Total Unidades" value={data?.totalUnits.toLocaleString('es') ?? '—'}
            variant="default"
          />
          <KpiCard icon={<AlertTriangle className="w-6 h-6" />} subtitle="Requieren salida FEFO" title="Por Vencer (< 60 días)" value={data?.expiringUnits ?? '—'}
            variant="warning"
          />
          <KpiCard icon={<XCircle className="w-6 h-6" />} subtitle="Lotes marcados para retirar" title="Caducados (Retirar)" value={data?.expiredUnits ?? '—'}
            variant="danger"
          />
          <KpiCard icon={<HeartHandshake className="w-6 h-6" />} subtitle="Unidades registradas como salida" title="Donaciones Entregadas" value={data?.donatedUnits.toLocaleString('es') ?? '—'}
            variant="success"
          />
        </section>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* TABLA FEFO PRIORITARIA */}
        <section
          aria-labelledby="fefo-heading"
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
            <div>
              <h2 id="fefo-heading" className="flex items-center text-sm font-bold text-slate-900 sm:text-base">
                <Clock className="w-5 h-5 text-amber-500 mr-2" />
                Prioridad de Salida (Regla FEFO)
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">Medicamentos ordenados automáticamente por fecha de caducidad más cercana.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Medicamento / Principio Activo</th>
                  <th className="px-6 py-3">Lote</th>
                  <th className="px-6 py-3">Ubicación Física</th>
                  <th className="px-6 py-3">Vencimiento</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td className="px-6 py-6 text-center" colSpan={6}>
                      Cargando inventario desde Supabase...
                    </td>
                  </tr>
                )}
                {!loading && !error && data?.fefoItems.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-center" colSpan={6}>
                      No hay lotes disponibles en la vista FEFO.
                    </td>
                  </tr>
                )}
                {!loading && !error && data?.fefoItems.map((item) => (
                  <tr key={item.batch_id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {item.trade_name} {item.concentration}
                      </div>
                      <div className="text-xs text-slate-500">Principio Activo: {item.active_ingredient}</div>
                      {item.requires_refrigeration && (
                        <span className="inline-flex items-center text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-1">
                          <Snowflake className="w-2.5 h-2.5 mr-1" /> Refrigerado
                        </span>
                      )}
                    </td>
                    {/* <td className="px-6 py-4 font-mono text-xs text-slate-700">{item.batch_number}</td> */}
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-sm">{item.batch_number}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {item.location_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        {item.days_until_expiration < 0
                          ? `Caducado hace ${Math.abs(item.days_until_expiration)} días`
                          : `Quedan ${item.days_until_expiration} días`} ({item.expiration_date})
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{item.current_quantity} unidades</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeliveryBatchId(item.batch_id)}
                        className="text-xs bg-dispense hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        Dispensar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      {deliveryBatchId && (
        <MedicationDelivery
          initialBatchId={deliveryBatchId}
          onClose={() => setDeliveryBatchId(null)}
        />
      )}
    </>
  );
}