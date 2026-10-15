'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Users,
  Bed,
  FlaskConical,
  Shield,
  Plus,
  AlertTriangle,
  Building2,
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useHospitalStore } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard';
import { PatientList } from '@/components/patients/PatientList';
import { PatientMonitoringView } from '@/components/patients/PatientMonitoringView';
import { WardBedManagement } from '@/components/wards/WardBedManagement';
import { LaboratoryWorkstation } from '@/components/laboratory/LaboratoryWorkstation';
import { HospitalAdmin } from '@/components/admin/HospitalAdmin';
import { NewPatientModal } from '@/components/modals/NewPatientModal';
import { NewSampleModal } from '@/components/modals/NewSampleModal';
import { RegisterHospitalModal } from '@/components/modals/RegisterHospitalModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { Patient } from '@/lib/types';

export default function HomePage() {
  const store = useHospitalStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'beds' | 'laboratory' | 'admin'>('overview');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isRegisterHospOpen, setIsRegisterHospOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [preselectedPatientForSample, setPreselectedPatientForSample] = useState<Patient | null>(null);
  const isClient = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isClient || !store.isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-3 text-teal-800">
          <Activity className="w-8 h-8 animate-pulse text-teal-600" />
          <span className="text-xl font-bold tracking-tight">HOSCARE</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-mono">Initializing Clinical Data & Hospital Kernel...</p>
      </div>
    );
  }

  // Selected patient for deep-dive stay monitoring
  const activeMonitoredPatient = selectedPatientId
    ? store.patients.find((p) => p.id === selectedPatientId)
    : null;

  // Counts
  const criticalAlertsCount = store.samples.filter(
    (s) => s.overallUrgency === 'CRITICAL_PANIC' || (s.criticalFlags && s.criticalFlags.length > 0)
  ).length;

  const triageQueueCount = store.patients.filter((p) => p.currentStatus === 'triage').length;
  const availableBeds = store.beds.filter((b) => b.status === 'available');

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
  };

  const handleOpenSampleForPatient = (patient: Patient) => {
    setPreselectedPatientForSample(patient);
    setIsSampleModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col antialiased">
      {/* Top Clinical Navigation Bar */}
      <Navbar
        hospitals={store.hospitals}
        activeHospital={store.activeHospital}
        onSwitchHospital={(id) => {
          store.switchHospital(id);
          setSelectedPatientId(null);
        }}
        onOpenRegisterHospital={() => setIsRegisterHospOpen(true)}
        currentRole={store.currentRole}
        currentStaffName={store.currentStaffName}
        onSwitchRole={store.switchRole}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'patients') {
            setSelectedPatientId(null);
          }
        }}
        onOpenNewPatient={() => setIsPatientModalOpen(true)}
        onOpenNewSample={() => {
          setPreselectedPatientForSample(null);
          setIsSampleModalOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        criticalAlertsCount={criticalAlertsCount}
        triageQueueCount={triageQueueCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <OverviewDashboard
                hospital={store.activeHospital}
                patients={store.patients}
                beds={store.beds}
                samples={store.samples}
                onSelectPatient={handleSelectPatient}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  setSelectedPatientId(null);
                }}
                onOpenNewPatient={() => setIsPatientModalOpen(true)}
                onOpenNewSample={() => {
                  setPreselectedPatientForSample(null);
                  setIsSampleModalOpen(true);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'patients' && (
            <motion.div
              key={activeMonitoredPatient ? `patient-${activeMonitoredPatient.id}` : 'patients-list'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activeMonitoredPatient ? (
                <PatientMonitoringView
                  patient={activeMonitoredPatient}
                  hospital={store.activeHospital}
                  allHospitals={store.hospitals}
                  vitals={store.vitals}
                  notes={store.notes}
                  medications={store.medications}
                  samples={store.allSamples}
                  beds={store.beds}
                  onBack={() => setSelectedPatientId(null)}
                  onRecordVitals={store.recordVitals}
                  onAddNote={store.addClinicalNote}
                  onAddMedication={store.addMedication}
                  onAssignBed={store.assignBedToPatient}
                  onUpdateStatus={store.updatePatientStatus}
                  onTransferPatient={(patientId, targetHospitalId, reason, priority, summary) => {
                    store.transferPatient(patientId, targetHospitalId, reason, priority, summary);
                  }}
                  onOpenNewSampleForPatient={handleOpenSampleForPatient}
                  currentRole={store.currentRole}
                  currentStaffName={store.currentStaffName}
                />
              ) : (
                <PatientList
                  patients={store.patients}
                  onSelectPatient={handleSelectPatient}
                  onOpenNewPatient={() => setIsPatientModalOpen(true)}
                />
              )}
            </motion.div>
          )}

          {activeTab === 'beds' && (
            <motion.div
              key="beds"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <WardBedManagement
                wards={store.wards}
                beds={store.beds}
                patients={store.patients}
                onSelectPatient={handleSelectPatient}
                onUpdateBedStatus={store.updateBedStatus}
                onAssignBed={store.assignBedToPatient}
              />
            </motion.div>
          )}

          {activeTab === 'laboratory' && (
            <motion.div
              key="laboratory"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <LaboratoryWorkstation
                samples={store.samples}
                patients={store.patients}
                onOpenNewSample={() => {
                  setPreselectedPatientForSample(null);
                  setIsSampleModalOpen(true);
                }}
                onUpdateSampleAnalysis={store.updateSampleAnalysis}
                currentRole={store.currentRole}
                currentStaffName={store.currentStaffName}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <HospitalAdmin
                hospital={store.activeHospital}
                hospitals={store.hospitals}
                auditLogs={store.auditLogs}
                onSwitchHospital={(id) => {
                  store.switchHospital(id);
                  setSelectedPatientId(null);
                }}
                onOpenRegisterHospital={() => setIsRegisterHospOpen(true)}
                onResetData={store.resetAllDataToDefault}
                allDataSnapshot={{
                  hospital: store.activeHospital,
                  patients: store.patients,
                  vitals: store.vitals,
                  beds: store.beds,
                  wards: store.wards,
                  samples: store.samples,
                  notes: store.notes,
                  medications: store.medications,
                  auditLogs: store.auditLogs
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <NewPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        availableBeds={availableBeds}
        onRegister={(data) => {
          const newPat = store.registerPatient(data);
          setSelectedPatientId(newPat.id);
          setActiveTab('patients');
        }}
      />

      <NewSampleModal
        key={preselectedPatientForSample?.id || 'sample-modal'}
        isOpen={isSampleModalOpen}
        onClose={() => {
          setIsSampleModalOpen(false);
          setPreselectedPatientForSample(null);
        }}
        patients={store.patients}
        preselectedPatient={preselectedPatientForSample}
        onAccession={(sampleData) => {
          store.accessionLabSample(sampleData);
          setActiveTab('laboratory');
        }}
        currentStaffName={store.currentStaffName}
      />

      <RegisterHospitalModal
        isOpen={isRegisterHospOpen}
        onClose={() => setIsRegisterHospOpen(false)}
        onRegisterHospital={store.registerHospital}
      />

      {/* Authentication and Privileges Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentRole={store.currentRole}
        currentStaffName={store.currentStaffName}
        onLoginAsRole={store.loginAsRole}
        staffUsers={store.staffUsers}
      />
    </div>
  );
}
