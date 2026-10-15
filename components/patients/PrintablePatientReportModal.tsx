'use client';

import React from 'react';
import {
  X,
  Printer,
  FileText,
  Building2,
  Calendar,
  User,
  Shield,
  Activity,
  Pill,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Patient, VitalSign, ClinicalNote, MedicationOrder, LabSample, Hospital } from '@/lib/types';

interface PrintablePatientReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  hospital: Hospital;
  vitals: VitalSign[];
  notes: ClinicalNote[];
  medications: MedicationOrder[];
  samples: LabSample[];
  currentStaffName: string;
}

export const PrintablePatientReportModal: React.FC<PrintablePatientReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  hospital,
  vitals,
  notes,
  medications,
  samples,
  currentStaffName
}) => {
  if (!isOpen) return null;

  const patientVitals = vitals.filter((v) => v.patientId === patient.id);
  const patientNotes = notes.filter((n) => n.patientId === patient.id);
  const patientMeds = medications.filter((m) => m.patientId === patient.id);
  const patientSamples = samples.filter((s) => s.patientId === patient.id);

  const handlePrint = () => {
    window.print();
  };

  const reportId = `REP-${patient.mrn}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-medical-report, #printable-medical-report * {
                visibility: visible !important;
              }
              #printable-medical-report {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 20px !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                max-height: none !important;
                overflow: visible !important;
              }
              .print-break-inside-avoid {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
              @page {
                margin: 12mm;
                size: A4 portrait;
              }
            }
          `
        }}
      />
      {/* Container */}
      <div
        id="printable-medical-report"
        className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[92vh] print:border-none print:shadow-none print:my-0 print:max-w-none print:rounded-none"
      >
        {/* Modal Controls Bar (hidden during printing) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Consolidated Patient Visit Record (PDF Report Preview)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Medical Document Body */}
        <div className="p-8 sm:p-10 overflow-y-auto space-y-6 text-slate-900 print:p-0 print:m-0 print:overflow-visible">
          {/* Document Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-teal-800 text-white font-bold flex items-center justify-center text-sm">
                  {hospital.logoInitial}
                </span>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    {hospital.name}
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    {hospital.type} · Accreditation: {hospital.licenseNumber}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {hospital.address} · Tel: {hospital.phone} · Emergency: {hospital.emergencyHotline}
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Official Clinical Visit Record
              </span>
              <span className="font-mono font-bold text-slate-800">{reportId}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Generated: {new Date().toLocaleString()} by {currentStaffName}
              </p>
            </div>
          </div>

          {/* Inter-Hospital Transfer Notice (if patient was transferred) */}
          {patient.transferredFromHospitalName && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Inter-Hospital Medical Record Transfer:</strong>
                <span>
                  This patient was transferred to {hospital.name} from <strong>{patient.transferredFromHospitalName}</strong>. All prior bedside vitals, physician round notes, and diagnostic laboratory findings recorded at the originating facility are consolidated below for clinical continuity.
                </span>
              </div>
            </div>
          )}

          {/* Patient Demographics & Identification Matrix */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Patient Full Name</span>
              <strong className="text-sm font-bold text-slate-900">{patient.firstName} {patient.lastName}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Medical Record No. (MRN)</span>
              <strong className="font-mono text-sm font-bold text-slate-900">{patient.mrn}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Age / Sex / Blood Group</span>
              <strong className="text-slate-900">
                {patient.age} yrs · {patient.gender.toUpperCase()} · <span className="font-bold text-rose-700">{patient.bloodType}</span>
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Date of Birth</span>
              <span className="text-slate-800">{patient.dateOfBirth}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Current Inpatient Location</span>
              <span className="text-slate-800 font-medium">
                {patient.currentBedNumber ? `Bed ${patient.currentBedNumber} (${patient.currentWardName})` : 'Emergency Triage'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Attending Physician</span>
              <span className="text-slate-800 font-medium">{patient.attendingDoctorName || 'Pending'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Admission Intake Date</span>
              <span className="text-slate-800">{new Date(patient.triageEntryAt).toLocaleString()}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Discharge / Clearance Status</span>
              <span className="font-bold text-teal-800">
                {patient.currentStatus.toUpperCase().replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Allergies & Medical History Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50">
              <strong className="text-rose-900 font-bold block mb-1">Drug Allergies & Adverse Reactions:</strong>
              {patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map((all) => (
                    <span key={all} className="font-semibold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                      ⚠ {all}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-500">No known drug allergies (NKDA)</span>
              )}
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="text-slate-800 font-bold block mb-1">Pre-existing Chronic Conditions:</strong>
              {patient.chronicConditions.length > 0 ? (
                <span className="text-slate-700">{patient.chronicConditions.join(', ')}</span>
              ) : (
                <span className="text-slate-500">None documented</span>
              )}
            </div>
          </div>

          {/* Presenting Chief Complaint & Working Diagnosis */}
          <div className="border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Presenting Emergency Chief Complaint
              </span>
              <p className="text-slate-900 font-medium mt-0.5">{patient.chiefComplaint}</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Primary Admission Diagnosis
              </span>
              <p className="text-slate-900 font-bold mt-0.5">{patient.admissionDiagnosis || 'Clinical workup in progress'}</p>
            </div>
            {patient.dischargeSummary && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Final Discharge Diagnosis & Summary
                </span>
                <p className="text-slate-900 mt-0.5">{patient.dischargeSummary}</p>
              </div>
            )}
          </div>

          {/* Section 1: Complete Bedside Vitals Log */}
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              <span>1. Physiological Vitals & Early Warning Score (NEWS2) History</span>
            </h3>

            {patientVitals.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-2.5">Date & Time</th>
                      <th className="py-2 px-2.5">HR (bpm)</th>
                      <th className="py-2 px-2.5">BP (mmHg)</th>
                      <th className="py-2 px-2.5">SpO2 (%)</th>
                      <th className="py-2 px-2.5">RR (/min)</th>
                      <th className="py-2 px-2.5">Temp (°C)</th>
                      <th className="py-2 px-2.5">Pain</th>
                      <th className="py-2 px-2.5">EWS</th>
                      <th className="py-2 px-2.5">Recorder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {patientVitals.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2.5 font-mono text-slate-600">
                          {new Date(v.recordedAt).toLocaleString()}
                        </td>
                        <td className="py-1.5 px-2.5 font-bold">{v.heartRate}</td>
                        <td className="py-1.5 px-2.5">
                          {v.bloodPressureSystolic}/{v.bloodPressureDiastolic}
                        </td>
                        <td className="py-1.5 px-2.5 font-bold text-teal-800">{v.oxygenSaturation}%</td>
                        <td className="py-1.5 px-2.5">{v.respiratoryRate}</td>
                        <td className="py-1.5 px-2.5">{v.temperature}°C</td>
                        <td className="py-1.5 px-2.5">{v.painScore}/10</td>
                        <td className="py-1.5 px-2.5 font-bold">
                          <span className={v.news2Score >= 5 ? 'text-rose-700' : 'text-slate-800'}>
                            {v.news2Score} pts
                          </span>
                        </td>
                        <td className="py-1.5 px-2.5 text-slate-600">{v.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No vitals logged for this patient encounter.</p>
            )}
          </div>

          {/* Section 2: Physician Rounds & Clinical Notes */}
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>2. Physician Rounds, Clinical Assessments & Consultations</span>
            </h3>

            {patientNotes.length > 0 ? (
              <div className="space-y-3">
                {patientNotes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 text-[11px]">
                      <span className="font-bold text-slate-900">{note.title}</span>
                      <span className="text-slate-500">{new Date(note.recordedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-800 mt-2 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    <div className="mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
                      <span>Author: <strong className="text-slate-800">{note.authorName}</strong></span>
                      <span className="uppercase">{note.authorRole}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No physician notes recorded.</p>
            )}
          </div>

          {/* Section 3: Medication Administration Record */}
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
              <Pill className="w-3.5 h-3.5 text-teal-700" />
              <span>3. Pharmacological Orders & Inpatient Medications</span>
            </h3>

            {patientMeds.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Medication</th>
                      <th className="py-2 px-3">Dosage & Route</th>
                      <th className="py-2 px-3">Frequency</th>
                      <th className="py-2 px-3">Prescriber</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {patientMeds.map((med) => (
                      <tr key={med.id}>
                        <td className="py-1.5 px-3 font-bold text-slate-900">{med.medicationName}</td>
                        <td className="py-1.5 px-3">{med.dosage} ({med.route})</td>
                        <td className="py-1.5 px-3">{med.frequency}</td>
                        <td className="py-1.5 px-3 text-slate-600">{med.prescribedBy}</td>
                        <td className="py-1.5 px-3 font-semibold text-emerald-800">{med.status.toUpperCase()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No medications prescribed for this stay.</p>
            )}
          </div>

          {/* Section 4: Laboratory Diagnostic Results & Calculations */}
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b pb-1">
              <FlaskConical className="w-3.5 h-3.5 text-teal-700" />
              <span>4. Diagnostic Laboratory Results & Biochemical Analysis</span>
            </h3>

            {patientSamples.length > 0 ? (
              <div className="space-y-4">
                {patientSamples.map((sample) => (
                  <div key={sample.id} className="border border-slate-200 rounded-lg p-3 text-xs bg-slate-50/50">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <div>
                        <strong className="text-slate-900 font-bold">{sample.panelType} Diagnostic Panel</strong>
                        <span className="text-[11px] text-slate-500 font-mono ml-2">({sample.sampleBarcode})</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Collected: {new Date(sample.collectedAt).toLocaleString()} · Status: <strong className="text-teal-800">{sample.status}</strong>
                      </span>
                    </div>

                    {/* Biomarker Table */}
                    {sample.analyzedItems && Object.keys(sample.analyzedItems).length > 0 && (
                      <div className="mt-2">
                        <table className="w-full text-left text-[11px] border border-slate-200">
                          <thead className="bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            <tr>
                              <th className="py-1.5 px-2">Assay Parameter</th>
                              <th className="py-1.5 px-2">Value</th>
                              <th className="py-1.5 px-2">Unit</th>
                              <th className="py-1.5 px-2">Reference Range</th>
                              <th className="py-1.5 px-2">Evaluation Flag</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {Object.entries(sample.analyzedItems).map(([key, item]) => (
                              <tr key={key} className={item.status.includes('CRITICAL') ? 'bg-rose-50 font-bold' : ''}>
                                <td className="py-1 px-2 font-medium">{item.name}</td>
                                <td className="py-1 px-2">{item.value}</td>
                                <td className="py-1 px-2 text-slate-500">{item.unit}</td>
                                <td className="py-1 px-2 text-slate-500 font-mono">{item.reference_range}</td>
                                <td className="py-1 px-2">
                                  {item.status.includes('CRITICAL') ? (
                                    <span className="text-rose-700 font-bold">PANIC CRITICAL</span>
                                  ) : item.status !== 'NORMAL' ? (
                                    <span className="text-amber-700">{item.status}</span>
                                  ) : (
                                    <span className="text-slate-400">Normal</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Calculated Indices */}
                    {sample.calculatedIndices && Object.keys(sample.calculatedIndices).length > 0 && (
                      <div className="mt-2 p-2 bg-white rounded border border-slate-200 text-[11px]">
                        <span className="font-bold text-slate-800 block mb-1">Calculated Diagnostic Indices:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(sample.calculatedIndices).map(([key, c]) => (
                            <div key={key}>
                              <span className="text-slate-500">{c.name}: </span>
                              <strong className="text-slate-900">{c.value} {c.unit}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pathologist Notes */}
                    {sample.pathologistNotes && (
                      <p className="mt-2 text-[11px] text-slate-700 italic border-l-2 border-teal-600 pl-2">
                        <strong>Pathologist Interpretation: </strong>{sample.pathologistNotes} (Verified by: {sample.verifiedBy || 'Pathology Division'})
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No laboratory tests recorded for this visit.</p>
            )}
          </div>

          {/* Clinical Attestation & Signature Block */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-8">
                Attending Inpatient Physician Verification
              </p>
              <div className="border-b border-slate-400 w-48 mb-1" />
              <p className="font-bold text-slate-900">{patient.attendingDoctorName || 'Dr. Marcus Chen, MD'}</p>
              <p className="text-[10px] text-slate-500">Board Certified Inpatient Specialist</p>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-8">
                Medical Records Seal & Custody
              </p>
              <div className="border-b border-slate-400 w-48 ml-auto mb-1" />
              <p className="font-bold text-slate-900">{hospital.name}</p>
              <p className="text-[10px] text-slate-500">Health Information Management (HIM)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
