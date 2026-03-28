import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const DATA_FRAGMENTS = [
  { text: 'E11.9',           label: 'ICD-10',       color: '#1DB899' },
  { text: 'Sarah Jenkins',   label: 'PATIENT',       color: '#0D1F1A' },
  { text: '2024-03-15',      label: 'DATE OF SERVICE', color: 'rgba(13,31,26,0.75)' },
  { text: 'Type 2 Diabetes', label: 'DIAGNOSIS',     color: '#0D1F1A' },
  { text: 'MRN-4892031',     label: 'MRN',           color: 'rgba(13,31,26,0.7)' },
  { text: 'Dr. R. Patel',    label: 'PROVIDER',      color: 'rgba(13,31,26,0.75)' },
  { text: '99213',           label: 'CPT CODE',      color: '#1DB899' },
  { text: 'Metformin 500mg', label: 'MEDICATION',    color: 'rgba(13,31,26,0.72)' },
  { text: 'BCBS-IL-00291',   label: 'PAYER ID',      color: 'rgba(13,31,26,0.65)' },
  { text: 'HbA1c: 7.2%',    label: 'LAB RESULT',    color: '#1DB899' },
  { text: 'Facility 12-B',   label: 'FACILITY',      color: 'rgba(13,31,26,0.6)' },
  { text: 'NPI-1234567',     label: 'NPI',           color: 'rgba(13,31,26,0.58)' },
  { text: 'FHIR R4',         label: 'STANDARD',      color: 'rgba(29,184,153,0.9)' },
  { text: '$247.00',         label: 'CHARGE',        color: 'rgba(13,31,26,0.68)' },
];

const OVERLAYS = [
  {
    range: [0, 0.20],
    label: 'Clinical Data Normalization',
    heading: <>Fixing the gap between <span style={{ color: '#1DB899' }}>data</span></>,
    body: 'Medical records arrive fragmented, inconsistent, unreadable by billing systems.'
  },
  {
    range: [0.18, 0.38],
    label: 'Data Ingestion',
    heading: 'Every fragment identified.',
    body: 'Simpy.ai extracts ICD-10 codes, patient IDs, billing fields in milliseconds.'
  },
  {
    range: [0.36, 0.56],
    label: 'AI Extraction',
    heading: 'Unstructured → Structured.',
    body: 'AI maps every clinical entity to its standardized FHIR equivalent automatically.'
  },
  {
    range: [0.54, 0.74],
    label: 'FHIR Mapping',
    heading: 'Normalized. Structured. Reconciled.',
    body: 'Clean, validated FHIR output — ready for any billing system instantly.'
  },
  {
    range: [0.72, 1.00],
    label: '100% Match',
    heading: '100% Match. Every time.',
    body: 'Claims validated, revenue protected, zero manual intervention required.'
  }
];

const PROGRESS_STEPS = [
  '01  raw_data_ingested',
  '02  entities_extracted',
  '03  fhir_mapping_complete',
  '04  reconciliation_done',
];

