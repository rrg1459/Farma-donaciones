'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, LoaderCircle, X } from 'lucide-react';
import {
  INVENTORY_UPDATED_EVENT,
  loadDeliveryMedicationOptions,
} from '../../lib/inventoryData';
import { useSupabaseData } from '../../lib/useSupabaseData';
import { getSupabaseClient } from '../../lib/supabaseClient';

interface MedicationDeliveryProps {
  onClose: () => void;
  initialBatchId?: string;
}

export function MedicationDelivery({
  onClose,
  initialBatchId,
}: MedicationDeliveryProps) {
  const {
    data: medications,
    error: loadError,
    loading,
  } = useSupabaseData(loadDeliveryMedicationOptions);
  const [medicationId, setMedicationId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [destination, setDestination] = useState('');
  const [prescriptionDelivered, setPrescriptionDelivered] = useState<boolean | null>(null);
  const [motive, setMotive] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initialMedicationId = initialBatchId
    ? medications?.find((medication) =>
        medication.batch_ids.includes(initialBatchId),
      )?.id
    : undefined;
  const selectedMedicationId =
    medicationId ||
    (initialBatchId ? initialMedicationId ?? '' : medications?.[0]?.id ?? '');
  const selectedMedication = medications?.find(
    (medication) => medication.id === selectedMedicationId,
  );
  const requestedQuantity = Number(quantity);
  const canSubmit =
    Boolean(selectedMedication) &&
    Number.isInteger(requestedQuantity) &&
    requestedQuantity > 0 &&
    requestedQuantity <= (selectedMedication?.available_quantity ?? 0) &&
    destination.trim().length > 0 &&
    (!selectedMedication?.requires_prescription || prescriptionDelivered !== null) &&
    !submitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMedication || !canSubmit) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await getSupabaseClient().rpc(
        'deliver_medication_fefo',
        {
          p_medication_id: selectedMedication.id,
          p_quantity: requestedQuantity,
          p_destination_or_beneficiary: destination.trim(),
          p_motive_or_observation: motive.trim() || null,
          p_prescription_delivered: selectedMedication.requires_prescription
            ? prescriptionDelivered
            : null,
        },
      );

      if (error) {
        throw new Error(error.message);
      }
      if (!data || data.length === 0) {
        throw new Error('Supabase no confirmó la salida del medicamento.');
      }

      const lotsSummary = data
        .map((item) => `${item.quantity} del lote ${item.batch_number}`)
        .join(', ');
      setSuccessMessage(
        `Entrega registrada: ${requestedQuantity} unidades de ${selectedMedication.label} para ${destination.trim()}. Lotes FEFO: ${lotsSummary}.`,
      );
      window.dispatchEvent(new Event(INVENTORY_UPDATED_EVENT));
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la entrega.',
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
        aria-labelledby="delivery-title"
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h2 id="delivery-title" className="text-lg font-bold text-slate-900">
              Entregar medicamento
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              La salida se asignará a los lotes disponibles por orden FEFO.
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

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {loadError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {loadError}
            </p>
          )}
          {initialBatchId && !loading && !loadError && !initialMedicationId && (
            <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              El lote seleccionado no está disponible para entrega. Elige un medicamento
              con stock vigente.
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

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Medicamento</span>
            <select
              required
              value={selectedMedicationId}
              onChange={(event) => {
                setMedicationId(event.target.value);
                setPrescriptionDelivered(null);
                setSuccessMessage(null);
              }}
              disabled={loading || !medications?.length || submitting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
            >
              <option value="">
                {loading ? 'Cargando medicamentos...' : 'Selecciona un medicamento'}
              </option>
              {medications?.map((medication) => (
                <option key={medication.id} value={medication.id}>
                  {medication.label} · {medication.available_quantity} unidades
                  disponibles
                </option>
              ))}
            </select>
            {selectedMedication && (
              <span className="block text-xs text-slate-500">
                Principio activo: {selectedMedication.active_ingredient}.{' '}
                {selectedMedication.batch_count} lote(s) disponibles; el sistema
                seleccionará primero el de vencimiento más cercano.
              </span>
            )}
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Cantidad</span>
            <input
              required
              min={1}
              max={selectedMedication?.available_quantity ?? 0}
              step={1}
              type="number"
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value);
                setSuccessMessage(null);
              }}
              disabled={!selectedMedication || submitting}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">
              Destino o beneficiario
            </span>
            <input
              required
              maxLength={300}
              value={destination}
              onChange={(event) => {
                setDestination(event.target.value);
                setSuccessMessage(null);
              }}
              placeholder="Centro de salud, jornada o beneficiario"
              disabled={submitting}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
            />
          </label>

          {selectedMedication?.requires_prescription && (
            <fieldset className="space-y-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
              <legend className="px-1 text-sm font-semibold text-rose-900">
                ¿Entregó la receta?
              </legend>
              <div className="flex flex-row gap-5">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    required
                    type="radio"
                    name="prescription-delivered"
                    value="yes"
                    checked={prescriptionDelivered === true}
                    onChange={() => {
                      setPrescriptionDelivered(true);
                      setSuccessMessage(null);
                    }}
                    disabled={submitting}
                    className="h-4 w-4 accent-rose-600"
                  />
                  Sí, entregó receta
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    required
                    type="radio"
                    name="prescription-delivered"
                    value="no"
                    checked={prescriptionDelivered === false}
                    onChange={() => {
                      setPrescriptionDelivered(false);
                      setSuccessMessage(null);
                    }}
                    disabled={submitting}
                    className="h-4 w-4 accent-rose-600"
                  />
                  No entregó receta
                </label>
              </div>
            </fieldset>
          )}

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">
              Motivo u observación <span className="font-normal text-slate-400">(opcional)</span>
            </span>
            <textarea
              maxLength={1000}
              rows={3}
              value={motive}
              onChange={(event) => {
                setMotive(event.target.value);
                setSuccessMessage(null);
              }}
              disabled={submitting}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
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
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {submitting ? 'Registrando entrega...' : 'Confirmar entrega'}
                </button>
              </>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
