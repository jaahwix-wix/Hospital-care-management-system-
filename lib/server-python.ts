import { spawn } from 'child_process';
import path from 'path';
import { runClientSideAnalysis, LabAnalysisRequest, LabAnalysisResponse } from './lab-calculator';

export async function runServerPythonAnalyzer(payload: LabAnalysisRequest): Promise<LabAnalysisResponse> {
  return new Promise((resolve) => {
    try {
      const scriptPath = path.resolve(process.cwd(), 'python_service', 'analyzer.py');
      const pyProcess = spawn('python3', [scriptPath]);

      let stdoutData = '';
      let stderrData = '';

      pyProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });

      pyProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      pyProcess.on('close', (code) => {
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData.trim());
            resolve(parsed);
            return;
          } catch {
            // fallback
          }
        }
        console.warn('Python engine warning, utilizing fallback TS clinical engine:', stderrData);
        resolve(runClientSideAnalysis(payload));
      });

      pyProcess.on('error', (err) => {
        console.warn('Python spawn error, executing fallback:', err);
        resolve(runClientSideAnalysis(payload));
      });

      pyProcess.stdin.write(JSON.stringify(payload));
      pyProcess.stdin.end();
    } catch (e) {
      console.warn('Exception during python execution:', e);
      resolve(runClientSideAnalysis(payload));
    }
  });
}
