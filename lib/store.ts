'use client';

import { useState, useEffect } from 'react';
import {
  Hospital,
  StaffUser,
  Patient,
  VitalSign,
  Bed,
  Ward,
  LabSample,
  ClinicalNote,
  MedicationOrder,
  AuditLog,
  UserRole,
  PatientStatus,
  TriageScore,
  LabPriority,
  PanelType,
  SpecimenType,
  TransferRecord
} from './types';
import { runClientSideAnalysis } from './lab-calculator';

// Initial Seed Hospitals
const SEED_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-st-jude',
    name: 'St. Jude Metropolitan Medical Center',
    code: 'SJMMC',
    type: 'Tertiary Medical Center',
    licenseNumber: 'HOSP-NY-2024-8842',
    address: '742 Healthcare Parkway, Suite 100, New York, NY 10021',
    phone: '+1 (212) 555-0199',
    emergencyHotline: '+1 (212) 555-9110',
    email: 'admissions@stjudemedical.org',
    bedCapacity: 120,
    activeAdmissions: 28,
    logoInitial: 'SJ',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 'hosp-apex-memorial',
    name: 'Apex Memorial Regional Hospital',
    code: 'AMRH',
    type: 'General Hospital',
    licenseNumber: 'HOSP-CA-2023-4109',
    address: '1400 Grandview Blvd, San Francisco, CA 94110',
    phone: '+1 (415) 555-3200',
    emergencyHotline: '+1 (415) 555-3911',
    email: 'admin@apexmemorial.org',
    bedCapacity: 80,
    activeAdmissions: 14,
    logoInitial: 'AM',
    createdAt: '2024-03-20T09:30:00Z'
  },
  {
    id: 'hosp-greenfield-trauma',
    name: 'Greenfield Trauma & Specialized Care',
    code: 'GTSC',
    type: 'Specialty Care',
    licenseNumber: 'HOSP-IL-2024-1182',
    address: '880 Medical Center Drive, Chicago, IL 60611',
    phone: '+1 (312) 555-7700',
    emergencyHotline: '+1 (312) 555-7911',
    email: 'ops@greenfieldhealth.org',
    bedCapacity: 60,
    activeAdmissions: 9,
    logoInitial: 'GT',
    createdAt: '2024-05-10T11:00:00Z'
  }
];

// Initial Staff Users
const SEED_STAFF: StaffUser[] = [
  {
    id: 'staff-admin-1',
    hospitalId: 'hosp-st-jude',
    name: 'Dr. Eleanor Vance, MD',
    role: 'admin',
    title: 'Chief Medical Officer & Administrator',
    department: 'Executive Clinical Leadership',
    email: 'e.vance@stjudemedical.org',
    badgeId: 'EXEC-001'
  },
  {
    id: 'staff-doc-1',
    hospitalId: 'hosp-st-jude',
    name: 'Dr. Marcus Chen, MD, FACC',
    role: 'doctor',
    title: 'Attending Cardiologist & Inpatient Lead',
    department: 'Cardiology & Intensive Care',
    email: 'm.chen@stjudemedical.org',
    badgeId: 'DOC-104'
  },
  {
    id: 'staff-nurse-1',
    hospitalId: 'hosp-st-jude',
    name: 'Sarah Jenkins, BSN, RN',
    role: 'nurse',
    title: 'Charge Nurse & Clinical Triage Supervisor',
    department: 'Emergency & Acute Inpatient Care',
    email: 's.jenkins@stjudemedical.org',
    badgeId: 'RN-302'
  },
  {
    id: 'staff-lab-1',
    hospitalId: 'hosp-st-jude',
    name: 'Dr. Julian Reynolds, PhD, MLS',
    role: 'lab_tech',
    title: 'Director of Clinical Pathology & Laboratory Sciences',
    department: 'Central Diagnostic Laboratories',
    email: 'j.reynolds@stjudemedical.org',
    badgeId: 'LAB-501'
  },
  {
    id: 'staff-rec-1',
    hospitalId: 'hosp-st-jude',
    name: 'Emily Thorne',
    role: 'receptionist',
    title: 'Senior Patient Intake & Admissions Specialist',
    department: 'Patient Access & Emergency Registration',
    email: 'e.thorne@stjudemedical.org',
    badgeId: 'ADM-708'
  }
];

// Wards for St. Jude
const SEED_WARDS: Ward[] = [
  {
    id: 'ward-ed',
    hospitalId: 'hosp-st-jude',
    name: 'Emergency Department Bay',
    code: 'ED-BAY',
    floor: 'Floor 1, East Wing',
    specialty: 'Trauma & Acute Resuscitation',
    totalBeds: 6,
    occupiedBeds: 2
  },
  {
    id: 'ward-icu',
    hospitalId: 'hosp-st-jude',
    name: 'Intensive Care Unit (ICU)',
    code: 'ICU-3',
    floor: 'Floor 3, Tower A',
    specialty: 'Critical Care & Mechanical Monitoring',
    totalBeds: 6,
    occupiedBeds: 3
  },
  {
    id: 'ward-cardiac',
    hospitalId: 'hosp-st-jude',
    name: 'Cardiology & Telemetry Unit',
    code: 'CARD-4',
    floor: 'Floor 4, West Wing',
    specialty: 'Cardiovascular Inpatient Care',
    totalBeds: 8,
    occupiedBeds: 2
  },
  {
    id: 'ward-medsurg',
    hospitalId: 'hosp-st-jude',
    name: 'General Medical-Surgical Ward',
    code: 'MED-SURG-5',
    floor: 'Floor 5, Main Wing',
    specialty: 'Post-Surgical & Inpatient Recovery',
    totalBeds: 12,
    occupiedBeds: 4
  }
];

