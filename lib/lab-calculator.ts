import { AnalyzedBiomarker, CalculatedIndex } from './types';

export interface LabAnalysisRequest {
  raw_results: Record<string, number>;
  patient_meta: {
    age: number;
    gender: string;
    mrn?: string;
  };
}

export interface LabAnalysisResponse {
  success: boolean;
  items: Record<string, AnalyzedBiomarker>;
  calculated_indices: Record<string, CalculatedIndex>;
  critical_flags: string[];
  clinical_impressions: string[];
  abnormal_count: number;
  total_analyzed: number;
  overall_urgency: 'ROUTINE' | 'ABNORMAL' | 'CRITICAL_PANIC';
  engine: string;
  error?: string;
}

// Reference values for clinical testing
export const CLINICAL_REFERENCE_RANGES: Record<
  string,
  { min: number; max: number; unit: string; critical_low: number; critical_high: number; name: string }
> = {
  wbc: { min: 4.0, max: 11.0, unit: "10^3/µL", critical_low: 2.0, critical_high: 30.0, name: "White Blood Cells" },
  rbc: { min: 4.2, max: 5.9, unit: "10^6/µL", critical_low: 2.0, critical_high: 6.8, name: "Red Blood Cells" },
  hemoglobin: { min: 12.0, max: 17.5, unit: "g/dL", critical_low: 7.0, critical_high: 20.0, name: "Hemoglobin" },
  hematocrit: { min: 36.0, max: 50.0, unit: "%", critical_low: 21.0, critical_high: 60.0, name: "Hematocrit" },
  platelets: { min: 150.0, max: 450.0, unit: "10^3/µL", critical_low: 50.0, critical_high: 1000.0, name: "Platelet Count" },
  neutrophils: { min: 40.0, max: 75.0, unit: "%", critical_low: 15.0, critical_high: 90.0, name: "Neutrophils %" },
  lymphocytes: { min: 20.0, max: 45.0, unit: "%", critical_low: 5.0, critical_high: 65.0, name: "Lymphocytes %" },
  glucose: { min: 70.0, max: 99.0, unit: "mg/dL", critical_low: 45.0, critical_high: 400.0, name: "Fasting Glucose" },
  sodium: { min: 135.0, max: 145.0, unit: "mEq/L", critical_low: 120.0, critical_high: 160.0, name: "Sodium (Na+)" },
  potassium: { min: 3.5, max: 5.1, unit: "mEq/L", critical_low: 2.8, critical_high: 6.2, name: "Potassium (K+)" },
  chloride: { min: 96.0, max: 106.0, unit: "mEq/L", critical_low: 80.0, critical_high: 120.0, name: "Chloride (Cl-)" },
  co2: { min: 22.0, max: 29.0, unit: "mEq/L", critical_low: 10.0, critical_high: 40.0, name: "Bicarbonate / CO2" },
  bun: { min: 7.0, max: 20.0, unit: "mg/dL", critical_low: 3.0, critical_high: 80.0, name: "Blood Urea Nitrogen (BUN)" },
  creatinine: { min: 0.6, max: 1.3, unit: "mg/dL", critical_low: 0.3, critical_high: 4.0, name: "Serum Creatinine" },
  calcium: { min: 8.5, max: 10.5, unit: "mg/dL", critical_low: 6.5, critical_high: 13.0, name: "Total Calcium" },
  albumin: { min: 3.5, max: 5.0, unit: "g/dL", critical_low: 1.5, critical_high: 6.0, name: "Albumin" },
  total_protein: { min: 6.0, max: 8.3, unit: "g/dL", critical_low: 4.0, critical_high: 10.0, name: "Total Protein" },
  alt: { min: 7.0, max: 56.0, unit: "U/L", critical_low: 0.0, critical_high: 500.0, name: "Alanine Aminotransferase (ALT)" },
  ast: { min: 10.0, max: 40.0, unit: "U/L", critical_low: 0.0, critical_high: 500.0, name: "Aspartate Aminotransferase (AST)" },
  bilirubin: { min: 0.2, max: 1.2, unit: "mg/dL", critical_low: 0.0, critical_high: 15.0, name: "Total Bilirubin" },
  troponin: { min: 0.0, max: 0.04, unit: "ng/mL", critical_low: 0.0, critical_high: 0.4, name: "Troponin I" },
  bnp: { min: 0.0, max: 100.0, unit: "pg/mL", critical_low: 0.0, critical_high: 900.0, name: "B-Type Natriuretic Peptide" },
  total_cholesterol: { min: 100.0, max: 199.0, unit: "mg/dL", critical_low: 50.0, critical_high: 350.0, name: "Total Cholesterol" },
  hdl: { min: 40.0, max: 60.0, unit: "mg/dL", critical_low: 20.0, critical_high: 100.0, name: "HDL Cholesterol" },
  ldl: { min: 50.0, max: 99.0, unit: "mg/dL", critical_low: 20.0, critical_high: 190.0, name: "LDL Cholesterol" },
  triglycerides: { min: 35.0, max: 150.0, unit: "mg/dL", critical_low: 10.0, critical_high: 500.0, name: "Triglycerides" },
  ph: { min: 7.35, max: 7.45, unit: "", critical_low: 7.15, critical_high: 7.60, name: "Arterial pH" },
  pco2: { min: 35.0, max: 45.0, unit: "mmHg", critical_low: 20.0, critical_high: 70.0, name: "Partial Pressure CO2 (pCO2)" },
  po2: { min: 80.0, max: 100.0, unit: "mmHg", critical_low: 50.0, critical_high: 300.0, name: "Partial Pressure O2 (pO2)" },
  hco3: { min: 22.0, max: 26.0, unit: "mEq/L", critical_low: 12.0, critical_high: 40.0, name: "Serum Bicarbonate (HCO3)" },
  base_excess: { min: -2.0, max: 2.0, unit: "mEq/L", critical_low: -10.0, critical_high: 10.0, name: "Base Excess" },
  lactate: { min: 0.5, max: 2.0, unit: "mmol/L", critical_low: 0.0, critical_high: 4.0, name: "Serum Lactate" }
};

