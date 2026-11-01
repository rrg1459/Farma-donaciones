import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createClient } from "../utils/supabase";
import { createAdminClient } from "../utils/supabase-admin";
import { initials } from "../utils/initials";
import DashboardClient from "./DashboardClient";
import { AdminHeader } from "./AdminHeader";
import AdminDashboardShell from "./AdminDashboardShell";

export const instant = false;

async function AdminDashboardData({ userRole }: { userRole: string }) {
  const supabaseAdmin = createAdminClient();
  const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Error al listar usuarios de autenticación:", error.message);
  }

  let authUsers = authData?.users || [];

  if (userRole === "admin") {
    const { data: volunteerProfiles, error: volunteerProfilesError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "volunteer");

    if (volunteerProfilesError) {
      console.error("Error al consultar perfiles de voluntarios:", volunteerProfilesError.message);
      throw new Error("No se pudieron consultar los perfiles de voluntarios.");
    }

    const allowedIds = new Set(volunteerProfiles?.map((profile) => profile.id) || []);
    authUsers = authUsers.filter((authUser) => allowedIds.has(authUser.id));
  } else if (userRole === "superadmin") {
    const { data: excludedProfiles, error: excludedProfilesError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .in("role", ["superadmin"]);

    if (excludedProfilesError) {
      console.error("Error al consultar perfiles de superadministradores:", excludedProfilesError.message);
      throw new Error("No se pudieron consultar los perfiles de superadministradores.");
    }

    const excludedIds = new Set(excludedProfiles?.map((profile) => profile.id) || []);
    authUsers = authUsers.filter((authUser) => !excludedIds.has(authUser.id));
  }

  const [medicationsResponse, locationsResponse, donorsResponse, batchesResponse] =
    await Promise.all([
      supabaseAdmin.from("medications").select("*").order("trade_name"),
      supabaseAdmin.from("locations").select("*").order("location_code"),
      supabaseAdmin.from("donors").select("*").order("name_or_company"),
      supabaseAdmin.from("batches").select("medication_id").range(0, 499),
    ]);

  if (medicationsResponse.error) {
    throw new Error(`No se pudieron consultar los medicamentos: ${medicationsResponse.error.message}`);
  }
  if (locationsResponse.error) {
    throw new Error(`No se pudieron consultar las ubicaciones: ${locationsResponse.error.message}`);
  }
  if (donorsResponse.error) {
    throw new Error(`No se pudieron consultar los donantes: ${donorsResponse.error.message}`);
  }
  if (batchesResponse.error) {
    throw new Error(`No se pudieron consultar los lotes: ${batchesResponse.error.message}`);
  }

  const medicationIdsWithBatches = new Set<string>();
  let batches = batchesResponse.data ?? [];
  let batchOffset = 0;
  while (batches.length > 0) {
    for (const batch of batches) {
      medicationIdsWithBatches.add(batch.medication_id);
    }

    batchOffset += batches.length;
    const { data: nextBatches, error: batchesError } = await supabaseAdmin
      .from("batches")
      .select("medication_id")
      .range(batchOffset, batchOffset + 499);

    if (batchesError) {
      throw new Error(`No se pudieron consultar los lotes: ${batchesError.message}`);
    }

    batches = nextBatches;
  }

  return (
    <DashboardClient
      initialUsers={authUsers}
      initialMedications={medicationsResponse.data ?? []}
      medicationIdsWithBatches={[...medicationIdsWithBatches]}
      initialLocations={locationsResponse.data ?? []}
      initialDonors={donorsResponse.data ?? []}
    />
  );
}

function AdminDashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl p-3 sm:p-6">
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-center text-sm italic text-zinc-500">
          Procesando...
        </p>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  await connection();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const userInitials = initials(profile?.full_name || "U");
  const userRole = profile?.role || "volunteer";
  const hasAccess = userRole === "admin" || userRole === "superadmin";

  if (!hasAccess) {
    redirect("/");
  }

  return (
    <>
      <AdminHeader userInitials={userInitials} />
      <AdminDashboardShell>
        <Suspense fallback={<AdminDashboardLoading />}>
          <AdminDashboardData userRole={userRole} />
        </Suspense>
      </AdminDashboardShell>
    </>
  );
}
