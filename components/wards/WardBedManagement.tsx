'use client';

import React, { useState } from 'react';
import {
  Bed as BedIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  User,
  Users,
  Building,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Plus,
  Settings,
  TrendingUp,
  BarChart3,
  Edit2,
  Trash2,
  LayoutGrid
} from 'lucide-react';
import { Bed, Ward, Patient } from '@/lib/types';
import { BedModal } from '@/components/modals/BedModal';

interface WardBedManagementProps {
  wards: Ward[];
  beds: Bed[];
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onUpdateBedStatus: (bedId: string, status: Bed['status']) => void;
  onAssignBed: (patientId: string, bedId: string) => void;
  onAddBed?: (bedData: Omit<Bed, 'id' | 'hospitalId'>) => void;
  onUpdateBed?: (bedId: string, updates: Partial<Bed>) => void;
  onDeleteBed?: (bedId: string) => void;
}

export const WardBedManagement: React.FC<WardBedManagementProps> = ({
  wards,
  beds,
  patients,
  onSelectPatient,
  onUpdateBedStatus,
  onAssignBed,
  onAddBed,
  onUpdateBed,
  onDeleteBed
}) => {
  const [selectedWardId, setSelectedWardId] = useState<string>('all');
  const [assigningBed, setAssigningBed] = useState<Bed | null>(null);
  const [selectedPatientIdToAssign, setSelectedPatientIdToAssign] = useState<string>('');
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [bedToEdit, setBedToEdit] = useState<Bed | null>(null);

  const unassignedPatients = patients.filter(
    (p) => p.currentStatus !== 'discharged' && (!p.currentBedId || p.currentStatus === 'triage')
  );

  const filteredBeds = beds.filter((b) => (selectedWardId === 'all' ? true : b.wardId === selectedWardId));

  const totalBeds = beds.length;
  const occupiedCount = beds.filter((b) => b.status === 'occupied').length;
  const availableCount = beds.filter((b) => b.status === 'available').length;
  const cleaningCount = beds.filter((b) => b.status === 'cleaning').length;
  const maintenanceCount = beds.filter((b) => b.status === 'maintenance').length;

  const hospitalOccupancyRate = totalBeds > 0 ? Math.round((occupiedCount / totalBeds) * 100) : 0;

  const handleExecuteAssign = () => {
    if (!assigningBed || !selectedPatientIdToAssign) return;
    onAssignBed(selectedPatientIdToAssign, assigningBed.id);
    setAssigningBed(null);
    setSelectedPatientIdToAssign('');
  };

  const handleOpenAddBed = () => {
    setBedToEdit(null);
    setIsBedModalOpen(true);
  };

  const handleOpenEditBed = (bed: Bed) => {
    setBedToEdit(bed);
    setIsBedModalOpen(true);
  };

  const handleSaveBedModal = (bedData: Omit<Bed, 'id' | 'hospitalId'>, bedId?: string) => {
    if (bedId && onUpdateBed) {
      onUpdateBed(bedId, bedData);
    } else if (onAddBed) {
      onAddBed(bedData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Command Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Ward & Bed Occupancy Operations</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                Live Census
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time inpatient census, ward utilization progress tracking, and bed allocation workflow.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onAddBed && (
              <button
                onClick={handleOpenAddBed}
                className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Inpatient Bed</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Hospital Census Meter with Gradient Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 p-6 rounded-b-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Hospital-Wide Inpatient Bed Utilization Rate
              </span>
              <p className="text-[11px] text-slate-500">
                {occupiedCount} of {totalBeds} total licensed inpatient beds currently occupied
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{hospitalOccupancyRate}%</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                  hospitalOccupancyRate >= 85
                    ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                    : hospitalOccupancyRate >= 70
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {hospitalOccupancyRate >= 85
                  ? 'Critical Surge Occupancy'
                  : hospitalOccupancyRate >= 70
                  ? 'Elevated Census'
                  : 'Optimal Operating Capacity'}
              </span>
            </div>
          </div>

          {/* Segmented Hospital-wide Progress Bar */}
          <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${totalBeds > 0 ? (occupiedCount / totalBeds) * 100 : 0}%` }}
              className="bg-rose-500 h-full transition-all duration-500"
              title={`Occupied: ${occupiedCount}`}
            />
            <div
              style={{ width: `${totalBeds > 0 ? (cleaningCount / totalBeds) * 100 : 0}%` }}
              className="bg-amber-400 h-full transition-all duration-500"
              title={`Sanitizing: ${cleaningCount}`}
            />
            <div
              style={{ width: `${totalBeds > 0 ? (availableCount / totalBeds) * 100 : 0}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Available: ${availableCount}`}
            />
            <div
              style={{ width: `${totalBeds > 0 ? (maintenanceCount / totalBeds) * 100 : 0}%` }}
              className="bg-slate-400 h-full transition-all duration-500"
              title={`Maintenance: ${maintenanceCount}`}
            />
          </div>

          {/* Census Breakdown Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Available (Clean)</span>
                <span className="text-lg font-bold text-emerald-700">{availableCount}</span>
                <span className="text-[10px] text-slate-400 ml-1">beds</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Occupied</span>
                <span className="text-lg font-bold text-rose-700">{occupiedCount}</span>
                <span className="text-[10px] text-slate-400 ml-1">beds</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Sanitizing</span>
                <span className="text-lg font-bold text-amber-700">{cleaningCount}</span>
                <span className="text-[10px] text-slate-400 ml-1">beds</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Inpatient Beds</span>
                <span className="text-lg font-bold text-slate-900">{totalBeds}</span>
                <span className="text-[10px] text-slate-400 ml-1">licensed</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Building className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL OCCUPANCY DASHBOARD: Progress Charts Per Ward */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Ward Utilization Progress Dashboard
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Click any ward card to filter bed view below
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wards.map((ward) => {
            const wardBeds = beds.filter((b) => b.wardId === ward.id);
            const wardTotal = wardBeds.length;
            const wardOccupied = wardBeds.filter((b) => b.status === 'occupied').length;
            const wardCleaning = wardBeds.filter((b) => b.status === 'cleaning').length;
            const wardAvailable = wardBeds.filter((b) => b.status === 'available').length;
            const wardMaintenance = wardBeds.filter((b) => b.status === 'maintenance').length;

            const wardOccupancyRate = wardTotal > 0 ? Math.round((wardOccupied / wardTotal) * 100) : 0;
            const isSelected = selectedWardId === ward.id;

            let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
            let statusLabel = 'Optimal Flow';
            if (wardOccupancyRate >= 85) {
              statusColor = 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse';
              statusLabel = 'Critical High';
            } else if (wardOccupancyRate >= 70) {
              statusColor = 'text-amber-800 bg-amber-50 border-amber-200';
              statusLabel = 'Elevated Census';
            }

            return (
              <div
                key={ward.id}
                onClick={() => setSelectedWardId(isSelected ? 'all' : ward.id)}
                className={`bg-white border rounded-xl p-4.5 transition-all shadow-xs cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                      {ward.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 group-hover:text-teal-900 transition-colors">
                      {ward.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{ward.floor}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">{wardOccupancyRate}%</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase block mt-0.5 ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Progress Chart Bar per Ward */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Bed Utilization</span>
                    <span className="font-semibold text-slate-700">
                      {wardOccupied} / {wardTotal} Beds ({wardAvailable} Available)
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-xs">
                    <div
                      style={{ width: `${wardTotal > 0 ? (wardOccupied / wardTotal) * 100 : 0}%` }}
                      className="bg-rose-500 h-full transition-all duration-300"
                      title={`Occupied: ${wardOccupied}`}
                    />
                    <div
                      style={{ width: `${wardTotal > 0 ? (wardCleaning / wardTotal) * 100 : 0}%` }}
                      className="bg-amber-400 h-full transition-all duration-300"
                      title={`Cleaning: ${wardCleaning}`}
                    />
                    <div
                      style={{ width: `${wardTotal > 0 ? (wardAvailable / wardTotal) * 100 : 0}%` }}
                      className="bg-emerald-500 h-full transition-all duration-300"
                      title={`Available: ${wardAvailable}`}
                    />
                    <div
                      style={{ width: `${wardTotal > 0 ? (wardMaintenance / wardTotal) * 100 : 0}%` }}
                      className="bg-slate-400 h-full transition-all duration-300"
                      title={`Maintenance: ${wardMaintenance}`}
                    />
                  </div>
                </div>

                {/* Ward Metrics Summary Footer */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate max-w-[150px]">{ward.specialty}</span>
                  <span className={`font-semibold ${isSelected ? 'text-teal-700 font-bold' : 'text-slate-400 group-hover:text-slate-700'}`}>
                    {isSelected ? '✓ Filtered' : 'Filter →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bed Assignment Modal / Inline Form if active */}
      {assigningBed && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-teal-200">
            <div>
              <h3 className="text-sm font-bold text-teal-950">
                Allocate Patient to Bed {assigningBed.bedNumber} ({assigningBed.wardName})
              </h3>
              <p className="text-xs text-teal-800">
                Type: {assigningBed.type.toUpperCase()} · Status: Ready for Inpatient Intake
              </p>
            </div>
            <button
              onClick={() => setAssigningBed(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-teal-950 mb-1">
                Select Patient from Triage / Intake Queue ({unassignedPatients.length} Waiting)
              </label>
              <select
                value={selectedPatientIdToAssign}
                onChange={(e) => setSelectedPatientIdToAssign(e.target.value)}
                className="w-full bg-white border border-teal-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="">Choose waiting patient...</option>
                {unassignedPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} ({p.mrn}) – {p.triageScore} – Complaint: {p.chiefComplaint}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExecuteAssign}
              disabled={!selectedPatientIdToAssign}
              className="mt-4 sm:mt-5 px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Confirm Bed Placement
            </button>
          </div>
        </div>
      )}

      {/* Bed Grid Section Header & Ward Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Inpatient Bed Directory ({filteredBeds.length} Beds)
            </h2>
          </div>

          {selectedWardId !== 'all' && (
            <button
              onClick={() => setSelectedWardId('all')}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline"
            >
              Clear Ward Filter (Show All)
            </button>
          )}
        </div>

        {/* Ward Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setSelectedWardId('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedWardId === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Wards ({beds.length})
          </button>
          {wards.map((ward) => (
            <button
              key={ward.id}
              onClick={() => setSelectedWardId(ward.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedWardId === ward.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ward.name} ({beds.filter((b) => b.wardId === ward.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Bed Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBeds.map((bed) => {
          const isOccupied = bed.status === 'occupied';
          const isAvailable = bed.status === 'available';
          const isCleaning = bed.status === 'cleaning';

          return (
            <div
              key={bed.id}
              className={`rounded-xl border p-4 transition-all shadow-xs flex flex-col justify-between ${
                isOccupied
                  ? 'bg-white border-rose-200 ring-1 ring-rose-100'
                  : isAvailable
                  ? 'bg-white border-emerald-200 hover:border-emerald-300 ring-1 ring-emerald-50'
                  : 'bg-white border-amber-200'
              }`}
            >
              <div>
                {/* Bed Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{bed.bedNumber}</span>
                    <span className="text-[10px] font-mono font-medium text-slate-500 uppercase">
                      {bed.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isOccupied
                          ? 'text-rose-700 bg-rose-50 border-rose-200'
                          : isAvailable
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {bed.status.toUpperCase()}
                    </span>

                    {/* Configure Bed Button */}
                    <button
                      onClick={() => handleOpenEditBed(bed)}
                      className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 cursor-pointer"
                      title="Configure Bed / Edit Details"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 mt-1">{bed.wardName}</div>

                {/* Bed Occupant Info if occupied */}
                {isOccupied && bed.patientId ? (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{bed.patientName}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">{bed.patientMrn}</div>
                    {bed.occupiedSince && (
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Admitted: {new Date(bed.occupiedSince).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 italic">
                    {isAvailable ? 'Bed sanitized & ready for admission' : 'Sanitation & cleaning in progress'}
                  </div>
                )}
              </div>

              {/* Action Buttons for Bed */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {isOccupied && bed.patientId ? (
                  <button
                    onClick={() => onSelectPatient(bed.patientId!)}
                    className="w-full py-1.5 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Open Patient Chart</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : isAvailable ? (
                  <button
                    onClick={() => setAssigningBed(bed)}
                    className="w-full py-1.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Assign Patient</span>
                  </button>
                ) : isCleaning ? (
                  <button
                    onClick={() => onUpdateBedStatus(bed.id, 'available')}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Sanitized</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateBedStatus(bed.id, 'available')}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Make Available
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bed Modal for Add/Edit */}
      <BedModal
        isOpen={isBedModalOpen}
        onClose={() => {
          setIsBedModalOpen(false);
          setBedToEdit(null);
        }}
        wards={wards}
        bedToEdit={bedToEdit}
        onSaveBed={handleSaveBedModal}
        onDeleteBed={onDeleteBed}
      />
    </div>
  );
};
