'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Filter,
  Users,
  AlertCircle,
  Clock,
  ArrowRight,
  Activity,
  Bed,
  FileSpreadsheet
} from 'lucide-react';
import { Patient, PatientStatus, TriageScore } from '@/lib/types';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onOpenNewPatient: () => void;
}

type FilterCategory = 'all' | 'triage' | 'inpatient' | 'icu' | 'discharge_pending' | 'discharged' | 'transferred';

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  onSelectPatient,
  onOpenNewPatient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'mrn'>('recent');

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Status filter
      if (statusFilter === 'triage' && patient.currentStatus !== 'triage') return false;
      if (statusFilter === 'inpatient' && (patient.currentStatus !== 'in_monitoring' && patient.currentStatus !== 'admitted')) return false;
      if (statusFilter === 'icu' && patient.currentStatus !== 'icu') return false;
      if (statusFilter === 'discharge_pending' && patient.currentStatus !== 'discharge_pending') return false;
      if (statusFilter === 'discharged' && patient.currentStatus !== 'discharged') return false;
      if (statusFilter === 'transferred' && !patient.transferredFromHospitalName && !(patient.transferHistory && patient.transferHistory.length > 0)) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const mrn = patient.mrn.toLowerCase();
      const complaint = (patient.chiefComplaint || '').toLowerCase();
      const diagnosis = (patient.admissionDiagnosis || '').toLowerCase();
      const bed = (patient.currentBedNumber || '').toLowerCase();
      const transferHosp = (patient.transferredFromHospitalName || '').toLowerCase();

      return (
        fullName.includes(q) ||
        mrn.includes(q) ||
        complaint.includes(q) ||
        diagnosis.includes(q) ||
        bed.includes(q) ||
        transferHosp.includes(q)
      );
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.lastName.localeCompare(b.lastName);
      }
      if (sortBy === 'mrn') {
        return a.mrn.localeCompare(b.mrn);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [patients, searchQuery, statusFilter, sortBy]);

  const exportToCSV = () => {
    const headers = ['MRN', 'First Name', 'Last Name', 'Age', 'Gender', 'Blood Type', 'Status', 'Ward', 'Bed', 'Attending Physician', 'Triage Score', 'Chief Complaint', 'Admitted At', 'Discharged At'];
    const rows = filteredPatients.map((p) => [
      p.mrn,
      p.firstName,
      p.lastName,
      p.age,
      p.gender,
      p.bloodType,
      p.currentStatus,
      p.currentWardName || '',
      p.currentBedNumber || '',
      p.attendingDoctorName || '',
      p.triageScore,
      `"${(p.chiefComplaint || '').replace(/"/g, '""')}"`,
      p.admittedAt || '',
      p.dischargedAt || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HOSCARE_Patient_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTriageBadge = (score: TriageScore) => {
    switch (score) {
      case 'ESI-1_IMMEDIATE':
        return { text: 'ESI-1 Resuscitation (STAT)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'ESI-2_EMERGENT':
        return { text: 'ESI-2 Emergent', color: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'ESI-3_URGENT':
        return { text: 'ESI-3 Urgent', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'ESI-4_LESS_URGENT':
        return { text: 'ESI-4 Less Urgent', color: 'text-slate-700 bg-slate-100 border-slate-200' };
      default:
        return { text: 'ESI-5 Non-Urgent', color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case 'triage':
        return { text: 'In Triage', color: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'admitted':
      case 'in_monitoring':
        return { text: 'Active Inpatient', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'icu':
        return { text: 'Critical ICU', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'discharge_pending':
        return { text: 'Discharge Clearance', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'discharged':
        return { text: 'Discharged / Released', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Patient Directory & Clinical Lifecycle</h1>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {patients.length} Registered
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              End-to-end monitoring from admission intake and ward assignment through to discharge summary.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={exportToCSV}
              className="px-3 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onOpenNewPatient}
              className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Intake New Patient</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Interactive Filter Buttons */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, MRN, complaint, bed..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({patients.length})
            </button>
            <button
              onClick={() => setStatusFilter('triage')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'triage'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Triage ({patients.filter((p) => p.currentStatus === 'triage').length})
            </button>
            <button
              onClick={() => setStatusFilter('inpatient')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'inpatient'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inpatient
            </button>
            <button
              onClick={() => setStatusFilter('icu')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'icu'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ICU ({patients.filter((p) => p.currentStatus === 'icu').length})
            </button>
            <button
              onClick={() => setStatusFilter('discharge_pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'discharge_pending'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Discharge
            </button>
            <button
              onClick={() => setStatusFilter('discharged')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'discharged'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Discharged ({patients.filter((p) => p.currentStatus === 'discharged').length})
            </button>
            <button
              onClick={() => setStatusFilter('transferred')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'transferred'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transferred In ({patients.filter((p) => p.transferredFromHospitalName || (p.transferHistory && p.transferHistory.length > 0)).length})
            </button>
          </div>
        </div>
      </div>

      {/* Patient Table / List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">No patients matching filter</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or status filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 px-3 py-1.5 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg font-medium cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Patient & MRN</th>
                  <th className="py-3.5 px-4">Status & Location</th>
                  <th className="py-3.5 px-4">Triage Priority</th>
                  <th className="py-3.5 px-4">Chief Complaint / Diagnosis</th>
                  <th className="py-3.5 px-4">Attending Doctor</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => {
                  const triage = getTriageBadge(patient.triageScore);
                  const status = getStatusBadge(patient.currentStatus);

                  return (
                    <tr
                      key={patient.id}
                      onClick={() => onSelectPatient(patient.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Name & MRN */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-teal-100 text-slate-700 group-hover:text-teal-900 flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
                            {patient.firstName[0]}
                            {patient.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-teal-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono font-medium">{patient.mrn}</span>
                              <span aria-hidden="true">·</span>
                              <span>{patient.age}y</span>
                              <span aria-hidden="true">·</span>
                              <span>{patient.gender.toUpperCase()}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-slate-700">{patient.bloodType}</span>
                            </div>
                            {patient.transferredFromHospitalName && (
                              <div className="mt-1">
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                  Transferred from {patient.transferredFromHospitalName}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status & Location */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block ${status.color}`}>
                            {status.text}
                          </span>
                          <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                            <Bed className="w-3 h-3 text-slate-400" />
                            <span>
                              {patient.currentBedNumber
                                ? `${patient.currentBedNumber} (${patient.currentWardName})`
                                : 'Awaiting Bed Allocation'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Triage Priority */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block ${triage.color}`}>
                          {triage.text}
                        </span>
                      </td>

                      {/* Chief Complaint / Diagnosis */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-900 font-medium truncate">
                          {patient.admissionDiagnosis || patient.chiefComplaint}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {patient.chiefComplaint}
                        </div>
                      </td>

                      {/* Attending Doctor */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium">{patient.attendingDoctorName || 'Pending Assignment'}</div>
                        <div className="text-[11px] text-slate-400">
                          Intake: {new Date(patient.triageEntryAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPatient(patient.id);
                          }}
                          className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Monitor Stay</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
