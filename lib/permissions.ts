import { UserRole, PrivilegeAction } from './types';

export const ROLE_PRIVILEGES: Record<UserRole, PrivilegeAction[]> = {
  admin: [
    'admit_patient',
    'edit_patient',
    'delete_records',
    'record_vitals',
    'write_doctor_note',
    'write_nurse_note',
    'prescribe_med',
    'order_lab',
    'verify_lab',
    'transfer_patient',
    'discharge_patient',
    'manage_hospital',
    'view_audit_logs'
  ],
  doctor: [
    'admit_patient',
    'edit_patient',
    'record_vitals',
    'write_doctor_note',
    'write_nurse_note',
    'prescribe_med',
    'order_lab',
    'transfer_patient',
    'discharge_patient',
    'view_audit_logs'
  ],
  nurse: [
    'admit_patient',
    'edit_patient',
    'record_vitals',
    'write_nurse_note',
    'order_lab',
    'transfer_patient',
    'view_audit_logs'
  ],
  lab_tech: [
    'order_lab',
    'verify_lab',
    'view_audit_logs'
  ],
  receptionist: [
    'admit_patient',
    'edit_patient',
    'view_audit_logs'
  ]
};

export const PRIVILEGE_LABELS: Record<PrivilegeAction, { label: string; minRole: string; description: string }> = {
  admit_patient: {
    label: 'Patient Intake & Triage',
    minRole: 'Receptionist / Nurse',
    description: 'Register and admit emergency or scheduled patients'
  },
  edit_patient: {
    label: 'Edit Medical Records',
    minRole: 'Receptionist / Nurse / Doctor',
    description: 'Update demographics, allergies, conditions, and contacts'
  },
  delete_records: {
    label: 'Delete / Purge Clinical Records',
    minRole: 'Hospital Administrator (CMO)',
    description: 'Delete erroneous patient, bed, or medication records'
  },
  record_vitals: {
    label: 'Record Vital Signs',
    minRole: 'Nurse / Doctor',
    description: 'Log bedside telemetry and physiological parameters'
  },
  write_doctor_note: {
    label: 'Physician Round Notes',
    minRole: 'Attending Physician',
    description: 'Author medical round assessments and treatment plans'
  },
  write_nurse_note: {
    label: 'Nursing Assessments',
    minRole: 'Staff Nurse',
    description: 'Log nursing care plans and bedside observations'
  },
  prescribe_med: {
    label: 'Prescribe Inpatient Medications',
    minRole: 'Attending Physician',
    description: 'Author pharmacological orders and IV infusions'
  },
  order_lab: {
    label: 'Accession & Order Lab Tests',
    minRole: 'Nurse / Doctor / Lab',
    description: 'Order blood, urine, or tissue diagnostic assays'
  },
  verify_lab: {
    label: 'Verify Diagnostic Lab Results',
    minRole: 'Pathologist / Lab Director',
    description: 'Digitally verify laboratory results and panic findings'
  },
  transfer_patient: {
    label: 'Authorize Inter-Hospital Transfer',
    minRole: 'Nurse / Doctor / Admin',
    description: 'Transfer patient and medical record to external hospital facility'
  },
  discharge_patient: {
    label: 'Authorize Clinical Discharge',
    minRole: 'Attending Physician / CMO',
    description: 'Sign off discharge checklist and release bed'
  },
  manage_hospital: {
    label: 'Manage Hospital Accounts & Settings',
    minRole: 'Hospital Administrator',
    description: 'Register facilities, edit capacities, configure wards'
  },
  view_audit_logs: {
    label: 'Access Clinical Audit Records',
    minRole: 'All Clinical Staff',
    description: 'View immutable chronological activity logs'
  }
};

export function hasPrivilege(role: UserRole, action: PrivilegeAction): boolean {
  const allowed = ROLE_PRIVILEGES[role];
  return allowed ? allowed.includes(action) : false;
}

export function getRoleBadgeInfo(role: UserRole) {
  switch (role) {
    case 'admin':
      return { label: 'Hospital Admin (CMO)', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    case 'doctor':
      return { label: 'Attending Physician', color: 'text-blue-800 bg-blue-50 border-blue-200' };
    case 'nurse':
      return { label: 'Charge Nurse', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    case 'lab_tech':
      return { label: 'Clinical Pathologist', color: 'text-purple-800 bg-purple-50 border-purple-200' };
    case 'receptionist':
      return { label: 'Admissions Officer', color: 'text-slate-800 bg-slate-100 border-slate-200' };
  }
}