export default function FHIRScrollytelling() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = dimensions.width;
    const H = dimensions.height;
    const isMobile = W < 768;

    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const fragments = DATA_FRAGMENTS.slice(0, isMobile ? 8 : 14).map((data, i) => {
      const angle = (i / (isMobile ? 8 : 14)) * Math.PI * 2;
      const orbitRadius = isMobile ? 90 + Math.random() * 60 : 130 + Math.random() * 95;
      return {
        ...data,
        depth: 0.55 + Math.random() * 0.9,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.35 + Math.random() * 0.65,
        rotation: (Math.random() - 0.5) * 0.22,
        x: W / 2,
        y: H / 2,
        homePos: { 
          x: W / 2 + (Math.random() - 0.5) * 110, 
          y: H / 2 + (Math.random() - 0.5) * 110 
        },
        explodePos: {
          x: W / 2 + Math.cos(angle) * orbitRadius - (isMobile ? 0 : 200),
          y: H / 2 + Math.sin(angle) * orbitRadius
        },
        opacity: 0,
        scale: 0
      };
    });

    let animationFrame;
    const render = () => {
      ctx.clearRect(0, 0, W, H);
      const progress = scrollYProgress.get();
      const cardX = W * 0.75;
      const cardY = H / 2;

      fragments.forEach((f, i) => {
        let targetX, targetY, targetOpacity, targetScale;

        // Stage Transitions
        if (progress < 0.18) {
          // Stage 0: Clustered
          targetX = f.homePos.x;
          targetY = f.homePos.y;
          targetOpacity = 0.2 * f.depth;
          targetScale = f.depth * 0.72;
        } else if (progress < 0.38) {
          // Stage 1: Explode
          targetX = f.explodePos.x;
          targetY = f.explodePos.y;
          targetOpacity = 0.9 * f.depth;
          targetScale = f.depth;
        } else if (progress < 0.58) {
          // Stage 2: Orbit + Lines
          const float = Math.sin(Date.now() * 0.002 * f.floatSpeed + f.floatOffset) * 10;
          targetX = f.explodePos.x;
          targetY = f.explodePos.y + float;
          targetOpacity = f.depth;
          targetScale = f.depth;

          // Dash lines to card area
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = `rgba(29,184,153, ${0.1 * f.depth})`;
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(cardX, cardY);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (progress < 0.78) {
          // Stage 3: Fly into card
          targetX = cardX;
          targetY = cardY;
          targetOpacity = 0;
          targetScale = 0.2;
        } else {
          // Stage 4: Gone
          targetX = cardX;
          targetY = cardY;
          targetOpacity = 0;
          targetScale = 0;
        }

        // LERP
        const lerpFactor = progress < 0.18 ? 0.055 : (progress < 0.38 ? 0.048 : 0.06);
        f.x += (targetX - f.x) * lerpFactor;
        f.y += (targetY - f.y) * lerpFactor;
        f.opacity += (targetOpacity - f.opacity) * lerpFactor;
        f.scale += (targetScale - f.scale) * lerpFactor;

        // Draw Fragment
        if (f.opacity > 0.01) {
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(f.rotation);
          ctx.scale(f.scale, f.scale);
          ctx.globalAlpha = f.opacity;

          const paddingX = 16, paddingY = 11;
          ctx.font = '11px JetBrains Mono';
          const textWidth = ctx.measureText(f.text).width;
          const rectW = textWidth + paddingX * 2;
          const rectH = 40;

          // Pill
          ctx.beginPath();
          ctx.roundRect(-rectW / 2, -rectH / 2, rectW, rectH, 6);
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(29,184,153,0.2)';
          ctx.stroke();

          // Main Text
          ctx.fillStyle = f.color;
          ctx.textAlign = 'center';
          ctx.fillText(f.text, 0, -2);

          // Label
          ctx.font = '700 8px Sora';
          ctx.fillStyle = 'rgba(29,184,153,0.7)';
          ctx.fillText(f.label.toUpperCase(), 0, 12);

          ctx.restore();
        }
      });

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [dimensions, scrollYProgress]);

  return (
    <section ref={containerRef} className="relative w-full" style={{ height: '600vh' }}>
      <div className="sticky top-0 h-screen w-full bg-[#F7F9F8] overflow-hidden fhir-grid-bg">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        
        {/* Top Branding */}
        <div className="absolute top-8 left-12 flex items-center gap-2 opacity-40">
          <div className="w-2 h-2 rounded-full bg-[#1DB899]" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#0D1F1A] uppercase">simpy.ai // clinical_engine_v2</span>
        </div>

        {/* Text Overlays */}
        <div className="absolute inset-0 flex items-center px-12 md:px-24">
          <div className="max-w-xl w-full">
            {OVERLAYS.map((o, i) => (
              <StoryOverlay key={i} data={o} progress={scrollYProgress} />
            ))}
          </div>
        </div>

        {/* FHIR Card */}
        <CardLayer progress={scrollYProgress} />

        {/* Progress Steps */}
        <div className="absolute bottom-12 left-12 flex flex-col gap-3">
          {PROGRESS_STEPS.map((step, i) => (
            <Step key={i} text={step} index={i} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryOverlay({ data, progress }) {
  const opacity = useTransform(progress, [data.range[0], data.range[0] + 0.04, data.range[1] - 0.04, data.range[1]], [0, 1, 1, 0]);
  const y = useTransform(progress, [data.range[0], data.range[1]], [20, -20]);

  return (
    <motion.div style={{ opacity, y, position: 'absolute' }} className="pointer-events-none">
      <span className="text-[10px] font-bold text-[#1DB899] border border-[#1DB899]/20 px-2 py-0.5 rounded uppercase tracking-wider mb-6 inline-block">
        {data.label}
      </span>
      <h2 className="text-4xl md:text-6xl font-extrabold text-[#0D1F1A] leading-[1.1] tracking-tight mb-6 whitespace-pre-line font-sora">
        {data.heading}
      </h2>
      <p className="text-lg text-[#0D1F1A]/60 max-w-md leading-relaxed">
        {data.body}
      </p>
    </motion.div>
  );
}

function CardLayer({ progress }) {
  const opacity = useTransform(progress, [0.55, 0.65], [0, 1]);
  const scale = useTransform(progress, [0.55, 0.65], [0.92, 1]);
  const x = useTransform(progress, [0.55, 0.65], [40, 0]);
  const progressWidth = useTransform(progress, [0.72, 0.95], ["0%", "100%"]);

  return (
    <motion.div 
      style={{ opacity, scale, x }} 
      className="absolute right-12 md:right-24 top-1/2 -translate-y-1/2 pointer-events-none"
    >
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.09)',
        borderRadius: '14px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        width: '280px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div className="p-4 border-b border-gray-50 flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-full bg-[#1DB899]/10 flex items-center justify-center text-[#1DB899] font-bold text-xs">SJ</div>
            <div>
              <p className="text-sm font-bold text-[#0D1F1A] font-sora">Sarah Jenkins</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Patient Profile</p>
            </div>
          </div>
          <span className="fhir-badge">MAPPED TO FHIR</span>
        </div>

        {/* Fields */}
        <div className="p-4 grid grid-cols-2 gap-4 border-b border-gray-50">
          <div>
            <p className="text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Diagnosis</p>
            <p className="text-xs font-bold text-[#0D1F1A]">Type 2 Diabetes</p>
          </div>
          <div className="border-l border-gray-50 pl-4">
            <p className="text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wider">ICD-10 Code</p>
            <p className="text-xs font-bold text-[#1DB899] font-mono">E11.9</p>
          </div>
        </div>

        {/* Reconciliation */}
        <div className="p-4 bg-gray-50/30">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 bg-[#1DB899] rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.1em]">Reconciliation Status</span>
          </div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-base font-black text-[#0D1F1A]">100% Match</span>
            <span className="text-[9px] text-gray-400 font-medium">Claims validated</span>
          </div>
          <div className="h-[3px] w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-[#1DB899]" style={{ width: progressWidth }} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-between items-center bg-white border-t border-gray-50">
          <span className="text-[10px] text-gray-300 font-medium tracking-tight">Updated 2m ago</span>
          <span className="text-[10px] font-bold text-[#1DB899] cursor-pointer">View JSON →</span>
        </div>
      </div>
    </motion.div>
  );
}

function Step({ text, index, progress }) {
  const threshold = [0, 0.25, 0.5, 0.75][index];
  const activeOpacity = useTransform(progress, [threshold, threshold + 0.1], [0.22, 1]);
  const dotColor = useTransform(progress, [threshold, threshold + 0.1], ["rgba(13,31,26,0.22)", "#1DB899"]);

  return (
    <div className="flex items-center gap-3">
      <motion.div className="w-1 h-1 rounded-full" style={{ backgroundColor: dotColor }} />
      <motion.span style={{ opacity: activeOpacity }} className="text-[9px] font-medium font-mono text-[#0D1F1A] tracking-wider uppercase">
        {text}
      </motion.span>
    </div>
  );
}
