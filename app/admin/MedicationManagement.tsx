'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  adminDeleteMedication,
  adminSaveMedication,
  type MedicationInput,
} from '@/app/actions/admin-actions'
import type { Medication, PharmaceuticalForm } from '@/types/inventory'

const forms: { value: PharmaceuticalForm; label: string }[] = [
  { value: 'tablet_pill', label: 'Tableta o comprimido' },
  { value: 'capsule', label: 'Cápsula' },
  { value: 'syrup_suspension', label: 'Jarabe o suspensión' },
  { value: 'injectable_ampoule', label: 'Ampolla inyectable' },
  { value: 'cream_ointment', label: 'Crema o pomada' },
  { value: 'drops', label: 'Gotas' },
  { value: 'inhaler', label: 'Inhalador' },
  { value: 'other', label: 'Otro' },
]

const emptyMedication: MedicationInput = {
  trade_name: '',
  active_ingredient: '',
  concentration: '',
  pharmaceutical_form: 'tablet_pill',
  requires_refrigeration: false,
  requires_prescription: false,
}

const inputClass =
  'w-full rounded-md border border-zinc-300 bg-transparent p-2 focus:outline-blue-500 text-zinc-900 dark:text-zinc-100'

export default function MedicationManagement({
  initialMedications,
}: {
  initialMedications: Medication[]
}) {
  const router = useRouter()
  const [form, setForm] = useState<MedicationInput>(emptyMedication)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState<MedicationInput>(emptyMedication)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function save(id: string | null, input: MedicationInput) {
    setBusy(true)
    setMessage('')
    const result = await adminSaveMedication(id, input)
    setBusy(false)

    if (!result.success) {
      setMessage(`Error: ${result.error}`)
      return
    }

    setMessage(id ? 'Medicamento actualizado.' : 'Medicamento creado.')
    setForm(emptyMedication)
    setEditingId(null)
    router.refresh()
  }

  async function remove(medication: Medication) {
    if (!confirm(`¿Eliminar ${medication.trade_name}?`)) return

    setBusy(true)
    setMessage('')
    const result = await adminDeleteMedication(medication.id)
    setBusy(false)
    if (!result.success) {
      setMessage(`Error: ${result.error}`)
      return
    }

    setMessage('Medicamento eliminado.')
    router.refresh()
  }

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-12">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:p-6 lg:col-span-5">
        <h2 className="mb-4 text-md font-bold text-zinc-800 dark:text-zinc-200 sm:text-xl">
          Crear medicamento
        </h2>
        <button
          type="button"
          aria-expanded={showCreateForm}
          aria-controls="create-medication-form"
          onClick={() => setShowCreateForm((visible) => !visible)}
          className="w-full cursor-pointer rounded-md border border-zinc-300 bg-blue-50 px-3 py-1.5 text-left text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:bg-blue-900/20 dark:text-zinc-300 sm:hidden"
        >
          {showCreateForm ? 'Ocultar' : 'Mostrar'} Crear Nuevo Medicamento
        </button>
        <h3 className="hidden text-base font-semibold text-zinc-700 dark:text-zinc-300 sm:block">
          Crear Nuevo Medicamento
        </h3>
        <div
          id="create-medication-form"
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
              Nombre comercial *
              <input
                className={inputClass}
                required
                maxLength={200}
                value={form.trade_name}
                onChange={(event) =>
                  setForm({ ...form, trade_name: event.target.value })
                }
                disabled={busy}
              />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Principio activo *
              <input
                className={inputClass}
                required
                maxLength={200}
                value={form.active_ingredient}
                onChange={(event) =>
                  setForm({ ...form, active_ingredient: event.target.value })
                }
                disabled={busy}
              />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Concentración *
              <input
                className={inputClass}
                required
                maxLength={100}
                value={form.concentration}
                onChange={(event) =>
                  setForm({ ...form, concentration: event.target.value })
                }
                disabled={busy}
              />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Forma farmacéutica
              <select
                className={inputClass}
                value={form.pharmaceutical_form}
                onChange={(event) =>
                  setForm({
                    ...form,
                    pharmaceutical_form: event.target.value as PharmaceuticalForm,
                  })
                }
                disabled={busy}
              >
                {forms.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.requires_refrigeration}
                onChange={(event) =>
                  setForm({ ...form, requires_refrigeration: event.target.checked })
                }
                disabled={busy}
              />
              Requiere refrigeración
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.requires_prescription}
                onChange={(event) =>
                  setForm({ ...form, requires_prescription: event.target.checked })
                }
                disabled={busy}
              />
              Requiere receta
            </label>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full cursor-pointer rounded-md bg-green-600 p-2 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              Crear medicamento
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:p-6 lg:col-span-7">
        <h2 className="mb-4 text-md font-bold text-zinc-800 dark:text-zinc-200 sm:text-xl">
          Medicamentos registrados ({initialMedications.length})
        </h2>
        {message && (
          <p role="status" className="mb-4 rounded bg-blue-100 p-2 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {message}
          </p>
        )}
        <div className="flex max-h-[550px] flex-col gap-3 overflow-y-auto pr-2">
          {initialMedications.length === 0 ? (
            <p className="text-sm italic text-zinc-500">No hay medicamentos registrados.</p>
          ) : initialMedications.map((medication) => {
            const isEditing = editingId === medication.id
            const selectedForm = isEditing
              ? editingForm
              : {
                trade_name: medication.trade_name,
                active_ingredient: medication.active_ingredient,
                concentration: medication.concentration,
                pharmaceutical_form: medication.pharmaceutical_form,
                requires_refrigeration: medication.requires_refrigeration,
                requires_prescription: medication.requires_prescription,
              }

            return (
              <article
                key={medication.id}
                className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors duration-300 ${isEditing
                    ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/10'
                    : 'border-zinc-100 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700/50'
                  }`}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Editando Medicamento</p>
                    <input className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50" aria-label="Nombre comercial" value={editingForm.trade_name} onChange={(event) => setEditingForm({ ...editingForm, trade_name: event.target.value })} disabled={busy} />
                    <input className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50" aria-label="Principio activo" value={editingForm.active_ingredient} onChange={(event) => setEditingForm({ ...editingForm, active_ingredient: event.target.value })} disabled={busy} />
                    <input className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50" aria-label="Concentración" value={editingForm.concentration} onChange={(event) => setEditingForm({ ...editingForm, concentration: event.target.value })} disabled={busy} />
                    <select className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50" aria-label="Forma farmacéutica" value={editingForm.pharmaceutical_form} onChange={(event) => setEditingForm({ ...editingForm, pharmaceutical_form: event.target.value as PharmaceuticalForm })} disabled={busy}>
                      {forms.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <label className="mr-4 inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={editingForm.requires_refrigeration} onChange={(event) => setEditingForm({ ...editingForm, requires_refrigeration: event.target.checked })} disabled={busy} /> Refrigeración</label>
                    <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={editingForm.requires_prescription} onChange={(event) => setEditingForm({ ...editingForm, requires_prescription: event.target.checked })} disabled={busy} /> Receta</label>
                    <div className="mt-2 flex justify-end gap-2 border-t border-zinc-200/60 pt-2 dark:border-zinc-700/60">
                      <button type="button" onClick={() => setEditingId(null)} disabled={busy} className="cursor-pointer rounded-md bg-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-600 dark:text-zinc-200">Cancelar</button>
                      <button type="button" onClick={() => void save(medication.id, editingForm)} disabled={busy} className="flex cursor-pointer items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy ? 'Guardando...' : 'Guardar Cambios'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{medication.trade_name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-300">{medication.active_ingredient} · {medication.concentration}</p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-300">
                        {forms.find((option) => option.value === selectedForm.pharmaceutical_form)?.label}
                        {medication.requires_refrigeration ? ' · Refrigeración' : ''}
                        {medication.requires_prescription ? ' · Receta' : ''}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 sm:flex-row">
                      <button type="button" onClick={() => { setEditingForm(selectedForm); setEditingId(medication.id) }} className="cursor-pointer rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-500">Editar</button>
                      <button type="button" onClick={() => void remove(medication)} disabled={busy} className="cursor-pointer rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/40">Eliminar</button>
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
