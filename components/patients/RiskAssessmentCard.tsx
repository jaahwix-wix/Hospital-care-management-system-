'use client';

import React from 'react';
import {
  AlertTriangle,
  HeartPulse,
  Activity,
  Wind,
  Thermometer,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';
import { VitalSign } from '@/lib/types';

interface RiskAssessmentCardProps {
  vitals: VitalSign[];
}

interface ComponentScore {
  name: string;
  measured: string;
  points: number;
  normalRange: string;
  status: 'normal' | 'mild' | 'moderate' | 'severe';
}

export function computeEWSBreakdown(vital?: VitalSign): {
  totalScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  components: ComponentScore[];
  clinicalAction: string;
  monitoringFrequency: string;
  scoreColor: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    indicator: string;
  };
} {
  if (!vital) {
    return {
      totalScore: 0,
      riskLevel: 'LOW',
      components: [],
      clinicalAction: 'No vitals logged yet. Awaiting initial bedside physiological measurement.',
      monitoringFrequency: 'Baseline intake pending',
      scoreColor: {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: 'text-slate-700',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        indicator: 'bg-slate-400'
      }
    };
  }

  const { respiratoryRate, oxygenSaturation, bloodPressureSystolic, heartRate, temperature, consciousness } = vital;
  const components: ComponentScore[] = [];
  let total = 0;

  // 1. Respiration Rate
  let rrPoints = 0;
  let rrStatus: ComponentScore['status'] = 'normal';
  if (respiratoryRate <= 8 || respiratoryRate >= 25) {
    rrPoints = 3;
    rrStatus = 'severe';
  } else if (respiratoryRate >= 21) {
    rrPoints = 2;
    rrStatus = 'moderate';
  } else if (respiratoryRate >= 9 && respiratoryRate <= 11) {
    rrPoints = 1;
    rrStatus = 'mild';
  }
  total += rrPoints;
  components.push({
    name: 'Respiration Rate',
    measured: `${respiratoryRate} /min`,
    points: rrPoints,
    normalRange: '12 - 20 /min',
    status: rrStatus
  });

  // 2. Oxygen Saturation (SpO2)
  let spo2Points = 0;
  let spo2Status: ComponentScore['status'] = 'normal';
  if (oxygenSaturation <= 91) {
    spo2Points = 3;
    spo2Status = 'severe';
  } else if (oxygenSaturation <= 93) {
    spo2Points = 2;
    spo2Status = 'moderate';
  } else if (oxygenSaturation <= 95) {
    spo2Points = 1;
    spo2Status = 'mild';
  }
  total += spo2Points;
  components.push({
    name: 'Oxygen Sat (SpO2)',
    measured: `${oxygenSaturation}%`,
    points: spo2Points,
    normalRange: '≥ 96%',
    status: spo2Status
  });

  // 3. Systolic Blood Pressure
  let sbpPoints = 0;
  let sbpStatus: ComponentScore['status'] = 'normal';
  if (bloodPressureSystolic <= 90 || bloodPressureSystolic >= 220) {
    sbpPoints = 3;
    sbpStatus = 'severe';
  } else if (bloodPressureSystolic <= 100) {
    sbpPoints = 2;
    sbpStatus = 'moderate';
  } else if (bloodPressureSystolic <= 110) {
    sbpPoints = 1;
    sbpStatus = 'mild';
  }
  total += sbpPoints;
  components.push({
    name: 'Systolic Blood Pressure',
    measured: `${bloodPressureSystolic} mmHg`,
    points: sbpPoints,
    normalRange: '111 - 219 mmHg',
    status: sbpStatus
  });

  // 4. Pulse / Heart Rate
  let hrPoints = 0;
  let hrStatus: ComponentScore['status'] = 'normal';
  if (heartRate <= 40 || heartRate >= 131) {
    hrPoints = 3;
    hrStatus = 'severe';
  } else if (heartRate >= 111) {
    hrPoints = 2;
    hrStatus = 'moderate';
  } else if (heartRate <= 50 || heartRate >= 91) {
    hrPoints = 1;
    hrStatus = 'mild';
  }
  total += hrPoints;
  components.push({
    name: 'Pulse / Heart Rate',
    measured: `${heartRate} bpm`,
    points: hrPoints,
    normalRange: '51 - 90 bpm',
    status: hrStatus
  });

  // 5. Temperature
  let tempPoints = 0;
  let tempStatus: ComponentScore['status'] = 'normal';
  if (temperature <= 35.0) {
    tempPoints = 3;
    tempStatus = 'severe';
  } else if (temperature >= 39.1) {
    tempPoints = 2;
    tempStatus = 'moderate';
  } else if (temperature <= 36.0 || temperature >= 38.1) {
    tempPoints = 1;
    tempStatus = 'mild';
  }
  total += tempPoints;
  components.push({
    name: 'Core Temperature',
    measured: `${temperature} °C`,
    points: tempPoints,
    normalRange: '36.1 - 38.0 °C',
    status: tempStatus
  });

  // 6. Consciousness (AVPU)
  let avpuPoints = 0;
  let avpuStatus: ComponentScore['status'] = 'normal';
  if (consciousness && consciousness !== 'ALERT') {
    avpuPoints = 3;
    avpuStatus = 'severe';
  }
  total += avpuPoints;
  components.push({
    name: 'Consciousness (AVPU)',
    measured: consciousness === 'ALERT' ? 'Alert' : consciousness.replace('_', ' '),
    points: avpuPoints,
    normalRange: 'Alert (Awake)',
    status: avpuStatus
  });

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let clinicalAction = '';
  let monitoringFrequency = '';
  let scoreColor = {
    bg: 'bg-emerald-50/60',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    indicator: 'bg-emerald-500'
  };

  const hasSingleSevere = components.some((c) => c.points === 3);

  if (total >= 7) {
    riskLevel = 'HIGH';
    scoreColor = {
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      text: 'text-rose-950',
      badge: 'bg-rose-600 text-white border-rose-700 animate-pulse',
      indicator: 'bg-rose-600'
    };
    clinicalAction =
      'STAT Emergency Medical Response: Immediate assessment by Attending Physician / Critical Care Outreach Team. Continuous vital telemetry. Prepare for emergency airway, vasopressor support, or immediate transfer to ICU bed.';
    monitoringFrequency = 'Continuous monitoring / every 15 minutes minimum';
  } else if (total >= 5 || hasSingleSevere) {
    riskLevel = 'MEDIUM';
    scoreColor = {
      bg: 'bg-amber-50/70',
      border: 'border-amber-300',
      text: 'text-amber-950',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      indicator: 'bg-amber-500'
    };
    clinicalAction =
      'Urgent Clinical Review: Charge Nurse and Attending Physician review required within 30 minutes. Optimize oxygenation, evaluate fluid status, and consider diagnostic blood gas / sepsis workup.';
    monitoringFrequency = 'Hourly vital observations minimum';
  } else {
    riskLevel = 'LOW';
    clinicalAction =
      'Routine Inpatient Surveillance: Continue prescribed ward protocol, medication schedule, and routine nursing rounds.';
    monitoringFrequency = 'Standard ward observations (every 4 to 12 hours)';
  }

  return {
    totalScore: total,
    riskLevel,
    components,
    clinicalAction,
    monitoringFrequency,
    scoreColor
  };
}