// Beds for St. Jude
const SEED_BEDS: Bed[] = [
  // ED
  { id: 'bed-ed-01', hospitalId: 'hosp-st-jude', wardId: 'ward-ed', wardName: 'Emergency Bay', bedNumber: 'ED-01', type: 'emergency_bay', status: 'occupied', patientId: 'pat-1', patientName: 'Robert Vance Jr.', patientMrn: 'MRN-2026-9411', occupiedSince: '2026-10-04T05:30:00Z' },
  { id: 'bed-ed-02', hospitalId: 'hosp-st-jude', wardId: 'ward-ed', wardName: 'Emergency Bay', bedNumber: 'ED-02', type: 'emergency_bay', status: 'available' },
  { id: 'bed-ed-03', hospitalId: 'hosp-st-jude', wardId: 'ward-ed', wardName: 'Emergency Bay', bedNumber: 'ED-03', type: 'emergency_bay', status: 'cleaning' },
  { id: 'bed-ed-04', hospitalId: 'hosp-st-jude', wardId: 'ward-ed', wardName: 'Emergency Bay', bedNumber: 'ED-04', type: 'emergency_bay', status: 'available' },
  { id: 'bed-ed-05', hospitalId: 'hosp-st-jude', wardId: 'ward-ed', wardName: 'Emergency Bay', bedNumber: 'ED-05', type: 'emergency_bay', status: 'available' },
  { id: 'bed-ed-06', hospitalId: 'hosp-st-jude', wardId: 'ward-ed', wardName: 'Emergency Bay', bedNumber: 'ED-06', type: 'emergency_bay', status: 'available' },

  // ICU
  { id: 'bed-icu-01', hospitalId: 'hosp-st-jude', wardId: 'ward-icu', wardName: 'Intensive Care Unit', bedNumber: 'ICU-01', type: 'icu', status: 'occupied', patientId: 'pat-3', patientName: 'Arthur Pendelton', patientMrn: 'MRN-2026-8802', occupiedSince: '2026-10-02T14:15:00Z' },
  { id: 'bed-icu-02', hospitalId: 'hosp-st-jude', wardId: 'ward-icu', wardName: 'Intensive Care Unit', bedNumber: 'ICU-02', type: 'icu', status: 'occupied', patientId: 'pat-6', patientName: 'Elena Rostova', patientMrn: 'MRN-2026-7714', occupiedSince: '2026-10-03T18:00:00Z' },
  { id: 'bed-icu-03', hospitalId: 'hosp-st-jude', wardId: 'ward-icu', wardName: 'Intensive Care Unit', bedNumber: 'ICU-03', type: 'icu', status: 'available' },
  { id: 'bed-icu-04', hospitalId: 'hosp-st-jude', wardId: 'ward-icu', wardName: 'Intensive Care Unit', bedNumber: 'ICU-04', type: 'icu', status: 'cleaning' },
  { id: 'bed-icu-05', hospitalId: 'hosp-st-jude', wardId: 'ward-icu', wardName: 'Intensive Care Unit', bedNumber: 'ICU-05', type: 'icu', status: 'available' },
  { id: 'bed-icu-06', hospitalId: 'hosp-st-jude', wardId: 'ward-icu', wardName: 'Intensive Care Unit', bedNumber: 'ICU-06', type: 'icu', status: 'available' },

  // Cardiology
  { id: 'bed-card-01', hospitalId: 'hosp-st-jude', wardId: 'ward-cardiac', wardName: 'Cardiology Telemetry', bedNumber: 'CARD-101', type: 'cardiac', status: 'occupied', patientId: 'pat-2', patientName: 'Clara Oswald', patientMrn: 'MRN-2026-6542', occupiedSince: '2026-10-03T09:40:00Z' },
  { id: 'bed-card-02', hospitalId: 'hosp-st-jude', wardId: 'ward-cardiac', wardName: 'Cardiology Telemetry', bedNumber: 'CARD-102', type: 'cardiac', status: 'available' },
  { id: 'bed-card-03', hospitalId: 'hosp-st-jude', wardId: 'ward-cardiac', wardName: 'Cardiology Telemetry', bedNumber: 'CARD-103', type: 'cardiac', status: 'available' },
  { id: 'bed-card-04', hospitalId: 'hosp-st-jude', wardId: 'ward-cardiac', wardName: 'Cardiology Telemetry', bedNumber: 'CARD-104', type: 'cardiac', status: 'available' },

  // Med Surg
  { id: 'bed-ms-01', hospitalId: 'hosp-st-jude', wardId: 'ward-medsurg', wardName: 'Med-Surg 5', bedNumber: 'MS-501', type: 'standard', status: 'occupied', patientId: 'pat-4', patientName: 'David K. Henderson', patientMrn: 'MRN-2026-5120', occupiedSince: '2026-10-01T11:20:00Z' },
  { id: 'bed-ms-02', hospitalId: 'hosp-st-jude', wardId: 'ward-medsurg', wardName: 'Med-Surg 5', bedNumber: 'MS-502', type: 'standard', status: 'available' },
  { id: 'bed-ms-03', hospitalId: 'hosp-st-jude', wardId: 'ward-medsurg', wardName: 'Med-Surg 5', bedNumber: 'MS-503', type: 'standard', status: 'available' },
  { id: 'bed-ms-04', hospitalId: 'hosp-st-jude', wardId: 'ward-medsurg', wardName: 'Med-Surg 5', bedNumber: 'MS-504', type: 'standard', status: 'available' }
];

