// app/actions/admin-actions.ts
'use server'

import { createAdminClient } from '../utils/supabase-admin'
import { createClient } from '../utils/supabase'
import { AdminUserAttributes } from '@supabase/supabase-js'
import type {
  Donor,
  Location,
  Medication,
  PharmaceuticalForm,
} from '../../types/inventory'

const supabaseAdmin = createAdminClient();

type AdminActorRole = 'admin' | 'superadmin'
type CatalogActionResult = { success: true } | { success: false; error: string }

export type MedicationInput = Pick<
  Medication,
  | 'trade_name'
  | 'active_ingredient'
  | 'concentration'
  | 'pharmaceutical_form'
  | 'requires_refrigeration'
  | 'requires_prescription'
>
export type LocationInput = Pick<
  Location,
  'zone' | 'shelf_unit' | 'tier_bin' | 'location_code' | 'description'
>
export type DonorInput = Pick<
  Donor,
  'name_or_company' | 'contact_phone' | 'contact_email' | 'donor_type'
>

const pharmaceuticalForms: PharmaceuticalForm[] = [
  'tablet_pill',
  'capsule',
  'syrup_suspension',
  'injectable_ampoule',
  'cream_ointment',
  'drops',
  'inhaler',
  'other',
]

// Función auxiliar para verificar si el usuario actual es admin o superadmin
async function checkAdminActor(): Promise<AdminActorRole> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin' && profile?.role !== 'admin') {
    throw new Error('Acceso denegado: No eres admin ni superadmin')
  }

  return profile.role as AdminActorRole
}

async function runCatalogAdminAction(
  action: () => Promise<void>,
): Promise<CatalogActionResult> {
  try {
    await checkAdminActor()
    await action()
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

function requireText(value: string, label: string, maxLength = 200): string {
  const normalized = value.trim()
  if (!normalized) {
    throw new Error(`${label} es obligatorio.`)
  }
  if (normalized.length > maxLength) {
    throw new Error(`${label} no puede superar ${maxLength} caracteres.`)
  }
  return normalized
}

function getCatalogDatabaseError(error: { code?: string; message: string }) {
  if (error.code === '23503') {
    return 'No se puede eliminar porque existen lotes relacionados.'
  }
  if (error.code === '23505') {
    return 'Ya existe un registro con ese código de ubicación.'
  }
  if (error.code === 'PGRST116') {
    return 'El registro ya no existe.'
  }
  return error.message
}

export async function adminSaveMedication(
  id: string | null,
  input: MedicationInput,
): Promise<CatalogActionResult> {
  return runCatalogAdminAction(async () => {
    const medication = {
      trade_name: requireText(input.trade_name, 'El nombre comercial'),
      active_ingredient: requireText(input.active_ingredient, 'El principio activo'),
      concentration: requireText(input.concentration, 'La concentración', 100),
      pharmaceutical_form: input.pharmaceutical_form,
      requires_refrigeration: Boolean(input.requires_refrigeration),
      requires_prescription: Boolean(input.requires_prescription),
    }

    if (!pharmaceuticalForms.includes(medication.pharmaceutical_form)) {
      throw new Error('La forma farmacéutica no es válida.')
    }

    const query = id
      ? supabaseAdmin.from('medications').update(medication).eq('id', id)
      : supabaseAdmin.from('medications').insert(medication)
    const { error } = await query.select('id').single()
    if (error) {
      throw new Error(getCatalogDatabaseError(error))
    }
  })
}

export async function adminDeleteMedication(
  id: string,
): Promise<CatalogActionResult> {
  return runCatalogAdminAction(async () => {
    const { error } = await supabaseAdmin
      .from('medications')
      .delete()
      .eq('id', id)
      .select('id')
      .single()
    if (error) {
      throw new Error(getCatalogDatabaseError(error))
    }
  })
}

export async function adminSaveLocation(
  id: string | null,
  input: LocationInput,
): Promise<CatalogActionResult> {
  return runCatalogAdminAction(async () => {
    const location = {
      zone: requireText(input.zone, 'La zona'),
      shelf_unit: requireText(input.shelf_unit, 'El estante'),
      tier_bin: requireText(input.tier_bin, 'El nivel o casillero'),
      location_code: requireText(input.location_code, 'El código', 100),
      description: input.description?.trim()
        ? requireText(input.description, 'La descripción', 500)
        : null,
    }

    const query = id
      ? supabaseAdmin.from('locations').update(location).eq('id', id)
      : supabaseAdmin.from('locations').insert(location)
    const { error } = await query.select('id').single()
    if (error) {
      throw new Error(getCatalogDatabaseError(error))
    }
  })
}

export async function adminDeleteLocation(
  id: string,
): Promise<CatalogActionResult> {
  return runCatalogAdminAction(async () => {
    const { error } = await supabaseAdmin
      .from('locations')
      .delete()
      .eq('id', id)
      .select('id')
      .single()
    if (error) {
      throw new Error(getCatalogDatabaseError(error))
    }
  })
}

export async function adminSaveDonor(
  id: string | null,
  input: DonorInput,
): Promise<CatalogActionResult> {
  return runCatalogAdminAction(async () => {
    const donor = {
      name_or_company: requireText(input.name_or_company, 'El nombre del donante'),
      contact_phone: input.contact_phone?.trim()
        ? requireText(input.contact_phone, 'El teléfono', 50)
        : null,
      contact_email: input.contact_email?.trim()
        ? requireText(input.contact_email, 'El correo electrónico', 254)
        : null,
      donor_type: requireText(input.donor_type, 'El tipo de donante', 50),
    }

    if (!['individual', 'pharmacy', 'ngo', 'laboratory'].includes(donor.donor_type)) {
      throw new Error('El tipo de donante no es válido.')
    }

    if (
      donor.contact_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donor.contact_email)
    ) {
      throw new Error('Ingresa un correo electrónico válido.')
    }

    const query = id
      ? supabaseAdmin.from('donors').update(donor).eq('id', id)
      : supabaseAdmin.from('donors').insert(donor)
    const { error } = await query.select('id').single()
    if (error) {
      throw new Error(getCatalogDatabaseError(error))
    }
  })
}

export async function adminDeleteDonor(
  id: string,
): Promise<CatalogActionResult> {
  return runCatalogAdminAction(async () => {
    const { error } = await supabaseAdmin
      .from('donors')
      .delete()
      .eq('id', id)
      .select('id')
      .single()
    if (error) {
      throw new Error(getCatalogDatabaseError(error))
    }
  })
}

// 1. CREAR USUARIO
export async function adminCreateUser(email: string, password: string, fullName: string) {
  try {
    await checkAdminActor()
    const normalizedRole = 'volunteer'

    // 1. Crear en Supabase Auth
    // Guardamos 'role' dentro de los metadatos. Si tienes un trigger en Postgres, 
    // asegúrate de que tu función SQL lea: new.raw_user_meta_data->>'role'
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: normalizedRole }
    })

    if (error) return { success: false, error: error.message }

    const newUserId = data.user.id

    // 2. Forzar inserción o actualización (Upsert) en la tabla 'profiles'
    // Esto asegura que si el trigger nativo ya insertó una fila vacía, nosotros la llenemos con el nombre y ROL correctos.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUserId,
        full_name: fullName,
        role: normalizedRole,
        email: email
      })

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      return { success: false, error: `Error al registrar rol en perfil: ${profileError.message}` }
    }

    return { success: true, user: data.user }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido';
    return { success: false, error: errorMessage };
  }
}

