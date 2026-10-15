export type UserRole = 'admin' | 'doctor' | 'nurse' | 'lab_tech' | 'receptionist';

export type PrivilegeAction =
  | 'admit_patient'
  | 'edit_patient'
  | 'delete_records'
  | 'record_vitals'
  | 'write_doctor_note'
  | 'write_nurse_note'
  | 'prescribe_med'
  | 'order_lab'
  | 'verify_lab'
  | 'transfer_patient'
  | 'discharge_patient'
  | 'manage_hospital'
  | 'view_audit_logs';

export interface TransferRecord {
  id: string;
  patientId: string;
  fromHospitalId: string;
  fromHospitalName: string;
  toHospitalId: string;
  toHospitalName: string;
  transferredAt: string;
  transferredBy: string;
  transferredByRole: UserRole;
  reason: string;
  priority: 'EMERGENT_STAT' | 'URGENT' | 'ROUTINE';
  clinicalSummary: string;
  specialtyRequired: string;
  status: 'completed' | 'in_transit';
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  type: 'Tertiary Medical Center' | 'General Hospital' | 'Specialty Care' | 'Community Clinic';
  licenseNumber: string;
  address: string;
  phone: string;
  emergencyHotline: string;
  email: string;
  bedCapacity: number;
  activeAdmissions: number;
  logoInitial: string;
  createdAt: string;
}

export interface StaffUser {
  id: string;
  hospitalId: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  email: string;
  badgeId: string;
  pinCode?: string;
}

export type PatientStatus =
  | 'triage'
  | 'admitted'
  | 'in_monitoring'
  | 'icu'
  | 'discharge_pending'
  | 'discharged';

export type TriageScore =
  | 'ESI-1_IMMEDIATE'
  | 'ESI-2_EMERGENT'
  | 'ESI-3_URGENT'
  | 'ESI-4_LESS_URGENT'
  | 'ESI-5_NON_URGENT';

export interface Patient {
  id: string;
  hospitalId: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email?: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelation: string;
  allergies: string[];
  chronicConditions: string[];
  currentStatus: PatientStatus;
  currentWardId?: string;
  currentWardName?: string;
  currentBedId?: string;
  currentBedNumber?: string;
  attendingDoctorName?: string;
  triageScore: TriageScore;
  chiefComplaint: string;
  admissionDiagnosis?: string;
  dischargeDiagnosis?: string;
  dischargeSummary?: string;
  dischargeClearedBy?: string;
  triageEntryAt: string;
  admittedAt?: string;
  dischargedAt?: string;
  transferredFromHospitalId?: string;
  transferredFromHospitalName?: string;
  transferHistory?: TransferRecord[];
  accessibleHospitalIds?: string[];
  createdAt: string;
}

export interface VitalSign {
  id: string;
  patientId: string;
  hospitalId: string;
  recordedAt: string;
  recordedBy: string;
  recordedByRole: UserRole;
  heartRate: number; // bpm
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  respiratoryRate: number; // /min
  oxygenSaturation: number; // %
  temperature: number; // °C
  painScore: number; // 0-10
  consciousness: 'ALERT' | 'VOICE_RESPONSIVE' | 'PAIN_RESPONSIVE' | 'UNRESPONSIVE';
  news2Score: number;
  notes?: string;
}

export type BedStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';
export type BedType = 'standard' | 'icu' | 'isolation' | 'emergency_bay' | 'pediatric' | 'cardiac';

export interface Bed {
  id: string;
  hospitalId: string;
  wardId: string;
  wardName: string;
  bedNumber: string;
  type: BedType;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  patientMrn?: string;
  occupiedSince?: string;
}

export interface Ward {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  floor: string;
  specialty: string;
  totalBeds: number;
  occupiedBeds: number;
}

export type SpecimenType =
  | 'Whole Blood'
  | 'Serum'
  | 'Plasma'
  | 'Urine'
  | 'CSF'
  | 'Arterial Blood'
  | 'Sputum'
  | 'Swab'
  | 'Tissue Biopsy';

export type SampleStatus =
  | 'COLLECTED'
  | 'RECEIVED'
  | 'IN_ANALYSIS'
  | 'ANALYSIS_COMPLETE'
  | 'VERIFIED';

export type LabPriority = 'ROUTINE' | 'URGENT' | 'STAT_CRITICAL';

export type PanelType =
  | 'CBC'
  | 'CMP'
  | 'LIPID'
  | 'CARDIAC'
  | 'ABG'
  | 'URINALYSIS'
  | 'COMPREHENSIVE';

export interface AnalyzedBiomarker {
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  status: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH';
  reference_range: string;
}

export interface CalculatedIndex {
  name: string;
  value: number;
  unit: string;
  reference: string;
  status: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH';
}

export interface LabSample {
  id: string;
  hospitalId: string;
  sampleBarcode: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientAge: number;
  patientGender: string;
  specimenType: SpecimenType;
  tubeColor: string;
  panelType: PanelType;
  collectionSite: string;
  collectedAt: string;
  collectedBy: string;
  receivedAtLab?: string;
  processedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  status: SampleStatus;
  priority: LabPriority;
  rawValues: Record<string, number>;
  analyzedItems?: Record<string, AnalyzedBiomarker>;
  calculatedIndices?: Record<string, CalculatedIndex>;
  criticalFlags?: string[];
  clinicalImpressions?: string[];
  overallUrgency?: 'ROUTINE' | 'ABNORMAL' | 'CRITICAL_PANIC';
  pathologistNotes?: string;
  engineUsed?: string;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  hospitalId: string;
  recordedAt: string;
  authorName: string;
  authorRole: UserRole;
  noteType: 'triage_intake' | 'physician_round' | 'nursing_assessment' | 'discharge_summary' | 'urgent_consult';
  title: string;
  content: string;
}

export interface MedicationOrder {
  id: string;
  patientId: string;
  hospitalId: string;
  medicationName: string;
  dosage: string;
  route: 'Oral' | 'IV Push' | 'IV Infusion' | 'Subcutaneous' | 'Inhaled' | 'Topical';
  frequency: string;
  prescribedBy: string;
  startDate: string;
  status: 'active' | 'completed' | 'discontinued';
  lastAdministeredAt?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  hospitalId: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'patient' | 'lab_sample' | 'bed' | 'hospital' | 'security' | 'vital';
  targetId: string;
  details: string;
}