// Seed Patients representing all stages from Entry to Exit
const SEED_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    hospitalId: 'hosp-st-jude',
    mrn: 'MRN-2026-9411',
    firstName: 'Robert',
    lastName: 'Vance Jr.',
    dateOfBirth: '1964-08-14',
    age: 62,
    gender: 'male',
    bloodType: 'O+',
    phone: '+1 (555) 382-9011',
    address: '412 Evergreen Terrace, Brooklyn, NY',
    emergencyContactName: 'Margaret Vance',
    emergencyContactPhone: '+1 (555) 382-9012',
    emergencyRelation: 'Spouse',
    allergies: ['Penicillin', 'Sulfa drugs'],
    chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    currentStatus: 'triage',
    currentWardId: 'ward-ed',
    currentWardName: 'Emergency Bay',
    currentBedId: 'bed-ed-01',
    currentBedNumber: 'ED-01',
    attendingDoctorName: 'Dr. Marcus Chen, MD',
    triageScore: 'ESI-2_EMERGENT',
    chiefComplaint: 'Acute substernal chest pressure radiating to left jaw, diaphoresis, shortness of breath for 90 minutes.',
    admissionDiagnosis: 'Suspected Non-ST Elevation Myocardial Infarction (NSTEMI) / Acute Coronary Syndrome',
    triageEntryAt: '2026-10-04T05:30:00Z',
    admittedAt: '2026-10-04T05:45:00Z',
    createdAt: '2026-10-04T05:30:00Z'
  },
  {
    id: 'pat-2',
    hospitalId: 'hosp-st-jude',
    mrn: 'MRN-2026-6542',
    firstName: 'Clara',
    lastName: 'Oswald',
    dateOfBirth: '1987-11-23',
    age: 38,
    gender: 'female',
    bloodType: 'A+',
    phone: '+1 (555) 749-1120',
    address: '89 Baker Street, Manhattan, NY',
    emergencyContactName: 'Danny Pink',
    emergencyContactPhone: '+1 (555) 749-1121',
    emergencyRelation: 'Partner',
    allergies: ['Latex'],
    chronicConditions: ['Asthma'],
    currentStatus: 'in_monitoring',
    currentWardId: 'ward-cardiac',
    currentWardName: 'Cardiology Telemetry',
    currentBedId: 'bed-card-01',
    currentBedNumber: 'CARD-101',
    attendingDoctorName: 'Dr. Marcus Chen, MD',
    triageScore: 'ESI-3_URGENT',
    chiefComplaint: 'Episodes of paroxysmal supraventricular tachycardia with lightheadedness and presyncope.',
    admissionDiagnosis: 'Paroxysmal Supraventricular Tachycardia (PSVT), awaiting electrophysiology review',
    triageEntryAt: '2026-10-03T08:15:00Z',
    admittedAt: '2026-10-03T09:40:00Z',
    createdAt: '2026-10-03T08:15:00Z'
  },
  {
    id: 'pat-3',
    hospitalId: 'hosp-st-jude',
    mrn: 'MRN-2026-8802',
    firstName: 'Arthur',
    lastName: 'Pendelton',
    dateOfBirth: '1955-04-03',
    age: 71,
    gender: 'male',
    bloodType: 'B+',
    phone: '+1 (555) 602-3399',
    address: '1004 Riverdale Ave, Bronx, NY',
    emergencyContactName: 'Grace Pendelton',
    emergencyContactPhone: '+1 (555) 602-3390',
    emergencyRelation: 'Daughter',
    allergies: ['Ciprofloxacin', 'Codeine'],
    chronicConditions: ['Chronic Kidney Disease Stage 3b', 'Congestive Heart Failure'],
    currentStatus: 'icu',
    currentWardId: 'ward-icu',
    currentWardName: 'Intensive Care Unit',
    currentBedId: 'bed-icu-01',
    currentBedNumber: 'ICU-01',
    attendingDoctorName: 'Dr. Eleanor Vance, MD',
    triageScore: 'ESI-1_IMMEDIATE',
    chiefComplaint: 'Severe lethargy, anuria for 18 hours, acute respiratory distress, severe hyperkalemia.',
    admissionDiagnosis: 'Acute on Chronic Renal Failure (Stage 4 AKI), Hyperkalemic Emergency, Metabolic Acidosis',
    triageEntryAt: '2026-10-02T13:00:00Z',
    admittedAt: '2026-10-02T14:15:00Z',
    createdAt: '2026-10-02T13:00:00Z'
  },
  {
    id: 'pat-4',
    hospitalId: 'hosp-st-jude',
    mrn: 'MRN-2026-5120',
    firstName: 'David K.',
    lastName: 'Henderson',
    dateOfBirth: '1979-02-17',
    age: 47,
    gender: 'male',
    bloodType: 'AB-',
    phone: '+1 (555) 912-4411',
    address: '55 Queens Blvd, Queens, NY',
    emergencyContactName: 'Laura Henderson',
    emergencyContactPhone: '+1 (555) 912-4412',
    emergencyRelation: 'Spouse',
    allergies: ['None known'],
    chronicConditions: ['Mild Dyslipidemia'],
    currentStatus: 'discharge_pending',
    currentWardId: 'ward-medsurg',
    currentWardName: 'Med-Surg 5',
    currentBedId: 'bed-ms-01',
    currentBedNumber: 'MS-501',
    attendingDoctorName: 'Dr. Eleanor Vance, MD',
    triageScore: 'ESI-3_URGENT',
    chiefComplaint: 'Community acquired right lower lobe pneumonia with pleuritic chest discomfort and fever.',
    admissionDiagnosis: 'Bacterial Pneumonia (Streptococcus pneumoniae) - Responding to IV Ceftriaxone',
    dischargeDiagnosis: 'Resolved Right Lower Lobe Bacterial Pneumonia',
    dischargeSummary: 'Patient afebrile for >48h, leukocytosis resolved, ambulating on room air without dyspnea. Oral Cefpodoxime prescribed for 5 days.',
    dischargeClearedBy: 'Dr. Eleanor Vance, MD',
    triageEntryAt: '2026-10-01T10:00:00Z',
    admittedAt: '2026-10-01T11:20:00Z',
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'pat-5',
    hospitalId: 'hosp-st-jude',
    mrn: 'MRN-2026-3091',
    firstName: 'Miriam',
    lastName: 'Al-Mansoor',
    dateOfBirth: '1992-06-30',
    age: 34,
    gender: 'female',
    bloodType: 'O-',
    phone: '+1 (555) 234-8899',
    address: '228 Atlantic Ave, Brooklyn, NY',
    emergencyContactName: 'Tariq Al-Mansoor',
    emergencyContactPhone: '+1 (555) 234-8890',
    emergencyRelation: 'Brother',
    allergies: ['NSAIDs', 'Aspirin'],
    chronicConditions: [],
    currentStatus: 'discharged',
    attendingDoctorName: 'Dr. Eleanor Vance, MD',
    triageScore: 'ESI-4_LESS_URGENT',
    chiefComplaint: 'Acute uncomplicated appendicitis post laparoscopic appendectomy.',
    admissionDiagnosis: 'Acute suppurative appendicitis',
    dischargeDiagnosis: 'Status post uncomplicated laparoscopic appendectomy',
    dischargeSummary: 'Tolerating regular diet, surgical wounds clean and dry, pain managed with acetaminophen. Cleared for normal non-strenuous activity.',
    dischargeClearedBy: 'Dr. Eleanor Vance, MD',
    triageEntryAt: '2026-09-30T14:00:00Z',
    admittedAt: '2026-09-30T16:00:00Z',
    dischargedAt: '2026-10-03T16:30:00Z',
    accessibleHospitalIds: ['hosp-st-jude'],
    createdAt: '2026-09-30T14:00:00Z'
  },
  {
    id: 'pat-6',
    hospitalId: 'hosp-st-jude',
    mrn: 'MRN-2026-7714',
    firstName: 'Elena',
    lastName: 'Rostova',
    dateOfBirth: '1975-09-12',
    age: 51,
    gender: 'female',
    bloodType: 'AB+',
    phone: '+1 (555) 881-2099',
    address: '600 Post Street, San Francisco, CA',
    emergencyContactName: 'Mikhail Rostov',
    emergencyContactPhone: '+1 (555) 881-2090',
    emergencyRelation: 'Spouse',
    allergies: ['Vancomycin', 'Sulfa'],
    chronicConditions: ['Type 1 Diabetes', 'Hypothyroidism'],
    currentStatus: 'icu',
    currentWardId: 'ward-icu',
    currentWardName: 'Intensive Care Unit',
    currentBedId: 'bed-icu-02',
    currentBedNumber: 'ICU-02',
    attendingDoctorName: 'Dr. Eleanor Vance, MD',
    triageScore: 'ESI-1_IMMEDIATE',
    chiefComplaint: 'Septic shock secondary to pyelonephritis with multiorgan failure, transferred from Apex Memorial for tertiary ICU ECMO/dialysis support.',
    admissionDiagnosis: 'Urosepsis, Septic Shock, Acute Tubular Necrosis',
    transferredFromHospitalId: 'hosp-apex-memorial',
    transferredFromHospitalName: 'Apex Memorial Regional Hospital',
    accessibleHospitalIds: ['hosp-st-jude', 'hosp-apex-memorial'],
    transferHistory: [
      {
        id: 'trans-init-1',
        patientId: 'pat-6',
        fromHospitalId: 'hosp-apex-memorial',
        fromHospitalName: 'Apex Memorial Regional Hospital',
        toHospitalId: 'hosp-st-jude',
        toHospitalName: 'St. Jude Metropolitan Medical Center',
        transferredAt: '2026-10-03T18:00:00Z',
        transferredBy: 'Dr. Gregory House, MD',
        transferredByRole: 'doctor',
        reason: 'Tertiary ICU escalation & continuous renal replacement therapy unavailable at community site',
        priority: 'EMERGENT_STAT',
        clinicalSummary: 'Intubated on mechanical ventilation, noradrenaline infusion at 0.15 mcg/kg/min, blood cultures pending.',
        specialtyRequired: 'Tertiary Medical Center ICU',
        status: 'completed'
      }
    ],
    triageEntryAt: '2026-10-03T18:00:00Z',
    admittedAt: '2026-10-03T18:30:00Z',
    createdAt: '2026-10-03T18:00:00Z'
  }
];

// Initial Vitals
const SEED_VITALS: VitalSign[] = [
  // For pat-1 (Robert Vance)
  {
    id: 'vit-1',
    patientId: 'pat-1',
    hospitalId: 'hosp-st-jude',
    recordedAt: '2026-10-04T05:35:00Z',
    recordedBy: 'Sarah Jenkins, RN',
    recordedByRole: 'nurse',
    heartRate: 104,
    bloodPressureSystolic: 158,
    bloodPressureDiastolic: 96,
    respiratoryRate: 22,
    oxygenSaturation: 94,
    temperature: 37.1,
    painScore: 8,
    consciousness: 'ALERT',
    news2Score: 4,
    notes: 'Triage intake: patient clenching sternum, cool diaphoretic skin. Oxygen 2L nasal cannula started.'
  },
  {
    id: 'vit-2',
    patientId: 'pat-1',
    hospitalId: 'hosp-st-jude',
    recordedAt: '2026-10-04T06:15:00Z',
    recordedBy: 'Dr. Marcus Chen, MD',
    recordedByRole: 'doctor',
    heartRate: 92,
    bloodPressureSystolic: 138,
    bloodPressureDiastolic: 84,
    respiratoryRate: 18,
    oxygenSaturation: 97,
    temperature: 37.0,
    painScore: 4,
    consciousness: 'ALERT',
    news2Score: 1,
    notes: 'Post sublingual nitroglycerin x1 and aspirin 324mg chewable. Pain decreasing.'
  },
  // For pat-3 (Arthur Pendelton in ICU)
  {
    id: 'vit-3',
    patientId: 'pat-3',
    hospitalId: 'hosp-st-jude',
    recordedAt: '2026-10-04T04:00:00Z',
    recordedBy: 'Sarah Jenkins, RN',
    recordedByRole: 'nurse',
    heartRate: 118,
    bloodPressureSystolic: 172,
    bloodPressureDiastolic: 104,
    respiratoryRate: 26,
    oxygenSaturation: 91,
    temperature: 37.8,
    painScore: 5,
    consciousness: 'VOICE_RESPONSIVE',
    news2Score: 8,
    notes: 'Kussmaul breathing noted, continuous telemetry on. Stat calcium gluconate and insulin-dextrose protocol.'
  },
  // For pat-4 (David Henderson)
  {
    id: 'vit-4',
    patientId: 'pat-4',
    hospitalId: 'hosp-st-jude',
    recordedAt: '2026-10-04T06:00:00Z',
    recordedBy: 'Sarah Jenkins, RN',
    recordedByRole: 'nurse',
    heartRate: 72,
    bloodPressureSystolic: 122,
    bloodPressureDiastolic: 78,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    temperature: 36.8,
    painScore: 1,
    consciousness: 'ALERT',
    news2Score: 0,
    notes: 'Vitals completely normalized on room air. Ready for discharge.'
  },
  // For pat-6 (Elena Rostova - Transferred ICU patient)
  {
    id: 'vit-5',
    patientId: 'pat-6',
    hospitalId: 'hosp-st-jude',
    recordedAt: '2026-10-04T06:30:00Z',
    recordedBy: 'Sarah Jenkins, RN',
    recordedByRole: 'nurse',
    heartRate: 112,
    bloodPressureSystolic: 98,
    bloodPressureDiastolic: 56,
    respiratoryRate: 24,
    oxygenSaturation: 93,
    temperature: 38.6,
    painScore: 3,
    consciousness: 'VOICE_RESPONSIVE',
    news2Score: 7,
    notes: 'Post-transfer telemetry in ICU Bed 02: Tachycardia, borderline MAP, febrile on broad-spectrum Meropenem. Arterial line zeroed.'
  }
];

