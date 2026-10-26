import Link from 'next/link';
import { ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react';
import PillsLogo from './components/PillsLogo';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between">
      {/* HEADER SIMPLE */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-[#05D49B] p-2.5 rounded-xl text-slate-950 font-black">
            <PillsLogo size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">FarmaffDonaciones</span>
        </div>
        <Link
          href="/dashboard"
          className="bg-[#05D49B] hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition flex items-center space-x-2"
        >
          <span>Ingresar al Sistema</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-xs text-[#05D49B] font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Gestión de Almacén Central Farmacéutico</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Control inteligente de <span className="text-[#05D49B]">medicamentos donados</span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Sistema especializado para el registro de lotes, control estricto de fechas de caducidad mediante la regla <strong>FEFO</strong> y trazabilidad exacta de la ubicación física en el almacén central.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-[#05D49B] hover:bg-emerald-600 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
          >
            <span>Ir al Panel Operativo</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* CARACTERÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-slate-800 text-left">
          <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-800">
            <div className="text-[#05D49B] mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white mb-1">Regla FEFO Automática</h3>
            <p className="text-xs text-slate-400">
              Prioriza la salida de los medicamentos próximos a vencer para evitar mermas innecesarias.
            </p>
          </div>

          <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-800">
            <div className="text-[#05D49B] mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white mb-1">Ubicación Física Real</h3>
            <p className="text-xs text-slate-400">
              Mapea pasillos, estantes y zonas de refrigeración (2°C-8°C) para ubicarlos en segundos.
            </p>
          </div>

          <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-800">
            <div className="text-[#05D49B] mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white mb-1">Trazabilidad Total</h3>
            <p className="text-xs text-slate-400">
              Historial detallado de cada donante, entrada, salida y beneficiario registrado.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-800">
        FarmaDonaciones • Almacén Central
      </footer>
    </div>
  );
}