'use client';

import { useRef, useState, type FormEvent } from 'react';
import { CalendarDays, CheckCircle2, LoaderCircle, X } from 'lucide-react';
import type { PharmaceuticalForm } from '../../types/inventory';
import {
  INVENTORY_UPDATED_EVENT,
  loadDonationFormOptions,
} from '../../lib/inventoryData';
import { useSupabaseData } from '../../lib/useSupabaseData';
import { getSupabaseClient } from '../../lib/supabaseClient';

interface NewDonationProps {
  onClose: () => void;
}

const formLabels: Record<PharmaceuticalForm, string> = {
  tablet_pill: 'Tableta o comprimido',
  capsule: 'Cápsula',
  syrup_suspension: 'Jarabe o suspensión',
  injectable_ampoule: 'Ampolla inyectable',
  cream_ointment: 'Crema o pomada',
  drops: 'Gotas',
  inhaler: 'Inhalador',
  other: 'Otro',
};

const donorTypes = [
  ['individual', 'Persona'],
  ['pharmacy', 'Farmacia'],
  ['ngo', 'Organización / ONG'],
  ['laboratory', 'Laboratorio'],
];

function isPharmaceuticalForm(value: string): value is PharmaceuticalForm {
  return value in formLabels;
}

function getMinimumExpirationDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseExpirationDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(Number(yearText), Number(monthText) - 1, Number(dayText));

  if (
    Number(yearText) < 1 ||
    date.getUTCFullYear() !== Number(yearText) ||
    date.getUTCMonth() !== Number(monthText) - 1 ||
    date.getUTCDate() !== Number(dayText)
  ) {
    return null;
  }

  return `${yearText}-${monthText}-${dayText}`;
}

