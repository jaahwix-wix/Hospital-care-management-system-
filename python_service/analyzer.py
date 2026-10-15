#!/usr/bin/env python3
"""
HOSCARE Laboratory Analytical Engine
Performs advanced clinical chemistry, hematology calculations, reference range evaluation,
anion gap, eGFR (CKD-EPI 2021), osmolality estimation, delta checks, and clinical risk flagging.
"""

import sys
import json
import math
from typing import Dict, Any, List

# Standard Clinical Reference Ranges and Panic (Critical) Thresholds
REFERENCE_RANGES = {
    # Complete Blood Count (CBC)
    "wbc": {"min": 4.0, "max": 11.0, "unit": "10^3/µL", "critical_low": 2.0, "critical_high": 30.0, "name": "White Blood Cells"},
    "rbc": {"min": 4.2, "max": 5.9, "unit": "10^6/µL", "critical_low": 2.0, "critical_high": 6.8, "name": "Red Blood Cells"},
    "hemoglobin": {"min": 12.0, "max": 17.5, "unit": "g/dL", "critical_low": 7.0, "critical_high": 20.0, "name": "Hemoglobin"},
    "hematocrit": {"min": 36.0, "max": 50.0, "unit": "%", "critical_low": 21.0, "critical_high": 60.0, "name": "Hematocrit"},
    "platelets": {"min": 150.0, "max": 450.0, "unit": "10^3/µL", "critical_low": 50.0, "critical_high": 1000.0, "name": "Platelet Count"},
    "neutrophils": {"min": 40.0, "max": 75.0, "unit": "%", "critical_low": 15.0, "critical_high": 90.0, "name": "Neutrophils %"},
    "lymphocytes": {"min": 20.0, "max": 45.0, "unit": "%", "critical_low": 5.0, "critical_high": 65.0, "name": "Lymphocytes %"},
    
    # Comprehensive Metabolic Panel (CMP)
    "glucose": {"min": 70.0, "max": 99.0, "unit": "mg/dL", "critical_low": 45.0, "critical_high": 400.0, "name": "Fasting Glucose"},
    "sodium": {"min": 135.0, "max": 145.0, "unit": "mEq/L", "critical_low": 120.0, "critical_high": 160.0, "name": "Sodium (Na+)"},
    "potassium": {"min": 3.5, "max": 5.1, "unit": "mEq/L", "critical_low": 2.8, "critical_high": 6.2, "name": "Potassium (K+)"},
    "chloride": {"min": 96.0, "max": 106.0, "unit": "mEq/L", "critical_low": 80.0, "critical_high": 120.0, "name": "Chloride (Cl-)"},
    "co2": {"min": 22.0, "max": 29.0, "unit": "mEq/L", "critical_low": 10.0, "critical_high": 40.0, "name": "Bicarbonate / CO2"},
    "bun": {"min": 7.0, "max": 20.0, "unit": "mg/dL", "critical_low": 3.0, "critical_high": 80.0, "name": "Blood Urea Nitrogen (BUN)"},
    "creatinine": {"min": 0.6, "max": 1.3, "unit": "mg/dL", "critical_low": 0.3, "critical_high": 4.0, "name": "Serum Creatinine"},
    "calcium": {"min": 8.5, "max": 10.5, "unit": "mg/dL", "critical_low": 6.5, "critical_high": 13.0, "name": "Total Calcium"},
    "albumin": {"min": 3.5, "max": 5.0, "unit": "g/dL", "critical_low": 1.5, "critical_high": 6.0, "name": "Albumin"},
    "total_protein": {"min": 6.0, "max": 8.3, "unit": "g/dL", "critical_low": 4.0, "critical_high": 10.0, "name": "Total Protein"},
    "alt": {"min": 7.0, "max": 56.0, "unit": "U/L", "critical_low": 0.0, "critical_high": 500.0, "name": "Alanine Aminotransferase (ALT)"},
    "ast": {"min": 10.0, "max": 40.0, "unit": "U/L", "critical_low": 0.0, "critical_high": 500.0, "name": "Aspartate Aminotransferase (AST)"},
    "bilirubin": {"min": 0.2, "max": 1.2, "unit": "mg/dL", "critical_low": 0.0, "critical_high": 15.0, "name": "Total Bilirubin"},

    # Cardiac & Lipid Markers
    "troponin": {"min": 0.0, "max": 0.04, "unit": "ng/mL", "critical_low": 0.0, "critical_high": 0.4, "name": "Troponin I"},
    "bnp": {"min": 0.0, "max": 100.0, "unit": "pg/mL", "critical_low": 0.0, "critical_high": 900.0, "name": "B-Type Natriuretic Peptide"},
    "total_cholesterol": {"min": 100.0, "max": 199.0, "unit": "mg/dL", "critical_low": 50.0, "critical_high": 350.0, "name": "Total Cholesterol"},
    "hdl": {"min": 40.0, "max": 60.0, "unit": "mg/dL", "critical_low": 20.0, "critical_high": 100.0, "name": "HDL Cholesterol"},
    "ldl": {"min": 50.0, "max": 99.0, "unit": "mg/dL", "critical_low": 20.0, "critical_high": 190.0, "name": "LDL Cholesterol"},
    "triglycerides": {"min": 35.0, "max": 150.0, "unit": "mg/dL", "critical_low": 10.0, "critical_high": 500.0, "name": "Triglycerides"},

    # Arterial Blood Gas (ABG)
    "ph": {"min": 7.35, "max": 7.45, "unit": "", "critical_low": 7.15, "critical_high": 7.60, "name": "Arterial pH"},
    "pco2": {"min": 35.0, "max": 45.0, "unit": "mmHg", "critical_low": 20.0, "critical_high": 70.0, "name": "Partial Pressure CO2 (pCO2)"},
    "po2": {"min": 80.0, "max": 100.0, "unit": "mmHg", "critical_low": 50.0, "critical_high": 300.0, "name": "Partial Pressure O2 (pO2)"},
    "hco3": {"min": 22.0, "max": 26.0, "unit": "mEq/L", "critical_low": 12.0, "critical_high": 40.0, "name": "Serum Bicarbonate (HCO3)"},
    "base_excess": {"min": -2.0, "max": 2.0, "unit": "mEq/L", "critical_low": -10.0, "critical_high": 10.0, "name": "Base Excess"},
    "lactate": {"min": 0.5, "max": 2.0, "unit": "mmol/L", "critical_low": 0.0, "critical_high": 4.0, "name": "Serum Lactate"}
}