export const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ vitals }) => {
  const latestVital = vitals[0];
  const previousVital = vitals[1];

  const currentEws = computeEWSBreakdown(latestVital);
  const previousEws = previousVital ? computeEWSBreakdown(previousVital) : null;

  const scoreDiff = previousEws ? currentEws.totalScore - previousEws.totalScore : 0;

  return (
    <div className={`rounded-xl border p-5 transition-all shadow-xs ${currentEws.scoreColor.bg} ${currentEws.scoreColor.border}`}>
      {/* Top Banner: Score, Risk Badge, and Trend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-xs shrink-0 ${currentEws.scoreColor.indicator}`}>
            {currentEws.totalScore}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Patient Risk Assessment (EWS / NEWS2)
              </h3>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${currentEws.scoreColor.badge}`}>
                {currentEws.riskLevel} DETERIORATION RISK
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Standardized physiological early warning score for clinical deterioration surveillance.
            </p>
          </div>
        </div>

        {/* Delta change since last recording */}
        {previousEws && (
          <div className="flex items-center gap-2 text-xs bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500">Delta vs prior vitals:</span>
            {scoreDiff > 0 ? (
              <span className="font-bold text-rose-700 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                +{scoreDiff} pts (Deterioration)
              </span>
            ) : scoreDiff < 0 ? (
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                {scoreDiff} pts (Improving)
              </span>
            ) : (
              <span className="font-semibold text-slate-700">Stable (0 pts change)</span>
            )}
          </div>
        )}
      </div>

      {/* Recommended Clinical Action and Frequency */}
      <div className="my-4 bg-white/90 border border-slate-200/80 rounded-lg p-3.5 text-xs space-y-1.5">
        <div className="flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="text-slate-900">Mandated Clinical Escalation Protocol: </strong>
            <span className="text-slate-700">{currentEws.clinicalAction}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Surveillance cadence: <strong className="text-slate-700">{currentEws.monitoringFrequency}</strong></span>
        </div>
      </div>

      {/* Parameter Breakdown Grid */}
      <div>
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
          Physiological Parameter Score Breakdown
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {currentEws.components.map((comp) => {
            let pointBg = 'bg-white border-slate-200 text-slate-800';
            if (comp.points === 3) {
              pointBg = 'bg-rose-50 border-rose-300 text-rose-950 font-bold';
            } else if (comp.points === 2) {
              pointBg = 'bg-amber-50 border-amber-300 text-amber-950 font-semibold';
            } else if (comp.points === 1) {
              pointBg = 'bg-yellow-50 border-yellow-200 text-yellow-950';
            }

            return (
              <div key={comp.name} className={`p-2.5 rounded-lg border ${pointBg}`}>
                <div className="text-[10px] text-slate-500 truncate">{comp.name}</div>
                <div className="text-sm font-bold mt-0.5">{comp.measured}</div>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-mono">Ref: {comp.normalRange}</span>
                  <span className="font-bold">
                    +{comp.points} {comp.points === 1 ? 'pt' : 'pts'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
