"use client";

import UserManagement from "./UserManagement";
import type { User } from "@supabase/supabase-js";
import MedicationManagement from "./MedicationManagement";
import LocationManagement from "./LocationManagement";
import DonorManagement from "./DonorManagement";
import type { Donor, Location, Medication } from "@/types/inventory";
import { useAdminSection } from "./AdminDashboardShell";

interface DashboardClientProps {
  initialUsers: User[];
  initialMedications: Medication[];
  initialLocations: Location[];
  initialDonors: Donor[];
}

export default function DashboardClient({
  initialUsers,
  initialMedications,
  initialLocations,
  initialDonors,
}: DashboardClientProps) {
  const section = useAdminSection();

  return (
    <div className="mx-auto max-w-6xl p-3 sm:p-6">
      <main className="mt-3 sm:mt-4">
        {section === "users" && <UserManagement initialUsers={initialUsers} />}
        {section === "medications" && (
          <MedicationManagement initialMedications={initialMedications} />
        )}
        {section === "locations" && (
          <LocationManagement initialLocations={initialLocations} />
        )}
        {section === "donors" && <DonorManagement initialDonors={initialDonors} />}
      </main>
    </div>
  );
}