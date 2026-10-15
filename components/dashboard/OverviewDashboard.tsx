'use client';

import React from 'react';
import {
  Users,
  Bed,
  FlaskConical,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  HeartPulse,
  Plus,
  ShieldCheck,
  Building,
  CheckCircle2
} from 'lucide-react';
import { Hospital, Patient, Bed as BedType, LabSample } from '@/lib/types';

interface OverviewDashboardProps {
  hospital: Hospital;
  patients: Patient[];
  beds: BedType[];
  samples: LabSample[];
  onSelectPatient: (patientId: string) => void;
  onNavigateTab: (tab: 'patients' | 'beds' | 'laboratory' | 'admin') => void;
  onOpenNewPatient: () => void;
  onOpenNewSample: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  hospital,
  patients,
  beds,
  samples,
  onSelectPatient,
  onNavigateTab,
  onOpenNewPatient,
  onOpenNewSample
}) => {
  // Compute vital statistics
  const activeInpatients = patients.filter((p) => p.currentStatus !== 'discharged');
  const triagePatients = patients.filter((p) => p.currentStatus === 'triage');
  const icuPatients = patients.filter((p) => p.currentStatus === 'icu');
  const dischargePending = patients.filter((p) => p.currentStatus === 'discharge_pending');

  const occupiedBeds = beds.filter((b) => b.status === 'occupied').length;
  const availableBeds = beds.filter((b) => b.status === 'available').length;
  const cleaningBeds = beds.filter((b) => b.status === 'cleaning').length;
  const totalBeds = beds.length;
  const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const criticalSamples = samples.filter(
    (s) => s.overallUrgency === 'CRITICAL_PANIC' || (s.criticalFlags && s.criticalFlags.length > 0)
  );
  const pendingSamples = samples.filter((s) => s.status !== 'VERIFIED');

  return (
    <div className="space-y-8">
      {/* Hospital Identity & Operational Status Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              {hospital.logoInitial}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{hospital.name}</h1>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Facility Online
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span>Code: {hospital.code}</span>
                <span aria-hidden="true">·</span>
                <span>Lic: {hospital.licenseNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{hospital.type}</span>
                <span aria-hidden="true">·</span>
                <span>{hospital.address}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewPatient}
              className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Admit / Triage Patient</span>
            </button>
            <button
              onClick={onOpenNewSample}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-slate-600" />
              <span>Collect Specimen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Panic Lab Alert Banner (if any) */}
      {criticalSamples.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-rose-900">
                  Laboratory Critical Panic Notification ({criticalSamples.length} Active Findings)
                </h2>
                <p className="text-xs text-rose-800 mt-0.5">
                  High-risk clinical biomarker thresholds breached. Medical protocol mandates telephone readback confirmation to the attending physician.
                </p>
                <div className="mt-3 space-y-1.5">
                  {criticalSamples.slice(0, 3).map((sample) => (
                    <div
                      key={sample.id}
                      onClick={() => onNavigateTab('laboratory')}
                      className="bg-white/80 border border-rose-200 rounded-lg p-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-white transition-colors"
                    >
                      <div>
                        <span className="font-bold text-rose-950">{sample.patientName}</span>
                        <span className="text-slate-400 mx-1.5">·</span>
                        <span className="text-slate-600 font-mono">{sample.patientMrn}</span>
                        <span className="text-slate-400 mx-1.5">·</span>
                        <span className="font-semibold text-rose-800">{sample.panelType}</span>
                        <span className="text-slate-400 mx-1.5">·</span>
                        <span className="text-slate-600">Barcode {sample.sampleBarcode}</span>
                      </div>
                      <div className="text-rose-700 font-medium flex items-center gap-1">
                        <span>Review specimen findings</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('laboratory')}
              className="text-xs font-bold text-rose-800 hover:text-rose-950 bg-rose-100/70 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ml-4"
            >
              Open Lab Center
            </button>
          </div>
        </div>
      )}

      {/* 4 Core Clinical Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Inpatient Population */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Inpatients</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{activeInpatients.length}</span>
            <span className="text-xs text-slate-500">currently admitted</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Triage: {triagePatients.length}</span>
            <span aria-hidden="true">·</span>
            <span>Discharge pending: {dischargePending.length}</span>
          </div>
        </div>

        {/* Metric 2: Bed Occupancy */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bed Occupancy</span>
            <Bed className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{occupancyPercent}%</span>
            <span className="text-xs text-slate-500">
              ({occupiedBeds} / {totalBeds} beds)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-emerald-700 font-medium">{availableBeds} Available</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700">{cleaningBeds} Sanitizing</span>
          </div>
        </div>

        {/* Metric 3: Critical ICU Census */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ICU / Critical Care</span>
            <HeartPulse className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{icuPatients.length}</span>
            <span className="text-xs text-slate-500">on continuous telemetry</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>High early warning score</span>
            <button
              onClick={() => onNavigateTab('beds')}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
            >
              Bed map →
            </button>
          </div>
        </div>

        {/* Metric 4: Lab Specimen Pipeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lab Pipeline</span>
            <FlaskConical className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{pendingSamples.length}</span>
            <span className="text-xs text-slate-500">in processing / review</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Critical alerts: {criticalSamples.length}</span>
            <button
              onClick={() => onNavigateTab('laboratory')}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
            >
              Diagnostic run →
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual Columns: Patient Admission & Monitoring Flow + Bed Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1 & 2: Active Patient Journey Tracking */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Active Patient Monitoring & Flow</h2>
                <p className="text-xs text-slate-500">
                  Real-time status tracking from entry triage to bed allocation and discharge clearance.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('patients')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Patients ({patients.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {activeInpatients.slice(0, 6).map((patient) => {
                let statusBadgeColor = 'text-blue-700 bg-blue-50 border-blue-200';
                let statusLabel = 'Inpatient';
                if (patient.currentStatus === 'triage') {
                  statusBadgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
                  statusLabel = 'Triage Intake';
                } else if (patient.currentStatus === 'icu') {
                  statusBadgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
                  statusLabel = 'Critical ICU';
                } else if (patient.currentStatus === 'discharge_pending') {
                  statusBadgeColor = 'text-purple-700 bg-purple-50 border-purple-200';
                  statusLabel = 'Discharge Clearance';
                }

                return (
                  <div
                    key={patient.id}
                    onClick={() => onSelectPatient(patient.id)}
                    className="py-3.5 px-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 mt-0.5">
                        {patient.firstName[0]}
                        {patient.lastName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusBadgeColor}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2.5 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono text-slate-600 font-medium">{patient.mrn}</span>
                          <span aria-hidden="true">·</span>
                          <span>{patient.age}y / {patient.gender.toUpperCase()}</span>
                          <span aria-hidden="true">·</span>
                          <span>Blood: {patient.bloodType}</span>
                          {patient.currentBedNumber && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-medium text-slate-700">Bed: {patient.currentBedNumber}</span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          {patient.admissionDiagnosis || patient.chiefComplaint}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between text-xs text-slate-500 shrink-0">
                      <span className="font-medium text-slate-700">
                        {patient.attendingDoctorName || 'Pending Physician'}
                      </span>
                      <span className="text-[11px] text-teal-700 font-semibold mt-1 flex items-center gap-1">
                        Open Monitoring Chart →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Intake Checklist Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block mb-1">
                  Clinical Admission Protocol
                </span>
                <h3 className="text-sm font-bold text-white">Full Lifecycle Patient Monitoring Standard</h3>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Every patient entering HOSCARE is tracked continuously from triage check-in, bedside vitals & medications, and diagnostic laboratory testing, through to signed clinical discharge.
                </p>
              </div>
              <button
                onClick={onOpenNewPatient}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
              >
                Intake New Patient
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: Wards, Bed Status & Quick Diagnostics */}
        <div className="space-y-6">
          {/* Bed Allocation Snapshot */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Ward Occupancy</h2>
              <button
                onClick={() => onNavigateTab('beds')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                Bed Grid →
              </button>
            </div>

            <div className="space-y-4">
              {hospital.id === 'hosp-st-jude' && (
                <>
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                      <span className="text-slate-800">Emergency Department (Bay)</span>
                      <span className="text-slate-500">2 / 6 Beds</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '33%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                      <span className="text-slate-800">Intensive Care Unit (ICU)</span>
                      <span className="text-rose-600 font-semibold">3 / 6 Beds (50%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-rose-500 h-2 rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                      <span className="text-slate-800">Cardiology & Telemetry</span>
                      <span className="text-slate-500">2 / 8 Beds</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-teal-600 h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                      <span className="text-slate-800">Med-Surg Floor 5</span>
                      <span className="text-slate-500">4 / 12 Beds</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '33%' }} />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Available: {availableBeds}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Occupied: {occupiedBeds}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Cleaning: {cleaningBeds}
                </span>
              </div>
            </div>
          </div>

          {/* Laboratory Diagnostic Workstation Preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Lab Analysis Pipeline</h2>
              <button
                onClick={() => onNavigateTab('laboratory')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                Workstation →
              </button>
            </div>

            <div className="space-y-3">
              {samples.slice(0, 4).map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => onNavigateTab('laboratory')}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{sample.panelType}</span>
                    <span className="text-[10px] font-mono font-medium text-slate-500">
                      {sample.sampleBarcode}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 truncate">{sample.patientName}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1 border-t border-slate-100">
                    <span>{sample.specimenType}</span>
                    <span
                      className={`font-semibold ${
                        sample.overallUrgency === 'CRITICAL_PANIC'
                          ? 'text-rose-600 font-bold'
                          : sample.status === 'VERIFIED'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {sample.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenNewSample}
              className="w-full mt-4 py-2 border border-dashed border-slate-300 hover:border-teal-600 rounded-lg text-xs font-semibold text-slate-700 hover:text-teal-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Accession New Specimen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
