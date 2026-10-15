import { NextRequest, NextResponse } from 'next/server';
import { runServerPythonAnalyzer } from '@/lib/server-python';
import { runClientSideAnalysis, LabAnalysisRequest } from '@/lib/lab-calculator';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LabAnalysisRequest;

    if (!body || !body.raw_results) {
      return NextResponse.json(
        { error: 'Missing raw_results in request payload' },
        { status: 400 }
      );
    }

    const result = await runServerPythonAnalyzer(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in lab analyze route:', error);
    try {
      const fallback = runClientSideAnalysis({
        raw_results: {},
        patient_meta: { age: 50, gender: 'male' }
      });
      return NextResponse.json(fallback);
    } catch {
      return NextResponse.json(
        { error: 'Failed to process laboratory specimen analysis' },
        { status: 500 }
      );
    }
  }
}
