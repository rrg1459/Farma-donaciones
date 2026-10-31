"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { HandHeart, MapPin, Pill, Users } from "lucide-react";

type AdminSection = "users" | "medications" | "locations" | "donors";

const AdminSectionContext = createContext<AdminSection>("users");

const navItems: {
  id: AdminSection;
  nameShort: string;
  nameLarge: string;
  icon: typeof Users;
}[] = [
  {
    id: "users",
    nameShort: "Usua.",
    nameLarge: "Gestión de Usuarios",
    icon: Users,
  },
  {
    id: "medications",
    nameShort: "Meds.",
    nameLarge: "Catálogo de Medicamentos",
    icon: Pill,
  },
  {
    id: "locations",
    nameShort: "Ubics.",
    nameLarge: "Ubicaciones del Almacén",
    icon: MapPin,
  },
  {
    id: "donors",
    nameShort: "Dons.",
    nameLarge: "Registro de Donantes",
    icon: HandHeart,
  },
];

export function useAdminSection() {
  return useContext(AdminSectionContext);
}

export default function AdminDashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const [section, setSection] = useState<AdminSection>("users");
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element) || event.touches.length !== 1) {
      touchStart.current = null;
      return;
    }

    if (
      target.closest(
        'button, a, input, select, textarea, label, summary, [contenteditable="true"], [role="button"], [role="link"], [data-swipe-ignore]',
      )
    ) {
      touchStart.current = null;
      return;
    }

    let element: Element | null = target;
    while (element && element !== event.currentTarget) {
      const style = window.getComputedStyle(element);
      if (
        element.scrollWidth > element.clientWidth &&
        (style.overflowX === "auto" || style.overflowX === "scroll")
      ) {
        touchStart.current = null;
        return;
      }
      element = element.parentElement;
    }

    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) {
      return;
    }

    const currentIndex = navItems.findIndex((item) => item.id === section);
    const nextIndex = currentIndex + (deltaX < 0 ? 1 : -1);
    if (nextIndex >= 0 && nextIndex < navItems.length) {
      setSection(navItems[nextIndex].id);
    }
  }

  return (
    <AdminSectionContext.Provider value={section}>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
        <nav
          aria-label="Secciones de administración"
          className="border-b border-slate-200 bg-white px-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 sm:px-6 lg:px-8"
        >
          <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto sm:gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setSection(item.id)}
                  className={`flex min-h-12 items-center space-x-2 whitespace-nowrap border-b-2 py-3 text-xs font-medium transition hover:text-slate-700 sm:py-4 sm:text-sm ${
                    isActive
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-slate-500 dark:text-zinc-400"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="lg:hidden">{item.nameShort}</span>
                  <span className="hidden lg:inline">{item.nameLarge}</span>
                </button>
              );
            })}
          </div>
        </nav>
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            touchStart.current = null;
          }}
        >
          {children}
        </div>
      </div>
    </AdminSectionContext.Provider>
  );
}
