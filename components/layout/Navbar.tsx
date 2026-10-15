'use client';

import React, { useState } from 'react';
import {
  Building2,
  UserCheck,
  Activity,
  AlertTriangle,
  Plus,
  FlaskConical,
  Bed,
  Users,
  Shield,
  ChevronDown,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserRole, Hospital } from '@/lib/types';

interface NavbarProps {
  hospitals: Hospital[];
  activeHospital: Hospital;
  onSwitchHospital: (id: string) => void;
  onOpenRegisterHospital: () => void;
  currentRole: UserRole;
  currentStaffName: string;
  onSwitchRole: (role: UserRole) => void;
  activeTab: 'overview' | 'patients' | 'beds' | 'laboratory' | 'admin';
  setActiveTab: (tab: 'overview' | 'patients' | 'beds' | 'laboratory' | 'admin') => void;
  onOpenNewPatient: () => void;
  onOpenNewSample: () => void;
  onOpenAuthModal: () => void;
  criticalAlertsCount: number;
  triageQueueCount: number;
}

const ROLES: { id: UserRole; label: string; title: string; color: string }[] = [
  { id: 'admin', label: 'Hospital Admin', title: 'Dr. Eleanor Vance, MD (Chief Medical Officer)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'doctor', label: 'Attending Doctor', title: 'Dr. Marcus Chen, MD (Cardiology & Inpatient)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: 'nurse', label: 'Triage Nurse', title: 'Sarah Jenkins, RN (Charge Nurse)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'lab_tech', label: 'Lab Pathologist', title: 'Dr. Julian Reynolds, PhD (Lab Director)', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { id: 'receptionist', label: 'Admissions Officer', title: 'Emily Thorne (Intake Specialist)', color: 'text-slate-700 bg-slate-100 border-slate-200' }
];

export const Navbar: React.FC<NavbarProps> = ({
  hospitals,
  activeHospital,
  onSwitchHospital,
  onOpenRegisterHospital,
  currentRole,
  currentStaffName,
  onSwitchRole,
  activeTab,
  setActiveTab,
  onOpenNewPatient,
  onOpenNewSample,
  onOpenAuthModal,
  criticalAlertsCount,
  triageQueueCount
}) => {
  const [showHospMenu, setShowHospMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const activeRoleConfig = ROLES.find((r) => r.id === currentRole) || ROLES[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner / Ticker if critical alerts exist */}
      {criticalAlertsCount > 0 && (
        <div className="bg-rose-600 text-white text-xs py-1.5 px-4 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-semibold uppercase tracking-wider">STAT Critical Alert:</span>
            <span>{criticalAlertsCount} laboratory panic value(s) require immediate clinical attention and telephone readback.</span>
          </div>
          <button
            onClick={() => setActiveTab('laboratory')}
            className="text-xs bg-rose-700 hover:bg-rose-800 text-white px-2.5 py-0.5 rounded cursor-pointer font-medium"
          >
            Review Lab Alarms →
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <Activity className="w-5 h-5 text-teal-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-lg tracking-tight">HOSCARE</span>
                  <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    CARE KERNEL
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">Hospital Care Management System</p>
              </div>
            </div>

            {/* Hospital Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowHospMenu(!showHospMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors text-xs text-slate-800"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <div className="max-w-[200px] truncate">
                  <span className="font-medium text-slate-900 block truncate">{activeHospital.name}</span>
                  <span className="text-[10px] text-slate-500">{activeHospital.code} · {activeHospital.type}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {showHospMenu && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Hospital Account
                  </div>
                  {hospitals.map((hosp) => (
                    <button
                      key={hosp.id}
                      onClick={() => {
                        onSwitchHospital(hosp.id);
                        setShowHospMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2 hover:bg-slate-50 transition-colors ${
                        hosp.id === activeHospital.id ? 'bg-teal-50/70 text-teal-950 font-medium' : 'text-slate-700'
                      }`}
                    >
                      <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs mt-0.5 shrink-0">
                        {hosp.logoInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-900 truncate">{hosp.name}</div>
                        <div className="text-[11px] text-slate-500">{hosp.address}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Lic: {hosp.licenseNumber} · {hosp.bedCapacity} beds</div>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                    <button
                      onClick={() => {
                        setShowHospMenu(false);
                        onOpenRegisterHospital();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-teal-700 hover:bg-teal-50 rounded-lg flex items-center gap-2 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Register New Hospital Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'patients'
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Patients & Monitoring</span>
              {triageQueueCount > 0 && (
                <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                  {triageQueueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('beds')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'beds'
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bed className="w-3.5 h-3.5" />
              <span>Wards & Beds</span>
            </button>

            <button
              onClick={() => setActiveTab('laboratory')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'laboratory'
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Laboratory Analysis</span>
              {criticalAlertsCount > 0 && (
                <span className="ml-1 text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                  {criticalAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-teal-50 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Administration & Audit</span>
            </button>
          </nav>

          {/* Action Buttons & Staff Role Selector */}
          <div className="flex items-center gap-3">
            {/* Quick Action Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={onOpenNewPatient}
                className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Patient Intake</span>
              </button>

              <button
                onClick={onOpenNewSample}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
                <span>Accession Specimen</span>
              </button>
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${activeRoleConfig.color}`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <div className="text-left hidden sm:block">
                  <div className="font-semibold leading-tight">{activeRoleConfig.label}</div>
                  <div className="text-[10px] opacity-80 truncate max-w-[120px]">{currentStaffName}</div>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Clinical / Admin Persona
                  </div>
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSwitchRole(r.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${
                        r.id === currentRole ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">{r.label}</span>
                        {r.id === currentRole && (
                          <span className="text-[10px] text-teal-600 font-bold uppercase">Active</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{r.title}</div>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1.5 px-3 space-y-2">
                    <p className="text-[10px] text-slate-400">
                      Enforces role-based clinical security permissions & audit logging.
                    </p>
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenAuthModal();
                      }}
                      className="w-full py-1.5 px-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-teal-300" />
                      <span>Privilege Matrix & Credentials</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded text-xs shrink-0 font-medium ${
              activeTab === 'overview' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-3 py-1 rounded text-xs shrink-0 font-medium ${
              activeTab === 'patients' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Patients ({triageQueueCount})
          </button>
          <button
            onClick={() => setActiveTab('beds')}
            className={`px-3 py-1 rounded text-xs shrink-0 font-medium ${
              activeTab === 'beds' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Wards & Beds
          </button>
          <button
            onClick={() => setActiveTab('laboratory')}
            className={`px-3 py-1 rounded text-xs shrink-0 font-medium ${
              activeTab === 'laboratory' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Laboratory
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1 rounded text-xs shrink-0 font-medium ${
              activeTab === 'admin' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
            }`}
          >
            Admin & Audit
          </button>
        </div>
      </div>
    </header>
  );
};