// Helper to analyze seed lab results using Python/TS reference
function createAnalyzedSample(sample: Partial<LabSample>): LabSample {
  const analysis = runClientSideAnalysis({
    raw_results: sample.rawValues || {},
    patient_meta: {
      age: sample.patientAge || 50,
      gender: sample.patientGender || 'male'
    }
  });

  return {
    id: sample.id || `sample-${Date.now()}`,
    hospitalId: sample.hospitalId || 'hosp-st-jude',
    sampleBarcode: sample.sampleBarcode || 'LAB-2026-0000',
    patientId: sample.patientId || '',
    patientName: sample.patientName || '',
    patientMrn: sample.patientMrn || '',
    patientAge: sample.patientAge || 50,
    patientGender: sample.patientGender || 'male',
    specimenType: sample.specimenType || 'Whole Blood',
    tubeColor: sample.tubeColor || 'Purple (EDTA)',
    panelType: sample.panelType || 'CBC',
    collectionSite: sample.collectionSite || 'Left Antecubital Fossa',
    collectedAt: sample.collectedAt || new Date().toISOString(),
    collectedBy: sample.collectedBy || 'Staff Phlebotomist',
    receivedAtLab: sample.receivedAtLab,
    processedAt: sample.processedAt,
    verifiedAt: sample.verifiedAt,
    verifiedBy: sample.verifiedBy,
    status: sample.status || 'COLLECTED',
    priority: sample.priority || 'ROUTINE',
    rawValues: sample.rawValues || {},
    analyzedItems: analysis.items,
    calculatedIndices: analysis.calculated_indices,
    criticalFlags: analysis.critical_flags,
    clinicalImpressions: analysis.clinical_impressions,
    overallUrgency: analysis.overall_urgency,
    pathologistNotes: sample.pathologistNotes,
    engineUsed: analysis.engine
  };
}

// Initial Lab Samples
const SEED_SAMPLES: LabSample[] = [
  createAnalyzedSample({
    id: 'samp-101',
    hospitalId: 'hosp-st-jude',
    sampleBarcode: 'LAB-2026-BLD-9411',
    patientId: 'pat-1',
    patientName: 'Robert Vance Jr.',
    patientMrn: 'MRN-2026-9411',
    patientAge: 62,
    patientGender: 'male',
    specimenType: 'Serum',
    tubeColor: 'Gold (SST)',
    panelType: 'CARDIAC',
    collectionSite: 'Right Antecubital Vein',
    collectedAt: '2026-10-04T05:38:00Z',
    collectedBy: 'Sarah Jenkins, RN',
    receivedAtLab: '2026-10-04T05:46:00Z',
    processedAt: '2026-10-04T05:58:00Z',
    verifiedAt: '2026-10-04T06:05:00Z',
    verifiedBy: 'Dr. Julian Reynolds, PhD',
    status: 'VERIFIED',
    priority: 'STAT_CRITICAL',
    rawValues: {
      troponin: 0.28,
      bnp: 420.0,
      glucose: 148.0,
      potassium: 4.8,
      sodium: 139.0
    },
    pathologistNotes: 'STAT cardiac biomarkers confirmed positive. Troponin I markedly elevated at 0.28 ng/mL. Notified Attending Dr. Marcus Chen directly via critical phone readback.'
  }),
  createAnalyzedSample({
    id: 'samp-102',
    hospitalId: 'hosp-st-jude',
    sampleBarcode: 'LAB-2026-CHM-8802',
    patientId: 'pat-3',
    patientName: 'Arthur Pendelton',
    patientMrn: 'MRN-2026-8802',
    patientAge: 71,
    patientGender: 'male',
    specimenType: 'Serum',
    tubeColor: 'Gold (SST)',
    panelType: 'CMP',
    collectionSite: 'Left Median Cubital',
    collectedAt: '2026-10-04T03:50:00Z',
    collectedBy: 'Sarah Jenkins, RN',
    receivedAtLab: '2026-10-04T04:02:00Z',
    processedAt: '2026-10-04T04:18:00Z',
    verifiedAt: '2026-10-04T04:25:00Z',
    verifiedBy: 'Dr. Julian Reynolds, PhD',
    status: 'VERIFIED',
    priority: 'STAT_CRITICAL',
    rawValues: {
      potassium: 6.6,
      creatinine: 3.9,
      bun: 68.0,
      sodium: 132.0,
      chloride: 92.0,
      co2: 14.0,
      calcium: 7.9,
      glucose: 165.0
    },
    pathologistNotes: 'CRITICAL PANIC: Serum Potassium 6.6 mEq/L and high anion gap metabolic acidosis. Extreme cardiac arrhythmia risk.'
  }),
  createAnalyzedSample({
    id: 'samp-103',
    hospitalId: 'hosp-st-jude',
    sampleBarcode: 'LAB-2026-HEM-9411',
    patientId: 'pat-1',
    patientName: 'Robert Vance Jr.',
    patientMrn: 'MRN-2026-9411',
    patientAge: 62,
    patientGender: 'male',
    specimenType: 'Whole Blood',
    tubeColor: 'Purple (EDTA)',
    panelType: 'CBC',
    collectionSite: 'Right Antecubital Vein',
    collectedAt: '2026-10-04T05:38:00Z',
    collectedBy: 'Sarah Jenkins, RN',
    receivedAtLab: '2026-10-04T05:46:00Z',
    processedAt: '2026-10-04T06:00:00Z',
    status: 'ANALYSIS_COMPLETE',
    priority: 'URGENT',
    rawValues: {
      wbc: 11.8,
      rbc: 4.6,
      hemoglobin: 14.2,
      hematocrit: 42.5,
      platelets: 230.0,
      neutrophils: 78.0,
      lymphocytes: 16.0
    },
    pathologistNotes: 'Mild neutrophilic leukocytosis reactive to acute coronary stress.'
  }),
  createAnalyzedSample({
    id: 'samp-104',
    hospitalId: 'hosp-st-jude',
    sampleBarcode: 'LAB-2026-ABG-8802',
    patientId: 'pat-3',
    patientName: 'Arthur Pendelton',
    patientMrn: 'MRN-2026-8802',
    patientAge: 71,
    patientGender: 'male',
    specimenType: 'Arterial Blood',
    tubeColor: 'Green (Heparin)',
    panelType: 'ABG',
    collectionSite: 'Right Radial Artery',
    collectedAt: '2026-10-04T06:10:00Z',
    collectedBy: 'Dr. Eleanor Vance, MD',
    receivedAtLab: '2026-10-04T06:14:00Z',
    status: 'IN_ANALYSIS',
    priority: 'STAT_CRITICAL',
    rawValues: {
      ph: 7.22,
      pco2: 28.0,
      po2: 88.0,
      hco3: 13.0,
      base_excess: -8.5,
      lactate: 3.4
    }
  }),
  createAnalyzedSample({
    id: 'samp-105',
    hospitalId: 'hosp-st-jude',
    sampleBarcode: 'LAB-2026-HEM-5120',
    patientId: 'pat-4',
    patientName: 'David K. Henderson',
    patientMrn: 'MRN-2026-5120',
    patientAge: 47,
    patientGender: 'male',
    specimenType: 'Whole Blood',
    tubeColor: 'Purple (EDTA)',
    panelType: 'CBC',
    collectionSite: 'Left Cephalic Vein',
    collectedAt: '2026-10-04T05:00:00Z',
    collectedBy: 'Sarah Jenkins, RN',
    receivedAtLab: '2026-10-04T05:15:00Z',
    processedAt: '2026-10-04T05:30:00Z',
    verifiedAt: '2026-10-04T05:40:00Z',
    verifiedBy: 'Dr. Julian Reynolds, PhD',
    status: 'VERIFIED',
    priority: 'ROUTINE',
    rawValues: {
      wbc: 6.8,
      rbc: 4.8,
      hemoglobin: 14.9,
      hematocrit: 44.1,
      platelets: 285.0,
      neutrophils: 62.0,
      lymphocytes: 31.0
    },
    pathologistNotes: 'Post-treatment follow-up CBC completely normal. Leukocytosis fully resolved.'
  })
];