// 2. ACTUALIZAR USUARIO
export async function adminUpdateUser(
  userId: string,
  updates: { email?: string; password?: string; fullName?: string; role?: string; ban?: boolean }
) {
  try {
    const actorRole = await checkAdminActor()

    if (actorRole === 'admin') {
      const { data: targetProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!targetProfile || targetProfile.role !== 'volunteer') {
        throw new Error('Acceso denegado: solo puedes editar usuarios volunteer')
      }
    }

    const payload: AdminUserAttributes = {}

    // Si viene un correo nuevo, lo inyectamos al Auth payload
    if (updates.email) payload.email = updates.email
    if (updates.password) payload.password = updates.password

    // Modificamos metadatos en Auth
    if (updates.fullName || updates.role) {
      payload.user_metadata = {
        ...(updates.fullName ? { full_name: updates.fullName } : {}),
        ...(updates.role ? { role: 'volunteer' } : {})
      }
    }

    if (updates.ban) {
      payload.ban_duration = 'none'
    }

    // 1. Actualizar en Supabase Auth (Cambia el correo en el sistema de autenticación)
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, payload)

    if (error) return { success: false, error: error.message }

    // 2. Actualizar la tabla pública 'profiles'
    // Creamos un objeto dinámico con todo lo que cambió, incluyendo el EMAIL si se modificó.
    const profileUpdates: { role?: string; full_name?: string; email?: string } = {}

    if (updates.role) profileUpdates.role = 'volunteer'
    if (updates.fullName) profileUpdates.full_name = updates.fullName
    if (updates.email) profileUpdates.email = updates.email // 👈 SOLUCIÓN: Sincroniza el nuevo email en la tabla 'profiles'

    // Solo hacemos la consulta si de verdad hay campos públicos que cambiar
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId)

      if (profileError) return { success: false, error: `Error al actualizar perfil: ${profileError.message}` }
    }

    return { success: true, user: data.user }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    return { success: false, error: errorMessage }
  }
}

// 3. ELIMINAR USUARIO
export async function adminDeleteUser(userId: string) {
  try {
    const actorRole = await checkAdminActor()

    if (actorRole === 'admin') {
      const { data: targetProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!targetProfile || targetProfile.role !== 'volunteer') {
        throw new Error('Acceso denegado: solo puedes eliminar usuarios volunteer')
      }
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido';
    return { success: false, error: errorMessage };
  }
}