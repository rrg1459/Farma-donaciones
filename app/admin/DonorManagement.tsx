'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  adminDeleteDonor,
  adminSaveDonor,
  type DonorInput,
} from '@/app/actions/admin-actions'
import type { Donor } from '@/types/inventory'

const donorTypes = [
  { value: 'individual', label: 'Persona' },
  { value: 'pharmacy', label: 'Farmacia' },
  { value: 'ngo', label: 'Organización / ONG' },
  { value: 'laboratory', label: 'Laboratorio' },
]

const emptyDonor: DonorInput = {
  name_or_company: '',
  contact_phone: '',
  contact_email: '',
  donor_type: 'individual',
}

const inputClass =
  'w-full rounded-md border border-zinc-300 bg-transparent p-2 focus:outline-blue-500 text-zinc-900 dark:text-zinc-100'

export default function DonorManagement({
  initialDonors,
}: {
  initialDonors: Donor[]
}) {
  const router = useRouter()
  const [form, setForm] = useState<DonorInput>(emptyDonor)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState<DonorInput>(emptyDonor)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function save(id: string | null, input: DonorInput) {
    setBusy(true)
    setMessage('')
    const result = await adminSaveDonor(id, input)
    setBusy(false)
    if (!result.success) {
      setMessage(`Error: ${result.error}`)
      return
    }

    setMessage(id ? 'Donante actualizado.' : 'Donante creado.')
    setForm(emptyDonor)
    setEditingId(null)
    router.refresh()
  }

  async function remove(donor: Donor) {
    if (!confirm(`¿Eliminar el registro de ${donor.name_or_company}?`)) return

    setBusy(true)
    setMessage('')
    const result = await adminDeleteDonor(donor.id)
    setBusy(false)
    if (!result.success) {
      setMessage(`Error: ${result.error}`)
      return
    }

    setMessage('Donante eliminado. Sus lotes conservarán la información de inventario.')
    router.refresh()
  }

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-12">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:p-6 lg:col-span-5">
        <h2 className="mb-4 text-md font-bold text-zinc-800 dark:text-zinc-200 sm:text-xl">
          Crear donante
        </h2>
        <button
          type="button"
          aria-expanded={showCreateForm}
          aria-controls="create-donor-form"
          onClick={() => setShowCreateForm((visible) => !visible)}
          className="w-full cursor-pointer rounded-md border border-zinc-300 bg-blue-50 px-3 py-1.5 text-left text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:bg-blue-900/20 dark:text-zinc-300 sm:hidden"
        >
          {showCreateForm ? 'Ocultar' : 'Mostrar'} Crear Nuevo Donante
        </button>
        <h3 className="hidden text-base font-semibold text-zinc-700 dark:text-zinc-300 sm:block">
          Crear Nuevo Donante
        </h3>
        <div
          id="create-donor-form"
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
              Nombre o empresa *
              <input className={inputClass} required maxLength={200} value={form.name_or_company} onChange={(event) => setForm({ ...form, name_or_company: event.target.value })} disabled={busy} />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Tipo de donante
              <select className={inputClass} value={form.donor_type} onChange={(event) => setForm({ ...form, donor_type: event.target.value })} disabled={busy}>
                {donorTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Teléfono
              <input className={inputClass} type="tel" maxLength={50} value={form.contact_phone ?? ''} onChange={(event) => setForm({ ...form, contact_phone: event.target.value })} disabled={busy} />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Correo electrónico
              <input className={inputClass} type="email" maxLength={254} value={form.contact_email ?? ''} onChange={(event) => setForm({ ...form, contact_email: event.target.value })} disabled={busy} />
            </label>
            <button type="submit" disabled={busy} className="mt-2 w-full cursor-pointer rounded-md bg-green-600 p-2 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50">
              Crear donante
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:p-6 lg:col-span-7">
        <h2 className="mb-4 text-md font-bold text-zinc-800 dark:text-zinc-200 sm:text-xl">
          Donantes registrados ({initialDonors.length})
        </h2>
        {message && (
          <p role="status" className="mb-4 rounded bg-blue-100 p-2 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {message}
          </p>
        )}
        <div className="flex max-h-[550px] flex-col gap-3 overflow-y-auto pr-2">
          {initialDonors.length === 0 ? (
            <p className="text-sm italic text-zinc-500">No hay donantes registrados.</p>
          ) : initialDonors.map((donor) => {
            const isEditing = editingId === donor.id
            return (
              <article
                key={donor.id}
                className={`flex flex-col gap-3 rounded-lg border p-4 transition-colors duration-300 ${isEditing
                    ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/10'
                    : 'border-zinc-100 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700/50'
                  }`}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Editando Donante</p>
                    <input className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50" aria-label="Nombre o empresa" value={editingForm.name_or_company} onChange={(event) => setEditingForm({ ...editingForm, name_or_company: event.target.value })} disabled={busy} />
                    <select className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50" aria-label="Tipo de donante" value={editingForm.donor_type} onChange={(event) => setEditingForm({ ...editingForm, donor_type: event.target.value })} disabled={busy}>
                      {donorTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <input className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50" aria-label="Teléfono" type="tel" value={editingForm.contact_phone ?? ''} onChange={(event) => setEditingForm({ ...editingForm, contact_phone: event.target.value })} disabled={busy} />
                    <input className="w-full rounded border border-zinc-300 bg-white p-1.5 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50" aria-label="Correo electrónico" type="email" value={editingForm.contact_email ?? ''} onChange={(event) => setEditingForm({ ...editingForm, contact_email: event.target.value })} disabled={busy} />
                    <div className="mt-2 flex justify-end gap-2 border-t border-zinc-200/60 pt-2 dark:border-zinc-700/60">
                      <button type="button" onClick={() => setEditingId(null)} disabled={busy} className="cursor-pointer rounded-md bg-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-600 dark:text-zinc-200">Cancelar</button>
                      <button type="button" onClick={() => void save(donor.id, editingForm)} disabled={busy} className="flex cursor-pointer items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy ? 'Guardando...' : 'Guardar Cambios'}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{donor.name_or_company}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-300">
                        {donorTypes.find((option) => option.value === donor.donor_type)?.label ?? donor.donor_type}
                      </p>
                      {(donor.contact_phone || donor.contact_email) && (
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-300">
                          {[donor.contact_phone, donor.contact_email].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 sm:flex-row">
                      <button type="button" onClick={() => { setEditingForm({ name_or_company: donor.name_or_company, contact_phone: donor.contact_phone ?? '', contact_email: donor.contact_email ?? '', donor_type: donor.donor_type }); setEditingId(donor.id) }} className="cursor-pointer rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-500 dark:bg-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-500">Editar</button>
                      <button type="button" onClick={() => void remove(donor)} disabled={busy} className="cursor-pointer rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/40">Eliminar</button>
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
