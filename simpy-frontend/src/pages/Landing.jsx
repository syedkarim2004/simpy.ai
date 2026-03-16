import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { ArrowRight, FileText, Bot, Database, CheckCircle, Upload as UploadIcon, Building2, TrendingUp, HeartPulse } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function TorusKnot() {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.15;
    meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[2.5, 0.8, 128, 32]} />
      <meshStandardMaterial color="#0D9488" roughness={0.2} metalness={0.7} />
    </mesh>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen font-sans bg-white text-slate-900 selection:bg-teal/20 selection:text-teal">
      
      {/* SECTION 1 - NAVBAR */}
      <nav className="fixed top-0 w-full h-[70px] bg-white shadow-sm shadow-slate-200/50 z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal"></div>
          <span className="text-slate-900 font-extrabold text-2xl tracking-tight">Simpy.ai</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600 text-sm">
          <a href="#features" className="hover:text-teal transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-teal transition-colors">How It Works</a>
          <a href="#providers" className="hover:text-teal transition-colors">For Providers</a>
          <a href="#billers" className="hover:text-teal transition-colors">For Billers</a>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/app" className="text-sm font-semibold text-slate-600 hover:text-navy hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors border border-transparent">Login</Link>
          <Link to="/app" className="bg-teal hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-[0_4px_14px_0_rgba(13,148,136,0.39)] transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* SECTION 2 - HERO */}
      <section className="relative pt-[70px] min-h-[90vh] flex flex-col lg:flex-row items-center px-8 lg:px-16 gap-12 overflow-hidden bg-slate-50 border-b border-slate-200">
        <div className="lg:w-[55%] z-10 space-y-8 pl-4 lg:pl-12 pt-12 lg:pt-0">
          <div className="inline-flex items-center gap-2 bg-teal text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
            AI-Powered RCM Solution
          </div>
          
          <h1 className="text-6xl lg:text-7xl font-black text-navy leading-[1.1] tracking-tight">
            Clinical Data <br/>
            <span className="text-teal relative inline-block">
              Empowered<span className="text-3xl absolute top-1 -right-6 text-teal/50">®</span>
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
            Simpy.ai bridges the gap between clinical diagnosis and billing codes. 
            Powered by MedGemma AI and FHIR R4 standards.
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <Link to="/app" className="flex items-center gap-2 bg-teal hover:bg-teal-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-[0_4px_14px_0_rgba(13,148,136,0.39)] transition-all hover:-translate-y-0.5">
              Start Processing →
            </Link>
            <button className="px-8 py-4 text-slate-600 font-bold hover:text-navy hover:bg-slate-200/50 rounded-xl transition-colors">
              Watch Demo
            </button>
          </div>

          <div className="flex items-center gap-6 pt-10 border-t border-slate-200/60 mt-8">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-600">FHIR R4 Certified</span>
            <span className="flex items-center gap-2 text-sm font-bold text-slate-600 border-l border-slate-300 pl-6">MedGemma Powered</span>
            <span className="flex items-center gap-2 text-sm font-bold text-slate-600 border-l border-slate-300 pl-6">SOC 2 Ready</span>
          </div>
        </div>

        <div className="lg:w-[45%] h-[600px] relative mt-12 lg:mt-0">
          <div className="absolute inset-0 z-0 opacity-90">
            <Canvas camera={{ position: [0, 0, 9], fov: 40 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0D9488" />
              <TorusKnot />
              <OrbitControls enableZoom={false} autoRotate={true} autoRotateSpeed={1} />
            </Canvas>
          </div>
          
          <div className="absolute top-[20%] left-0 bg-white/90 backdrop-blur p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-[bounce_4s_infinite_ease-in-out]">
            <div>
              <p className="text-xl font-black text-navy">98.2% Accuracy</p>
            </div>
          </div>
          <div className="absolute bottom-[30%] right-[10%] bg-white/90 backdrop-blur p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-[bounce_5s_infinite_ease-in-out_reverse]">
            <div>
              <p className="text-xl font-black text-navy">&lt; 2s Processing</p>
            </div>
          </div>
           <div className="absolute top-[60%] left-[15%] bg-white/90 backdrop-blur p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-[bounce_6s_infinite_ease-in-out]">
            <div>
              <p className="text-xl font-black text-navy">FHIR R4 Standard</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 - STATS BAR */}
      <section className="bg-[#0A1628] py-16 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div>
            <p className="text-4xl font-black text-white mb-1 tracking-tight">50,000+</p>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Active Documents Processed</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-slate-800"></div>
          <div>
             <p className="text-4xl font-black text-white mb-1 tracking-tight">99.1%</p>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Claim Accuracy Rate</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-slate-800"></div>
          <div>
            <p className="text-4xl font-black text-white mb-1 tracking-tight">&lt; 2 sec</p>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Average Processing Time</p>
          </div>
          <div className="hidden md:block w-px h-16 bg-slate-800"></div>
          <div>
            <p className="text-4xl font-black text-white mb-1 tracking-tight">FHIR R4</p>
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Healthcare Standard</p>
          </div>
        </div>
      </section>

      {/* SECTION 4 - HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-navy mb-4">From Document to Clean Claim in 4 Steps</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative items-start">
            {/* Connecting line for md+ screens */}
            <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-[2px] bg-slate-200 -z-10"></div>
            
            <div className="text-center relative group">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2 border-2 border-white text-xs z-10">1</div>
              <div className="w-20 h-20 mx-auto bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-teal mb-6 shadow-sm"><UploadIcon className="w-8 h-8"/></div>
              <h3 className="text-lg font-bold text-navy mb-2">Upload Document</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">Drop any medical document — PDF, scan, or image</p>
            </div>

            <div className="text-center relative group">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2 border-2 border-white text-xs z-10">2</div>
              <div className="w-20 h-20 mx-auto bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-teal mb-6 shadow-sm"><Bot className="w-8 h-8"/></div>
              <h3 className="text-lg font-bold text-navy mb-2">AI Extraction</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">MedGemma reads and extracts all clinical entities</p>
            </div>

            <div className="text-center relative group">
               <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2 border-2 border-white text-xs z-10">3</div>
              <div className="w-20 h-20 mx-auto bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-teal mb-6 shadow-sm"><Database className="w-8 h-8"/></div>
              <h3 className="text-lg font-bold text-navy mb-2">FHIR Mapping</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">Data mapped to FHIR R4 healthcare standard</p>
            </div>

            <div className="text-center relative group">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-black flex items-center justify-center absolute -top-4 left-1/2 -translate-x-1/2 border-2 border-white text-xs z-10">4</div>
              <div className="w-20 h-20 mx-auto bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-teal mb-6 shadow-sm"><CheckCircle className="w-8 h-8"/></div>
              <h3 className="text-lg font-bold text-navy mb-2">Reconciliation</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-2">Revenue reconciliation with mismatch detection</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 - FOR WHO */}
      <section className="py-24 bg-slate-50 px-8 border-y border-slate-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-2xl font-black text-navy mb-6">For Hospital Billing Teams</h3>
            <ul className="space-y-4 text-slate-600 font-medium">
              <li className="flex gap-3"><span className="text-teal font-bold shrink-0">✓</span> Reduce claim rejections</li>
              <li className="flex gap-3"><span className="text-teal font-bold shrink-0">✓</span> Auto ICD-10 mapping</li>
              <li className="flex gap-3"><span className="text-teal font-bold shrink-0">✓</span> FHIR R4 output</li>
              <li className="flex gap-3"><span className="text-teal font-bold shrink-0">✓</span> Real-time reconciliation</li>
            </ul>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-2xl font-black text-navy mb-6">For RCM Managers</h3>
            <ul className="space-y-4 text-slate-600 font-medium">
              <li className="flex gap-3"><span className="text-teal font-bold shrink-0">✓</span> Revenue leak detection</li>
              <li className="flex gap-3"><span className="text-teal font-bold shrink-0">✓</span> Mismatch alerts</li>
              <li className="flex gap-3"><span className="text-teal font-bold shrink-0">✓</span> Audit trail</li>
              <li className="flex gap-3"><span className="text-teal font-bold shrink-0">✓</span> Dashboard analytics</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 6 - TESTIMONIAL */}
      <section className="py-24 bg-white text-center px-8 border-b border-slate-100">
         <h2 className="text-3xl md:text-4xl font-black text-navy leading-tight max-w-4xl mx-auto mb-6">
          "Simpy.ai reduced our claim rejection rate by 40%"
        </h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-16">Dr. Priya Sharma, Head of Billing, Apollo Hospitals</p>

        <div className="flex flex-wrap items-center justify-center gap-10 text-xl font-bold text-slate-400">
          <span>Tata Memorial</span>
          <span>AIIMS</span>
          <span>Fortis</span>
        </div>
      </section>

      {/* SECTION 7 - CTA */}
      <section className="py-24 bg-[#0A1628] text-center px-8 relative">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-10">Ready to Transform Your RCM?</h2>
          <Link to="/app" className="inline-block bg-teal hover:bg-teal-600 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-[0_4px_14px_0_rgba(13,148,136,0.39)] transition-all">
            Get Started Free →
          </Link>
          <p className="text-slate-400 font-medium text-sm mt-6">No credit card required</p>
        </div>
      </section>

      {/* SECTION 8 - FOOTER */}
      <footer className="bg-[#0A1628] py-16 px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
               <span className="text-white font-black text-2xl tracking-tight">Simpy.ai</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              Clinical Data Empowered
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><Link to="/app" className="hover:text-teal transition-colors">Start Uploading</Link></li>
              <li><Link to="/app" className="hover:text-teal transition-colors">Documentation</Link></li>
              <li><Link to="/app" className="hover:text-teal transition-colors">FHIR APIs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-teal transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-teal transition-colors">Contact</a></li>
            </ul>
          </div>
           <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
             <ul className="space-y-4 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-teal transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-teal transition-colors">System Status</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm font-medium">
          <p>&copy; 2026 Simpy.ai</p>
          <p className="mt-2 md:mt-0">Built at Bennett University • IIT Patna Track 2</p>
        </div>
      </footer>

    </div>
  );
}