export function runClientSideAnalysis(req: LabAnalysisRequest): LabAnalysisResponse {
  const { raw_results, patient_meta } = req;
  const analyzedItems: Record<string, AnalyzedBiomarker> = {};
  const calculatedIndices: Record<string, CalculatedIndex> = {};
  const criticalFlags: string[] = [];
  const clinicalImpressions: string[] = [];
  let abnormalCount = 0;

  const age = patient_meta.age || 50;
  const isFemale = (patient_meta.gender || '').toLowerCase() === 'female';

  for (const [key, rawVal] of Object.entries(raw_results)) {
    if (rawVal === undefined || rawVal === null || isNaN(Number(rawVal))) continue;
    const val = Number(rawVal);
    const ref = CLINICAL_REFERENCE_RANGES[key];
    if (!ref) {
      analyzedItems[key] = {
        name: key.toUpperCase(),
        value: val,
        unit: '',
        min: 0,
        max: 100,
        status: 'NORMAL',
        reference_range: 'N/A'
      };
      continue;
    }

    let status: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH' = 'NORMAL';
    if (val <= ref.critical_low) {
      status = 'CRITICAL_LOW';
      criticalFlags.push(`PANIC CRITICAL LOW: ${ref.name} is ${val} ${ref.unit} (< ${ref.critical_low})`);
      abnormalCount++;
    } else if (val >= ref.critical_high) {
      status = 'CRITICAL_HIGH';
      criticalFlags.push(`PANIC CRITICAL HIGH: ${ref.name} is ${val} ${ref.unit} (> ${ref.critical_high})`);
      abnormalCount++;
    } else if (val < ref.min) {
      status = 'LOW';
      abnormalCount++;
    } else if (val > ref.max) {
      status = 'HIGH';
      abnormalCount++;
    }

    analyzedItems[key] = {
      name: ref.name,
      value: Number(val.toFixed(2)),
      unit: ref.unit,
      min: ref.min,
      max: ref.max,
      status,
      reference_range: `${ref.min} - ${ref.max} ${ref.unit}`
    };
  }

  // Anion Gap
  if (raw_results.sodium !== undefined && raw_results.chloride !== undefined) {
    const na = Number(raw_results.sodium);
    const cl = Number(raw_results.chloride);
    const hco3 = Number(raw_results.co2 || raw_results.hco3 || 24);
    const ag = Number((na - (cl + hco3)).toFixed(1));
    const agStatus = ag > 16 ? 'HIGH' : ag < 8 ? 'LOW' : 'NORMAL';
    calculatedIndices.anion_gap = {
      name: 'Anion Gap',
      value: ag,
      unit: 'mEq/L',
      reference: '8 - 16 mEq/L',
      status: agStatus
    };
    if (ag > 16) {
      clinicalImpressions.push(`High Anion Gap (${ag} mEq/L) - Differential includes lactic acidosis, ketoacidosis, or renal impairment.`);
    }
  }

  // eGFR (CKD-EPI 2021)
  if (raw_results.creatinine !== undefined && Number(raw_results.creatinine) > 0) {
    const cr = Number(raw_results.creatinine);
    const kappa = isFemale ? 0.7 : 0.9;
    const alpha = isFemale ? -0.241 : -0.302;
    const genderMult = isFemale ? 1.012 : 1.0;
    const scrRatio = cr / kappa;
    const minPart = Math.pow(Math.min(scrRatio, 1.0), alpha);
    const maxPart = Math.pow(Math.max(scrRatio, 1.0), -1.2);
    const agePart = Math.pow(0.9938, age);
    const egfr = Number((142 * minPart * maxPart * agePart * genderMult).toFixed(1));

    let egfrStatus: 'NORMAL' | 'LOW' | 'CRITICAL_LOW' = 'NORMAL';
    if (egfr < 15) {
      egfrStatus = 'CRITICAL_LOW';
      criticalFlags.push(`End-Stage Renal Impairment / Stage 5 CKD: eGFR is ${egfr} mL/min/1.73m²`);
    } else if (egfr < 60) {
      egfrStatus = 'LOW';
    }

    calculatedIndices.egfr = {
      name: 'Estimated GFR (CKD-EPI 2021)',
      value: egfr,
      unit: 'mL/min/1.73m²',
      reference: '> 60 mL/min/1.73m²',
      status: egfrStatus
    };
    if (egfr < 60) {
      clinicalImpressions.push(`Reduced renal filtration (eGFR ${egfr} mL/min/1.73m²). Adjust nephrotoxic medication dosing.`);
    }
  }

  // BUN / Creatinine Ratio
  if (raw_results.bun !== undefined && raw_results.creatinine !== undefined && Number(raw_results.creatinine) > 0) {
    const bun = Number(raw_results.bun);
    const cr = Number(raw_results.creatinine);
    const ratio = Number((bun / cr).toFixed(1));
    calculatedIndices.bun_creatinine_ratio = {
      name: 'BUN / Creatinine Ratio',
      value: ratio,
      unit: 'ratio',
      reference: '10 - 20',
      status: ratio > 20 ? 'HIGH' : ratio < 10 ? 'LOW' : 'NORMAL'
    };
    if (ratio > 20) {
      clinicalImpressions.push('Elevated BUN/Creatinine ratio (>20) - consistent with prerenal volume contraction.');
    }
  }

  // Osmolality Estimate
  if (raw_results.sodium !== undefined && raw_results.glucose !== undefined && raw_results.bun !== undefined) {
    const na = Number(raw_results.sodium);
    const glu = Number(raw_results.glucose);
    const bun = Number(raw_results.bun);
    const osm = Number(((2 * na) + (glu / 18) + (bun / 2.8)).toFixed(1));
    calculatedIndices.serum_osmolality = {
      name: 'Calculated Serum Osmolality',
      value: osm,
      unit: 'mOsm/kg',
      reference: '275 - 295 mOsm/kg',
      status: osm > 295 ? 'HIGH' : osm < 275 ? 'LOW' : 'NORMAL'
    };
  }

  // Troponin Alert
  if (raw_results.troponin !== undefined && Number(raw_results.troponin) > 0.04) {
    clinicalImpressions.push(`ELEVATED TROPONIN I (${raw_results.troponin} ng/mL) - Critical cardiac biomarker. STAT 12-lead ECG and Cardiology consult.`);
  }

  // Hemoglobin alert
  if (raw_results.hemoglobin !== undefined && Number(raw_results.hemoglobin) < 8.0) {
    clinicalImpressions.push(`Severe Anemia (Hb ${raw_results.hemoglobin} g/dL). Crossmatch packed red blood cells.`);
  }

  const overallUrgency = criticalFlags.length > 0 ? 'CRITICAL_PANIC' : abnormalCount > 0 ? 'ABNORMAL' : 'ROUTINE';

  return {
    success: true,
    items: analyzedItems,
    calculated_indices: calculatedIndices,
    critical_flags: criticalFlags,
    clinical_impressions: clinicalImpressions,
    abnormal_count: abnormalCount,
    total_analyzed: Object.keys(analyzedItems).length,
    overall_urgency: overallUrgency,
    engine: 'HOSCARE Diagnostic Kernel (Embedded Clinical Engine)'
  };
}