// Initial Clinical Notes
const SEED_NOTES: ClinicalNote[] = [
  {
    id: 'note-1',
    patientId: 'pat-1',
    hospitalId: 'hosp-st-jude',
    recordedAt: '2026-10-04T05:32:00Z',
    authorName: 'Sarah Jenkins, RN',
    authorRole: 'nurse',
    noteType: 'triage_intake',
    title: 'Emergency Intake & Triage Assessment',
    content: 'Patient presented ambulatory with severe retrosternal gripping chest pain, onset 90 min ago at rest. Diaphoretic, pale, tachypneic. IV access established in right AC 18G. Stat 12-lead ECG and Troponin drawn.'
  },
  {
    id: 'note-2',
    patientId: 'pat-1',
    hospitalId: 'hosp-st-jude',
    recordedAt: '2026-10-04T06:10:00Z',
    authorName: 'Dr. Marcus Chen, MD',
    authorRole: 'doctor',
    noteType: 'physician_round',
    title: 'Cardiology Attending Evaluation',
    content: 'ECG shows ST-segment depression in V4-V6 with T-wave inversions. Troponin I elevated at 0.28 ng/mL. Confirmed NSTEMI. Initiated Heparin bolus + continuous drip, dual antiplatelet therapy (Aspirin + Clopidogrel), and Atorvastatin 80mg. Cardiac catheterization laboratory on standby.'
  },
  {
    id: 'note-3',
    patientId: 'pat-4',
    hospitalId: 'hosp-st-jude',
    recordedAt: '2026-10-04T06:15:00Z',
    authorName: 'Dr. Eleanor Vance, MD',
    authorRole: 'admin',
    noteType: 'discharge_summary',
    title: 'Discharge Clearance & Summary Note',
    content: 'Completed 72 hours of IV antimicrobial therapy for right lower lobe pneumonia. Chest auscultation demonstrates marked clearance of rales. Room air O2 saturation 98%. Patient educated on oral antibiotic regimen, warning signs, and scheduled for outpatient pulmonary clinic follow-up in 10 days.'
  }
];

// Initial Medications
const SEED_MEDS: MedicationOrder[] = [
  {
    id: 'med-1',
    patientId: 'pat-1',
    hospitalId: 'hosp-st-jude',
    medicationName: 'Heparin Sodium',
    dosage: '5,000 unit bolus followed by 1,000 units/hr',
    route: 'IV Infusion',
    frequency: 'Continuous IV Infusion (Titrate to aPTT 60-80s)',
    prescribedBy: 'Dr. Marcus Chen, MD',
    startDate: '2026-10-04T06:00:00Z',
    status: 'active',
    lastAdministeredAt: '2026-10-04T06:05:00Z',
    notes: 'STAT ACS Protocol'
  },
  {
    id: 'med-2',
    patientId: 'pat-1',
    hospitalId: 'hosp-st-jude',
    medicationName: 'Aspirin (Chewable)',
    dosage: '324 mg',
    route: 'Oral',
    frequency: 'Once STAT, then 81 mg Daily',
    prescribedBy: 'Dr. Marcus Chen, MD',
    startDate: '2026-10-04T05:35:00Z',
    status: 'completed',
    lastAdministeredAt: '2026-10-04T05:40:00Z'
  },
  {
    id: 'med-3',
    patientId: 'pat-3',
    hospitalId: 'hosp-st-jude',
    medicationName: 'Calcium Gluconate 10%',
    dosage: '1,000 mg in 100 mL D5W over 10 min',
    route: 'IV Infusion',
    frequency: 'STAT x 1 for myocardial membrane stabilization',
    prescribedBy: 'Dr. Eleanor Vance, MD',
    startDate: '2026-10-04T04:10:00Z',
    status: 'completed',
    lastAdministeredAt: '2026-10-04T04:15:00Z'
  }
];

// Initial Audit Logs
const SEED_AUDITS: AuditLog[] = [
  {
    id: 'aud-1',
    hospitalId: 'hosp-st-jude',
    timestamp: '2026-10-04T05:30:00Z',
    actorName: 'Sarah Jenkins, RN',
    actorRole: 'nurse',
    action: 'Patient Triage Intake',
    targetType: 'patient',
    targetId: 'pat-1',
    details: 'Admitted Robert Vance Jr. (MRN-2026-9411) into Emergency Bay ED-01 with ESI-2 priority.'
  },
  {
    id: 'aud-2',
    hospitalId: 'hosp-st-jude',
    timestamp: '2026-10-04T05:46:00Z',
    actorName: 'Dr. Julian Reynolds, PhD',
    actorRole: 'lab_tech',
    action: 'Specimen Accessioning',
    targetType: 'lab_sample',
    targetId: 'samp-101',
    details: 'Received Gold SST tube for STAT Cardiac Panel. Sample Barcode: LAB-2026-BLD-9411.'
  },
  {
    id: 'aud-3',
    hospitalId: 'hosp-st-jude',
    timestamp: '2026-10-04T06:05:00Z',
    actorName: 'Dr. Julian Reynolds, PhD',
    actorRole: 'lab_tech',
    action: 'Lab Results Verified & Critical Flag Raised',
    targetType: 'lab_sample',
    targetId: 'samp-101',
    details: 'Verified Troponin I 0.28 ng/mL (CRITICAL HIGH). Immediate readback alert provided to Dr. Marcus Chen.'
  }
];

const STORAGE_KEY_PREFIX = 'hoscare_system_v1_';

