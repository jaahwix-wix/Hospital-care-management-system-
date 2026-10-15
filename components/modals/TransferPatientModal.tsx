'use client';

import React, { useState } from 'react';
import { X, ArrowRightLeft, Building2, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Patient, Hospital, TransferRecord } from '@/lib/types';

interface TransferPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  currentHospital: Hospital;
  allHospitals: Hospital[];
  onExecuteTransfer: (
    patientId: string,
    targetHospitalId: string,
    reason: string,
    priority: TransferRecord['priority'],
    clinicalSummary: string
  ) => void;
  currentStaffName: string;
}

export const TransferPatientModal: React.FC<TransferPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  currentHospital,
  allHospitals,
  onExecuteTransfer,
  currentStaffName
}) => {
  const otherHospitals = allHospitals.filter((h) => h.id !== currentHospital.id);
  const [targetHospitalId, setTargetHospitalId] = useState<string>(otherHospitals[0]?.id || '');
  const [reason, setReason] = useState('Specialized surgical intervention / tertiary clinical escalation');
  const [priority, setPriority] = useState<TransferRecord['priority']>('URGENT');
  const [clinicalSummary, setClinicalSummary] = useState(
    `Patient ${patient.firstName} ${patient.lastName} (${patient.mrn}) requires inter-hospital transfer for ongoing care. Vital signs monitored, medical record history attached.`
  );
  const [confirmTransport, setConfirmTransport] = useState(true);

  if (!isOpen) return null;

  const targetHospital = allHospitals.find((h) => h.id === targetHospitalId) || otherHospitals[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetHospitalId) return;

    onExecuteTransfer(patient.id, targetHospitalId, reason, priority, clinicalSummary);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Inter-Hospital Patient Transfer</h2>
              <p className="text-xs text-slate-500">Transfer medical custody and grant immediate full data access.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Facility Route Banner */}
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Originating Facility (Hospital A)</span>
              <strong className="text-slate-900 block truncate">{currentHospital.name}</strong>
              <span className="text-[10px] font-mono text-slate-500">{currentHospital.code}</span>
            </div>

            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 text-right">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Receiving Facility (Hospital B)</span>
              <strong className="text-slate-900 block truncate">{targetHospital?.name || 'Select Hospital'}</strong>
              <span className="text-[10px] font-mono text-slate-500">{targetHospital?.code}</span>
            </div>
          </div>

          {/* Patient Details */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900">{patient.firstName} {patient.lastName}</span>
              <span className="font-mono text-slate-500 ml-2">({patient.mrn})</span>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Current Bed: {patient.currentBedNumber || 'Triage'} · Status: {patient.currentStatus.toUpperCase()}
              </div>
            </div>
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Blood: {patient.bloodType}
            </span>
          </div>

          {/* Target Hospital Picker */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Target Hospital Facility (Hospital B) *</label>
            <select
              value={targetHospitalId}
              onChange={(e) => setTargetHospitalId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-semibold"
              required
            >
              {otherHospitals.map((hosp) => (
                <option key={hosp.id} value={hosp.id}>
                  {hosp.name} ({hosp.code}) · {hosp.type} · Capacity: {hosp.bedCapacity} beds
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Reason */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Transfer Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
              >
                <option value="EMERGENT_STAT">Emergent STAT (Immediate Transport)</option>
                <option value="URGENT">Urgent (Within 2-4 Hours)</option>
                <option value="ROUTINE">Routine Scheduled Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Authorizing Clinician</label>
              <input
                type="text"
                disabled
                value={currentStaffName}
                className="w-full bg-slate-100 border border-slate-200 rounded px-2.5 py-1.5 text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Reason for Inter-Hospital Transfer *</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Escalation to Level 1 Trauma Center or Specialized Cardiac Intervention"
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Clinical Handover Summary & Transfer Directives
            </label>
            <textarea
              rows={3}
              value={clinicalSummary}
              onChange={(e) => setClinicalSummary(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
              required
            />
          </div>

          {/* Data continuity guarantee */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Guaranteed Cross-Hospital EHR Continuity:</strong>
              <span>
                Upon authorization, Hospital B will immediately gain full real-time access to this patient&apos;s complete medical history, including all prior vitals, physician round notes, and laboratory specimen analysis.
              </span>
            </div>
          </div>

          {/* Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-700">
            <input
              type="checkbox"
              checked={confirmTransport}
              onChange={(e) => setConfirmTransport(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <span>Medical escort / transport dispatch verified and receiving hospital notified</span>
          </label>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!confirmTransport || !targetHospitalId}
              className="px-5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white font-bold cursor-pointer"
            >
              Authorize & Transfer to {targetHospital?.code || 'Hospital B'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
