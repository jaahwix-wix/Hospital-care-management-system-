'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Activity,
  Bed,
  Heart,
  Thermometer,
  Wind,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  Pill,
  FlaskConical,
  LogOut,
  Printer,
  ChevronRight,
  ShieldAlert,
  User,
  Phone,
  Calendar
} from 'lucide-react';
import {
  Patient,
  VitalSign,
  ClinicalNote,
  MedicationOrder,
  LabSample,
  Bed as BedType,
  UserRole,
  Hospital,
  TransferRecord
} from '@/lib/types';
import { RiskAssessmentCard } from './RiskAssessmentCard';
import { PrintablePatientReportModal } from './PrintablePatientReportModal';
import { ExportReportModal } from './ExportReportModal';
import { EditPatientModal } from '../modals/EditPatientModal';
import { TransferPatientModal } from '../modals/TransferPatientModal';
import { hasPrivilege } from '@/lib/permissions';
import { ArrowRightLeft, Download, Edit2, Trash2 } from 'lucide-react';

interface PatientMonitoringViewProps {
  patient: Patient;
  hospital: Hospital;
  allHospitals: Hospital[];
  vitals: VitalSign[];
  notes: ClinicalNote[];
  medications: MedicationOrder[];
  samples: LabSample[];
  beds: BedType[];
  onBack: () => void;
  onRecordVitals: (vital: Omit<VitalSign, 'id' | 'hospitalId' | 'recordedBy' | 'recordedByRole' | 'news2Score'>) => void;
  onDeleteVital?: (vitalId: string) => void;
  onAddNote: (note: Omit<ClinicalNote, 'id' | 'hospitalId' | 'authorName' | 'authorRole'>) => void;
  onUpdateNote?: (noteId: string, updates: Partial<ClinicalNote>) => void;
  onDeleteNote?: (noteId: string) => void;
  onAddMedication: (med: Omit<MedicationOrder, 'id' | 'hospitalId'>) => void;
  onUpdateMedication?: (medId: string, updates: Partial<MedicationOrder>) => void;
  onDeleteMedication?: (medId: string) => void;
  onAssignBed: (patientId: string, bedId: string) => void;
  onUpdateStatus: (patientId: string, status: Patient['currentStatus'], details?: { dischargeDiagnosis?: string; dischargeSummary?: string }) => void;
  onUpdatePatient?: (patientId: string, updates: Partial<Patient>) => void;
  onDeletePatient?: (patientId: string, reason?: string) => void;
  onTransferPatient: (patientId: string, targetHospitalId: string, reason: string, priority: TransferRecord['priority'], clinicalSummary: string) => void;
  onOpenNewSampleForPatient: (patient: Patient) => void;
  currentRole: UserRole;
  currentStaffName: string;
}

