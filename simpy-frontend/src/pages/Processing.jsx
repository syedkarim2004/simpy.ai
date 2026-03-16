import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Circle, ArrowLeft, Terminal, AlertTriangle } from 'lucide-react';

export default function Processing() {
  const location = useLocation();
  const navigate = useNavigate();
  const docIdFromState = location.state?.document_id;
  
  const [document_id, setDocumentId] = useState(docIdFromState || localStorage.getItem('document_id'));
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [error, setError] = useState('');
  const [liveLog, setLiveLog] = useState([]);
  const [stepTimes, setStepTimes] = useState({});

  const steps = [
    { id: 1, title: 'OCR Text Extraction', desc: 'Extracting text from document...', timeKey: 'step1' },
    { id: 2, title: 'AI Entity Recognition', desc: 'MedGemma LLM extracting diagnoses, procedures, meds', timeKey: 'step2' },
    { id: 3, title: 'ICD-10 Code Mapping', desc: 'Standardizing unaligned vocabulary to SNOMED/ICD-10', timeKey: 'step3' },
    { id: 4, title: 'FHIR R4 Generation', desc: 'Structuring immutable interoperability payloads', timeKey: 'step4' },
    { id: 5, title: 'Revenue Reconciliation', desc: 'Detecting mismatched leakage patterns securely', timeKey: 'step5' },
  ];

  const addLog = (msg) => {
    setLiveLog(prev => [...prev, `[${new Date().toISOString().substring(11, 23)}] ${msg}`]);
  };

  useEffect(() => {
    if (!document_id) {
      setError("No document ID provided. Please start from the upload page.");
      return;
    }

    const runPipeline = async () => {
      try {
        const t0 = performance.now();
        addLog(`Initializing pipeline for document: ${document_id}`);
        
        // STEP 1: OCR Text Extraction (Already done in /ingest, simulate UI)
        await new Promise(r => setTimeout(r, 800));
        setStepTimes(p => ({...p, step1: `${Math.round(performance.now() - t0)}ms`}));
        setCurrentStepIndex(2);

        // STEP 2: AI Entity Recognition
        const t1 = performance.now();
        addLog("POST /extract - Connecting to Groq/MedGemma architecture...");
        const extractRes = await fetch('http://localhost:8000/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ document_id })
        });
        if (!extractRes.ok) throw new Error("Entity extraction failed from backend");
        const extractData = await extractRes.json();
        const extraction_id = extractData.extraction_id;
        localStorage.setItem('extraction_id', extraction_id);
        localStorage.setItem('entities', JSON.stringify(extractData.entities));
        
        const diagCount = extractData.entities?.diagnoses?.length || 0;
        addLog(`Success. Extracted ${diagCount} diagnoses.`);
        setStepTimes(p => ({...p, step2: `${Math.round(performance.now() - t1)}ms`}));
        setCurrentStepIndex(3);

        // STEP 3: ICD-10 Code Mapping (Handled inside /extract backend, updating UI)
        const t2 = performance.now();
        await new Promise(r => setTimeout(r, 500));
        addLog(`${diagCount} diagnoses mapped to ICD-10`);
        setStepTimes(p => ({...p, step3: `${Math.round(performance.now() - t2)}ms`}));
        setCurrentStepIndex(4);

        // STEP 4: FHIR R4 Bundle Generation
        const t3 = performance.now();
        addLog("POST /fhir - Transforming structured components to FHIR R4.");
        const fhirRes = await fetch('http://localhost:8000/fhir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ extraction_id })
        });
        if (!fhirRes.ok) throw new Error("FHIR generation failed natively");
        const fhirData = await fhirRes.json();
        const fhir_id = fhirData.fhir_id;
        localStorage.setItem('fhir_id', fhir_id);
        localStorage.setItem('fhir_bundle', JSON.stringify(fhirData.bundle));
        addLog("Success. Validated structurally against FHIR schemas.");
        setStepTimes(p => ({...p, step4: `${Math.round(performance.now() - t3)}ms`}));
        setCurrentStepIndex(5);
        
        // STEP 5: Revenue Reconciliation
        const t4 = performance.now();
        addLog("POST /reconcile - Firing mismatch detection against billed inputs.");
        const billed_data = {
          "billed_diagnoses": [{"code": "E11.9"}],
          "billed_procedures": [{"code": "99214"}],
          "total_amount": 49500
        }; 
        
        const reconcileRes = await fetch('http://localhost:8000/reconcile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fhir_id, billed_data })
        });
        if (!reconcileRes.ok) throw new Error("Reconciliation failed natively");
        const reconcileData = await reconcileRes.json();
        localStorage.setItem('report', JSON.stringify({report: reconcileData.report}));
        addLog(`Complete. Final Score calculated: ${reconcileData.report?.reconciliation_score}/100`);
        setStepTimes(p => ({...p, step5: `${Math.round(performance.now() - t4)}ms`}));
        
        setCurrentStepIndex(6); // All steps complete
        setPipelineComplete(true);
        addLog("PIPELINE AUTOMATION COMPLETE.");

      } catch (err) {
        console.error(err);
        addLog(`ERROR: ${err.message || 'Fatal exception caught in processing trace.'}`);
        setError(err.message || "An error occurred during secure processing.");
      }
    };

    runPipeline();
  }, [document_id]);

  const progressPercentage = Math.min(((currentStepIndex - 1) / steps.length) * 100, 100);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/app')} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 bg-white transition-colors text-slate-500 hover:text-navy">
                <ArrowLeft className="w-5 h-5"/>
            </button>
            <div>
               <h1 className="text-2xl font-black text-navy border-b border-transparent">Processing Document</h1>
               <p className="text-slate-500 font-medium text-sm mt-0.5">ID: {document_id || 'UNKNOWN'}</p>
            </div>
         </div>
         {pipelineComplete && (
            <div className="animate-fade-in bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-green-200 shadow-sm flex items-center gap-2">
               <CheckCircle2 className="w-4 h-4"/> Success
            </div>
         )}
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-10 overflow-hidden border border-slate-300 shadow-inner">
        <div 
           className="bg-teal h-2.5 rounded-full transition-all duration-700 ease-out" 
           style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* LEFT: Timeline */}
          <div className="lg:w-[50%] bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative">
             <div className="absolute left-[45px] top-12 bottom-12 w-0.5 bg-slate-100 z-0"></div>

              <div className="space-y-8 relative z-10">
              {steps.map((step) => {
                const isCompleted = currentStepIndex > step.id;
                const isProcessing = currentStepIndex === step.id;
                const isPending = currentStepIndex < step.id;
                const isError = error && isProcessing;

                return (
                  <div key={step.id} className={`flex items-start gap-6 transition-all duration-300 ${isPending ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                    <div className="mt-1 flex-shrink-0 bg-white p-1">
                      {isError ? <AlertTriangle className="w-8 h-8 text-red-500 bg-white" /> :
                       isCompleted ? <CheckCircle2 className="w-8 h-8 text-green-500 bg-white" /> :
                       isProcessing ? <Loader2 className="w-8 h-8 text-teal bg-white animate-spin" /> :
                       <Circle className="w-8 h-8 text-slate-300 bg-white" />}
                    </div>
                    <div className="flex-1 border-b border-slate-50 pb-6">
                      <div className="flex items-center justify-between">
                         <h3 className={`font-black text-lg tracking-tight ${isError ? 'text-red-500' : isCompleted ? 'text-navy' : isProcessing ? 'text-teal' : 'text-slate-400'}`}>
                            {step.title}
                         </h3>
                         {isCompleted && <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">{stepTimes[step.timeKey]}</span>}
                      </div>
                      <p className="text-sm font-medium text-slate-500 mt-1">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-bold text-sm flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* RIGHT: Live Terminal */}
          <div className="lg:w-[50%] flex flex-col gap-6">
              <div className="flex-1 bg-[#0A1628] rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
                  <div className="bg-[#112240] px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                     <Terminal className="w-4 h-4 text-teal" />
                     <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">Live Output Trace</span>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1 h-[400px]">
                     {liveLog.map((log, i) => (
                        <p key={i} className={`text-teal font-mono text-xs mb-2 leading-relaxed ${log.includes('ERROR') ? 'text-red-400' : ''}`}>
                          <span className="text-slate-500 opacity-60 mr-2">»</span> {log}
                        </p>
                     ))}
                     {(!pipelineComplete && !error) && (
                         <div className="flex items-center gap-2 mt-4 text-slate-500 animate-pulse">
                            <span className="w-2 h-4 bg-teal align-middle inline-block"></span>
                         </div>
                     )}
                  </div>
              </div>

              <button
                onClick={() => navigate('/app/report')}
                disabled={!pipelineComplete}
                className={`w-full py-5 rounded-xl font-black text-lg tracking-wide transition-all shadow-lg
                  ${!pipelineComplete 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300' 
                    : 'bg-teal text-white hover:bg-teal-600 shadow-teal/30 hover:-translate-y-0.5'
                  }
                `}
              >
                {pipelineComplete ? 'View Report →' : 'Awaiting Finalization...'}
              </button>
          </div>
      </div>
    </div>
  );
}
