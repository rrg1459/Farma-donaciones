"use client";

import { useState } from "react";
import UserManagement from "./UserManagement";
import { User } from "@supabase/supabase-js";

interface DashboardClientProps {
  userName: string;
  userRole: string;
  initialUsers: User[];
  appSettings: { key: string; value: number }[];
}

export default function DashboardClient({
  userRole,
  initialUsers,
}: DashboardClientProps) {
  const [isNavigating] = useState(false);

  const [activeTab, setActiveTab] = useState<"metrics" | "charts" | "users" | "persons">("users");

  // 1. Definimos el tipo de las pestañas permitidas
  type TabId = "metrics" | "charts" | "users" | "persons";

  interface TabItem {
    id: TabId;
    shortLabel: string;
    longLabel: string;
  }

  // 2. Aplicamos el tipo al Array base
  const allTabs: TabItem[] = [
    // { id: "metrics", shortLabel: "Métricas", longLabel: "Resumen de Métricas" },
    // { id: "charts", shortLabel: "Gráficos", longLabel: "Gráficos de Asistencia" },
    { id: "users", shortLabel: "Usuarios", longLabel: "Gestión de Usuarios" },
    // { id: "persons", shortLabel: "Personas", longLabel: "Gestión de Personas" },
  ];

  // 3. Filtramos las pestañas basándonos en el rol del usuario
  const visibleTabs = allTabs.filter(tab => {
    if (tab.id === "users" && userRole !== "superadmin" && userRole !== "admin") {
      return false;
    }

    if (tab.id === "persons" && userRole !== "superadmin") {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">

        {isNavigating && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 italic text-sm text-center dark:text-zinc-400">Procesando...</p>
          </div>
        )}

        {!isNavigating && (
          <>
            {/* Sistema de Pestañas (Tabs) */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-700 mb-8 overflow-x-auto scrollbar-none gap-1 sm:gap-2 -mb-[1px]">
              {visibleTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-2 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap focus:outline-none ${isActive
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 z-10"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                  >
                    {/* Texto corto para móvil, largo para escritorio */}
                    <span className="md:hidden">{tab.shortLabel}</span>
                    <span className="hidden md:inline">{tab.longLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Contenido Dinámico de las Pestañas (Se protege también por seguridad del render) */}
            <main className="mt-4">
              {activeTab === "users" && (userRole === "superadmin" || userRole === "admin") && <UserManagement initialUsers={initialUsers} />}
            </main>
          </>
        )}
      </div>
    </div>
    // </>
  );
}