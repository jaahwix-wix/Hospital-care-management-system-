'use client';

import React, { useState } from 'react';
import { X, Bed as BedIcon, Plus, Trash2, Save, AlertTriangle } from 'lucide-react';
import { Bed, Ward, BedType, BedStatus } from '@/lib/types';

interface BedModalProps {
  isOpen: boolean;
  onClose: () => void;
  wards: Ward[];
  bedToEdit?: Bed | null;
  onSaveBed: (bedData: Omit<Bed, 'id' | 'hospitalId'>, bedId?: string) => void;
  onDeleteBed?: (bedId: string) => void;
}

export const BedModal: React.FC<BedModalProps> = ({
  isOpen,
  onClose,
  wards,
  bedToEdit,
  onSaveBed,
  onDeleteBed
}) => {
  const [wardId, setWardId] = useState(bedToEdit?.wardId || wards[0]?.id || '');
  const [bedNumber, setBedNumber] = useState(bedToEdit?.bedNumber || '');
  const [type, setType] = useState<BedType>(bedToEdit?.type || 'standard');
  const [status, setStatus] = useState<BedStatus>(bedToEdit?.status || 'available');

  if (!isOpen) return null;

  const selectedWard = wards.find((w) => w.id === wardId) || wards[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedNumber.trim() || !selectedWard) return;

    onSaveBed(
      {
        wardId: selectedWard.id,
        wardName: selectedWard.name,
        bedNumber: bedNumber.trim(),
        type,
        status,
        patientId: bedToEdit?.patientId,
        patientName: bedToEdit?.patientName,
        patientMrn: bedToEdit?.patientMrn,
        occupiedSince: bedToEdit?.occupiedSince
      },
      bedToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold">
              <BedIcon className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {bedToEdit ? `Configure Bed ${bedToEdit.bedNumber}` : 'Add Inpatient Bed'}
              </h2>
              <p className="text-xs text-slate-500">
                {bedToEdit ? 'Modify bed properties & ward assignment' : 'Allocate new bed capacity to ward'}
              </p>
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
          {bedToEdit?.status === 'occupied' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>This bed is currently occupied by {bedToEdit.patientName} ({bedToEdit.patientMrn}).</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Ward Location *</label>
            <select
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-medium"
              required
            >
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code} - {w.floor})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Bed Number / Identifier *</label>
            <input
              type="text"
              value={bedNumber}
              onChange={(e) => setBedNumber(e.target.value)}
              placeholder="e.g. ICU-07 or MS-505"
              required
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bed Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
              >
                <option value="standard">Standard Inpatient</option>
                <option value="icu">Intensive Care (ICU)</option>
                <option value="cardiac">Cardiac Telemetry</option>
                <option value="emergency_bay">Emergency Bay</option>
                <option value="isolation">Negative Pressure Isolation</option>
                <option value="pediatric">Pediatric</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Operational Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={bedToEdit?.status === 'occupied'}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
              >
                <option value="available">Available (Clean)</option>
                <option value="cleaning">Cleaning / Sanitizing</option>
                <option value="maintenance">Maintenance</option>
                {bedToEdit?.status === 'occupied' && <option value="occupied">Occupied</option>}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {bedToEdit && onDeleteBed ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete Bed ${bedToEdit.bedNumber}?`)) {
                    onDeleteBed(bedToEdit.id);
                    onClose();
                  }
                }}
                disabled={bedToEdit.status === 'occupied'}
                className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 disabled:opacity-40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Bed</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{bedToEdit ? 'Save Changes' : 'Create Bed'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
