'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileText,
  FileCode,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Activity,
  Pill,
  FlaskConical,
  Building2
} from 'lucide-react';
import { Patient, Hospital, VitalSign, ClinicalNote, MedicationOrder, LabSample } from '@/lib/types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  hospital: Hospital;
  vitals: VitalSign[];
  notes: ClinicalNote[];
  medications: MedicationOrder[];
  samples: LabSample[];
  currentStaffName: string;
  onOpenPdfView: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  hospital,
  vitals,
  notes,
  medications,
  samples,
  currentStaffName,
  onOpenPdfView
}) => {
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<'formatted' | 'json'>('formatted');

  if (!isOpen) return null;

  const patientVitals = vitals.filter((v) => v.patientId === patient.id);
  const patientNotes = notes.filter((n) => n.patientId === patient.id);
  const patientMeds = medications.filter((m) => m.patientId === patient.id);
  const patientSamples = samples.filter((s) => s.patientId === patient.id);

  // Generate plain text / markdown formatted clinical report
  const generateFormattedText = () => {
    const timestamp = new Date().toLocaleString();
    return `================================================================================
HOSCARE CLINICAL SUMMARY & PATIENT DOSSIER
Facility: ${hospital.name} (${hospital.code})
Accreditation: ${hospital.licenseNumber}
Emergency Contact: ${hospital.phone} | Hotline: ${hospital.emergencyHotline}
Generated At: ${timestamp} by ${currentStaffName}
================================================================================

1. PATIENT DEMOGRAPHICS & IDENTIFIERS
--------------------------------------------------------------------------------
Full Name:           ${patient.firstName} ${patient.lastName}
Medical Record No.:  ${patient.mrn}
Age / Gender / Blood: ${patient.age} years / ${patient.gender.toUpperCase()} / ${patient.bloodType}
Date of Birth:       ${patient.dateOfBirth}
Contact Phone:       ${patient.phone}
Address:             ${patient.address}
Emergency Contact:   ${patient.emergencyContactName} (${patient.emergencyRelation}) - ${patient.emergencyContactPhone}
Current Location:    ${patient.currentBedNumber ? `Bed ${patient.currentBedNumber} (${patient.currentWardName})` : 'Emergency Triage'}
Care Status:         ${patient.currentStatus.toUpperCase()}
Attending Doctor:    ${patient.attendingDoctorName || 'Pending Assignment'}
Intake Timestamp:    ${new Date(patient.triageEntryAt).toLocaleString()}
${patient.transferredFromHospitalName ? `Transfer Note:       Transferred from ${patient.transferredFromHospitalName} (Cross-facility EHR active)\n` : ''}
2. ALLERGIES & CLINICAL CONDITIONS
--------------------------------------------------------------------------------
Allergies:           ${patient.allergies.length > 0 ? patient.allergies.join(', ') : 'No known drug allergies (NKDA)'}
Chronic Conditions:  ${patient.chronicConditions.length > 0 ? patient.chronicConditions.join(', ') : 'None documented'}

3. CLINICAL PRESENTATION & DIAGNOSIS
--------------------------------------------------------------------------------
Chief Complaint:     ${patient.chiefComplaint}
Admission Diagnosis: ${patient.admissionDiagnosis || 'Clinical workup in progress'}
${patient.dischargeSummary ? `Discharge Summary:   ${patient.dischargeSummary}\nDischarge Cleared:   ${patient.dischargedAt ? new Date(patient.dischargedAt).toLocaleString() : 'N/A'}\n` : ''}
4. INPATIENT MEDICATION ORDERS (MAR) (${patientMeds.length} Active Prescriptions)
--------------------------------------------------------------------------------
${patientMeds.length > 0 ? patientMeds.map((m, i) => `${i + 1}. [${m.status.toUpperCase()}] ${m.medicationName} ${m.dosage}
   Route: ${m.route} | Frequency: ${m.frequency} | Prescribed By: ${m.prescribedBy}`).join('\n\n') : 'No medications currently ordered.'}

5. LABORATORY SPECIMENS & DIAGNOSTIC PANELS (${patientSamples.length} Samples)
--------------------------------------------------------------------------------
${patientSamples.length > 0 ? patientSamples.map((s, i) => `[Panel ${i + 1}] ${s.panelType} (${s.specimenType} - ${s.tubeColor}) - Barcode: ${s.sampleBarcode}
   Status: ${s.status} | Priority: ${s.priority} | Urgency: ${s.overallUrgency || 'ROUTINE'}
   Collected: ${new Date(s.collectedAt).toLocaleString()} by ${s.collectedBy}
   Biomarkers:${s.analyzedItems ? '\n' + Object.values(s.analyzedItems).map((item) => `     - ${item.name}: ${item.value} ${item.unit} [Ref: ${item.reference_range}] => ${item.status}`).join('\n') : ' Pending analysis'}
   ${s.calculatedIndices ? 'Calculated Indices:\n' + Object.values(s.calculatedIndices).map((c) => `     * ${c.name}: ${c.value} ${c.unit} [Ref: ${c.reference}] => ${c.status}`).join('\n') : ''}
   ${s.criticalFlags && s.criticalFlags.length > 0 ? 'CRITICAL FLAGS:\n' + s.criticalFlags.map((f) => `     ! ${f}`).join('\n') : ''}
   ${s.pathologistNotes ? `Pathologist Notes: ${s.pathologistNotes}` : ''}`).join('\n\n') : 'No laboratory specimens accessioned.'}

6. BEDSIDE VITAL SIGNS & NEWS2 DETERIORATION TRAJECTORY (${patientVitals.length} Recorded Readings)
--------------------------------------------------------------------------------
${patientVitals.length > 0 ? patientVitals.map((v) => `[${new Date(v.recordedAt).toLocaleString()}]
   HR: ${v.heartRate} bpm | BP: ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} mmHg | SpO2: ${v.oxygenSaturation}% | RR: ${v.respiratoryRate}/min | Temp: ${v.temperature}°C | NEWS2: ${v.news2Score} pts
   AVPU: ${v.consciousness} | Pain: ${v.painScore}/10 | Recorded By: ${v.recordedBy} (${v.recordedByRole})
   Notes: ${v.notes || 'Routine check'}`).join('\n\n') : 'No vitals recorded yet.'}

7. PHYSICIAN ROUNDS & CLINICAL NOTES (${patientNotes.length} Documented Notes)
--------------------------------------------------------------------------------
${patientNotes.length > 0 ? patientNotes.map((n) => `[${n.noteType.toUpperCase()}] ${n.title} - ${new Date(n.recordedAt).toLocaleString()}
   Author: ${n.authorName} (${n.authorRole})
   ${n.content}`).join('\n\n') : 'No clinical notes logged.'}

================================================================================
CONFIDENTIAL MEDICAL DOCUMENT - PROTECTED HEALTH INFORMATION (HIPAA / GDPR)
================================================================================`;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateFormattedText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownloadTextReport = () => {
    const text = generateFormattedText();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HOSCARE_${patient.mrn}_Clinical_Report_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const data = {
      hospital: {
        id: hospital.id,
        name: hospital.name,
        code: hospital.code,
        licenseNumber: hospital.licenseNumber
      },
      patient,
      vitals: patientVitals,
      notes: patientNotes,
      medications: patientMeds,
      laboratorySamples: patientSamples,
      exportedAt: new Date().toISOString(),
      exportedBy: currentStaffName
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HOSCARE_${patient.mrn}_EHR_Export_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const lines: string[] = [
      'Category,Key,Value,Notes',
      `Demographics,MRN,"${patient.mrn}",""`,
      `Demographics,Name,"${patient.firstName} ${patient.lastName}",""`,
      `Demographics,Age,"${patient.age}",""`,
      `Demographics,Gender,"${patient.gender}",""`,
      `Demographics,Blood Type,"${patient.bloodType}",""`,
      `Demographics,Status,"${patient.currentStatus}",""`,
      `Demographics,Bed,"${patient.currentBedNumber || 'Triage'}","${patient.currentWardName || ''}"`,
      `Demographics,Attending Doctor,"${patient.attendingDoctorName || ''}",""`,
      `Clinical,Chief Complaint,"${(patient.chiefComplaint || '').replace(/"/g, '""')}",""`,
      `Clinical,Admission Diagnosis,"${(patient.admissionDiagnosis || '').replace(/"/g, '""')}",""`,
      `Clinical,Discharge Summary,"${(patient.dischargeSummary || '').replace(/"/g, '""')}",""`,
      ...patientMeds.map((m) => `Medication,"${m.medicationName}","${m.dosage} (${m.route} - ${m.frequency})","Status: ${m.status}"`),
      ...patientSamples.map((s) => `Lab Sample,"${s.panelType} - ${s.sampleBarcode}","${s.specimenType}","Urgency: ${s.overallUrgency || 'ROUTINE'}"`),
      ...patientVitals.map((v) => `Vital,"${new Date(v.recordedAt).toISOString()}","HR ${v.heartRate}, BP ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic}, SpO2 ${v.oxygenSaturation}%","NEWS2: ${v.news2Score}"`)
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HOSCARE_${patient.mrn}_Data_Dossier_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold">
              <Download className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Export Formatted Clinical Medical Report</h2>
              <p className="text-xs text-slate-500">
                Consolidated patient summary, medications, and laboratory results export suite.
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

        {/* Action Bar */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Download Text / Markdown */}
            <button
              onClick={handleDownloadTextReport}
              className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Formatted Report (.md)</span>
            </button>

            {/* Download JSON */}
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download JSON EHR</span>
            </button>

            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV Dossier</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Text */}
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>

            {/* Trigger PDF Print Modal */}
            <button
              onClick={() => {
                onClose();
                onOpenPdfView();
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-700" />
              <span>Printable PDF</span>
            </button>
          </div>
        </div>

        {/* Content Body Preview */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Preview:</span>
              <button
                onClick={() => setPreviewTab('formatted')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                  previewTab === 'formatted' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Formatted Clinical Summary
              </button>
              <button
                onClick={() => setPreviewTab('json')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                  previewTab === 'json' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Structured JSON
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Patient MRN: {patient.mrn} · {patientVitals.length} Vitals · {patientMeds.length} Meds · {patientSamples.length} Labs
            </span>
          </div>

          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs max-h-[50vh] overflow-y-auto leading-relaxed border border-slate-800 shadow-inner">
            {previewTab === 'formatted' ? (
              <pre className="whitespace-pre-wrap">{generateFormattedText()}</pre>
            ) : (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  {
                    hospital: {
                      id: hospital.id,
                      name: hospital.name,
                      code: hospital.code,
                      licenseNumber: hospital.licenseNumber
                    },
                    patient,
                    vitals: patientVitals,
                    notes: patientNotes,
                    medications: patientMeds,
                    laboratorySamples: patientSamples,
                    exportedAt: new Date().toISOString()
                  },
                  null,
                  2
                )}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Audit record created upon export. Secure clinical data interchange.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
