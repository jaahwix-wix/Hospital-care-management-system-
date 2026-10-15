'use client';

import React, { useState } from 'react';
import { X, Building2, Shield, Plus } from 'lucide-react';
import { Hospital } from '@/lib/types';

interface RegisterHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterHospital: (hosp: Omit<Hospital, 'id' | 'createdAt' | 'activeAdmissions'>) => void;
}

export const RegisterHospitalModal: React.FC<RegisterHospitalModalProps> = ({
  isOpen,
  onClose,
  onRegisterHospital
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<Hospital['type']>('General Hospital');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+1 (555) 800-1100');
  const [emergencyHotline, setEmergencyHotline] = useState('+1 (555) 800-9111');
  const [email, setEmail] = useState('admissions@hospital.org');
  const [bedCapacity, setBedCapacity] = useState(150);
  const [logoInitial, setLogoInitial] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    onRegisterHospital({
      name,
      code: code.toUpperCase(),
      type,
      licenseNumber: licenseNumber || `HOSP-REG-${Math.floor(1000 + Math.random() * 9000)}`,
      address: address || '100 Medical Center Way, Health City',
      phone,
      emergencyHotline,
      email,
      bedCapacity: Number(bedCapacity) || 100,
      logoInitial: logoInitial || name.slice(0, 2).toUpperCase()
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
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Register New Hospital Facility</h2>
              <p className="text-xs text-slate-500">Create an independent tenant account and clinical registry.</p>
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
          <div>
            <label className="block text-slate-700 font-bold mb-1">Hospital / Medical Center Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!logoInitial && e.target.value.length >= 2) {
                  setLogoInitial(e.target.value.slice(0, 2).toUpperCase());
                }
              }}
              placeholder="e.g., Mount Sinai Metropolitan Health"
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Facility Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., MSMH"
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Logo Badge Initials</label>
              <input
                type="text"
                maxLength={3}
                value={logoInitial}
                onChange={(e) => setLogoInitial(e.target.value.toUpperCase())}
                placeholder="e.g., MS"
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Facility Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
              >
                <option value="Tertiary Medical Center">Tertiary Medical Center</option>
                <option value="General Hospital">General Hospital</option>
                <option value="Specialty Care">Specialty Care</option>
                <option value="Community Clinic">Community Clinic</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Bed Capacity</label>
              <input
                type="number"
                value={bedCapacity}
                onChange={(e) => setBedCapacity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Healthcare State License / Accreditation</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="e.g., HOSP-NY-2026-9042"
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, State, ZIP"
              className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Emergency Hotline</label>
              <input
                type="text"
                value={emergencyHotline}
                onChange={(e) => setEmergencyHotline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
              />
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
              Register Facility Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
