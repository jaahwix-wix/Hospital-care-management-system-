'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  UserCheck,
  Shield,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LogOut,
  Users
} from 'lucide-react';
import { UserRole, StaffUser } from '@/lib/types';
import { ROLE_PRIVILEGES, PRIVILEGE_LABELS, getRoleBadgeInfo } from '@/lib/permissions';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  currentStaffName: string;
  onLoginAsRole: (role: UserRole, staffName: string) => void;
  staffUsers: StaffUser[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  currentStaffName,
  onLoginAsRole,
  staffUsers
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [badgeId, setBadgeId] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [showMatrix, setShowMatrix] = useState(false);

  if (!isOpen) return null;

  const currentRoleInfo = getRoleBadgeInfo(currentRole);
  const currentPrivileges = ROLE_PRIVILEGES[currentRole];

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = staffUsers.find(
      (s) => s.badgeId.toLowerCase() === badgeId.trim().toLowerCase()
    );

    if (matched) {
      onLoginAsRole(matched.role, matched.name);
      onClose();
    } else {
      setAuthError('Badge ID not found in hospital directory. Try selecting a verified clinical persona below.');
    }
  };

  const handleQuickSwitch = (staff: StaffUser) => {
    onLoginAsRole(staff.role, staff.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold">
              <Shield className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Hospital Staff Authentication & Privileges</h2>
              <p className="text-xs text-slate-500">Role-Based Access Control (RBAC) & Secure Session State</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Session Card */}
        <div className="p-6 space-y-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{currentStaffName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${currentRoleInfo.color}`}>
                    {currentRoleInfo.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Authenticated Session · {currentPrivileges.length} Active Clinical Privileges Granted
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowMatrix(!showMatrix)}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline"
            >
              {showMatrix ? 'Hide Privilege Matrix' : 'View Privileges'}
            </button>
          </div>

          {/* Privilege Matrix Breakdown */}
          {showMatrix && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 font-bold text-slate-800 text-[11px]">
                <span>Clinical Privilege / Operation</span>
                <span>Access Status</span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(PRIVILEGE_LABELS).map(([actionKey, info]) => {
                  const hasAccess = currentPrivileges.includes(actionKey as any);
                  return (
                    <div key={actionKey} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                      <div>
                        <strong className="text-slate-800 block">{info.label}</strong>
                        <span className="text-[10px] text-slate-400">{info.description}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          hasAccess
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                        }`}
                      >
                        {hasAccess ? 'Authorized' : 'Restricted'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clinical Personas Switcher (Quick Authenticate) */}
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Authenticate / Switch Verified Practitioner Persona
            </span>

            <div className="space-y-2">
              {staffUsers.map((staff) => {
                const isSelected = staff.role === currentRole && staff.name === currentStaffName;
                const roleBadge = getRoleBadgeInfo(staff.role);

                return (
                  <div
                    key={staff.id}
                    onClick={() => handleQuickSwitch(staff)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                        {staff.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900">{staff.name}</strong>
                          <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${roleBadge.color}`}>
                            {roleBadge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {staff.title} · <span className="font-mono">{staff.badgeId}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        isSelected
                          ? 'bg-teal-700 text-white'
                          : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      {isSelected ? 'Active Persona' : 'Log In As'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badge ID Input Option */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block mb-2">
              Or Sign In with Official Hospital Badge ID:
            </span>
            <form onSubmit={handleCustomLogin} className="flex gap-2">
              <input
                type="text"
                value={badgeId}
                onChange={(e) => {
                  setBadgeId(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter Badge ID (e.g. DOC-104, RN-302, EXEC-001)"
                className="flex-1 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-teal-700 hover:bg-teal-800 text-white font-bold cursor-pointer"
              >
                Sign In
              </button>
            </form>
            {authError && <p className="text-[11px] text-rose-600 mt-1.5">{authError}</p>}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
