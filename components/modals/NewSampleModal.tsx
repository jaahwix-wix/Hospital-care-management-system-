'use client';

import React, { useState } from 'react';
import { X, FlaskConical, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Patient, SpecimenType, PanelType, LabPriority } from '@/lib/types';

interface NewSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  preselectedPatient?: Patient | null;
  onAccession: (sampleData: any) => void;
  currentStaffName: string;
}

export const NewSampleModal: React.FC<NewSampleModalProps> = ({
  isOpen,
  onClose,
  patients,
  preselectedPatient,
  onAccession,
  currentStaffName
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    preselectedPatient?.id || patients[0]?.id || ''
  );
  const [specimenType, setSpecimenType] = useState<SpecimenType>('Whole Blood');
  const [panelType, setPanelType] = useState<PanelType>('CBC');
  const [priority, setPriority] = useState<LabPriority>('ROUTINE');
  const [tubeColor, setTubeColor] = useState('Purple (EDTA)');
  const [collectionSite, setCollectionSite] = useState('Right Median Cubital Vein');
  const [collectorName, setCollectorName] = useState(currentStaffName);

  // Test values preloader
  const [presetScenario, setPresetScenario] = useState<'normal' | 'critical_high' | 'abnormal_renal'>('normal');

  if (!isOpen) return null;

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || preselectedPatient || patients[0];

  const handlePanelChange = (panel: PanelType) => {
    setPanelType(panel);
    if (panel === 'CBC') {
      setSpecimenType('Whole Blood');
      setTubeColor('Purple (EDTA)');
    } else if (panel === 'CMP' || panel === 'CARDIAC' || panel === 'LIPID') {
      setSpecimenType('Serum');
      setTubeColor('Gold (SST)');
    } else if (panel === 'ABG') {
      setSpecimenType('Arterial Blood');
      setTubeColor('Green (Heparin)');
    } else if (panel === 'URINALYSIS') {
      setSpecimenType('Urine');
      setTubeColor('Sterile Yellow Cup');
    }
  };

  const getPresetValues = (panel: PanelType, scenario: string): Record<string, number> => {
    if (panel === 'CBC') {
      if (scenario === 'critical_high') {
        return { wbc: 28.5, hemoglobin: 6.8, hematocrit: 20.4, platelets: 32.0, neutrophils: 88.0, lymphocytes: 8.0 };
      }
      return { wbc: 7.2, rbc: 4.8, hemoglobin: 14.5, hematocrit: 43.0, platelets: 260.0, neutrophils: 60.0, lymphocytes: 32.0 };
    }
    if (panel === 'CMP') {
      if (scenario === 'critical_high') {
        return { potassium: 6.8, creatinine: 3.8, bun: 65.0, sodium: 131.0, chloride: 94.0, co2: 13.0, calcium: 7.8, glucose: 240.0 };
      }
      return { potassium: 4.2, creatinine: 0.9, bun: 14.0, sodium: 140.0, chloride: 102.0, co2: 25.0, calcium: 9.4, glucose: 88.0 };
    }
    if (panel === 'CARDIAC') {
      if (scenario === 'critical_high') {
        return { troponin: 0.35, bnp: 580.0, glucose: 160.0, potassium: 4.9, sodium: 138.0 };
      }
      return { troponin: 0.01, bnp: 45.0, glucose: 90.0, potassium: 4.1, sodium: 141.0 };
    }
    if (panel === 'ABG') {
      if (scenario === 'critical_high') {
        return { ph: 7.18, pco2: 58.0, po2: 65.0, hco3: 16.0, base_excess: -9.0, lactate: 4.2 };
      }
      return { ph: 7.40, pco2: 40.0, po2: 95.0, hco3: 24.0, base_excess: 0.0, lactate: 1.1 };
    }
    return { glucose: 95.0, sodium: 140.0, potassium: 4.0 };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

    const rawValues = getPresetValues(panelType, presetScenario);

    onAccession({
      patientId: currentPatient.id,
      patientName: `${currentPatient.firstName} ${currentPatient.lastName}`,
      patientMrn: currentPatient.mrn,
      patientAge: currentPatient.age,
      patientGender: currentPatient.gender,
      specimenType,
      tubeColor,
      panelType,
      collectionSite,
      collectedAt: new Date().toISOString(),
      collectedBy: collectorName || currentStaffName,
      priority,
      rawValues
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Accession Laboratory Specimen</h2>
              <p className="text-xs text-slate-500">Collect sample & configure diagnostic analysis profile.</p>
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
          {/* Patient Selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Patient Subject *</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium"
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.mrn}) · Bed: {p.currentBedNumber || 'Triage'}
                </option>
              ))}
            </select>
          </div>

          {/* Panel Type & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Diagnostic Panel *</label>
              <select
                value={panelType}
                onChange={(e) => handlePanelChange(e.target.value as PanelType)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-semibold"
              >
                <option value="CBC">Complete Blood Count (CBC)</option>
                <option value="CMP">Comprehensive Metabolic (CMP)</option>
                <option value="CARDIAC">STAT Cardiac & Troponin Panel</option>
                <option value="ABG">Arterial Blood Gas (ABG)</option>
                <option value="LIPID">Lipid & Metabolic Profile</option>
                <option value="URINALYSIS">Urinalysis Chemistry</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Clinical Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LabPriority)}
                className={`w-full border rounded px-2.5 py-1.5 font-bold ${
                  priority === 'STAT_CRITICAL'
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="ROUTINE">Routine (Ward Scheduled)</option>
                <option value="URGENT">Urgent (Inpatient Expedited)</option>
                <option value="STAT_CRITICAL">STAT Critical (Emergency)</option>
              </select>
            </div>
          </div>

          {/* Specimen and Tube details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Specimen Matrix</label>
              <input
                type="text"
                value={specimenType}
                onChange={(e) => setSpecimenType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Collection Tube / Vial</label>
              <input
                type="text"
                value={tubeColor}
                onChange={(e) => setTubeColor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Anatomical Collection Site</label>
            <input
              type="text"
              value={collectionSite}
              onChange={(e) => setCollectionSite(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
            />
          </div>

          {/* Initial Assay Simulation Preset */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="block text-slate-700 font-bold mb-1">Initial Specimen Assay Scenario:</span>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-1.5 p-2 bg-white border border-slate-200 rounded cursor-pointer">
                <input
                  type="radio"
                  name="preset"
                  checked={presetScenario === 'normal'}
                  onChange={() => setPresetScenario('normal')}
                />
                <span>Standard Normal Baseline</span>
              </label>

              <label className="flex items-center gap-1.5 p-2 bg-white border border-slate-200 rounded cursor-pointer">
                <input
                  type="radio"
                  name="preset"
                  checked={presetScenario === 'critical_high'}
                  onChange={() => setPresetScenario('critical_high')}
                />
                <span className="text-rose-700 font-semibold">Critical Panic Values</span>
              </label>
            </div>
          </div>

          {/* Footer */}
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
              className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold cursor-pointer"
            >
              Generate Barcode & Accession
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