def calculate_egfr(creatinine: float, age: int = 55, is_female: bool = False) -> float:
    """Calculates eGFR using CKD-EPI 2021 formula."""
    if creatinine <= 0:
        return 0.0
    kappa = 0.7 if is_female else 0.9
    alpha = -0.241 if is_female else -0.302
    gender_mult = 1.012 if is_female else 1.0
    
    scr_ratio = creatinine / kappa
    min_part = min(scr_ratio, 1.0) ** alpha
    max_part = max(scr_ratio, 1.0) ** (-1.200)
    age_part = 0.9938 ** age
    
    egfr = 142 * min_part * max_part * age_part * gender_mult
    return round(egfr, 1)

def evaluate_parameters(raw_results: Dict[str, float], patient_meta: Dict[str, Any]) -> Dict[str, Any]:
    analyzed_items = {}
    critical_flags = []
    abnormal_count = 0
    calculated_indices = {}
    clinical_impressions = []

    age = int(patient_meta.get("age", 50))
    gender = str(patient_meta.get("gender", "male")).lower()
    is_female = (gender == "female")

    for key, value in raw_results.items():
        if value is None:
            continue
        try:
            val_float = float(value)
        except (ValueError, TypeError):
            continue

        ref = REFERENCE_RANGES.get(key)
        if not ref:
            analyzed_items[key] = {
                "name": key.capitalize(),
                "value": val_float,
                "unit": "",
                "status": "NORMAL",
                "reference_range": "N/A"
            }
            continue

        min_val = ref["min"]
        max_val = ref["max"]
        crit_low = ref["critical_low"]
        crit_high = ref["critical_high"]

        status = "NORMAL"
        if val_float <= crit_low:
            status = "CRITICAL_LOW"
            critical_flags.append(f"PANIC CRITICAL LOW: {ref['name']} is {val_float} {ref['unit']} (Panic threshold < {crit_low})")
            abnormal_count += 1
        elif val_float >= crit_high:
            status = "CRITICAL_HIGH"
            critical_flags.append(f"PANIC CRITICAL HIGH: {ref['name']} is {val_float} {ref['unit']} (Panic threshold > {crit_high})")
            abnormal_count += 1
        elif val_float < min_val:
            status = "LOW"
            abnormal_count += 1
        elif val_float > max_val:
            status = "HIGH"
            abnormal_count += 1

        analyzed_items[key] = {
            "name": ref["name"],
            "value": round(val_float, 2),
            "unit": ref["unit"],
            "min": min_val,
            "max": max_val,
            "status": status,
            "reference_range": f"{min_val} - {max_val} {ref['unit']}"
        }

    # Advanced Biochemical Indices Calculations
    # 1. Anion Gap = Na - (Cl + HCO3)
    if "sodium" in raw_results and "chloride" in raw_results:
        na = float(raw_results["sodium"])
        cl = float(raw_results["chloride"])
        hco3 = float(raw_results.get("co2") or raw_results.get("hco3", 24.0))
        ag = na - (cl + hco3)
        calculated_indices["anion_gap"] = {
            "name": "Anion Gap",
            "value": round(ag, 1),
            "unit": "mEq/L",
            "reference": "8 - 16 mEq/L",
            "status": "HIGH" if ag > 16 else ("LOW" if ag < 8 else "NORMAL")
        }
        if ag > 16:
            clinical_impressions.append(f"High Anion Gap ({ag:.1f} mEq/L) - Differential includes lactic acidosis, ketoacidosis, or renal impairment.")

    # 2. eGFR from Creatinine
    if "creatinine" in raw_results:
        cr = float(raw_results["creatinine"])
        egfr = calculate_egfr(cr, age, is_female)
        egfr_status = "NORMAL"
        if egfr < 15:
            egfr_status = "CRITICAL_LOW"
            critical_flags.append(f"Kidney Failure / Stage 5 CKD: eGFR is {egfr} mL/min/1.73m²")
        elif egfr < 60:
            egfr_status = "LOW"
        calculated_indices["egfr"] = {
            "name": "Estimated GFR (CKD-EPI)",
            "value": egfr,
            "unit": "mL/min/1.73m²",
            "reference": "> 60 mL/min/1.73m²",
            "status": egfr_status
        }
        if egfr < 60:
            clinical_impressions.append(f"Reduced renal filtration capacity (eGFR {egfr} mL/min). Recommend dose adjustment of renal-cleared medications.")

    # 3. BUN / Creatinine Ratio
    if "bun" in raw_results and "creatinine" in raw_results and float(raw_results["creatinine"]) > 0:
        bun = float(raw_results["bun"])
        cr = float(raw_results["creatinine"])
        ratio = bun / cr
        calculated_indices["bun_creatinine_ratio"] = {
            "name": "BUN / Creatinine Ratio",
            "value": round(ratio, 1),
            "unit": "ratio",
            "reference": "10 - 20",
            "status": "HIGH" if ratio > 20 else ("LOW" if ratio < 10 else "NORMAL")
        }
        if ratio > 20:
            clinical_impressions.append("Elevated BUN/Creatinine ratio (>20) - suggestive of prerenal azotemia or dehydration.")

    # 4. Serum Osmolality Estimate = 2*Na + Glucose/18 + BUN/2.8
    if "sodium" in raw_results and "glucose" in raw_results and "bun" in raw_results:
        na = float(raw_results["sodium"])
        glu = float(raw_results["glucose"])
        bun = float(raw_results["bun"])
        osm = (2 * na) + (glu / 18.0) + (bun / 2.8)
        calculated_indices["serum_osmolality"] = {
            "name": "Calculated Serum Osmolality",
            "value": round(osm, 1),
            "unit": "mOsm/kg",
            "reference": "275 - 295 mOsm/kg",
            "status": "HIGH" if osm > 295 else ("LOW" if osm < 275 else "NORMAL")
        }

    # 5. Cardiac Alert
    if "troponin" in raw_results and float(raw_results["troponin"]) > 0.04:
        trop = float(raw_results["troponin"])
        clinical_impressions.append(f"ELEVATED TROPONIN I ({trop} ng/mL) - Myocardial injury biomarker positive. Immediate STAT cardiology consult indicated.")

    # 6. Hematology Alerts
    if "hemoglobin" in raw_results and float(raw_results["hemoglobin"]) < 8.0:
        hb = float(raw_results["hemoglobin"])
        clinical_impressions.append(f"Severe Anemia (Hb {hb} g/dL). Cross-match and transfusion readiness recommended.")
    if "platelets" in raw_results and float(raw_results["platelets"]) < 50.0:
        plt = float(raw_results["platelets"])
        clinical_impressions.append(f"Severe Thrombocytopenia (Platelets {plt}k). High risk of spontaneous hemorrhage.")

    # 7. Acid-Base Interpretation (if ABG provided)
    if "ph" in raw_results and "pco2" in raw_results:
        ph_val = float(raw_results["ph"])
        pco2_val = float(raw_results["pco2"])
        if ph_val < 7.35:
            if pco2_val > 45:
                clinical_impressions.append("Primary Respiratory Acidosis (hypoventilation / CO2 retention).")
            else:
                clinical_impressions.append("Primary Metabolic Acidosis.")
        elif ph_val > 7.45:
            if pco2_val < 35:
                clinical_impressions.append("Primary Respiratory Alkalosis (hyperventilation).")
            else:
                clinical_impressions.append("Primary Metabolic Alkalosis.")

    overall_urgency = "ROUTINE"
    if critical_flags:
        overall_urgency = "CRITICAL_PANIC"
    elif abnormal_count > 0:
        overall_urgency = "ABNORMAL"

    return {
        "success": True,
        "items": analyzed_items,
        "calculated_indices": calculated_indices,
        "critical_flags": critical_flags,
        "clinical_impressions": clinical_impressions,
        "abnormal_count": abnormal_count,
        "total_analyzed": len(analyzed_items),
        "overall_urgency": overall_urgency,
        "engine": "Python 3 Lab Diagnostic Kernel v2.4 (HOSCARE Core)"
    }

def main():
    try:
        input_data = sys.stdin.read().strip()
        if not input_data:
            print(json.dumps({"error": "No input provided to analyzer"}))
            sys.exit(1)
            
        payload = json.loads(input_data)
        raw_results = payload.get("raw_results", {})
        patient_meta = payload.get("patient_meta", {})
        
        analysis = evaluate_parameters(raw_results, patient_meta)
        print(json.dumps(analysis, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e), "success": False}))
        sys.exit(1)

if __name__ == "__main__":
    main()
