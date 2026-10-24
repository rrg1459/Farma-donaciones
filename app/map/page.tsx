'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertOctagon, Snowflake } from 'lucide-react';
import { Header } from '../components/Header';

interface StoredMedication {
  name: string;
  quantity: string;
}

interface WarehouseZone {
  id: string;
  title: string;
  structure: string;
  code: string;
  description: string;
  status: string;
  counts: string;
  items: string;
  medications: StoredMedication[];
  style: {
    card: string;
    selected: string;
    title: string;
    badge: string;
    description: string;
    counts: string;
    total: string;
  };
  icon?: typeof Snowflake;
}

const warehouseZones: WarehouseZone[] = [
  {
    id: 'pas-a',
    title: 'Pasillo A',
    structure: 'Estantes A1 al A4',
    code: 'PAS-A',
    description: 'Antibióticos y Antihipertensivos',
    status: 'Ambiente Controlado',
    counts: 'Estantes: 4',
    items: '195 items',
    medications: [
      { name: 'Amoxicilina 500mg', quantity: '45 caps' },
      { name: 'Losartán 50mg', quantity: '150 tabs' },
    ],
    style: {
      card: 'bg-white border-slate-200 hover:border-emerald-500',
      selected: 'border-emerald-500',
      title: 'text-slate-900',
      badge: 'bg-emerald-100 text-emerald-800',
      description: 'text-slate-500',
      counts: 'text-slate-600',
      total: 'text-emerald-600',
    },
  },
  {
    id: 'pas-b',
    title: 'Pasillo B',
    structure: 'Estantes B1 al B4',
    code: 'PAS-B',
    description: 'Analgésicos y Antiinflamatorios',
    status: 'Ambiente Libre',
    counts: 'Estantes: 4',
    items: '380 items',
    medications: [
      { name: 'Paracetamol 500mg', quantity: '300 tabs' },
      { name: 'Ibuprofeno 400mg', quantity: '80 tabs' },
    ],
    style: {
      card: 'bg-white border-slate-200 hover:border-emerald-500',
      selected: 'border-emerald-500',
      title: 'text-slate-900',
      badge: 'bg-slate-100 text-slate-600',
      description: 'text-slate-500',
      counts: 'text-slate-600',
      total: 'text-slate-800',
    },
  },
  {
    id: 'ref-1',
    title: 'Refrigeración',
    structure: 'Nivel 1 al 4 (2°C - 8°C)',
    code: 'REF-1',
    description: 'Insulinas, Vacunas y Biológicos',
    status: '2°C a 8°C',
    counts: 'Neveras: 2',
    items: '62 items',
    medications: [
      { name: 'Insulina NPH', quantity: '12 frascos' },
      { name: 'Vacunas Hepatitis B', quantity: '50 dosis' },
    ],
    style: {
      card: 'bg-blue-50/60 border-blue-200 hover:border-blue-400',
      selected: 'border-blue-400',
      title: 'text-blue-950',
      badge: 'bg-blue-200 text-blue-900',
      description: 'text-blue-600',
      counts: 'text-blue-900',
      total: 'text-blue-700',
    },
    icon: Snowflake,
  },
  {
    id: 'zon-cua',
    title: 'Cuarentena',
    structure: 'Estante Especial Z-0',
    code: 'ZON-CUA',
    description: 'Medicamentos Caducados o Dañados',
    status: 'Acceso Restringido',
    counts: 'Cajas: 3',
    items: '15 items',
    medications: [{ name: 'Aspirina Caducada', quantity: '15 tabs' }],
    style: {
      card: 'bg-red-50/60 border-red-200 hover:border-red-400',
      selected: 'border-red-300',
      title: 'text-red-950',
      badge: 'bg-red-200 text-red-900',
      description: 'text-red-600',
      counts: 'text-red-900',
      total: 'text-red-700',
    },
    icon: AlertOctagon,
  },
];

export default function MapPage() {
  const [selectedZoneId, setSelectedZoneId] = useState(warehouseZones[0].id);
  const selectedZone =
    warehouseZones.find((zone) => zone.id === selectedZoneId) ?? warehouseZones[0];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Distribución del Almacén Central
            </h2>
            <p className="text-xs text-slate-500">
              Haz clic en una zona para explorar las medicinas guardadas en ese espacio
              físico.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:col-span-2">
              {warehouseZones.map((zone) => {
                const Icon = zone.icon;
                const isSelected = zone.id === selectedZone.id;

                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedZoneId(zone.id)}
                    aria-pressed={isSelected}
                    className={`cursor-pointer rounded-lg border-2 p-4 text-left shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${zone.style.card} ${isSelected ? zone.style.selected : ''
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`flex items-center text-sm font-bold ${zone.style.title}`}
                      >
                        {Icon && <Icon className="mr-1 h-4 w-4 text-blue-500" />}
                        {zone.title}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${zone.style.badge}`}
                      >
                        {zone.status}
                      </span>
                    </div>
                    <p className={`mt-1 text-xs ${zone.style.description}`}>
                      {zone.description}
                    </p>
                    <div
                      className={`mt-3 flex justify-between text-xs ${zone.style.counts}`}
                    >
                      <span>{zone.counts}</span>
                      <span className={`font-semibold ${zone.style.total}`}>
                        {zone.items}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <section
              aria-live="polite"
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedZone.title}
                  </h3>
                  <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs">
                    {selectedZone.code}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <span className="block text-xs font-medium text-slate-400">
                      Estructura Física:
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedZone.structure}
                    </span>
                  </div>

                  <div>
                    <span className="mb-1 block text-xs font-medium text-slate-400">
                      Medicamentos almacenados aquí:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {selectedZone.medications.map((medication) => (
                        <li
                          key={medication.name}
                          className="flex justify-between rounded border border-slate-200 bg-slate-50 p-2"
                        >
                          <span>• {medication.name}</span>
                          <span className="font-bold">{medication.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <Link
                  href="/inventario"
                  className="block w-full rounded-lg bg-slate-900 px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  Ir al inventario para asignar medicamentos
                </Link>
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
