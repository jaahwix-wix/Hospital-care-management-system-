'use client';

import React, { useState } from 'react';
import { X, Plus, AlertCircle, User, Activity } from 'lucide-react';
import { Patient, Bed, TriageScore } from '@/lib/types';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBeds: Bed[];
  onRegister: (patientData: Omit<Patient, 'id' | 'createdAt' | 'hospitalId' | 'mrn'>) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  availableBeds,
  onRegister
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1985-05-15');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [bloodType, setBloodType] = useState<Patient['bloodType']>('O+');
  const [phone, setPhone] = useState('+1 (555) 012-3456');
  const [address, setAddress] = useState('123 Health Ave, Metro City');
  const [emergencyName, setEmergencyName] = useState('Jane Doe');
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (555) 012-7890');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [allergiesText, setAllergiesText] = useState('None known');
  const [conditionsText, setConditionsText] = useState('');
  const [triageScore, setTriageScore] = useState<TriageScore>('ESI-3_URGENT');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [admissionDiagnosis, setAdmissionDiagnosis] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [attendingDoctor, setAttendingDoctor] = useState('Dr. Marcus Chen, MD');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !chiefComplaint) return;

    // Calculate age from DOB
    const birth = new Date(dateOfBirth);
    const ageDiffMs = Date.now() - birth.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970) || 40;

    const chosenBed = availableBeds.find((b) => b.id === selectedBedId);

    const allergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s.toLowerCase() !== 'none' && s.toLowerCase() !== 'none known');

    const chronicConditions = conditionsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const now = new Date().toISOString();

    onRegister({
      firstName,
      lastName,
      dateOfBirth,
      age,
      gender,
      bloodType,
      phone,
      address,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      emergencyRelation,
      allergies,
      chronicConditions,
      currentStatus: chosenBed ? (chosenBed.type === 'icu' ? 'icu' : 'in_monitoring') : 'triage',
      currentBedId: chosenBed?.id,
      currentBedNumber: chosenBed?.bedNumber,
      currentWardId: chosenBed?.wardId,
      currentWardName: chosenBed?.wardName,
      attendingDoctorName: attendingDoctor,
      triageScore,
      chiefComplaint,
      admissionDiagnosis: admissionDiagnosis || chiefComplaint,
      triageEntryAt: now,
      admittedAt: chosenBed ? now : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Patient Emergency Intake & Triage</h2>
              <p className="text-xs text-slate-500">Record clinical presentation from the moment they enter the hospital.</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              1. Patient Demographics & Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g., Jonathan"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g., Bradley"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900 font-bold"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Emergency Contact (Name & Tel)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Name"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900"
                  />
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Allergies & Past History */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              2. Allergies & Medical History
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Known Drug Allergies (comma separated)
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g., Penicillin, Morphine"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Chronic Conditions (comma separated)
                </label>
                <input
                  type="text"
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  placeholder="e.g., Hypertension, Type 2 Diabetes, Asthma"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Triage Presentation & Bed Assignment */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              3. Triage Priority & Entry Assessment
            </h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Emergency Triage Category *</label>
                  <select
                    value={triageScore}
                    onChange={(e) => setTriageScore(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-semibold"
                  >
                    <option value="ESI-1_IMMEDIATE">ESI-1: Immediate Resuscitation (Life-Threatening)</option>
                    <option value="ESI-2_EMERGENT">ESI-2: Emergent (High Risk / Severe Pain / Altered)</option>
                    <option value="ESI-3_URGENT">ESI-3: Urgent (Requires 2+ Resources)</option>
                    <option value="ESI-4_LESS_URGENT">ESI-4: Less Urgent (1 Resource)</option>
                    <option value="ESI-5_NON_URGENT">ESI-5: Non-Urgent (Consultation Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Attending Inpatient Physician</label>
                  <input
                    type="text"
                    value={attendingDoctor}
                    onChange={(e) => setAttendingDoctor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Presenting Chief Complaint *</label>
                <textarea
                  rows={2}
                  required
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Describe symptoms, onset, severity, and reason for emergency admission..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Working Admission Diagnosis</label>
                <input
                  type="text"
                  value={admissionDiagnosis}
                  onChange={(e) => setAdmissionDiagnosis(e.target.value)}
                  placeholder="e.g., Acute Appendicitis or Hypertensive Crisis"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Assign Inpatient / Emergency Bed (Optional)
                </label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                >
                  <option value="">Hold in Triage Bay (Assign bed later)</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bedNumber} ({b.wardName} - {b.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Admit & Begin Monitoring
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
