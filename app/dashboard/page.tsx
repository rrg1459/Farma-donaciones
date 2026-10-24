// app/dashboard/page.tsx
'use client';

import React from 'react';
// import { KpiCard } from '@/components/KpiCard';
import { KpiCard } from '../components/KpiCard';
import { Pill, AlertTriangle, XCircle, HeartHandshake, Clock, Snowflake, MapPin } from 'lucide-react';
import { Header } from '../components/Header';

// Tipos para la tabla FEFO
interface BatchItemFEFO {
  batch_id: string;
  trade_name: string;
  active_ingredient: string;
  batch_number: string;
  location_code: string;
  expiration_date: string;
  days_until_expiration: number;
  current_quantity: number;
  unit: string; // caps, frascos, tabs
  requires_refrigeration: boolean;
}

// Datos de prueba tipados
const mockFEFOItems: BatchItemFEFO[] = [
  {
    batch_id: 'b-1',
    trade_name: 'Amoxicilina 500mg',
    active_ingredient: 'Amoxicilina',
    batch_number: 'LOT-2024-089',
    location_code: 'PAS-A-SH2-T1',
    expiration_date: '2026-11-10',
    days_until_expiration: 18,
    current_quantity: 45,
    unit: 'caps',
    requires_refrigeration: false,
  },
  {
    batch_id: 'b-2',
    trade_name: 'Insulina NPH 100 UI/ml',
    active_ingredient: 'Insulina Humana',
    batch_number: 'INS-7741-X',
    location_code: 'REF-1-T2',
    expiration_date: '2026-11-24',
    days_until_expiration: 32,
    current_quantity: 12,
    unit: 'frascos',
    requires_refrigeration: true,
  },
  {
    batch_id: 'b-3',
    trade_name: 'Paracetamol 500mg',
    active_ingredient: 'Acetaminofén',
    batch_number: 'PAR-9902-A',
    location_code: 'PAS-B-SH1-T3',
    expiration_date: '2027-01-16',
    days_until_expiration: 85,
    current_quantity: 300,
    unit: 'tabs',
    requires_refrigeration: false,
  },
];

export default function DashboardPage() {
  const handleDispense = (batchId: string) => {
    alert(`Modal de Entrega:\nDispensando lote ${batchId}.\n\nSe registrará la salida automáticamente con la regla FEFO.`);
  };

  return (
    <>
      <Header />
      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* SECCIÓN DE KPIS */}
        <section
          aria-label="Indicadores principales"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <KpiCard icon={<Pill className="w-6 h-6" />} subtitle="+12% recibido este mes" title="Total Unidades" value="4,850"
            variant="default"
          />
          <KpiCard icon={<AlertTriangle className="w-6 h-6" />} subtitle="Requieren salida FEFO" title="Por Vencer (< 60 días)" value={180}
            variant="warning"
          />
          <KpiCard icon={<XCircle className="w-6 h-6" />} subtitle="En zona de cuarentena" title="Caducados (Retirar)" value={15}
            variant="danger"
          />
          <KpiCard icon={<HeartHandshake className="w-6 h-6" />} subtitle="A 320 beneficiarios" title="Donaciones Entregadas" value="1,240"
            variant="success"
          />
        </section>

        {/* TABLA FEFO PRIORITARIA */}
        <section
          aria-labelledby="fefo-heading"
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 id="fefo-heading" className="font-bold text-slate-900 flex items-center text-base">
                <Clock className="w-5 h-5 text-amber-500 mr-2" />
                Prioridad de Salida (Regla FEFO)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Medicamentos ordenados automáticamente por fecha de caducidad más cercana.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
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
                {mockFEFOItems.map((item) => (
                  <tr key={item.batch_id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{item.trade_name}</div>
                      <div className="text-xs text-slate-500">Principio Activo: {item.active_ingredient}</div>
                      {item.requires_refrigeration && (
                        <span className="inline-flex items-center text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-1">
                          <Snowflake className="w-2.5 h-2.5 mr-1" /> Refrigerado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">{item.batch_number}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {item.location_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        Quedan {item.days_until_expiration} días ({item.expiration_date})
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{item.current_quantity} {item.unit}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDispense(item.batch_id)}
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
    </>

  );
}