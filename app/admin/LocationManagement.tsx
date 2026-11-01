'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  adminDeleteLocation,
  adminSaveLocation,
  type LocationInput,
} from '@/app/actions/admin-actions'
import type { Location } from '@/types/inventory'

const emptyLocation: LocationInput = {
  zone: '',
  shelf_unit: '',
  tier_bin: '',
  location_code: '',
  description: '',
}

const inputClass =
  'w-full rounded-md border border-zinc-300 bg-transparent p-2 focus:outline-blue-500 text-zinc-900'

export default function LocationManagement({
  initialLocations,
  locationIdsWithBatches,
}: {
  initialLocations: Location[]
  locationIdsWithBatches: string[]
}) {
  const router = useRouter()
  const locationIdsWithBatchesSet = new Set(locationIdsWithBatches)
  const [form, setForm] = useState<LocationInput>(emptyLocation)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState<LocationInput>(emptyLocation)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function save(id: string | null, input: LocationInput) {
    setBusy(true)
    setMessage('')
    const result = await adminSaveLocation(id, input)
    setBusy(false)
    if (!result.success) {
      setMessage(`Error: ${result.error}`)
      return
    }

    setMessage(id ? 'Ubicación actualizada.' : 'Ubicación creada.')
    setForm(emptyLocation)
    setEditingId(null)
    router.refresh()
  }

  async function remove(location: Location) {
    if (!confirm(`¿Eliminar la ubicación ${location.location_code}?`)) return

    setBusy(true)
    setMessage('')
    const result = await adminDeleteLocation(location.id)
    setBusy(false)
    if (!result.success) {
      setMessage(`Error: ${result.error}`)
      return
    }

    setMessage('Ubicación eliminada.')
    router.refresh()
  }

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-12">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-xs sm:p-6 lg:col-span-5">
        <h2 className="mb-4 text-md font-bold text-zinc-800 sm:text-xl">
          Crear ubicación
        </h2>
        <button
          type="button"
          aria-expanded={showCreateForm}
          aria-controls="create-location-form"
          onClick={() => setShowCreateForm((visible) => !visible)}
          className="w-full cursor-pointer rounded-md border border-zinc-300 bg-blue-50 px-3 py-1.5 text-left text-sm font-medium text-zinc-700 sm:hidden"
        >
          {showCreateForm ? 'Ocultar' : 'Mostrar'} Crear Nueva Ubicación
        </button>
        <h3 className="hidden text-base font-semibold text-zinc-700 sm:block">
          Crear Nueva Ubicación
        </h3>
        <div
          id="create-location-form"
          className={`${showCreateForm ? 'block' : 'hidden'} mt-4 space-y-4 sm:block`}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              void save(null, form)
            }}
          >
            <label className="block space-y-1 text-sm font-medium">
              Zona *
              <input className={inputClass} required maxLength={200} value={form.zone} onChange={(event) => setForm({ ...form, zone: event.target.value })} disabled={busy} />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Estante o mueble *
              <input className={inputClass} required maxLength={200} value={form.shelf_unit} onChange={(event) => setForm({ ...form, shelf_unit: event.target.value })} disabled={busy} />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Nivel o casillero *
              <input className={inputClass} required maxLength={200} value={form.tier_bin} onChange={(event) => setForm({ ...form, tier_bin: event.target.value })} disabled={busy} />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Código de ubicación *
              <input className={inputClass} required maxLength={100} value={form.location_code} onChange={(event) => setForm({ ...form, location_code: event.target.value })} disabled={busy} />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Descripción
              <textarea className={inputClass} maxLength={500} rows={3} value={form.description ?? ''} onChange={(event) => setForm({ ...form, description: event.target.value })} disabled={busy} />
            </label>
            <button type="submit" disabled={busy} className="mt-2 w-full cursor-pointer rounded-md bg-green-600 p-2 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50">
              Crear ubicación
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-xs sm:p-6 lg:col-span-7">
        <h2 className="mb-4 text-md font-bold text-zinc-800 sm:text-xl">
          Ubicaciones registradas ({initialLocations.length})
        </h2>
        {message && (
          <p role="status" className="mb-4 rounded bg-blue-100 p-2 text-sm text-blue-700">
            {message}
          </p>
        )}
        <div className="flex max-h-[550px] flex-col gap-3 overflow-y-auto pr-2">
          {initialLocations.length === 0 ? (
            <p className="text-sm italic text-zinc-500">No hay ubicaciones registradas.</p>
          ) : initialLocations.map((location) => {
            const isEditing = editingId === location.id
            const hasBatches = locationIdsWithBatchesSet.has(location.id)
            const editValue = editingForm
            return (
              <article
                key={location.id}
                className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors duration-300 ${isEditing
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-zinc-100 bg-zinc-50'
                  }`}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-blue-600">Editando Ubicación</p>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500">Zona</label>
                      <input className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 disabled:opacity-50" aria-label="Zona" value={editValue.zone} onChange={(event) => setEditingForm({ ...editValue, zone: event.target.value })} disabled={busy} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500">Estante o mueble</label>
                      <input className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 disabled:opacity-50" aria-label="Estante o mueble" value={editValue.shelf_unit} onChange={(event) => setEditingForm({ ...editValue, shelf_unit: event.target.value })} disabled={busy} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500">Nivel o casillero</label>
                      <input className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 disabled:opacity-50" aria-label="Nivel o casillero" value={editValue.tier_bin} onChange={(event) => setEditingForm({ ...editValue, tier_bin: event.target.value })} disabled={busy} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500">Código de ubicación</label>
                      <input className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 disabled:opacity-50" aria-label="Código de ubicación" value={editValue.location_code} onChange={(event) => setEditingForm({ ...editValue, location_code: event.target.value })} disabled={busy} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500">Descripción</label>
                      <textarea className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 disabled:opacity-50" aria-label="Descripción" rows={2} value={editValue.description ?? ''} onChange={(event) => setEditingForm({ ...editValue, description: event.target.value })} disabled={busy} />
                    </div>
                    <div className="mt-2 flex justify-end gap-2 border-t border-zinc-200/60 pt-2">
                      <button type="button" onClick={() => setEditingId(null)} disabled={busy} className="cursor-pointer rounded-md bg-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-300 disabled:opacity-50">Cancelar</button>
                      <button type="button" onClick={() => void save(location.id, editingForm)} disabled={busy} className="flex cursor-pointer items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy ? 'Guardando...' : 'Guardar Cambios'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{location.location_code}</p>
                      <p className="text-xs text-zinc-500">{location.zone} · {location.shelf_unit} · {location.tier_bin}</p>
                      {location.description && <p className="mt-1 text-xs text-zinc-500">{location.description}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5 sm:flex-row">
                      <button type="button" onClick={() => { setEditingForm({ zone: location.zone, shelf_unit: location.shelf_unit, tier_bin: location.tier_bin, location_code: location.location_code, description: location.description ?? '' }); setEditingId(location.id) }} className="cursor-pointer rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100">Editar</button>
                      <button type="button" onClick={() => void remove(location)} disabled={busy || hasBatches} title={hasBatches ? 'No se puede eliminar porque tiene lotes asociados.' : undefined} className="cursor-pointer rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50">Eliminar</button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
