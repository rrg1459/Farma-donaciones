import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "../utils/supabase";
import { createAdminClient } from "../utils/supabase-admin";
import { initials } from "../utils/initials";
import DashboardClient from "./DashboardClient";
import { AdminHeader } from "./AdminHeader";

export const instant = false;

export default async function AdminPage() {
  await connection();

  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // 1. Verificar sesión de usuario
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  // 2. Verificar rol en la base de datos
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const userName = profile?.full_name?.trim().split(/\s+/).slice(0, 2).join(" ") || "Usuario";
  const userInitials = initials(profile?.full_name || "U");
  const userRole = profile?.role || "volunteer";
  const hasAccess = userRole === "admin" || userRole === "superadmin";

  if (!hasAccess) {
    redirect("/");
  }

  // 3. OBTENER LOS USUARIOS DE AUTENTICACIÓN
  const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("Error al listar usuarios de autenticación:", error.message);
  }

  const { data: appSettings } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['min_age_member', 'min_age_leader', 'max_age_member', 'max_age_leader']);

  let authUsers = authData?.users || [];

  // 4. FILTRAR SI EL USUARIO ES SOLO 'admin'
  if (userRole === "admin") {
    // Un admin solo puede gestionar usuarios con rol 'volunteer'

    const { data: volunteerProfiles, error: volunteerProfilesError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("role", "volunteer");

    if (volunteerProfilesError) {
      console.error("Error al consultar perfiles de voluntarios:", volunteerProfilesError.message);
      throw new Error("No se pudieron consultar los perfiles de voluntarios.");
    }

    const allowedIds = new Set(volunteerProfiles?.map((p) => p.id) || []);

    // Filtramos la lista de authUsers dejando solo los operadores
    authUsers = authUsers.filter((authUser) => allowedIds.has(authUser.id));
  } else if (userRole === "superadmin") {
    // Traemos los IDs de los perfiles que son 'superadmin'
    const { data: excludedProfiles, error: excludedProfilesError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .in("role", ["superadmin"]);

    if (excludedProfilesError) {
      console.error("Error al consultar perfiles de superadministradores:", excludedProfilesError.message);
      throw new Error("No se pudieron consultar los perfiles de superadministradores.");
    }

    // Creamos un Set con los IDs a excluir para que la búsqueda sea ultra rápida
    const excludedIds = new Set(excludedProfiles?.map((p) => p.id) || []);

    // Filtramos la lista de authUsers eliminando los que coincidan con esos IDs
    authUsers = authUsers.filter((authUser) => !excludedIds.has(authUser.id));

  }

  return (
    <>
      <AdminHeader userInitials={userInitials} />
      <DashboardClient
        userName={userName}
        initialUsers={authUsers}
        appSettings={appSettings ?? []}
      />
    </>
  );
}