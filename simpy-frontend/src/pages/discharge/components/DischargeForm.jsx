import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Zap, LayoutDashboard, Calculator, Hash, Building2, Calendar, Loader2, Info, Activity, ClipboardCheck, TrendingUp } from 'lucide-react';

export default function DischargeForm({ externalData, onAuditStart, onAuditComplete }) {
  const [loading, setLoading] = useState(false);
  const extraction = externalData?.extraction;
  
  const [formData, setFormData] = useState({
    admission_date: extraction?.admission_date || '',
    discharge_date: extraction?.discharge_date || '',
    procedures: [],
    bill_items: (extraction?.line_items || extraction?.bill_breakdown || []).map(item => ({
      name: item.category || 'Unknown Item',
      cost: item.billed_amount || item.bill_amount || 0
    }))
  });

  // Sync when externalData changes
  useEffect(() => {
    if (extraction) {
      console.log("🔗 Syncing DischargeForm with Extraction:", extraction);
      setFormData({
        admission_date: extraction.admission_date || '',
        discharge_date: extraction.discharge_date || '',
        procedures: [],
        bill_items: (extraction.line_items || extraction.bill_breakdown || []).map(item => ({
          name: item.category || 'Unknown Item',
          cost: item.billed_amount || item.bill_amount || 0
        }))
      });
    }
  }, [extraction]);

  const addBillItem = () => {
    setFormData({
      ...formData,
      bill_items: [...formData.bill_items, { name: '', cost: 0 }]
    });
  };

  const removeBillItem = (index) => {
    const items = [...formData.bill_items];
    items.splice(index, 1);
    setFormData({ ...formData, bill_items: items });
  };

  const handleAudit = async () => {
    setLoading(true);
    if (onAuditStart) onAuditStart();
    
    try {
      const res = await fetch('http://localhost:8000/api/discharge/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extraction: extraction,
          discharge: formData
        })
      });
      const data = await res.json();
      if (data.success) {
        onAuditComplete(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
      
      {/* Protocol Summary Card */}
      <div className="bg-white border border-[var(--border)] p-8 rounded-[12px] shadow-sm relative overflow-hidden group/summary">
        <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] pb-6">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] rounded-[8px]">
                 <ClipboardCheck size={20} />
              </div>
              <div>
                 <h3 className="text-[22px] font-serif font-bold text-[var(--text)]">Protocol Summary</h3>
                 <p className="font-mono text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5 font-bold">Verification Engine v3.1</p>
              </div>
           </div>

           <div className="px-3 py-1 bg-[var(--accent-light)] border border-[var(--accent-border)] rounded-[6px] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
              <span className="font-mono text-[9px] font-bold text-[var(--accent)] uppercase tracking-wider leading-none">High Confidence Ingestion</span>
           </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
           {/* Case Metadata */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Claim ID', val: extraction?.claim_number || 'PENDING_ID', icon: Hash },
                { label: 'Facility', val: extraction?.hospital_name || 'NOT_DETECTED', icon: Building2 },
                { label: 'Admission Timeline', val: extraction?.admission_date ? `${extraction.admission_date} → ${extraction.discharge_date || '...'}` : 'NO_TIMELINE', icon: Calendar },
                { label: 'Extracted Claim', val: extraction?.total_claimed ? `₹${extraction.total_claimed.toLocaleString()}` : '₹0.00', icon: TrendingUp, accent: true },
              ].map((item, i) => (
                <div key={i} className={`bg-[var(--surface-alt)] border p-4 rounded-[8px] flex items-center gap-4 transition-all duration-300 border-[var(--border)] hover:bg-white`}>
                   <div className="w-9 h-9 bg-white border border-[var(--border)] flex items-center justify-center text-[var(--mid)] rounded-[6px]">
                      <item.icon size={16} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className={`text-[13px] font-bold tracking-tight leading-none ${item.accent ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>{item.val}</p>
                   </div>
                </div>
              ))}
           </div>

            {/* Deductions Preview */}
            <div className="bg-[var(--surface-alt)] border border-[var(--border)] p-6 rounded-[8px]">
               <div className="flex items-center gap-2 mb-5">
                  <Activity size={14} className="text-[var(--accent)]" />
                  <h5 className="font-mono text-[9px] text-[var(--text)] font-bold uppercase tracking-widest">Initial Reconciliation Log</h5>
               </div>
               <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  {[
                    { label: 'TDS Statutory', val: extraction?.tds || 0, color: 'text-blue-600' },
                    { label: 'Hosp. Discount', val: extraction?.hospital_discount || 0, color: 'text-[var(--amber)]' },
                    { label: 'Policy Excess', val: extraction?.policy_excess || 0, color: 'text-red-500' },
                    { label: 'Copayment', val: extraction?.copay || 0, color: 'text-red-500' },
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-[var(--border)] pb-2.5">
                       <span className="text-[11px] text-[var(--muted)] font-bold">{stat.label}</span>
                       <span className={`font-mono text-[13px] font-bold ${stat.color}`}>₹{stat.val.toLocaleString()}</span>
                    </div>
                  ))}
               </div>
            </div>
        </div>
      </div>

      {/* Itemized bill verification */}
      <div className="bg-white border border-[var(--border)] p-8 rounded-[12px] shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] pb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] rounded-[8px]">
                <Calculator size={20} />
            </div>
            <div>
              <h3 className="text-[22px] font-serif font-bold text-[var(--text)]">Bill Verification</h3>
              <p className="font-mono text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5">Live Editor Layer</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] px-1">Admission Date</label>
              <input 
                type="date"
                value={formData.admission_date}
                onChange={e => setFormData({...formData, admission_date: e.target.value})}
                className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-[8px] px-4 py-3 text-[var(--text)] font-body text-sm font-medium focus:border-[var(--accent)]/50 focus:bg-white outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] px-1">Discharge Date</label>
              <input 
                type="date"
                value={formData.discharge_date}
                onChange={e => setFormData({...formData, discharge_date: e.target.value})}
                className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-[8px] px-4 py-3 text-[var(--text)] font-body text-sm font-medium focus:border-[var(--accent)]/50 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text)]">Itemized Cost Vector</label>
              <button 
                onClick={addBillItem}
                className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-[var(--accent)] hover:underline uppercase tracking-wider transition-all"
              >
                <Plus size={14} /> Add Line Item
              </button>
            </div>
            
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar border border-[var(--border)] bg-[var(--surface-alt)] p-2 rounded-[6px]">
              {formData.bill_items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center animate-in fade-in duration-300 transition-all hover:bg-white bg-transparent rounded-[4px] py-1 border border-transparent hover:border-[var(--border)]">
                  <div className="px-3 font-mono text-[10px] text-[var(--mid)] font-bold">{(idx + 1).toString().padStart(2, '0')}</div>
                  <input 
                    placeholder="Category Name"
                    value={item.name}
                    onChange={e => {
                      const items = [...formData.bill_items];
                      items[idx].name = e.target.value;
                      setFormData({...formData, bill_items: items});
                    }}
                    className="flex-1 bg-transparent border-none px-2 py-2 text-[13px] font-bold text-[var(--text)] focus:ring-0 outline-none"
                  />
                  <div className="relative w-36 flex items-center pr-3">
                    <span className="text-[11px] text-[var(--mid)] font-bold mr-2">₹</span>
                    <input 
                      type="number"
                      value={item.cost}
                      onChange={e => {
                        const items = [...formData.bill_items];
                        items[idx].cost = parseInt(e.target.value) || 0;
                        setFormData({...formData, bill_items: items});
                      }}
                      className="w-full bg-transparent border-none p-0 font-mono text-[13px] font-bold text-right text-[var(--text)] focus:ring-0 outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => removeBillItem(idx)}
                    className="p-3 text-[var(--mid)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            id="audit-trigger-btn"
            onClick={handleAudit}
            disabled={loading}
            className="w-full h-16 bg-[var(--accent)] hover:opacity-95 disabled:bg-[var(--mid)] text-white font-bold transition-all uppercase tracking-widest flex items-center justify-center gap-4 text-[15px] group shadow-lg shadow-[var(--accent)]/10 rounded-[8px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />}
            {loading ? "Processing Payload" : "Initiate Audit Protocol"}
          </button>
        </div>
      </div>
    </div>
  );
}
