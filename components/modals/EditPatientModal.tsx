'use client';

import React, { useState } from 'react';
import { X, User, Save, ShieldAlert, HeartPulse, Stethoscope, Phone } from 'lucide-react';
import { Patient, UserRole } from '@/lib/types';
import { hasPrivilege } from '@/lib/permissions';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSave: (patientId: string, updates: Partial<Patient>) => void;
  currentRole: UserRole;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave,
  currentRole
}) => {
  const [firstName, setFirstName] = useState(patient.firstName);
  const [lastName, setLastName] = useState(patient.lastName);
  const [dateOfBirth, setDateOfBirth] = useState(patient.dateOfBirth);
  const [age, setAge] = useState(patient.age);
  const [gender, setGender] = useState(patient.gender);
  const [bloodType, setBloodType] = useState(patient.bloodType);
  const [phone, setPhone] = useState(patient.phone);
  const [email, setEmail] = useState(patient.email || '');
  const [address, setAddress] = useState(patient.address);
  const [emergencyContactName, setEmergencyContactName] = useState(patient.emergencyContactName);
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(patient.emergencyContactPhone);
  const [emergencyRelation, setEmergencyRelation] = useState(patient.emergencyRelation);
  const [allergiesText, setAllergiesText] = useState(patient.allergies.join(', '));
  const [chronicConditionsText, setChronicConditionsText] = useState(patient.chronicConditions.join(', '));
  const [attendingDoctorName, setAttendingDoctorName] = useState(patient.attendingDoctorName || '');
  const [chiefComplaint, setChiefComplaint] = useState(patient.chiefComplaint);
  const [admissionDiagnosis, setAdmissionDiagnosis] = useState(patient.admissionDiagnosis || '');

  if (!isOpen) return null;

  const canEdit = hasPrivilege(currentRole, 'edit_patient');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const allergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const chronicConditions = chronicConditionsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave(patient.id, {
      firstName,
      lastName,
      dateOfBirth,
      age: Number(age),
      gender,
      bloodType,
      phone,
      email: email || undefined,
      address,
      emergencyContactName,
      emergencyContactPhone,
      emergencyRelation,
      allergies,
      chronicConditions,
      attendingDoctorName: attendingDoctorName || undefined,
      chiefComplaint,
      admissionDiagnosis: admissionDiagnosis || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold">
              <User className="w-4 h-4 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Patient Medical Record</h2>
              <p className="text-xs text-slate-500 font-mono">MRN: {patient.mrn} · Inpatient Stay Care</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {!canEdit && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>You do not have privileges to edit medical records with your current credentials.</span>
            </div>
          )}

          {/* Demographics */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              1. Primary Demographics
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Age *</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  disabled={!canEdit}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Blood Type *</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value as any)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-semibold text-rose-700"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              2. Contact & Address
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-700 font-semibold mb-1">Residential Address *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!canEdit}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              3. Emergency Contact Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Name *</label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Relationship *</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  disabled={!canEdit}
                  required
                  placeholder="e.g. Spouse, Parent, Sibling"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Phone *</label>
                <input
                  type="text"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Clinical Allergies & Conditions */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              4. Clinical Allergies & Medical Profile
            </span>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Known Drug & Environmental Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  disabled={!canEdit}
                  placeholder="e.g. Penicillin, Sulfa, Latex, Peanuts"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Chronic Medical Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  value={chronicConditionsText}
                  onChange={(e) => setChronicConditionsText(e.target.value)}
                  disabled={!canEdit}
                  placeholder="e.g. Hypertension, Type 2 Diabetes, COPD"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Clinical Presentation & Attending Doctor */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              5. Attending Care & Diagnosis
            </span>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Attending Physician</label>
                <input
                  type="text"
                  value={attendingDoctorName}
                  onChange={(e) => setAttendingDoctorName(e.target.value)}
                  disabled={!canEdit}
                  placeholder="e.g. Dr. Marcus Chen, MD"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Presenting Chief Complaint</label>
                <textarea
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  disabled={!canEdit}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Working Admission Diagnosis</label>
                <textarea
                  rows={2}
                  value={admissionDiagnosis}
                  onChange={(e) => setAdmissionDiagnosis(e.target.value)}
                  disabled={!canEdit}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canEdit}
              className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
