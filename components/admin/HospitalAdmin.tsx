'use client';

import React, { useState } from 'react';
import {
  Shield,
  Building2,
  Database,
  Download,
  Upload,
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  Plus,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Hospital, AuditLog, UserRole } from '@/lib/types';

interface HospitalAdminProps {
  hospital: Hospital;
  hospitals: Hospital[];
  auditLogs: AuditLog[];
  onSwitchHospital: (id: string) => void;
  onOpenRegisterHospital: () => void;
  onResetData: () => void;
  allDataSnapshot: any;
}

export const HospitalAdmin: React.FC<HospitalAdminProps> = ({
  hospital,
  hospitals,
  auditLogs,
  onSwitchHospital,
  onOpenRegisterHospital,
  onResetData,
  allDataSnapshot
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'audit' | 'data'>('profile');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState<string>('all');

  const filteredAudits = auditLogs.filter((log) => {
    if (auditRoleFilter !== 'all' && log.actorRole !== auditRoleFilter) return false;
    if (!auditSearch.trim()) return true;
    const q = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.targetType.toLowerCase().includes(q)
    );
  });

  const exportFullDatabaseJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allDataSnapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `HOSCARE_${hospital.code}_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xl shrink-0">
              <Shield className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Hospital Administration & System Security</h1>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  HIPAA Compliant Audit Trail
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-hospital account control, role-based access governance, and encrypted database exports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRegisterHospital}
              className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Hospital Account</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-teal-50 text-teal-900 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hospital Profiles & Facilities ({hospitals.length})
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'audit'
                ? 'bg-teal-50 text-teal-900 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clinical Security Audit Logs ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveSubTab('data')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'data'
                ? 'bg-teal-50 text-teal-900 border border-teal-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Database Management & Backups
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Hospital Accounts */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hospitals.map((hosp) => {
              const isCurrent = hosp.id === hospital.id;

              return (
                <div
                  key={hosp.id}
                  className={`rounded-xl border p-5 bg-white transition-all shadow-xs flex flex-col justify-between ${
                    isCurrent ? 'border-teal-600 ring-2 ring-teal-500/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-lg bg-teal-800 text-white font-bold flex items-center justify-center text-sm">
                        {hosp.logoInitial}
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                          Active Facility
                        </span>
                      ) : (
                        <button
                          onClick={() => onSwitchHospital(hosp.id)}
                          className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer"
                        >
                          Switch Facility →
                        </button>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-3">{hosp.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{hosp.type}</p>

                    <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">CLINICAL LICENSE NUMBER</span>
                        <span className="font-mono font-medium text-slate-800">{hosp.licenseNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">ADDRESS</span>
                        <span>{hosp.address}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">EMERGENCY HOTLINE</span>
                        <span className="font-medium text-rose-700">{hosp.emergencyHotline}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">BED CAPACITY</span>
                        <span>{hosp.bedCapacity} Total Inpatient Beds</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Est: {new Date(hosp.createdAt).toLocaleDateString()}</span>
                    <span className="font-mono font-bold text-slate-700">CODE: {hosp.code}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Clinical & Operational Audit Trail</h2>
              <p className="text-xs text-slate-500">
                Immutable records of all patient admissions, vitals entries, laboratory analysis, and discharge actions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search audit actions..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 w-48 sm:w-60 focus:outline-none"
                />
              </div>

              <select
                value={auditRoleFilter}
                onChange={(e) => setAuditRoleFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="lab_tech">Lab Tech / Pathologist</option>
                <option value="receptionist">Admissions</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Staff Practitioner</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAudits.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {log.actorName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-teal-800 whitespace-nowrap">
                      {log.targetType}:{log.targetId.slice(0, 12)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Data Management */}
      {activeSubTab === 'data' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hospital Database Backup</h3>
                <p className="text-xs text-slate-500">Export complete relational data store to JSON</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Export all patients, admissions, bedside vitals logs, medication schedules, laboratory orders, and clinical audit records for offline archive or regulatory compliance.
            </p>

            <button
              onClick={exportFullDatabaseJSON}
              className="px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Full JSON Database</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Factory Seed Reset</h3>
                <p className="text-xs text-slate-500">Restore default clinical records</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Clears local mutations and re-initializes HOSCARE with default multi-hospital seed data, clinical triage cases, active ICU patients, and laboratory specimens.
            </p>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all hospital records to default seed?')) {
                  onResetData();
                }
              }}
              className="px-4 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset to Factory Clinical Seed</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