function getInitialData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function useHospitalStore() {
  const [isLoaded] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>(() => getInitialData('hospitals', SEED_HOSPITALS));
  const [activeHospitalId, setActiveHospitalId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'hosp-st-jude';
    return localStorage.getItem(STORAGE_KEY_PREFIX + 'activeHospitalId') || 'hosp-st-jude';
  });
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return 'admin';
    return (localStorage.getItem(STORAGE_KEY_PREFIX + 'currentRole') as UserRole) || 'admin';
  });
  const [currentStaffName, setCurrentStaffName] = useState<string>('Dr. Eleanor Vance, MD');

  const [patients, setPatients] = useState<Patient[]>(() => getInitialData('patients', SEED_PATIENTS));
  const [vitals, setVitals] = useState<VitalSign[]>(() => getInitialData('vitals', SEED_VITALS));
  const [beds, setBeds] = useState<Bed[]>(() => getInitialData('beds', SEED_BEDS));
  const [wards, setWards] = useState<Ward[]>(() => getInitialData('wards', SEED_WARDS));
  const [samples, setSamples] = useState<LabSample[]>(() => getInitialData('samples', SEED_SAMPLES));
  const [notes, setNotes] = useState<ClinicalNote[]>(() => getInitialData('notes', SEED_NOTES));
  const [medications, setMedications] = useState<MedicationOrder[]>(() => getInitialData('medications', SEED_MEDS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getInitialData('auditLogs', SEED_AUDITS));

  // Save changes to localStorage
  const saveState = (key: string, val: any) => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  };

  const addAuditLog = (action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      hospitalId: activeHospitalId,
      timestamp: new Date().toISOString(),
      actorName: currentStaffName,
      actorRole: currentRole,
      action,
      targetType,
      targetId,
      details
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      saveState('auditLogs', updated);
      return updated;
    });
  };

  // Hospital operations
  const registerHospital = (newHospital: Omit<Hospital, 'id' | 'createdAt' | 'activeAdmissions'>) => {
    const id = `hosp-${Date.now()}`;
    const fullHospital: Hospital = {
      ...newHospital,
      id,
      activeAdmissions: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [...hospitals, fullHospital];
    setHospitals(updated);
    saveState('hospitals', updated);
    setActiveHospitalId(id);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'activeHospitalId', id);
    addAuditLog('Hospital Account Registered', 'hospital', id, `Registered new hospital: ${fullHospital.name} (${fullHospital.code})`);
    return fullHospital;
  };

  const switchHospital = (hospitalId: string) => {
    setActiveHospitalId(hospitalId);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'activeHospitalId', hospitalId);
    addAuditLog('Hospital Context Switched', 'hospital', hospitalId, `Switched operational context to hospital ID ${hospitalId}`);
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'currentRole', role);
    const staffMatch = SEED_STAFF.find((s) => s.role === role);
    if (staffMatch) {
      setCurrentStaffName(staffMatch.name);
    }
    addAuditLog('User Role Switched', 'security', role, `Active session switched to role: ${role.toUpperCase()}`);
  };

  // Patient operations
  const registerPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'hospitalId' | 'mrn'>) => {
    const id = `pat-${Date.now()}`;
    const mrn = `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullPatient: Patient = {
      ...patientData,
      id,
      hospitalId: activeHospitalId,
      mrn,
      createdAt: new Date().toISOString()
    };

    const updatedPatients = [fullPatient, ...patients];
    setPatients(updatedPatients);
    saveState('patients', updatedPatients);

    // If bed is assigned, mark bed as occupied
    if (fullPatient.currentBedId) {
      setBeds((prev) => {
        const up = prev.map((b) =>
          b.id === fullPatient.currentBedId
            ? { ...b, status: 'occupied' as const, patientId: id, patientName: `${fullPatient.firstName} ${fullPatient.lastName}`, patientMrn: mrn, occupiedSince: new Date().toISOString() }
            : b
        );
        saveState('beds', up);
        return up;
      });
    }

    addAuditLog(
      'Patient Triage Registration',
      'patient',
      id,
      `New patient intake: ${fullPatient.firstName} ${fullPatient.lastName} (${mrn}) with chief complaint: ${fullPatient.chiefComplaint}`
    );

    return fullPatient;
  };

  const updatePatientStatus = (patientId: string, status: PatientStatus, details?: { dischargeDiagnosis?: string; dischargeSummary?: string }) => {
    setPatients((prev) => {
      const up = prev.map((p) => {
        if (p.id !== patientId) return p;
        const now = new Date().toISOString();
        const updated: Patient = {
          ...p,
          currentStatus: status,
          ...(status === 'discharged' ? {
            dischargedAt: now,
            dischargeClearedBy: currentStaffName,
            dischargeDiagnosis: details?.dischargeDiagnosis || p.dischargeDiagnosis || p.admissionDiagnosis,
            dischargeSummary: details?.dischargeSummary || p.dischargeSummary
          } : {})
        };

        // If discharged, clear bed
        if (status === 'discharged' && p.currentBedId) {
          setBeds((bedList) => {
            const freedBeds = bedList.map((b) =>
              b.id === p.currentBedId
                ? { ...b, status: 'cleaning' as const, patientId: undefined, patientName: undefined, patientMrn: undefined, occupiedSince: undefined }
                : b
            );
            saveState('beds', freedBeds);
            return freedBeds;
          });
        }

        return updated;
      });
      saveState('patients', up);
      return up;
    });

    addAuditLog(
      'Patient Status Updated',
      'patient',
      patientId,
      `Patient status transitioned to ${status.toUpperCase()}${details?.dischargeSummary ? ' with discharge clearance.' : '.'}`
    );
  };

  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    setPatients((prev) => {
      const up = prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          ...updates,
          id: p.id,
          mrn: p.mrn // preserve immutable identifiers
        };
      });
      saveState('patients', up);
      return up;
    });

    // Update bed patientName if patient name changed
    if (updates.firstName || updates.lastName) {
      setBeds((prev) => {
        const up = prev.map((b) =>
          b.patientId === patientId
            ? { ...b, patientName: `${updates.firstName || ''} ${updates.lastName || ''}`.trim() }
            : b
        );
        saveState('beds', up);
        return up;
      });
    }

    addAuditLog(
      'Patient Record Updated',
      'patient',
      patientId,
      `Clinical demographic and medical details updated by ${currentStaffName}`
    );
  };

  const deletePatient = (patientId: string, reason?: string) => {
    const target = patients.find((p) => p.id === patientId);
    if (!target) return;

    // Release any occupied bed
    if (target.currentBedId) {
      setBeds((prev) => {
        const up = prev.map((b) =>
          b.id === target.currentBedId
            ? { ...b, status: 'available' as const, patientId: undefined, patientName: undefined, patientMrn: undefined, occupiedSince: undefined }
            : b
        );
        saveState('beds', up);
        return up;
      });
    }

    const updatedPatients = patients.filter((p) => p.id !== patientId);
    setPatients(updatedPatients);
    saveState('patients', updatedPatients);

    addAuditLog(
      'Patient Record Deleted / Purged',
      'patient',
      patientId,
      `Patient ${target.firstName} ${target.lastName} (${target.mrn}) purged. Reason: ${reason || 'Administrative clearance'}`
    );
  };

  const updateClinicalNote = (noteId: string, updates: Partial<ClinicalNote>) => {
    setNotes((prev) => {
      const up = prev.map((n) => (n.id === noteId ? { ...n, ...updates } : n));
      saveState('notes', up);
      return up;
    });
    addAuditLog('Clinical Note Updated', 'patient', noteId, `Updated note "${updates.title || noteId}"`);
  };

  const deleteClinicalNote = (noteId: string) => {
    setNotes((prev) => {
      const up = prev.filter((n) => n.id !== noteId);
      saveState('notes', up);
      return up;
    });
    addAuditLog('Clinical Note Deleted', 'patient', noteId, `Deleted clinical note ID: ${noteId}`);
  };

  const updateMedication = (medId: string, updates: Partial<MedicationOrder>) => {
    setMedications((prev) => {
      const up = prev.map((m) => (m.id === medId ? { ...m, ...updates } : m));
      saveState('medications', up);
      return up;
    });
    addAuditLog('Medication Order Updated', 'patient', medId, `Updated prescription order ID: ${medId}`);
  };

  const deleteMedication = (medId: string) => {
    setMedications((prev) => {
      const up = prev.filter((m) => m.id !== medId);
      saveState('medications', up);
      return up;
    });
    addAuditLog('Medication Order Deleted', 'patient', medId, `Deleted prescription order ID: ${medId}`);
  };

  const deleteVital = (vitalId: string) => {
    setVitals((prev) => {
      const up = prev.filter((v) => v.id !== vitalId);
      saveState('vitals', up);
      return up;
    });
    addAuditLog('Vital Signs Record Deleted', 'vital', vitalId, `Removed erroneous vital entry ID: ${vitalId}`);
  };

  const deleteLabSample = (sampleId: string) => {
    setSamples((prev) => {
      const up = prev.filter((s) => s.id !== sampleId);
      saveState('samples', up);
      return up;
    });
    addAuditLog('Lab Sample Deleted', 'lab_sample', sampleId, `Deleted specimen entry ID: ${sampleId}`);
  };

  const addBed = (bedData: Omit<Bed, 'id' | 'hospitalId'>) => {
    const id = `bed-${Date.now()}`;
    const newBed: Bed = {
      ...bedData,
      id,
      hospitalId: activeHospitalId
    };
    const updatedBeds = [...beds, newBed];
    setBeds(updatedBeds);
    saveState('beds', updatedBeds);

    // Update ward totalBeds
    setWards((prev) => {
      const up = prev.map((w) =>
        w.id === bedData.wardId ? { ...w, totalBeds: w.totalBeds + 1 } : w
      );
      saveState('wards', up);
      return up;
    });

    addAuditLog('Inpatient Bed Added', 'bed', id, `Added bed ${bedData.bedNumber} to ward ${bedData.wardName}`);
    return newBed;
  };

  const updateBed = (bedId: string, updates: Partial<Bed>) => {
    setBeds((prev) => {
      const up = prev.map((b) => (b.id === bedId ? { ...b, ...updates } : b));
      saveState('beds', up);
      return up;
    });
    addAuditLog('Bed Details Updated', 'bed', bedId, `Updated bed configuration ${bedId}`);
  };

  const deleteBed = (bedId: string) => {
    const target = beds.find((b) => b.id === bedId);
    if (!target) return;
    if (target.status === 'occupied') {
      alert('Cannot delete an occupied bed. Please discharge or transfer the patient first.');
      return;
    }

    const updatedBeds = beds.filter((b) => b.id !== bedId);
    setBeds(updatedBeds);
    saveState('beds', updatedBeds);

    // Update ward totalBeds
    setWards((prev) => {
      const up = prev.map((w) =>
        w.id === target.wardId ? { ...w, totalBeds: Math.max(0, w.totalBeds - 1) } : w
      );
      saveState('wards', up);
      return up;
    });

    addAuditLog('Inpatient Bed Deleted', 'bed', bedId, `Deleted bed ${target.bedNumber} from ${target.wardName}`);
  };

  const addWard = (wardData: Omit<Ward, 'id' | 'hospitalId' | 'occupiedBeds'>) => {
    const id = `ward-${Date.now()}`;
    const newWard: Ward = {
      ...wardData,
      id,
      hospitalId: activeHospitalId,
      occupiedBeds: 0
    };
    const updated = [...wards, newWard];
    setWards(updated);
    saveState('wards', updated);
    addAuditLog('Hospital Ward Created', 'hospital', id, `Created ward ${newWard.name} (${newWard.code})`);
    return newWard;
  };

  const updateWard = (wardId: string, updates: Partial<Ward>) => {
    setWards((prev) => {
      const up = prev.map((w) => (w.id === wardId ? { ...w, ...updates } : w));
      saveState('wards', up);
      return up;
    });
    addAuditLog('Ward Config Updated', 'hospital', wardId, `Updated configuration for ward ${wardId}`);
  };

  const assignBedToPatient = (patientId: string, bedId: string) => {
    const targetBed = beds.find((b) => b.id === bedId);
    const targetPatient = patients.find((p) => p.id === patientId);
    if (!targetBed || !targetPatient) return;

    // Release old bed if any
    if (targetPatient.currentBedId && targetPatient.currentBedId !== bedId) {
      setBeds((prev) =>
        prev.map((b) =>
          b.id === targetPatient.currentBedId
            ? { ...b, status: 'cleaning', patientId: undefined, patientName: undefined, patientMrn: undefined }
            : b
        )
      );
    }

    // Allocate new bed
    setBeds((prev) => {
      const up = prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: 'occupied' as const,
              patientId,
              patientName: `${targetPatient.firstName} ${targetPatient.lastName}`,
              patientMrn: targetPatient.mrn,
              occupiedSince: new Date().toISOString()
            }
          : b
      );
      saveState('beds', up);
      return up;
    });

    // Update patient record
    setPatients((prev) => {
      const up = prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              currentBedId: bedId,
              currentBedNumber: targetBed.bedNumber,
              currentWardId: targetBed.wardId,
              currentWardName: targetBed.wardName,
              currentStatus: (targetBed.type === 'icu' ? 'icu' : 'in_monitoring') as PatientStatus
            }
          : p
      );
      saveState('patients', up);
      return up;
    });

    addAuditLog(
      'Bed Allocation & Transfer',
      'bed',
      bedId,
      `Allocated Bed ${targetBed.bedNumber} (${targetBed.wardName}) to patient ${targetPatient.firstName} ${targetPatient.lastName} (${targetPatient.mrn})`
    );
  };

  const recordVitals = (vitalData: Omit<VitalSign, 'id' | 'hospitalId' | 'recordedBy' | 'recordedByRole' | 'news2Score'>) => {
    // Calculate NEWS2 Score
    let news2 = 0;
    const { respiratoryRate, oxygenSaturation, bloodPressureSystolic, heartRate, temperature } = vitalData;

    // Resp rate
    if (respiratoryRate <= 8 || respiratoryRate >= 25) news2 += 3;
    else if (respiratoryRate >= 21) news2 += 2;
    else if (respiratoryRate >= 9 && respiratoryRate <= 11) news2 += 1;

    // SpO2
    if (oxygenSaturation <= 91) news2 += 3;
    else if (oxygenSaturation <= 93) news2 += 2;
    else if (oxygenSaturation <= 95) news2 += 1;

    // Systolic BP
    if (bloodPressureSystolic <= 90 || bloodPressureSystolic >= 220) news2 += 3;
    else if (bloodPressureSystolic <= 100) news2 += 2;
    else if (bloodPressureSystolic <= 110) news2 += 1;

    // Pulse
    if (heartRate <= 40 || heartRate >= 131) news2 += 3;
    else if (heartRate >= 111) news2 += 2;
    else if (heartRate <= 50 || heartRate >= 91) news2 += 1;

    // Temp
    if (temperature <= 35.0) news2 += 3;
    else if (temperature >= 39.1) news2 += 2;
    else if (temperature <= 36.0 || temperature >= 38.1) news2 += 1;

    const newVital: VitalSign = {
      ...vitalData,
      id: `vit-${Date.now()}`,
      hospitalId: activeHospitalId,
      recordedBy: currentStaffName,
      recordedByRole: currentRole,
      news2Score: news2
    };

    const updated = [newVital, ...vitals];
    setVitals(updated);
    saveState('vitals', updated);

    addAuditLog(
      'Vital Signs Recorded',
      'vital',
      vitalData.patientId,
      `Vitals logged: HR ${heartRate} bpm, BP ${bloodPressureSystolic}/${vitalData.bloodPressureDiastolic}, SpO2 ${oxygenSaturation}%, Temp ${temperature}°C. NEWS2 Score: ${news2}`
    );

    return newVital;
  };

  const addClinicalNote = (noteData: Omit<ClinicalNote, 'id' | 'hospitalId' | 'authorName' | 'authorRole'>) => {
    const newNote: ClinicalNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      hospitalId: activeHospitalId,
      authorName: currentStaffName,
      authorRole: currentRole
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveState('notes', updated);

    addAuditLog('Clinical Note Added', 'patient', noteData.patientId, `Added note "${newNote.title}" (${newNote.noteType})`);
    return newNote;
  };

  const addMedication = (medData: Omit<MedicationOrder, 'id' | 'hospitalId'>) => {
    const newMed: MedicationOrder = {
      ...medData,
      id: `med-${Date.now()}`,
      hospitalId: activeHospitalId
    };
    const updated = [newMed, ...medications];
    setMedications(updated);
    saveState('medications', updated);

    addAuditLog('Medication Prescribed', 'patient', medData.patientId, `Prescribed ${newMed.medicationName} (${newMed.dosage}) - Route: ${newMed.route}`);
    return newMed;
  };

  // Lab Sample Operations
  const accessionLabSample = (sampleData: Omit<LabSample, 'id' | 'sampleBarcode' | 'hospitalId' | 'status'>) => {
    const sampleBarcode = `LAB-2026-${sampleData.panelType}-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `samp-${Date.now()}`;

    // Perform initial analysis if raw values provided
    const analysis = runClientSideAnalysis({
      raw_results: sampleData.rawValues || {},
      patient_meta: {
        age: sampleData.patientAge,
        gender: sampleData.patientGender
      }
    });

    const newSample: LabSample = {
      ...sampleData,
      id,
      sampleBarcode,
      hospitalId: activeHospitalId,
      status: 'COLLECTED',
      analyzedItems: analysis.items,
      calculatedIndices: analysis.calculated_indices,
      criticalFlags: analysis.critical_flags,
      clinicalImpressions: analysis.clinical_impressions,
      overallUrgency: analysis.overall_urgency,
      engineUsed: analysis.engine
    };

    const updated = [newSample, ...samples];
    setSamples(updated);
    saveState('samples', updated);

    addAuditLog(
      'Laboratory Sample Accessioned',
      'lab_sample',
      id,
      `Accessioned specimen ${sampleBarcode} (${sampleData.specimenType} - ${sampleData.panelType}) for patient ${sampleData.patientName}`
    );

    return newSample;
  };

  const updateSampleAnalysis = async (
    sampleId: string,
    rawValues: Record<string, number>,
    newStatus: LabSample['status'] = 'ANALYSIS_COMPLETE',
    pathologistNotes?: string
  ) => {
    const existing = samples.find((s) => s.id === sampleId);
    if (!existing) return;

    let analysisResult;
    try {
      const response = await fetch('/api/lab/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_results: rawValues,
          patient_meta: {
            age: existing.patientAge,
            gender: existing.patientGender,
            mrn: existing.patientMrn
          }
        })
      });
      if (response.ok) {
        analysisResult = await response.json();
      } else {
        throw new Error('API failed');
      }
    } catch {
      // Fallback to client-side TS diagnostic kernel
      analysisResult = runClientSideAnalysis({
        raw_results: rawValues,
        patient_meta: {
          age: existing.patientAge,
          gender: existing.patientGender
        }
      });
    }

    const updatedSamples = samples.map((s) => {
      if (s.id !== sampleId) return s;
      const now = new Date().toISOString();
      return {
        ...s,
        rawValues,
        status: newStatus,
        processedAt: now,
        ...(newStatus === 'VERIFIED' ? { verifiedAt: now, verifiedBy: currentStaffName } : {}),
        analyzedItems: analysisResult.items,
        calculatedIndices: analysisResult.calculated_indices,
        criticalFlags: analysisResult.critical_flags,
        clinicalImpressions: analysisResult.clinical_impressions,
        overallUrgency: analysisResult.overall_urgency,
        pathologistNotes: pathologistNotes !== undefined ? pathologistNotes : s.pathologistNotes,
        engineUsed: analysisResult.engine
      };
    });

    setSamples(updatedSamples);
    saveState('samples', updatedSamples);

    addAuditLog(
      newStatus === 'VERIFIED' ? 'Lab Results Verified' : 'Lab Sample Processed',
      'lab_sample',
      sampleId,
      `Specimen ${existing.sampleBarcode} evaluated. Urgency: ${analysisResult.overall_urgency}. Critical flags: ${analysisResult.critical_flags.length}`
    );
  };

  const updateBedStatus = (bedId: string, status: Bed['status']) => {
    setBeds((prev) => {
      const up = prev.map((b) => (b.id === bedId ? { ...b, status } : b));
      saveState('beds', up);
      return up;
    });
    addAuditLog('Bed Status Changed', 'bed', bedId, `Updated bed ${bedId} status to ${status.toUpperCase()}`);
  };

  const resetAllDataToDefault = () => {
    localStorage.clear();
    setHospitals(SEED_HOSPITALS);
    setActiveHospitalId('hosp-st-jude');
    setCurrentRole('admin');
    setCurrentStaffName('Dr. Eleanor Vance, MD');
    setPatients(SEED_PATIENTS);
    setVitals(SEED_VITALS);
    setBeds(SEED_BEDS);
    setWards(SEED_WARDS);
    setSamples(SEED_SAMPLES);
    setNotes(SEED_NOTES);
    setMedications(SEED_MEDS);
    setAuditLogs(SEED_AUDITS);
  };

  const transferPatient = (
    patientId: string,
    targetHospitalId: string,
    reason: string,
    priority: TransferRecord['priority'],
    clinicalSummary: string
  ) => {
    const targetPatient = patients.find((p) => p.id === patientId);
    const sourceHospital = hospitals.find((h) => h.id === activeHospitalId);
    const targetHospital = hospitals.find((h) => h.id === targetHospitalId);
    if (!targetPatient || !sourceHospital || !targetHospital) return;

    const now = new Date().toISOString();
    const transferRecord: TransferRecord = {
      id: `trans-${Date.now()}`,
      patientId,
      fromHospitalId: sourceHospital.id,
      fromHospitalName: sourceHospital.name,
      toHospitalId: targetHospital.id,
      toHospitalName: targetHospital.name,
      transferredAt: now,
      transferredBy: currentStaffName,
      transferredByRole: currentRole,
      reason,
      priority,
      clinicalSummary,
      specialtyRequired: targetHospital.type,
      status: 'completed'
    };

    // Release bed in originating hospital
    if (targetPatient.currentBedId) {
      setBeds((prev) => {
        const up = prev.map((b) =>
          b.id === targetPatient.currentBedId
            ? { ...b, status: 'cleaning' as const, patientId: undefined, patientName: undefined, patientMrn: undefined, occupiedSince: undefined }
            : b
        );
        saveState('beds', up);
        return up;
      });
    }

    // Update patient record: now active in target hospital with full historic access
    setPatients((prev) => {
      const up = prev.map((p) => {
        if (p.id !== patientId) return p;
        const accessible = Array.from(new Set([...(p.accessibleHospitalIds || [sourceHospital.id]), sourceHospital.id, targetHospital.id]));
        const history = [...(p.transferHistory || []), transferRecord];
        return {
          ...p,
          hospitalId: targetHospital.id,
          transferredFromHospitalId: sourceHospital.id,
          transferredFromHospitalName: sourceHospital.name,
          transferHistory: history,
          accessibleHospitalIds: accessible,
          currentStatus: 'triage' as const,
          currentBedId: undefined,
          currentBedNumber: undefined,
          currentWardId: undefined,
          currentWardName: undefined
        };
      });
      saveState('patients', up);
      return up;
    });

    addAuditLog(
      'Inter-Hospital Patient Transfer Dispatched',
      'patient',
      patientId,
      `Transferred patient ${targetPatient.firstName} ${targetPatient.lastName} (${targetPatient.mrn}) to ${targetHospital.name}. Reason: ${reason}`
    );
  };

  const loginAsRole = (role: UserRole, staffName: string) => {
    setCurrentRole(role);
    setCurrentStaffName(staffName);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'currentRole', role);
    addAuditLog('Staff Authenticated', 'security', role, `Staff signed in as ${staffName} (${role.toUpperCase()})`);
  };

  const activeHospital = hospitals.find((h) => h.id === activeHospitalId) || hospitals[0];
  const hospitalPatients = patients.filter(
    (p) => p.hospitalId === activeHospitalId || p.accessibleHospitalIds?.includes(activeHospitalId)
  );
  const hospitalBeds = beds.filter((b) => b.hospitalId === activeHospitalId);
  const hospitalWards = wards.filter((w) => w.hospitalId === activeHospitalId);
  const hospitalPatientIds = new Set(hospitalPatients.map((p) => p.id));
  const hospitalSamples = samples.filter(
    (s) => s.hospitalId === activeHospitalId || hospitalPatientIds.has(s.patientId)
  );
  const hospitalAudits = auditLogs.filter(
    (a) => a.hospitalId === activeHospitalId || hospitalPatientIds.has(a.targetId)
  );

  return {
    isLoaded,
    hospitals,
    activeHospital,
    activeHospitalId,
    currentRole,
    currentStaffName,
    staffUsers: SEED_STAFF,
    patients: hospitalPatients,
    allPatients: patients,
    vitals,
    beds: hospitalBeds,
    wards: hospitalWards,
    samples: hospitalSamples,
    allSamples: samples,
    notes,
    medications,
    auditLogs: hospitalAudits,
    // Operations
    registerHospital,
    switchHospital,
    switchRole,
    loginAsRole,
    transferPatient,
    registerPatient,
    updatePatient,
    deletePatient,
    updatePatientStatus,
    assignBedToPatient,
    recordVitals,
    deleteVital,
    addClinicalNote,
    updateClinicalNote,
    deleteClinicalNote,
    addMedication,
    updateMedication,
    deleteMedication,
    accessionLabSample,
    updateSampleAnalysis,
    deleteLabSample,
    addBed,
    updateBed,
    deleteBed,
    addWard,
    updateWard,
    updateBedStatus,
    addAuditLog,
    resetAllDataToDefault
  };
}
