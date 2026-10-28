"use client";

import { useState } from "react";
import UserManagement from "./UserManagement";
import { User } from "@supabase/supabase-js";
interface DashboardClientProps {
  userName: string;
  initialUsers: User[];
  appSettings: { key: string; value: number }[];
}

export default function DashboardClient({
  initialUsers,
}: DashboardClientProps) {
  const [isNavigating] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 p-3 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 sm:p-6">
      <div className="max-w-5xl mx-auto">

        {isNavigating && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 italic text-sm text-center dark:text-zinc-400">Procesando...</p>
          </div>
        )}

        {!isNavigating && (
          <main className="mt-3 sm:mt-4">
            <UserManagement initialUsers={initialUsers} />
          </main>
        )}
      </div>
    </div>
    // </>
  );
}