function formatExpirationDate(value: string): string {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function NewDonation({ onClose }: NewDonationProps) {
  const {
    data: options,
    error: loadError,
    loading,
  } = useSupabaseData(loadDonationFormOptions);
  const [donorChoice, setDonorChoice] = useState('');
  const [medicationChoice, setMedicationChoice] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorType, setDonorType] = useState('individual');
  const [tradeName, setTradeName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [concentration, setConcentration] = useState('');
  const [pharmaceuticalForm, setPharmaceuticalForm] =
    useState<PharmaceuticalForm>('tablet_pill');
  const [requiresRefrigeration, setRequiresRefrigeration] = useState(false);
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [locationId, setLocationId] = useState('');
  const [locationZone, setLocationZone] = useState('');
  const [locationShelfUnit, setLocationShelfUnit] = useState('');
  const [locationTierBin, setLocationTierBin] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [observations, setObservations] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const calendarInputRef = useRef<HTMLInputElement>(null);

  const selectedDonor = options?.donors.find(
    (donor) => donor.id === donorChoice,
  );
  const selectedMedication = options?.medications.find(
    (medication) => medication.id === medicationChoice,
  );
  const selectedQuantity = Number(quantity);
  const expirationDateISO = parseExpirationDate(expirationDate);
  const minimumExpirationDate = getMinimumExpirationDate();
  const creatingDonor = donorChoice === 'new';
  const creatingMedication = medicationChoice === 'new';
  const creatingLocation = locationId === 'new';
  const canSubmit =
    (creatingLocation
      ? Boolean(
        locationZone.trim() &&
        locationShelfUnit.trim() &&
        locationTierBin.trim() &&
        locationCode.trim(),
      )
      : Boolean(options?.locations.some((location) => location.id === locationId))) &&
    Boolean(batchNumber.trim()) &&
    expirationDateISO !== null &&
    expirationDateISO >= minimumExpirationDate &&
    Number.isInteger(selectedQuantity) &&
    selectedQuantity > 0 &&
    (creatingDonor ? Boolean(donorName.trim()) : Boolean(selectedDonor)) &&
    (creatingMedication
      ? Boolean(
        tradeName.trim() &&
        activeIngredient.trim() &&
        concentration.trim(),
      )
      : Boolean(selectedMedication)) &&
    !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await getSupabaseClient().rpc('register_donation', {
        p_donor_id: creatingDonor ? null : selectedDonor?.id ?? null,
        p_donor_name: creatingDonor
          ? donorName.trim()
          : selectedDonor?.name_or_company ?? '',
        p_donor_phone: creatingDonor
          ? donorPhone.trim() || null
          : selectedDonor?.contact_phone ?? null,
        p_donor_email: creatingDonor
          ? donorEmail.trim() || null
          : selectedDonor?.contact_email ?? null,
        p_donor_type: creatingDonor
          ? donorType
          : selectedDonor?.donor_type ?? 'individual',
        p_medication_id: creatingMedication
          ? null
          : selectedMedication?.id ?? null,
        p_trade_name: creatingMedication
          ? tradeName.trim()
          : selectedMedication?.trade_name ?? '',
        p_active_ingredient: creatingMedication
          ? activeIngredient.trim()
          : selectedMedication?.active_ingredient ?? '',
        p_concentration: creatingMedication
          ? concentration.trim()
          : selectedMedication?.concentration ?? '',
        p_pharmaceutical_form: creatingMedication
          ? pharmaceuticalForm
          : selectedMedication?.pharmaceutical_form ?? 'tablet_pill',
        p_requires_refrigeration: creatingMedication
          ? requiresRefrigeration
          : selectedMedication?.requires_refrigeration ?? false,
        p_requires_prescription: creatingMedication
          ? requiresPrescription
          : selectedMedication?.requires_prescription ?? false,
        p_location_id: creatingLocation ? null : locationId,
        p_location_zone: creatingLocation ? locationZone.trim() : null,
        p_location_shelf_unit: creatingLocation ? locationShelfUnit.trim() : null,
        p_location_tier_bin: creatingLocation ? locationTierBin.trim() : null,
        p_location_code: creatingLocation ? locationCode.trim() : null,
        p_location_description: creatingLocation
          ? locationDescription.trim() || null
          : null,
        p_batch_number: batchNumber.trim(),
        p_expiration_date: expirationDateISO,
        p_quantity: selectedQuantity,
        p_observations: observations.trim() || null,
      });

      if (error) {
        throw new Error(error.message);
      }
      if (!data || data.length === 0) {
        throw new Error('Supabase no confirmó el registro de la donación.');
      }

      const donation = data[0];
      setSuccessMessage(
        `Donación registrada: ${donation.quantity} unidades del lote ${donation.batch_number}.`,
      );
      window.dispatchEvent(new Event(INVENTORY_UPDATED_EVENT));
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la donación.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-slate-100 bg-white p-5">
          <div>
            <h2 id="donation-title" className="text-lg font-bold text-slate-900">
              Registrar nueva donación
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Registra el donante, medicamento, lote y ubicación de recepción.
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {loadError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {loadError}
            </p>
          )}
          {submitError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </p>
          )}
          {successMessage && (
            <p role="status" className="flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Donante</span>
              <select
                value={donorChoice}
                onChange={(event) => setDonorChoice(event.target.value)}
                disabled={loading || submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
              >
                <option value="">
                  {loading ? 'Cargando donantes...' : 'Selecciona un donante'}
                </option>
                {options?.donors.map((donor) => (
                  <option key={donor.id} value={donor.id}>
                    {donor.name_or_company}
                  </option>
                ))}
                <option value="new">Registrar nuevo donante</option>
              </select>
            </label>

            {creatingDonor && (
              <>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    Nombre o empresa
                  </span>
                  <input
                    required
                    maxLength={200}
                    value={donorName}
                    onChange={(event) => setDonorName(event.target.value)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    Tipo de donante
                  </span>
                  <select
                    value={donorType}
                    onChange={(event) => setDonorType(event.target.value)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {donorTypes.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    Teléfono <span className="font-normal text-slate-400">(opcional)</span>
                  </span>
                  <input
                    type="tel"
                    maxLength={40}
                    value={donorPhone}
                    onChange={(event) => setDonorPhone(event.target.value)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    Correo <span className="font-normal text-slate-400">(opcional)</span>
                  </span>
                  <input
                    type="email"
                    maxLength={254}
                    value={donorEmail}
                    onChange={(event) => setDonorEmail(event.target.value)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Medicamento</span>
              <select
                value={medicationChoice}
                onChange={(event) => setMedicationChoice(event.target.value)}
                disabled={loading || submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
              >
                <option value="">
                  {loading ? 'Cargando medicamentos...' : 'Selecciona un medicamento'}
                </option>
                {options?.medications.map((medication) => (
                  <option key={medication.id} value={medication.id}>
                    {medication.trade_name} {medication.concentration}
                  </option>
                ))}
                <option value="new">Registrar nuevo medicamento</option>
              </select>
            </label>

            {creatingMedication && (
              <>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    Nombre comercial
                  </span>
                  <input
                    required
                    maxLength={200}
                    value={tradeName}
                    onChange={(event) => setTradeName(event.target.value)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    Principio activo
                  </span>
                  <input
                    required
                    maxLength={200}
                    value={activeIngredient}
                    onChange={(event) => setActiveIngredient(event.target.value)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    Concentración
                  </span>
                  <input
                    required
                    maxLength={100}
                    value={concentration}
                    onChange={(event) => setConcentration(event.target.value)}
                    placeholder="Ej. 500 mg"
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">
                    Forma farmacéutica
                  </span>
                  <select
                    value={pharmaceuticalForm}
                    onChange={(event) => {
                      if (isPharmaceuticalForm(event.target.value)) {
                        setPharmaceuticalForm(event.target.value);
                      }
                    }}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.entries(formLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={requiresRefrigeration}
                    onChange={(event) =>
                      setRequiresRefrigeration(event.target.checked)
                    }
                    disabled={submitting}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  Requiere refrigeración
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={requiresPrescription}
                    onChange={(event) =>
                      setRequiresPrescription(event.target.checked)
                    }
                    disabled={submitting}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  Requiere receta médica
                </label>
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Ubicación</span>
              <select
                required
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
                disabled={loading || submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
              >
                <option value="">Selecciona una ubicación</option>
                {options?.locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.zone} · {location.location_code}
                  </option>
                ))}
                <option value="new">Registrar nueva ubicación</option>
              </select>
            </label>
            {creatingLocation && (
              <>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">Zona</span>
                  <input
                    required
                    maxLength={100}
                    value={locationZone}
                    onChange={(event) => setLocationZone(event.target.value)}
                    disabled={submitting}
                    placeholder="Ej. Pasillo A o Refrigeración"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">Estante o mueble</span>
                  <input
                    required
                    maxLength={100}
                    value={locationShelfUnit}
                    onChange={(event) => setLocationShelfUnit(event.target.value)}
                    disabled={submitting}
                    placeholder="Ej. Estante 3"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">Nivel o casillero</span>
                  <input
                    required
                    maxLength={100}
                    value={locationTierBin}
                    onChange={(event) => setLocationTierBin(event.target.value)}
                    disabled={submitting}
                    placeholder="Ej. Nivel 2 o Caja B"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">Código de ubicación</span>
                  <input
                    required
                    maxLength={100}
                    value={locationCode}
                    onChange={(event) => setLocationCode(event.target.value)}
                    disabled={submitting}
                    placeholder="Ej. PAS-A-EST3-N2"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                <label className="block space-y-1.5 sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Descripción <span className="font-normal text-slate-400">(opcional)</span>
                  </span>
                  <input
                    maxLength={500}
                    value={locationDescription}
                    onChange={(event) => setLocationDescription(event.target.value)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
              </>
            )}
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Número de lote</span>
              <input
                required
                maxLength={100}
                value={batchNumber}
                onChange={(event) => setBatchNumber(event.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">
                Fecha de caducidad
              </span>
              <span className="relative block">
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  placeholder="dd/mm/yyyy"
                  maxLength={10}
                  value={expirationDate}
                  onChange={(event) => setExpirationDate(event.target.value)}
                  disabled={submitting}
                  aria-describedby="expiration-date-hint"
                  aria-invalid={
                    expirationDate.length > 0 &&
                    (expirationDateISO === null ||
                      expirationDateISO < minimumExpirationDate)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  aria-label="Abrir calendario de fecha de caducidad"
                  disabled={submitting}
                  onClick={() => {
                    const calendarInput = calendarInputRef.current;
                    if (!calendarInput) {
                      return;
                    }

                    if (typeof calendarInput.showPicker === 'function') {
                      calendarInput.showPicker();
                    } else {
                      calendarInput.click();
                    }
                  }}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-emerald-700 disabled:cursor-not-allowed"
                >
                  <CalendarDays aria-hidden="true" className="h-5 w-5" />
                </button>
                <input
                  ref={calendarInputRef}
                  type="date"
                  min={minimumExpirationDate}
                  value={expirationDateISO ?? ''}
                  onChange={(event) =>
                    setExpirationDate(formatExpirationDate(event.target.value))
                  }
                  disabled={submitting}
                  aria-hidden="true"
                  tabIndex={-1}
                  className="sr-only"
                />
              </span>
              <span
                id="expiration-date-hint"
                className={`text-xs ${expirationDate.length > 0 &&
                    (expirationDateISO === null ||
                      expirationDateISO < minimumExpirationDate)
                    ? 'text-red-600'
                    : 'text-slate-500'
                  }`}
              >
                {expirationDate.length > 0 &&
                  expirationDateISO === null
                  ? 'Ingresa una fecha válida en formato dd/mm/yyyy.'
                  : 'La fecha debe ser al menos 7 días a partir de hoy.'}
              </span>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">
                Cantidad recibida
              </span>
              <input
                required
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">
              Observaciones <span className="font-normal text-slate-400">(opcional)</span>
            </span>
            <textarea
              rows={3}
              maxLength={1000}
              value={observations}
              onChange={(event) => setObservations(event.target.value)}
              disabled={submitting}
              placeholder="Condición del empaque u otra información de recepción"
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            {successMessage ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Listo
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || loading || Boolean(loadError)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {submitting ? 'Registrando donación...' : 'Registrar donación'}
                </button>
              </>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