export const PatientMonitoringView: React.FC<PatientMonitoringViewProps> = ({
  patient,
  hospital,
  allHospitals,
  vitals,
  notes,
  medications,
  samples,
  beds,
  onBack,
  onRecordVitals,
  onDeleteVital,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
  onAssignBed,
  onUpdateStatus,
  onUpdatePatient,
  onDeletePatient,
  onTransferPatient,
  onOpenNewSampleForPatient,
  currentRole,
  currentStaffName
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'notes' | 'medications' | 'labs' | 'discharge'>('vitals');
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // New Vital Form State
  const [showVitalForm, setShowVitalForm] = useState(false);
  const [heartRate, setHeartRate] = useState(78);
  const [bpSystolic, setBpSystolic] = useState(120);
  const [bpDiastolic, setBpDiastolic] = useState(80);
  const [respRate, setRespRate] = useState(16);
  const [o2Sat, setO2Sat] = useState(98);
  const [temp, setTemp] = useState(36.8);
  const [pain, setPain] = useState(2);
  const [consciousness, setConsciousness] = useState<'ALERT' | 'VOICE_RESPONSIVE' | 'PAIN_RESPONSIVE' | 'UNRESPONSIVE'>('ALERT');
  const [vitalNotes, setVitalNotes] = useState('');

  // New Note Form State
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<ClinicalNote['noteType']>('physician_round');

  // New Med Form State
  const [showMedForm, setShowMedForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medRoute, setMedRoute] = useState<MedicationOrder['route']>('Oral');
  const [medFreq, setMedFreq] = useState('Once daily');

  // Discharge Checklist State
  const [dischargeDiagnosis, setDischargeDiagnosis] = useState(patient.admissionDiagnosis || '');
  const [dischargeSummary, setDischargeSummary] = useState(patient.dischargeSummary || '');
  const [critVitalsStable, setCritVitalsStable] = useState(true);
  const [critDoctorSigned, setCritDoctorSigned] = useState(true);
  const [critMedsDispensed, setCritMedsDispensed] = useState(true);
  const [critHomeCareReady, setCritHomeCareReady] = useState(true);

  // Bed allocation dropdown
  const [selectedBedId, setSelectedBedId] = useState(patient.currentBedId || '');

  // Patient data subsets
  const patientVitals = vitals.filter((v) => v.patientId === patient.id);
  const patientNotes = notes.filter((n) => n.patientId === patient.id);
  const patientMeds = medications.filter((m) => m.patientId === patient.id);
  const patientSamples = samples.filter((s) => s.patientId === patient.id);
  const availableBeds = beds.filter((b) => b.status === 'available' || b.id === patient.currentBedId);

  const latestVital = patientVitals[0];

  const handleSaveVital = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordVitals({
      patientId: patient.id,
      recordedAt: new Date().toISOString(),
      heartRate: Number(heartRate),
      bloodPressureSystolic: Number(bpSystolic),
      bloodPressureDiastolic: Number(bpDiastolic),
      respiratoryRate: Number(respRate),
      oxygenSaturation: Number(o2Sat),
      temperature: Number(temp),
      painScore: Number(pain),
      consciousness,
      notes: vitalNotes
    });
    setShowVitalForm(false);
    setVitalNotes('');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;
    onAddNote({
      patientId: patient.id,
      recordedAt: new Date().toISOString(),
      noteType,
      title: noteTitle,
      content: noteContent
    });
    setShowNoteForm(false);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;
    onAddMedication({
      patientId: patient.id,
      medicationName: medName,
      dosage: medDosage,
      route: medRoute,
      frequency: medFreq,
      prescribedBy: currentStaffName,
      startDate: new Date().toISOString(),
      status: 'active'
    });
    setShowMedForm(false);
    setMedName('');
    setMedDosage('');
  };

  const handleExecuteDischarge = () => {
    onUpdateStatus(patient.id, 'discharged', {
      dischargeDiagnosis,
      dischargeSummary: dischargeSummary || `Patient clinically stabilized. Vitals normalized. Cleared for discharge by ${currentStaffName}.`
    });
  };

  // Lifecycle stage status
  const stages = [
    { id: 'triage', label: '1. Entry & Triage', done: true, current: patient.currentStatus === 'triage' },
    { id: 'admitted', label: '2. Bed Allocation', done: !!patient.currentBedId || patient.currentStatus !== 'triage', current: patient.currentStatus === 'admitted' },
    { id: 'monitoring', label: '3. Inpatient Care', done: patient.currentStatus === 'in_monitoring' || patient.currentStatus === 'icu' || patient.currentStatus === 'discharge_pending' || patient.currentStatus === 'discharged', current: patient.currentStatus === 'in_monitoring' || patient.currentStatus === 'icu' },
    { id: 'clearance', label: '4. Discharge Review', done: patient.currentStatus === 'discharge_pending' || patient.currentStatus === 'discharged', current: patient.currentStatus === 'discharge_pending' },
    { id: 'discharged', label: '5. Discharged / Departed', done: patient.currentStatus === 'discharged', current: patient.currentStatus === 'discharged' }
  ];

  return (
    <div className="space-y-6">
      {/* Back button and patient title bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Patient Directory</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Formatted Clinical Report Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Export clinical summary, medications, and laboratory results"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>Export Clinical Report</span>
          </button>

          {/* Consolidated Printable PDF Visit Report Button */}
          <button
            onClick={() => setShowPrintReportModal(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-teal-700" />
            <span>Consolidated PDF Report</span>
          </button>

          {/* Edit Patient Demographics & Profile */}
          {hasPrivilege(currentRole, 'edit_patient') && onUpdatePatient && (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Edit patient profile, allergies, contacts, and chronic conditions"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Record</span>
            </button>
          )}

          {/* Delete Patient Record (Admin privilege) */}
          {hasPrivilege(currentRole, 'delete_records') && onDeletePatient && (
            <button
              onClick={() => {
                if (confirm(`PERMANENT ACTION: Are you sure you want to delete and purge the patient record for ${patient.firstName} ${patient.lastName} (${patient.mrn})? This will release their bed and remove active clinical entries.`)) {
                  onDeletePatient(patient.id, 'Administrative purge');
                  onBack();
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-rose-200 hover:border-rose-300 bg-rose-50 text-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Permanently delete medical record (CMO / Admin only)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Delete Record</span>
            </button>
          )}

          {/* Inter-Hospital Transfer Button */}
          {patient.currentStatus !== 'discharged' && (
            <button
              onClick={() => setShowTransferModal(true)}
              disabled={!hasPrivilege(currentRole, 'transfer_patient')}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300 bg-indigo-50 text-indigo-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title={!hasPrivilege(currentRole, 'transfer_patient') ? 'Requires transfer authorization privilege' : ''}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-700" />
              <span>Inter-Hospital Transfer</span>
            </button>
          )}

          {patient.currentStatus !== 'discharged' ? (
            <button
              onClick={() => {
                setActiveTab('discharge');
              }}
              disabled={!hasPrivilege(currentRole, 'discharge_patient')}
              className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={!hasPrivilege(currentRole, 'discharge_patient') ? 'Requires attending doctor discharge privilege' : ''}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Discharge Clearance Checklist</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Patient Successfully Discharged
            </span>
          )}
        </div>
      </div>

      {/* Patient Master Card & Clinical Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xl shrink-0">
              {patient.firstName[0]}
              {patient.lastName[0]}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {patient.firstName} {patient.lastName}
                </h1>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                  {patient.mrn}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${
                    patient.currentStatus === 'icu'
                      ? 'text-rose-700 bg-rose-50 border-rose-200'
                      : patient.currentStatus === 'triage'
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : patient.currentStatus === 'discharged'
                      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                      : 'text-blue-700 bg-blue-50 border-blue-200'
                  }`}
                >
                  {patient.currentStatus.toUpperCase().replace('_', ' ')}
                </span>
              </div>

              {/* Patient Core Demographics */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2">
                <span>DOB: {patient.dateOfBirth} ({patient.age} yrs)</span>
                <span aria-hidden="true">·</span>
                <span>Sex: {patient.gender.toUpperCase()}</span>
                <span aria-hidden="true">·</span>
                <span className="font-bold text-slate-800">Blood Type: {patient.bloodType}</span>
                <span aria-hidden="true">·</span>
                <span>Attending: {patient.attendingDoctorName || 'Pending'}</span>
              </div>

              {/* Bed Location & Entry Time */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Bed className="w-3.5 h-3.5 text-teal-600" />
                  {patient.currentBedNumber
                    ? `Bed ${patient.currentBedNumber} · ${patient.currentWardName}`
                    : 'Emergency Triage Bay (Awaiting Inpatient Bed)'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Entered Hospital: {new Date(patient.triageEntryAt).toLocaleString()}
                </span>
                {patient.dischargedAt && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-semibold">
                      Discharged: {new Date(patient.dischargedAt).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Allergies and Chronic Conditions */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Allergies:</span>
                {patient.allergies.length > 0 ? (
                  patient.allergies.map((all) => (
                    <span
                      key={all}
                      className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded"
                    >
                      ⚠ {all}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No known drug allergies</span>
                )}

                {patient.chronicConditions.length > 0 && (
                  <>
                    <span className="text-slate-300 ml-2">|</span>
                    <span className="text-xs font-semibold text-slate-500 ml-1">History:</span>
                    {patient.chronicConditions.map((cond) => (
                      <span
                        key={cond}
                        className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded"
                      >
                        {cond}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Bed Assignment Control */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs w-full lg:w-72 shrink-0">
            <span className="font-semibold text-slate-800 block mb-1">Ward & Bed Allocation</span>
            <div className="flex items-center gap-2">
              <select
                value={selectedBedId}
                onChange={(e) => setSelectedBedId(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="">Select available bed...</option>
                {availableBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bedNumber} - {b.wardName} ({b.type.toUpperCase()})
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (selectedBedId) onAssignBed(patient.id, selectedBedId);
                }}
                disabled={!selectedBedId || selectedBedId === patient.currentBedId}
                className="px-2.5 py-1.5 rounded bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-medium text-xs cursor-pointer"
              >
                Assign
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Current: {patient.currentBedNumber || 'None'} ({patient.currentWardName || 'Unassigned'})
            </p>
          </div>
        </div>

        {/* Chief Complaint / Triage Presentation Banner */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
              Presenting Chief Complaint (At Entry)
            </span>
            <p className="text-xs text-slate-900 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {patient.chiefComplaint}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
              Working Admission Diagnosis
            </span>
            <p className="text-xs text-slate-900 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {patient.admissionDiagnosis || 'Clinical workup in progress'}
            </p>
          </div>
        </div>

        {/* Inter-Hospital Medical Record Continuity Notice if Transferred */}
        {patient.transferredFromHospitalName && (
          <div className="mt-4 p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-start gap-3">
            <ArrowRightLeft className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="font-bold">Inter-Hospital Medical Record Continuity Active:</strong>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.2 rounded border border-indigo-200 uppercase">
                  Transferred from {patient.transferredFromHospitalName}
                </span>
              </div>
              <p className="text-indigo-900/90 mt-1 leading-relaxed">
                This patient was transferred to {hospital.name} with full clinical data access. All prior bedside vitals, physician round notes, and diagnostic laboratory findings from {patient.transferredFromHospitalName} are preserved below.
              </p>
            </div>
          </div>
        )}

        {/* Patient Monitoring Journey Stepper (Entry to Departure) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">
              Continuous Patient Stay Journey (Entry → Departure)
            </span>
            <span className="text-xs text-slate-500">Protocol E-Track 2026</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                  stage.current
                    ? 'border-teal-600 bg-teal-50 font-bold text-teal-900 ring-2 ring-teal-500/20'
                    : stage.done
                    ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  {stage.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span className="truncate">{stage.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Tabs: Vitals, Notes, Medications, Labs, Discharge */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/50">
          <button
            onClick={() => setActiveTab('vitals')}
            className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'vitals'
                ? 'border-teal-700 text-teal-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Vital Signs & Deterioration (NEWS2)</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
              {patientVitals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'notes'
                ? 'border-teal-700 text-teal-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Physician Rounds & Clinical Notes</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
              {patientNotes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('medications')}
            className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'medications'
                ? 'border-teal-700 text-teal-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Medication Chart (MAR)</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
              {patientMeds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('labs')}
            className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'labs'
                ? 'border-teal-700 text-teal-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Laboratory Diagnostics</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
              {patientSamples.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('discharge')}
            className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'discharge'
                ? 'border-teal-700 text-teal-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Discharge Clearance</span>
          </button>
        </div>

        {/* Tab Content 1: Vital Signs */}
        {activeTab === 'vitals' && (
          <div className="p-6 space-y-6">
            {/* Color-Coded EWS Early Warning Deterioration Risk Assessment Card */}
            <RiskAssessmentCard vitals={patientVitals} />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bedside Physiological Monitoring</h3>
                <p className="text-xs text-slate-500">
                  Continuous vital telemetry with automated National Early Warning Score (NEWS2) calculation.
                </p>
              </div>
              <button
                onClick={() => setShowVitalForm(!showVitalForm)}
                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record New Vitals</span>
              </button>
            </div>

            {/* Record Vitals Drawer / Form */}
            {showVitalForm && (
              <form onSubmit={handleSaveVital} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Log Clinical Vital Signs
                  </h4>
                  <span className="text-xs text-slate-500">Recorder: {currentStaffName}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={bpSystolic}
                      onChange={(e) => setBpSystolic(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={bpDiastolic}
                      onChange={(e) => setBpDiastolic(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      value={o2Sat}
                      onChange={(e) => setO2Sat(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Resp Rate (/min)</label>
                    <input
                      type="number"
                      value={respRate}
                      onChange={(e) => setRespRate(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Pain Score (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={pain}
                      onChange={(e) => setPain(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Consciousness</label>
                    <select
                      value={consciousness}
                      onChange={(e) => setConsciousness(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                    >
                      <option value="ALERT">Alert</option>
                      <option value="VOICE_RESPONSIVE">Voice Responsive</option>
                      <option value="PAIN_RESPONSIVE">Pain Responsive</option>
                      <option value="UNRESPONSIVE">Unresponsive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-semibold mb-1">Bedside Observations / Notes</label>
                  <input
                    type="text"
                    value={vitalNotes}
                    onChange={(e) => setVitalNotes(e.target.value)}
                    placeholder="e.g., Patient comfortable, oxygen cannula 2L/min, resting comfortably"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowVitalForm(false)}
                    className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Save Vitals
                  </button>
                </div>
              </form>
            )}

            {/* Latest Vitals Metric Cards */}
            {latestVital ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                    <span>Heart Rate</span>
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{latestVital.heartRate}</span>
                    <span className="text-[10px] text-slate-500">bpm</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Normal: 60-100</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                    <span>Blood Pressure</span>
                    <Activity className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">
                      {latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic}
                    </span>
                    <span className="text-[10px] text-slate-500">mmHg</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Normal: 120/80</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                    <span>Oxygen Sat (SpO2)</span>
                    <Wind className="w-3.5 h-3.5 text-teal-500" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{latestVital.oxygenSaturation}</span>
                    <span className="text-[10px] text-slate-500">%</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Target: ≥ 96%</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                    <span>Resp Rate</span>
                    <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{latestVital.respiratoryRate}</span>
                    <span className="text-[10px] text-slate-500">/min</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Normal: 12-20</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                    <span>Temperature</span>
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{latestVital.temperature}</span>
                    <span className="text-[10px] text-slate-500">°C</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Normal: 36.5-37.5</span>
                </div>

                <div className={`rounded-lg p-3 border ${
                  latestVital.news2Score >= 7
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : latestVital.news2Score >= 5
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>NEWS2 Score</span>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold">{latestVital.news2Score}</span>
                    <span className="text-[10px]">pts</span>
                  </div>
                  <span className="text-[10px] font-medium">
                    {latestVital.news2Score >= 7
                      ? 'High Clinical Risk'
                      : latestVital.news2Score >= 5
                      ? 'Medium Alert'
                      : 'Low Risk'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl">
                No vitals recorded yet. Click &quot;Record New Vitals&quot; above to start bedside monitoring.
              </div>
            )}

            {/* Vitals History Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Telemetry Log History
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">HR</th>
                      <th className="py-2.5 px-3">BP</th>
                      <th className="py-2.5 px-3">SpO2</th>
                      <th className="py-2.5 px-3">RR</th>
                      <th className="py-2.5 px-3">Temp</th>
                      <th className="py-2.5 px-3">NEWS2</th>
                      <th className="py-2.5 px-3">Recorded By</th>
                      <th className="py-2.5 px-3">Notes</th>
                      {onDeleteVital && hasPrivilege(currentRole, 'delete_records') && (
                        <th className="py-2.5 px-3 text-right">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patientVitals.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {new Date(v.recordedAt).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">{v.heartRate} bpm</td>
                        <td className="py-2.5 px-3">
                          {v.bloodPressureSystolic}/{v.bloodPressureDiastolic}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-teal-700">{v.oxygenSaturation}%</td>
                        <td className="py-2.5 px-3">{v.respiratoryRate}/min</td>
                        <td className="py-2.5 px-3">{v.temperature}°C</td>
                        <td className="py-2.5 px-3 font-bold">
                          <span className={v.news2Score >= 5 ? 'text-rose-600' : 'text-slate-800'}>
                            {v.news2Score}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{v.recordedBy}</td>
                        <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{v.notes || '—'}</td>
                        {onDeleteVital && hasPrivilege(currentRole, 'delete_records') && (
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => {
                                if (confirm('Delete this erroneous vital sign entry from the record?')) {
                                  onDeleteVital(v.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer transition-colors"
                              title="Delete erroneous vital entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Notes & Physician Rounds */}
        {activeTab === 'notes' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Clinical Progress Notes & Physician Rounds</h3>
                <p className="text-xs text-slate-500">
                  Document ongoing physician assessments, nursing interventions, and consults.
                </p>
              </div>
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Clinical Note</span>
              </button>
            </div>

            {showNoteForm && (
              <form onSubmit={handleSaveNote} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Note Type</label>
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                    >
                      <option value="physician_round">Attending Physician Round Note</option>
                      <option value="nursing_assessment">Nursing Care Assessment</option>
                      <option value="urgent_consult">Urgent Specialist Consult</option>
                      <option value="triage_intake">Triage Intake Note</option>
                      <option value="discharge_summary">Discharge Summary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Note Title</label>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="e.g., Morning Cardiovascular Round Evaluation"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-semibold mb-1">Clinical Narrative</label>
                  <textarea
                    rows={4}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter objective clinical findings, assessment, diagnostic decisions, and plan..."
                    className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(false)}
                    className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Sign & Save Note
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {patientNotes.map((note) => (
                <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{note.title}</span>
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {note.noteType.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {new Date(note.recordedAt).toLocaleString()}
                      </span>
                      {onDeleteNote && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete clinical note "${note.title}"?`)) {
                              onDeleteNote(note.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer transition-colors"
                          title="Delete clinical note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 mt-2.5 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Signed: <strong className="text-slate-800">{note.authorName}</strong></span>
                    <span className="uppercase tracking-wider">{note.authorRole}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Medications */}
        {activeTab === 'medications' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Medication Administration Record (MAR)</h3>
                <p className="text-xs text-slate-500">
                  Prescribed pharmacological orders, delivery routes, and administration schedules.
                </p>
              </div>
              <button
                onClick={() => setShowMedForm(!showMedForm)}
                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Prescribe Medication</span>
              </button>
            </div>

            {showMedForm && (
              <form onSubmit={handleSaveMed} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Medication Name</label>
                    <input
                      type="text"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      placeholder="e.g., Ceftriaxone or Lisinopril"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Dosage</label>
                    <input
                      type="text"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      placeholder="e.g., 1g in 100mL Saline or 10mg"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Route</label>
                    <select
                      value={medRoute}
                      onChange={(e) => setMedRoute(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                    >
                      <option value="Oral">Oral (PO)</option>
                      <option value="IV Infusion">IV Infusion</option>
                      <option value="IV Push">IV Push</option>
                      <option value="Subcutaneous">Subcutaneous (SubQ)</option>
                      <option value="Inhaled">Inhaled</option>
                      <option value="Topical">Topical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Frequency</label>
                    <input
                      type="text"
                      value={medFreq}
                      onChange={(e) => setMedFreq(e.target.value)}
                      placeholder="e.g., Q12H or STAT x1"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMedForm(false)}
                    className="px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Sign Prescription
                  </button>
                </div>
              </form>
            )}

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Medication</th>
                    <th className="py-2.5 px-3">Dosage & Route</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Prescriber</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Administered</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patientMeds.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{med.medicationName}</td>
                      <td className="py-2.5 px-3">
                        {med.dosage} · <span className="text-slate-500">{med.route}</span>
                      </td>
                      <td className="py-2.5 px-3">{med.frequency}</td>
                      <td className="py-2.5 px-3 text-slate-600">{med.prescribedBy}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          med.status === 'active'
                            ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                            : med.status === 'completed'
                            ? 'text-blue-800 bg-blue-50 border-blue-200'
                            : 'text-slate-500 bg-slate-100 border-slate-200 line-through'
                        }`}>
                          {med.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {med.lastAdministeredAt ? new Date(med.lastAdministeredAt).toLocaleTimeString() : 'Pending schedule'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {med.status === 'active' && onUpdateMedication && (
                            <>
                              <button
                                onClick={() => {
                                  onUpdateMedication(med.id, { lastAdministeredAt: new Date().toISOString() });
                                }}
                                className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold cursor-pointer transition-colors"
                                title="Log dose administration timestamp"
                              >
                                Administer
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateMedication(med.id, { status: 'discontinued' });
                                }}
                                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                                title="Discontinue medication order"
                              >
                                Discontinue
                              </button>
                            </>
                          )}
                          {onDeleteMedication && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete medication order "${med.medicationName}"?`)) {
                                  onDeleteMedication(med.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer transition-colors"
                              title="Delete prescription record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content 4: Laboratory Diagnostics */}
        {activeTab === 'labs' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Laboratory Orders & Patient Specimens</h3>
                <p className="text-xs text-slate-500">
                  Specimen collection, barcode accessioning, and biochemical panel evaluations.
                </p>
              </div>
              <button
                onClick={() => onOpenNewSampleForPatient(patient)}
                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Order New Lab Test</span>
              </button>
            </div>

            <div className="space-y-4">
              {patientSamples.map((sample) => (
                <div key={sample.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{sample.panelType} Panel</span>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {sample.sampleBarcode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            sample.overallUrgency === 'CRITICAL_PANIC'
                              ? 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse'
                              : 'text-slate-700 bg-slate-100'
                          }`}
                        >
                          {sample.priority}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Specimen: {sample.specimenType} ({sample.tubeColor}) · Collected {new Date(sample.collectedAt).toLocaleTimeString()} by {sample.collectedBy}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                        {sample.status}
                      </span>
                    </div>
                  </div>

                  {/* Biomarkers Result Grid */}
                  {sample.analyzedItems && Object.keys(sample.analyzedItems).length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {Object.entries(sample.analyzedItems).map(([key, item]) => (
                        <div
                          key={key}
                          className={`p-2 rounded border ${
                            item.status.includes('CRITICAL')
                              ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                              : item.status !== 'NORMAL'
                              ? 'bg-amber-50 border-amber-200 text-amber-950'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="text-[10px] text-slate-500 truncate">{item.name}</div>
                          <div className="text-sm font-bold mt-0.5">
                            {item.value} <span className="text-[10px] font-normal text-slate-500">{item.unit}</span>
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">Ref: {item.reference_range}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Critical Flags if present */}
                  {sample.criticalFlags && sample.criticalFlags.length > 0 && (
                    <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 font-semibold space-y-1">
                      {sample.criticalFlags.map((flag, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pathologist Notes */}
                  {sample.pathologistNotes && (
                    <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
                      <strong className="text-slate-900">Pathologist Diagnostic Impression: </strong>
                      {sample.pathologistNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 5: Discharge Clearance */}
        {activeTab === 'discharge' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Formal Clinical Discharge Clearance</h3>
              <p className="text-xs text-slate-500">
                Verify stabilization criteria, review take-home orders, and finalize the patient departure summary.
              </p>
            </div>

            {patient.currentStatus === 'discharged' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Patient Has Been Officially Discharged</span>
                </div>
                <div className="text-xs text-emerald-800 space-y-1">
                  <p><strong>Departure Timestamp:</strong> {new Date(patient.dischargedAt || '').toLocaleString()}</p>
                  <p><strong>Cleared By:</strong> {patient.dischargeClearedBy || currentStaffName}</p>
                  <p><strong>Final Discharge Diagnosis:</strong> {patient.dischargeDiagnosis}</p>
                  <p><strong>Departure Summary:</strong> {patient.dischargeSummary}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Discharge Protocol Checklist */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Discharge Readiness Checklist
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-white border border-slate-200">
                      <input
                        type="checkbox"
                        checked={critVitalsStable}
                        onChange={(e) => setCritVitalsStable(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Bedside vitals normalized & stable for &gt;24 hours</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-white border border-slate-200">
                      <input
                        type="checkbox"
                        checked={critDoctorSigned}
                        onChange={(e) => setCritDoctorSigned(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Attending physician signed discharge approval order</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-white border border-slate-200">
                      <input
                        type="checkbox"
                        checked={critMedsDispensed}
                        onChange={(e) => setCritMedsDispensed(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Take-home medications and prescriptions verified</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-white border border-slate-200">
                      <input
                        type="checkbox"
                        checked={critHomeCareReady}
                        onChange={(e) => setCritHomeCareReady(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Patient / family education & follow-up appointment set</span>
                    </label>
                  </div>
                </div>

                {/* Final Diagnosis & Summary Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Final Discharge Diagnosis
                    </label>
                    <input
                      type="text"
                      value={dischargeDiagnosis}
                      onChange={(e) => setDischargeDiagnosis(e.target.value)}
                      placeholder="e.g., Resolved acute coronary syndrome, stabilized on oral antiplatelet therapy"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Discharge Summary & Outpatient Instructions
                    </label>
                    <textarea
                      rows={4}
                      value={dischargeSummary}
                      onChange={(e) => setDischargeSummary(e.target.value)}
                      placeholder="Provide comprehensive summary of hospital stay, procedures performed, resolved issues, activity restrictions, and follow-up timeline..."
                      className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Discharge Action Button */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Executing discharge will release Bed {patient.currentBedNumber || 'N/A'} for sanitation and mark patient stay complete.
                  </p>
                  <button
                    onClick={handleExecuteDischarge}
                    disabled={!critVitalsStable || !critDoctorSigned}
                    className="px-5 py-2.5 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Discharge & Free Bed</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Formatted Clinical Report Modal */}
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        patient={patient}
        hospital={hospital}
        vitals={vitals}
        notes={notes}
        medications={medications}
        samples={samples}
        currentStaffName={currentStaffName}
        onOpenPdfView={() => setShowPrintReportModal(true)}
      />

      {/* Edit Patient Demographic & Profile Modal */}
      {onUpdatePatient && (
        <EditPatientModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          patient={patient}
          onSave={onUpdatePatient}
          currentRole={currentRole}
        />
      )}

      {/* Printable Consolidated PDF Visit Report Modal */}
      <PrintablePatientReportModal
        isOpen={showPrintReportModal}
        onClose={() => setShowPrintReportModal(false)}
        patient={patient}
        hospital={hospital}
        vitals={vitals}
        notes={notes}
        medications={medications}
        samples={samples}
        currentStaffName={currentStaffName}
      />

      {/* Inter-Hospital Patient Transfer Modal */}
      <TransferPatientModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        patient={patient}
        currentHospital={hospital}
        allHospitals={allHospitals}
        onExecuteTransfer={onTransferPatient}
        currentStaffName={currentStaffName}
      />
    </div>
  );
};
