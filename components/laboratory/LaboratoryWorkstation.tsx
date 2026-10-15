'use client';

import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  Download,
  Terminal,
  Activity,
  User,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { LabSample, Patient, UserRole } from '@/lib/types';

interface LaboratoryWorkstationProps {
  samples: LabSample[];
  patients: Patient[];
  onOpenNewSample: () => void;
  onUpdateSampleAnalysis: (
    sampleId: string,
    rawValues: Record<string, number>,
    newStatus: LabSample['status'],
    pathologistNotes?: string
  ) => Promise<void>;
  currentRole: UserRole;
  currentStaffName: string;
}

export const LaboratoryWorkstation: React.FC<LaboratoryWorkstationProps> = ({
  samples,
  patients,
  onOpenNewSample,
  onUpdateSampleAnalysis,
  currentRole,
  currentStaffName
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>(samples[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [panelFilter, setPanelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, number>>(() => samples[0]?.rawValues || {});
  const [editNotes, setEditNotes] = useState(() => samples[0]?.pathologistNotes || '');
  const [showReportView, setShowReportView] = useState(false);

  // Selected sample
  const selectedSample = samples.find((s) => s.id === selectedSampleId) || samples[0];

  const handleSelectSample = (sample: LabSample) => {
    setSelectedSampleId(sample.id);
    setEditValues(sample.rawValues || {});
    setEditNotes(sample.pathologistNotes || '');
  };

  const filteredSamples = samples.filter((s) => {
    if (panelFilter !== 'all' && s.panelType !== panelFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.sampleBarcode.toLowerCase().includes(q) ||
      s.patientName.toLowerCase().includes(q) ||
      s.patientMrn.toLowerCase().includes(q) ||
      s.panelType.toLowerCase().includes(q) ||
      s.specimenType.toLowerCase().includes(q)
    );
  });

  const handleRunAnalysis = async (verifyAfter: boolean = false) => {
    if (!selectedSample) return;
    const valuesToAnalyze = Object.keys(editValues).length > 0 ? editValues : (selectedSample.rawValues || {});
    setIsAnalyzing(true);
    try {
      await onUpdateSampleAnalysis(
        selectedSample.id,
        valuesToAnalyze,
        verifyAfter ? 'VERIFIED' : 'ANALYSIS_COMPLETE',
        editNotes || selectedSample.pathologistNotes
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAdvanceStatus = async (targetStatus: LabSample['status']) => {
    if (!selectedSample) return;
    setIsAnalyzing(true);
    try {
      await onUpdateSampleAnalysis(
        selectedSample.id,
        selectedSample.rawValues,
        targetStatus,
        editNotes
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportLabReportCSV = () => {
    const headers = ['Barcode', 'Patient MRN', 'Patient Name', 'Panel', 'Specimen', 'Status', 'Urgency', 'Collected At', 'Verified By'];
    const rows = filteredSamples.map((s) => [
      s.sampleBarcode,
      s.patientMrn,
      `"${s.patientName}"`,
      s.panelType,
      s.specimenType,
      s.status,
      s.overallUrgency || 'ROUTINE',
      s.collectedAt,
      `"${s.verifiedBy || ''}"`
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `HOSCARE_Lab_Specimens_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Workstation Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Clinical Pathology & Diagnostic Workstation</h1>
              <span className="text-[10px] font-bold font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                PYTHON 3 ANALYTICAL KERNEL ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Specimen tracking, biochemical panel testing, automated eGFR & Anion Gap calculations, and critical panic value alerting.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={exportLabReportCSV}
              className="px-3 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenNewSample}
              className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Accession New Specimen</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search barcode, patient MRN, panel..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setPanelFilter('all')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  panelFilter === 'all' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All Panels
              </button>
              <button
                onClick={() => setPanelFilter('CBC')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  panelFilter === 'CBC' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                CBC
              </button>
              <button
                onClick={() => setPanelFilter('CMP')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  panelFilter === 'CMP' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                CMP
              </button>
              <button
                onClick={() => setPanelFilter('CARDIAC')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  panelFilter === 'CARDIAC' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Cardiac
              </button>
              <button
                onClick={() => setPanelFilter('ABG')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  panelFilter === 'ABG' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                ABG
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'all' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All Statuses
              </button>
              <button
                onClick={() => setStatusFilter('IN_ANALYSIS')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'IN_ANALYSIS' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                In Analysis
              </button>
              <button
                onClick={() => setStatusFilter('VERIFIED')}
                className={`px-2.5 py-1 rounded cursor-pointer ${
                  statusFilter === 'VERIFIED' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Verified
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Interface: Specimen Accession Queue (Left) + Analytical Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Specimen Pipeline Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[780px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Accessioned Specimens ({filteredSamples.length})
            </span>
            <span className="text-[11px] text-slate-500">Auto-Sorted STAT</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredSamples.map((sample) => {
              const isSelected = sample.id === selectedSample?.id;
              const isPanic = sample.overallUrgency === 'CRITICAL_PANIC';

              return (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer border-l-4 ${
                    isSelected
                      ? 'bg-teal-50/50 border-teal-600'
                      : isPanic
                      ? 'border-rose-500'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900">{sample.sampleBarcode}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        isPanic
                          ? 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse'
                          : sample.status === 'VERIFIED'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-amber-700 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {sample.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
                    {sample.patientName}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span className="font-medium text-slate-700">{sample.panelType}</span>
                    <span>{sample.specimenType}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100">
                    <span className="font-mono">{sample.patientMrn}</span>
                    <span>{new Date(sample.collectedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Analytical Console & Official Pathology Report (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[780px]">
          {selectedSample ? (
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Header Bar */}
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedSample.panelType} Panel Analysis
                    </h2>
                    <span className="font-mono text-xs font-bold bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-800">
                      {selectedSample.sampleBarcode}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1">
                    <span>Patient: <strong className="text-slate-800">{selectedSample.patientName}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{selectedSample.patientMrn}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedSample.patientAge}y / {selectedSample.patientGender.toUpperCase()}</span>
                    <span aria-hidden="true">·</span>
                    <span>Specimen: {selectedSample.specimenType} ({selectedSample.tubeColor})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReportView(!showReportView)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{showReportView ? 'Workstation Mode' : 'Printable Lab Report'}</span>
                  </button>

                  <button
                    onClick={() => handleRunAnalysis(true)}
                    disabled={isAnalyzing}
                    className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAnalyzing ? 'Running Python Engine...' : 'Run & Verify'}</span>
                  </button>
                </div>
              </div>

              {/* Critical Alert Bar if Panic Finding */}
              {selectedSample.overallUrgency === 'CRITICAL_PANIC' && (
                <div className="bg-rose-600 text-white p-3 px-5 flex items-center justify-between text-xs font-semibold shrink-0">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-white animate-bounce shrink-0" />
                    <span>
                      CRITICAL PANIC VALUE ALERT: One or more biomarkers exceed life-threatening emergency thresholds!
                    </span>
                  </div>
                  <span className="text-[11px] bg-rose-700 px-2 py-0.5 rounded font-mono">
                    STAT ACTION REQUIRED
                  </span>
                </div>
              )}

              {/* Specimen Status Pipeline Stepper */}
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 shrink-0">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">Specimen Custody Pipeline:</span>
                  <div className="flex items-center gap-2">
                    {selectedSample.status === 'COLLECTED' && (
                      <button
                        onClick={() => handleAdvanceStatus('RECEIVED')}
                        className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline"
                      >
                        Accept Specimen at Lab Station →
                      </button>
                    )}
                    {selectedSample.status === 'RECEIVED' && (
                      <button
                        onClick={() => handleAdvanceStatus('IN_ANALYSIS')}
                        className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline"
                      >
                        Begin Automated Centrifuge & Analysis →
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mt-2 text-[10px] text-center">
                  {[
                    { id: 'COLLECTED', label: '1. Collected' },
                    { id: 'RECEIVED', label: '2. Received' },
                    { id: 'IN_ANALYSIS', label: '3. In Analysis' },
                    { id: 'ANALYSIS_COMPLETE', label: '4. Analyzed' },
                    { id: 'VERIFIED', label: '5. Verified' }
                  ].map((st, idx) => {
                    const isPassed =
                      st.id === selectedSample.status ||
                      (selectedSample.status === 'VERIFIED' && idx <= 4) ||
                      (selectedSample.status === 'ANALYSIS_COMPLETE' && idx <= 3) ||
                      (selectedSample.status === 'IN_ANALYSIS' && idx <= 2) ||
                      (selectedSample.status === 'RECEIVED' && idx <= 1);

                    return (
                      <div
                        key={st.id}
                        className={`p-1.5 rounded border ${
                          st.id === selectedSample.status
                            ? 'bg-teal-50 border-teal-500 font-bold text-teal-900'
                            : isPassed
                            ? 'bg-emerald-50/60 border-emerald-300 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        {st.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main Content Body */}
              <div className="p-5 space-y-6 flex-1">
                {showReportView ? (
                  /* Official Diagnostic Pathology Report Document View */
                  <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-xs space-y-6 font-sans">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">CENTRAL CLINICAL PATHOLOGY LABORATORIES</h3>
                        <p className="text-xs text-slate-500">CLIA Accredited · Diagnostic Medicine Division</p>
                      </div>
                      <div className="text-right text-xs text-slate-600">
                        <p><strong>Report Date:</strong> {new Date().toLocaleDateString()}</p>
                        <p className="font-mono">Specimen ID: {selectedSample.sampleBarcode}</p>
                      </div>
                    </div>

                    {/* Patient Banner */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">PATIENT NAME</span>
                        <strong className="text-slate-900">{selectedSample.patientName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">MEDICAL RECORD NO.</span>
                        <strong className="text-slate-900 font-mono">{selectedSample.patientMrn}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">AGE / SEX</span>
                        <strong className="text-slate-900">{selectedSample.patientAge} / {selectedSample.patientGender.toUpperCase()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">SPECIMEN / TUBE</span>
                        <strong className="text-slate-900">{selectedSample.specimenType} ({selectedSample.tubeColor})</strong>
                      </div>
                    </div>

                    {/* Biomarker Table */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        {selectedSample.panelType} Diagnostic Findings
                      </h4>
                      <table className="w-full text-left text-xs border border-slate-200">
                        <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                          <tr>
                            <th className="py-2 px-3">Biomarker / Assay</th>
                            <th className="py-2 px-3">Result</th>
                            <th className="py-2 px-3">Units</th>
                            <th className="py-2 px-3">Reference Interval</th>
                            <th className="py-2 px-3">Flag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedSample.analyzedItems &&
                            Object.entries(selectedSample.analyzedItems).map(([key, item]) => (
                              <tr key={key} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-medium text-slate-900">{item.name}</td>
                                <td className="py-2 px-3 font-bold text-slate-900">{item.value}</td>
                                <td className="py-2 px-3 text-slate-500">{item.unit}</td>
                                <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{item.reference_range}</td>
                                <td className="py-2 px-3 font-bold">
                                  {item.status.includes('CRITICAL') ? (
                                    <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">
                                      CRITICAL
                                    </span>
                                  ) : item.status !== 'NORMAL' ? (
                                    <span className="text-amber-700 text-[10px]">{item.status}</span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">Normal</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Calculated Indices */}
                    {selectedSample.calculatedIndices && Object.keys(selectedSample.calculatedIndices).length > 0 && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                          Calculated Diagnostic Indices
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          {Object.entries(selectedSample.calculatedIndices).map(([key, idxItem]) => (
                            <div key={key}>
                              <span className="text-slate-500 block text-[10px]">{idxItem.name}</span>
                              <strong className="text-slate-900 text-sm">{idxItem.value} {idxItem.unit}</strong>
                              <span className="text-[10px] text-slate-400 block">Ref: {idxItem.reference}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sign-off */}
                    <div className="pt-4 border-t flex items-center justify-between text-xs text-slate-500">
                      <div>
                        <p><strong>Pathologist Sign-off:</strong> {selectedSample.verifiedBy || 'Pending Signature'}</p>
                        <p className="text-[10px]">{selectedSample.verifiedAt ? `Electronically verified on ${new Date(selectedSample.verifiedAt).toLocaleString()}` : 'Awaiting clinical verification'}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px]">Kernel: {selectedSample.engineUsed || 'Python 3 Diagnostic'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Live Workstation Entry & Analysis Mode */
                  <div className="space-y-6">
                    {/* Raw Parameter Values Editor & Analyzer Inputs */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Instrument Assay Inputs ({selectedSample.panelType})
                        </span>
                        <button
                          onClick={() => handleRunAnalysis(false)}
                          disabled={isAnalyzing}
                          className="px-3 py-1 rounded bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                        >
                          Execute Python Diagnostic Calculation
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
                        {Object.entries(Object.keys(editValues).length > 0 ? editValues : (selectedSample.rawValues || {})).map(([paramKey, val]) => (
                          <div key={paramKey} className="bg-white p-2.5 rounded-lg border border-slate-200">
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1 capitalize truncate">
                              {paramKey.replace('_', ' ')}
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={val}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...(Object.keys(prev).length > 0 ? prev : (selectedSample.rawValues || {})),
                                  [paramKey]: parseFloat(e.target.value) || 0
                                }))
                              }
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Calculated Indices (Anion gap, eGFR, Osmolality) */}
                    {selectedSample.calculatedIndices && Object.keys(selectedSample.calculatedIndices).length > 0 && (
                      <div className="border border-slate-200 rounded-xl p-4 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Automated Python Diagnostic Calculations
                          </span>
                          <span className="text-[10px] text-teal-700 font-mono">CKD-EPI 2021 & Biochemical Kernel</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {Object.entries(selectedSample.calculatedIndices).map(([key, calc]) => (
                            <div
                              key={key}
                              className={`p-3 rounded-lg border text-xs ${
                                calc.status === 'LOW' || calc.status === 'HIGH'
                                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                                  : calc.status === 'CRITICAL_LOW'
                                  ? 'bg-rose-50 border-rose-200 text-rose-950 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="text-[11px] font-semibold text-slate-600">{calc.name}</div>
                              <div className="text-lg font-bold mt-1">
                                {calc.value} <span className="text-[11px] font-normal">{calc.unit}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Reference: {calc.reference}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clinical Impressions & Differentials */}
                    {selectedSample.clinicalImpressions && selectedSample.clinicalImpressions.length > 0 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                          Diagnostic Interpretation & Differential Considerations
                        </span>
                        <div className="space-y-1.5 text-xs text-slate-700">
                          {selectedSample.clinicalImpressions.map((imp, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                              <span>{imp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pathologist Notes & Verification Input */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800">
                        Pathologist / Laboratory Director Notes
                      </label>
                      <textarea
                        rows={3}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Enter signed verification comments, critical readback verification, or morphology remarks..."
                        className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400">
              <FlaskConical className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">Select a laboratory specimen from the left queue to view and analyze.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
