// src/app/OrcaTaxApp.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Search, Users, FileText, Brain, Sparkles, TrendingUp, Download, Filter,
  Loader2, Settings as Cog, BarChart3, Calendar, Mail, CheckCircle2, X, Send,
  FileSignature, Plus, Paperclip, Clock, Sun, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ClientProfile from "../components/ClientProfile.jsx";

/* ─────────────────────────────────────────────────────────────
   ORCATAX CLOUD — CLICKABLE DEMO (no backend)
   React + Tailwind + Framer Motion + Recharts + Toastify
   ───────────────────────────────────────────────────────────── */

/* Glassy Toast CSS (inject once) */
const injectToastStyles = () => {
  if (document.getElementById("orcatax-toast-styles")) return;
  const style = document.createElement("style");
  style.id = "orcatax-toast-styles";
  style.innerHTML = `
  .Toastify__toast {
    background: rgba(255,255,255,0.78) !important;
    backdrop-filter: saturate(1.1) blur(6px);
    -webkit-backdrop-filter: saturate(1.1) blur(6px);
    color: #0f172a !important;
    border: 1px solid rgba(15,23,42,0.06);
    box-shadow: 0 8px 28px rgba(2,6,23,0.12);
    border-radius: 16px !important;
  }
  .Toastify__toast-container { pointer-events: none; }
  .Toastify__toast { pointer-events: all; }
  `;
  document.head.appendChild(style);
};

// Utilities / Mock data
const FIRST = ["Alex","Jordan","Taylor","Morgan","Riley","Casey","Cameron","Dakota","Jesse","Quinn","Peyton","Avery","Reese","Rowan","Sydney","Shawn","Logan","Skyler","Blake","Jamie"];
const LAST  = ["Smith","Johnson","Williams","Brown","Jones","Miller","Davis","Garcia","Rodriguez","Wilson","Martinez","Anderson","Taylor","Thomas","Hernandez","Moore","Martin","Jackson","Thompson","White"];
const TYPES = ["Individual","LLC","S-Corp","C-Corp","Partnership","Sole Prop"];
const STATUSES = ["Ready","In Progress","Waiting Docs","Filed","Review","Payment Due"];
const FILING = ["Single","Married Joint","Married Separate","Head of Household"];
function rng(seed){ let t = seed + 0x6d2b79f5; return ()=>{ t+=0x6d2b79f5; let r=Math.imul(t^(t>>>15),1|t); r^=r+Math.imul(r^(r>>>7),61|r); return ((r^(r>>>14))>>>0)/4294967296; }; }
const pick = (r, arr)=> arr[Math.floor(r()*arr.length)];
const round = (n,d=0)=>{const p=10**d; return Math.round(n*p)/p;};

function makeClients(count=740){
  const r = rng(2025);
  const rows=[];
  for(let i=1;i<=count;i++){
    const name = `${pick(r,FIRST)} ${pick(r,LAST)}`;
    const type = pick(r,TYPES);
    const filingStatus = pick(r,FILING);
    const income = Math.floor(35000 + r()*185000);
    const expenses = Math.floor(income*(0.08 + r()*0.25));
    const dependents = Math.floor(r()*4);
    const lastFiledYear = 2021 + Math.floor(r()*4);
    const status = pick(r,STATUSES);
    const refund = Math.random()<0.5 ? round(r()*4500,2) : 0;
    const balanceDue = refund ? 0 : round(r()*3500,2);
    const riskScore = Math.floor(r()*100);
    const id = `C${String(i).padStart(4,"0")}`;
    rows.push({
      id, name, type, filingStatus, income, expenses, dependents,
      lastFiledYear, status, refund, balanceDue, riskScore,
      city:"Lexington", state:"KY",
      email: `${name.toLowerCase().replace(/\s/g,'.')}@example.com`,
      phone: `859-${Math.floor(200+r()*700)}-${String(Math.floor(r()*10000)).padStart(4,'0')}`
    });
  }
  return rows;
}

function summarizeClient(c){
  const net = c.income - c.expenses;
  const direction = c.refund ? "refund" : c.balanceDue ? "balance due" : "neutral";
  const estimate = c.refund ? `$${c.refund.toLocaleString()}` : c.balanceDue ? `$${c.balanceDue.toLocaleString()}` : "$0";
  const risk = c.riskScore > 75 ? "High" : c.riskScore > 45 ? "Medium" : "Low";
  return {
    bullets: [
      `Projected net income: $${net.toLocaleString()}`,
      `Filing status: ${c.filingStatus} (${c.type})`,
      `Current posture: ${direction} ${estimate}`,
      `Risk indicators: ${risk} (${c.riskScore})`,
      `Docs outstanding: ${c.status === 'Waiting Docs' ? 'Yes' : 'No'}`,
    ],
    actions: [
      c.status === 'Waiting Docs' ? 'Send secure doc request' : 'Run final review check',
      net < 0 ? 'Consider NOL carryforward/carryback options' : 'Review estimated tax payments',
      c.type !== 'Individual' ? 'Verify KY local business obligations & registrations' : 'Confirm KY W-2/1099 completeness',
    ],
  };
}

const Pill = ({children}) => <span className="px-2 py-1 rounded-full text-xs bg-gray-100 border">{children}</span>;
function Badge({tone="gray", children}){
  const tones = {
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    green:"bg-emerald-50 text-emerald-700 border-emerald-200",
    yellow:"bg-amber-50 text-amber-700 border-amber-200",
    red:"bg-rose-50 text-rose-700 border-rose-200",
    blue:"bg-sky-50 text-sky-700 border-sky-200",
  };
  return <span className={`px-2 py-1 text-xs rounded-full border ${tones[tone]}`}>{children}</span>;
}
function StatCard({ icon:Icon, label, value, sub }){
  return (
    <motion.div
      initial={{opacity:0, y:6}}
      animate={{opacity:1, y:0}}
      transition={{duration:.25}}
      className="rounded-2xl bg-white shadow p-4 border border-gray-100 flex items-center gap-4"
    >
      <div className="p-3 rounded-xl bg-gray-50 border">{Icon && <Icon className="w-6 h-6"/>}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN APP — OrcaTax Cloud (fullscreen ClientProfile overlay)
   ───────────────────────────────────────────────────────────── */
export default function OrcaTaxApp(){
  const [allClients, setAllClients] = useState(() => makeClients(740));
  const [tab, setTab] = useState("dashboard");
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [agentBusy, setAgentBusy] = useState(false);
  const [agentLog, setAgentLog] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("orcatax-theme") || "light");

  // Force Light mode globally
useEffect(() => {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('orcatax-theme', 'light');
}, []);


  // toast CSS once
  useEffect(() => { injectToastStyles(); }, []);

  const filtered = useMemo(()=> {
    return allClients.filter(c=>{
      const matchesQ = !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.id.toLowerCase().includes(q.toLowerCase());
      const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchesQ && matchesType && matchesStatus;
    });
  }, [allClients, q, typeFilter, statusFilter]);

  const kpis = useMemo(()=> {
    const total = allClients.length;
    const filed = allClients.filter(c=>c.status==='Filed').length;
    const waiting = allClients.filter(c=>c.status==='Waiting Docs').length;
    const avgRefund = round(allClients.reduce((s,c)=>s+(c.refund||0),0)/total,2);
    return { total, filed, waiting, avgRefund };
  }, [allClients]);

  const filingsByStatus = useMemo(()=>{
    const map={}; STATUSES.forEach(s=>map[s]=0);
    allClients.forEach(c=>{ map[c.status]=(map[c.status]||0)+1; });
    return Object.entries(map).map(([name,value])=>({ name, value }));
  }, [allClients]);

  const revenueProjection = useMemo(()=>{
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months.map((m,i)=>({
      month:m,
      individualRevenue: 18000 + Math.sin(i/12*2*Math.PI)*8000 + i*900,
      businessRevenue:   12000 + Math.cos(i/12*2*Math.PI)*7000 + i*1100,
    }));
  }, []);

  function runAgent(c){
    setAgentBusy(true);
    setAgentLog([
      `Analyzing ${c.name} (${c.id})…`,
      "Gathering prior-year signals…",
      "Scanning docs & 1099/W-2 completeness…",
      "Checking KY local obligations…",
      "Evaluating deductions & credits…",
      "Projecting refund/balance range…",
    ]);
    toast("🤖 Running TaxAgent…");
    setTimeout(()=>{
      setAgentLog(log=>[...log,"Recommended actions prepared."]);
      setAgentBusy(false);
      toast.success("✅ AI analysis complete");
    }, 800);
  }

  function openClientProfile(c){
    setSelected(c);
    setShowProfile(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 dark:from-slate-950 dark:to-slate-950 dark:text-slate-100">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-slate-900/70 border-b dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600"/> OrcaTax <span className="text-slate-400 font-normal">Cloud</span>
          </div>
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search clients by name or ID…" className="w-full pl-9 pr-3 py-2 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring focus:ring-slate-200 dark:focus:ring-slate-800"/>
          </div>
          <div className="flex gap-2">
            <motion.button whileTap={{scale:.97}} onClick={()=>setTab("dashboard")} className={`px-3 py-2 rounded-lg border ${tab==='dashboard'?'bg-sky-600 text-white':'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><BarChart3 className="inline w-4 h-4 mr-1"/>Dashboard</motion.button>
            <motion.button whileTap={{scale:.97}} onClick={()=>setTab("clients")} className={`px-3 py-2 rounded-lg border ${tab==='clients'?'bg-sky-600 text-white':'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Users className="inline w-4 h-4 mr-1"/>Clients</motion.button>
            <motion.button whileTap={{scale:.97}} onClick={()=>setTab("reports")} className={`px-3 py-2 rounded-lg border ${tab==='reports'?'bg-sky-600 text-white':'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><FileText className="inline w-4 h-4 mr-1"/>Reports</motion.button>
            <motion.button whileTap={{scale:.97}} onClick={()=>setTab("settings")} className={`px-3 py-2 rounded-lg border ${tab==='settings'?'bg-sky-600 text-white':'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Cog className="inline w-4 h-4 mr-1"/>Settings</motion.button>
            <button
              onClick={() => setTheme(t => t==="dark" ? "light" : "dark")}
              className="px-3 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Clients" value={kpis.total} sub="Active in 2025 season"/>
              <StatCard icon={FileText} label="Filed YTD" value={allClients.filter(c=>c.status==='Filed').length} sub="Successful submissions"/>
              <StatCard icon={Calendar} label="Waiting Docs" value={kpis.waiting} sub="Chasing documents"/>
              <StatCard icon={TrendingUp} label="Avg Refund (demo)" value={`$${kpis.avgRefund.toLocaleString()}`} sub="Not financial advice"/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="col-span-1 lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 p-4 border dark:border-slate-800 shadow">
                <div className="flex items-center justify-between mb-2"><div className="font-semibold">Revenue Forecast (demo)</div><Pill>Individuals vs Business</Pill></div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueProjection} margin={{left:8,right:8,top:8,bottom:8}}>
                      <XAxis dataKey="month"/><YAxis/><Tooltip/><Legend/>
                      <Line type="monotone" dataKey="individualRevenue" strokeWidth={3} dot={false} name="Individual" />
                      <Line type="monotone" dataKey="businessRevenue"   strokeWidth={3} dot={false} name="Business" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="rounded-2xl bg-white dark:bg-slate-900 p-4 border dark:border-slate-800 shadow">
                <div className="flex items-center justify-between mb-2"><div className="font-semibold">Filings by Status</div><Pill>{allClients.length}</Pill></div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={filingsByStatus} dataKey="value" nameKey="name" outerRadius={90}>
                        {filingsByStatus.map((_,i)=>(<Cell key={i}/>))}
                      </Pie>
                      <Tooltip/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {filingsByStatus.map(s=> (<Badge key={s.name}>{s.name}: {s.value}</Badge>))}
                </div>
              </motion.div>
            </div>
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="rounded-2xl bg-gradient-to-br from-indigo-50/60 to-sky-50/60 dark:from-slate-900/40 dark:to-slate-900/20 p-5 border dark:border-slate-800">
              <div className="flex items-center gap-2 font-semibold"><Brain className="w-5 h-5"/> AI Practice Guidance (demo)</div>
              <ul className="list-disc ml-6 text-slate-700 dark:text-slate-300 mt-2 space-y-1 text-sm">
                <li>Nudge all <strong>Waiting Docs</strong> clients with a secure upload link.</li>
                <li>Flag high-risk profiles for a <em>Two-Person Review</em> step.</li>
                <li>Offer mid-season tax planning to business clients with volatile net income.</li>
              </ul>
            </motion.div>
          </div>
        )}

        {tab === 'clients' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 border dark:border-slate-800 rounded-xl p-2 bg-white dark:bg-slate-900">
                    <Filter className="w-4 h-4"/>
                    <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="outline-none bg-transparent">
                      <option value="ALL">All Types</option>
                      {TYPES.map(t=> <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="w-px h-5 bg-gray-200 dark:bg-slate-700"/>
                    <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="outline-none bg-transparent">
                      <option value="ALL">All Statuses</option>
                      {STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <motion.button whileTap={{scale:.97}} onClick={()=>{setTypeFilter("ALL"); setStatusFilter("ALL");}} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">Reset</motion.button>
                </div>
                <motion.button whileTap={{scale:.97}} onClick={()=> setShowAdd(true)} className="px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1">
                  <Plus className="w-4 h-4"/> Add Client
                </motion.button>
              </div>

              <div className="rounded-2xl overflow-hidden border dark:border-slate-800 bg-white dark:bg-slate-900">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="text-left p-3">Client</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-right p-3">Net</th>
                      <th className="text-right p-3">Posture</th>
                      <th className="text-right p-3">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 25).map(c => (
                      <tr key={c.id} className="border-t dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" onClick={()=> openClientProfile(c)}>
                        <td className="p-3">
                          <div className="font-medium">{c.name} <span className="text-xs text-slate-400">({c.id})</span></div>
                          <div className="text-xs text-slate-500">{c.city}, {c.state} • {c.email}</div>
                        </td>
                        <td className="p-3">{c.type}</td>
                        <td className="p-3"><Badge tone={c.status==='Filed'?'green':c.status==='Waiting Docs'?'yellow':c.status==='Payment Due'?'red':'blue'}>{c.status}</Badge></td>
                        <td className="p-3 text-right">${(c.income-c.expenses).toLocaleString()}</td>
                        <td className="p-3 text-right">{c.refund? <span className="text-emerald-600">Refund {c.refund.toLocaleString()}</span> : c.balanceDue? <span className="text-rose-600">Due {c.balanceDue.toLocaleString()}</span> : '-'}</td>
                        <td className="p-3 text-right">{c.riskScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-3 text-xs text-slate-500">Showing 25 of {filtered.length} • Use search and filters to refine.</div>
              </div>
            </div>

            {/* Right — Helper cards */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border dark:border-slate-800">
                <div className="font-semibold mb-2">Bulk Actions</div>
                <div className="flex flex-wrap gap-2">
                  <motion.button whileTap={{scale:.97}} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"><Mail className="inline w-4 h-4 mr-1"/> Send Doc Request</motion.button>
                  <motion.button whileTap={{scale:.97}} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"><Download className="inline w-4 h-4 mr-1"/> Export CSV</motion.button>
                  <motion.button whileTap={{scale:.97}} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"><FileText className="inline w-4 h-4 mr-1"/> Engagement Letters</motion.button>
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 border dark:border-slate-800">
                <div className="font-semibold mb-2">Tips</div>
                <ul className="text-sm list-disc ml-5 space-y-1">
                  <li>Use filters to slice by entity type and status.</li>
                  <li>Click a client to open the full profile screen.</li>
                  <li>Use Return Builder for structured intake + validation.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === 'reports' && <ReportsView clients={allClients}/>}

        {tab === 'settings' && <SettingsView/>}
      </div>

      {/* ADD CLIENT MODAL */}
      <AnimatePresence>
        {showAdd && (
          <Modal onClose={()=>setShowAdd(false)} title="Add New Client (mock)">
            <AddClientModal
              onClose={()=>setShowAdd(false)}
              setAllClients={setAllClients}
              onCreated={(c)=> { setSelected(c); setShowProfile(true); toast.success("✅ New client added"); }}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* FULLSCREEN CLIENT PROFILE OVERLAY */}
      <AnimatePresence>
        {showProfile && selected && (
          <motion.div
            key="profile-overlay"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="fixed inset-0 z-40 bg-white dark:bg-slate-950 overflow-y-auto"
          >
            {/* Top bar inside overlay */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="font-semibold">Client Profile</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowProfile(false)}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    ← Back to Clients
                  </button>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-4">
              <ClientDetail
                client={selected}
                onRunAgent={()=>runAgent(selected)}
                busy={agentBusy}
                log={agentLog}
                onStatusChange={(newStatus)=>{
                  setAllClients(prev => prev.map(p => p.id===selected.id ? {...p, status:newStatus} : p));
                  setSelected(s => s ? {...s, status:newStatus} : s);
                  toast.info(`🔄 Status → ${newStatus}`);
                }}
              />

              {/* Deep profile (full feature tabs + PDF + e-file) */}
              <div className="mt-6">
                <ClientProfile
                  client={selected}
                  onStatusChange={(newStatus)=>{
                    setAllClients(prev => prev.map(p => p.id===selected.id ? {...p, status:newStatus} : p));
                    setSelected(s => s ? {...s, status:newStatus} : s);
                    toast.info(`🔄 Status → ${newStatus}`);
                  }}
                  onClose={()=> setShowProfile(false)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        closeOnClick
        draggable={false}
        newestOnTop
        hideProgressBar
        closeButton={false}
        theme={theme === "dark" ? "dark" : "light"}
        transition={Slide}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Client detail card (lightweight) — appears above full profile
   ───────────────────────────────────────────────────────────── */
function ClientDetail({ client:c, onRunAgent, busy, log, onStatusChange }){
  const ai = useMemo(()=> summarizeClient(c), [c]);
  const [showSign, setShowSign] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [docs, setDocs] = useState([]);
  const [timeline, setTimeline] = useState([]);

  function addTimeline(entry){
    setTimeline(prev => [{ ts: new Date(), text: entry }, ...prev.slice(0,49)]);
  }

  useEffect(()=>{
    if(docs.length===0) return;
    const last = docs[docs.length-1];
    addTimeline(`📤 ${last.source} uploaded ${last.name}`);
    setTimeout(()=>{
      toast.info(`🤖 Detected: ${inferDocType(last.name)}`);
    }, 450);
  }, [docs]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{c.name} <span className="text-xs text-slate-400">({c.id})</span></div>
          <div className="text-xs text-slate-500">{c.city}, {c.state} • {c.type} • {c.filingStatus}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={c.status==='Filed'?'green':c.status==='Waiting Docs'?'yellow':c.status==='Payment Due'?'red':'blue'}>{c.status}</Badge>
          <Pill>Risk {c.riskScore}</Pill>
        </div>
      </div>

      {/* Snapshots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border dark:border-slate-800 p-3 bg-gray-50 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 mb-1">Financial snapshot</div>
          <div className="text-sm">Income: <strong>${c.income.toLocaleString()}</strong></div>
          <div className="text-sm">Expenses: <strong>${c.expenses.toLocaleString()}</strong></div>
          <div className="text-sm">Net: <strong>${(c.income-c.expenses).toLocaleString()}</strong></div>
          <div className="text-xs text-slate-400 mt-1">Last filed year: {c.lastFiledYear}</div>
        </div>
        <div className="rounded-xl border dark:border-slate-800 p-3 bg-gray-50 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 mb-1">Posture</div>
          <div className="text-sm">{c.refund? <span className="text-emerald-700">Refund ${c.refund.toLocaleString()}</span> : c.balanceDue? <span className="text-rose-700">Balance Due ${c.balanceDue.toLocaleString()}</span> : 'Neutral'}</div>
          <div className="text-xs text-slate-400">Status: {c.status}</div>
        </div>
        <div className="rounded-xl border dark:border-slate-800 p-3 bg-gray-50 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 mb-1">KY / Lexington notes</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">Confirm state & local obligations (state return, local business filings, occupational taxes/fees). Validate registrations and due dates.</div>
        </div>
      </div>

      {/* AI insights */}
      <div className="rounded-xl border dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 font-semibold mb-2"><Sparkles className="w-4 h-4 text-sky-600"/> AI Insights (demo)</div>
        <ul className="list-disc ml-6 text-sm space-y-1">
          {ai.bullets.map((b,i)=>(<li key={i}>{b}</li>))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          {ai.actions.map((a,i)=>(<motion.button whileTap={{scale:.98}} key={i} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">{a}</motion.button>))}
          <motion.button whileTap={{scale:.98}} onClick={onRunAgent} className="px-3 py-2 rounded-lg border bg-black text-white hover:opacity-90 flex items-center gap-2">{busy? <Loader2 className="w-4 h-4 animate-spin"/>:<Brain className="w-4 h-4"/>} Run TaxAgent</motion.button>
        </div>
        {log?.length>0 && (
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            {log.map((l,i)=>(<div key={i}>• {l}</div>))}
          </div>
        )}
      </div>

      {/* Actions & Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
          <div className="font-semibold mb-2">Actions</div>
          <div className="flex flex-wrap gap-2">
            <motion.button whileTap={{scale:.98}} onClick={()=>{ toast("🧾 Return Builder started"); setShowWizard(true); }} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">Start Return</motion.button>
            <motion.button whileTap={{scale:.98}} onClick={()=>{ setShowSign(true); toast("✍️ eSign initiated"); }} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"><FileSignature className="w-4 h-4"/> eSign Engagement</motion.button>
            <motion.button whileTap={{scale:.98}} onClick={()=>{ toast.info("🔗 Secure upload link sent"); }} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">Secure Upload Link</motion.button>
            <motion.button whileTap={{scale:.98}} onClick={()=>{ toast("📚 Form set generated (mock)"); }} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">Generate KY/IRS Form Set (mock)</motion.button>
          </div>
        </div>

        <div className="rounded-xl border dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
          <div className="font-semibold mb-2">Checklist</div>
          <ul className="text-sm space-y-1 list-disc ml-6">
            <li>ID verification complete</li>
            <li>Income coverage (W-2/1099/K-1) reviewed</li>
            <li>Deductions & credits mapped</li>
            <li>Local filings validated</li>
            <li>Two-person review scheduled</li>
          </ul>
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-xl border dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
        <div className="font-semibold mb-2">Documents (mock)</div>
        <div className="flex flex-wrap gap-2 mb-3">
          <motion.button
            whileTap={{scale:.98}}
            onClick={()=>{
              setDocs(d => [...d, {name:`W2_${c.name.replace(/\s/g,'')}_2024.pdf`, source:"Client"}]);
              toast.info("📄 Client uploaded W-2 (simulated)");
            }}
            className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Simulate Client Upload
          </motion.button>

          <label className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2">
            <Paperclip className="w-4 h-4"/> Upload (Advisor)
            <input type="file" className="hidden" onChange={e=>{
              const file = e.target.files?.[0];
              if(file) {
                setDocs(d => [...d, {name:file.name, source:"Advisor"}]);
                toast("📎 Uploaded (advisor)");
              }
              e.target.value = "";
            }}/>
          </label>

          <motion.button
            whileTap={{scale:.98}}
            onClick={()=>{
              if(docs.length===0){ toast("No docs to analyze"); return; }
              toast("🤖 TaxAgent validating…");
              setTimeout(()=> toast.success("✅ Validation complete — no anomalies"), 700);
            }}
            className="px-3 py-2 rounded-lg border bg-black text-white hover:opacity-90"
          >
            Run AI Doc Check
          </motion.button>
        </div>

        <ul className="text-xs space-y-1">
          {docs.length===0 && <li className="text-slate-500">No documents yet.</li>}
          {docs.map((d,i)=>(
            <li key={i}>📄 {d.name} — Uploaded by {d.source} — {new Date().toLocaleDateString()}</li>
          ))}
        </ul>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl border dark:border-slate-800 p-3 bg-gray-50 dark:bg-slate-900/40">
        <div className="font-semibold mb-2">Activity Timeline</div>
        <ul className="text-xs space-y-1">
          {timeline.length===0 && <li className="text-slate-500">No recent activity.</li>}
          {timeline.map((t,i)=>(
            <li key={i} className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-slate-400"/>
              <span className="text-slate-500">{formatTS(t.ts)} —</span>
              <span>{t.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSign && (
          <Modal onClose={()=>setShowSign(false)} title="Engagement eSign (mock)">
            <ESignFlow
              onClose={()=>setShowSign(false)}
              client={c}
              onDone={()=> { onStatusChange("Review"); toast.success("✍️ eSign completed"); }}
            />
          </Modal>
        )}
        {showWizard && (
          <Modal onClose={()=>setShowWizard(false)} title="Return Builder (demo)">
            <ReturnWizard
              onClose={()=>{ setShowWizard(false); onStatusChange("Review"); toast.success("🧾 Return complete (demo)"); }}
              client={c}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Helpers local to ClientDetail */
function inferDocType(filename){
  const f = filename.toLowerCase();
  if(f.includes("w2")) return "W-2 (Wage & Tax Statement)";
  if(f.includes("1099")) return "1099 (Income Statement)";
  if(f.includes("k1")) return "K-1 (Schedule K-1)";
  if(f.endsWith(".pdf")) return "PDF document";
  if(f.endsWith(".jpg") || f.endsWith(".png")) return "Image document";
  return "Document";
}
function formatTS(d){
  const dt = (d instanceof Date) ? d : new Date(d);
  const pad = (n)=>String(n).padStart(2,'0');
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

/* ─────────────────────────────────────────────────────────────
   Generic Modal
   ───────────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }){
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div initial={{opacity:0, scale:.96, y:8}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:.96, y:8}} transition={{type:'spring', stiffness:240, damping:22}} className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4"/></button>
        </div>
        <div>{children}</div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   eSign flow
   ───────────────────────────────────────────────────────────── */
function ESignFlow({ client, onClose, onDone }){
  const [step, setStep] = useState(0);
  const steps = ["Draft","Sent","Signed","Archived"];
  function advance(){
    if(step < steps.length-1){
      const next = step+1;
      setStep(next);
      if(next === steps.length-1){ onDone && onDone(); }
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        {steps.map((s,i)=>(
          <div key={s} className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-full border ${i<=step? 'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>{s}</div>
            {i<steps.length-1 && <div className="w-8 h-px bg-gray-200 dark:bg-slate-700"/>}
          </div>
        ))}
      </div>
      <div className="rounded-xl border dark:border-slate-800 p-3 bg-gray-50 dark:bg-slate-900/40 text-sm">
        <div><strong>Client:</strong> {client.name} ({client.id})</div>
        <div><strong>Email:</strong> {client.email}</div>
        <div><strong>Engagement:</strong> 2025 Tax Preparation & Advisory</div>
      </div>
      <div className="flex gap-2">
        {step===0 && <motion.button whileTap={{scale:.98}} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={advance}><Send className="inline w-4 h-4 mr-1"/> Send for Signature</motion.button>}
        {step===1 && <motion.button whileTap={{scale:.98}} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={advance}><CheckCircle2 className="inline w-4 h-4 mr-1"/> Mark as Signed</motion.button>}
        {step===2 && <motion.button whileTap={{scale:.98}} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={advance}>Archive</motion.button>}
        <motion.button whileTap={{scale:.98}} className="px-3 py-2 rounded-lg border" onClick={onClose}>Close</motion.button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Return Builder wizard
   ───────────────────────────────────────────────────────────── */
function ReturnWizard({ client, onClose }){
  const [i, setI] = useState(0);
  const [data, setData] = useState({ idVerified:false, docs:{w2:false,_1099:false,k1:false}, dependents: client.dependents, deductions:"standard" });
  const steps = ["Identity","Income","Deductions","Review"];

  function next(){
    if(i===0 && !data.idVerified) return alert('ID verification required');
    if(i===1 && !(data.docs.w2 || data.docs._1099 || data.docs.k1)) return alert('Upload at least one income document');
    const ni = Math.min(i+1, steps.length-1);
    setI(ni);
  }
  function prev(){
    const pi = Math.max(i-1, 0);
    setI(pi);
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center gap-2">
        {steps.map((s,idx)=>(
          <div key={s} className={`px-2 py-1 rounded-full border ${idx<=i? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-slate-800/40 dark:text-sky-300 dark:border-slate-700':'bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>{idx+1}. {s}</div>
        ))}
      </div>

      {i===0 && (
        <div className="rounded-xl border dark:border-slate-800 p-3 bg-gray-50 dark:bg-slate-900/40">
          <div className="font-medium mb-2">Identity</div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={data.idVerified} onChange={e=>setData({...data, idVerified:e.target.checked})}/> ID verified (KYC)</label>
        </div>
      )}

      {i===1 && (
        <div className="rounded-xl border dark:border-slate-800 p-3 bg-gray-50 dark:bg-slate-900/40 space-y-2">
          <div className="font-medium">Income Documents</div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={data.docs.w2} onChange={e=>setData({...data, docs:{...data.docs, w2:e.target.checked}})}/> W-2</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={data.docs._1099} onChange={e=>setData({...data, docs:{...data.docs, _1099:e.target.checked}})}/> 1099</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={data.docs.k1} onChange={e=>setData({...data, docs:{...data.docs, k1:e.target.checked}})}/> K-1</label>
        </div>
      )}

      {i===2 && (
        <div className="rounded-xl border dark:border-slate-800 p-3 bg-gray-50 dark:bg-slate-900/40 space-y-2">
          <div className="font-medium">Deductions</div>
          <select value={data.deductions} onChange={e=>setData({...data, deductions:e.target.value})} className="border rounded p-2 dark:bg-slate-900 dark:border-slate-700">
            <option value="standard">Standard deduction</option>
            <option value="itemized">Itemized deduction (mock)</option>
          </select>
        </div>
      )}

      {i===3 && (
        <div className="rounded-xl border dark:border-slate-800 p-3 bg-gray-50 dark:bg-slate-900/40">
          <div className="font-medium mb-1">Review</div>
          <div>Dependents: {data.dependents}</div>
          <div>Docs: {Object.entries(data.docs).filter(([k,v])=>v).map(([k])=>k.toUpperCase()).join(', ')||'None'}</div>
          <div>Deductions: {data.deductions}</div>
          <div className="mt-2 text-xs text-slate-500">On submit, system would assemble forms set and lock checklist.</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <motion.button whileTap={{scale:.98}} onClick={prev} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800" disabled={i===0}>Back</motion.button>
        <div className="flex gap-2">
          {i<steps.length-1 ? (
            <motion.button whileTap={{scale:.98}} onClick={next} className="px-3 py-2 rounded-lg border bg-black text-white">Next</motion.button>
          ) : (
            <motion.button whileTap={{scale:.98}} onClick={onClose} className="px-3 py-2 rounded-lg border bg-emerald-600 text-white">Finish</motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Reports
   ───────────────────────────────────────────────────────────── */
function ReportsView({ clients }){
  const [kind, setKind] = useState("Workload by Status");
  const rows = useMemo(()=>{
    if(kind === 'Workload by Status'){
      const map={}; STATUSES.forEach(s=>map[s]=0); clients.forEach(c=>map[c.status]++);
      return Object.entries(map).map(([label,value])=>({label, value}));
    }
    if(kind === 'High Risk Clients'){
      return clients.filter(c=>c.riskScore>=75).map(c=>({label:`${c.name} (${c.id})`, value:c.riskScore}));
    }
    if(kind === 'Refund vs Balance Mix'){
      const refund = clients.filter(c=>c.refund>0).length;
      const due = clients.filter(c=>c.balanceDue>0).length;
      const neutral = clients.length - refund - due;
      return [{label:'Refund', value:refund},{label:'Balance Due', value:due},{label:'Neutral', value:neutral}]
    }
    return [];
  }, [clients, kind]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 p-4 flex items-center justify-between">
        <div className="font-semibold">Reports</div>
        <div className="flex items-center gap-2">
          <select value={kind} onChange={e=>setKind(e.target.value)} className="border rounded-lg p-2 dark:bg-slate-900 dark:border-slate-700">
            <option>Workload by Status</option>
            <option>High Risk Clients</option>
            <option>Refund vs Balance Mix</option>
          </select>
          <motion.button whileTap={{scale:.98}} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"><Download className="inline w-4 h-4 mr-1"/> Export</motion.button>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rows} dataKey="value" nameKey="label" outerRadius={90}>
                  {rows.map((_,i)=>(<Cell key={i}/>))}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="font-semibold mb-2">{kind}</div>
            <div className="space-y-1 text-sm">
              {rows.map(r=> (<div key={r.label} className="flex items-center justify-between border-b dark:border-slate-800 py-1"><span>{r.label}</span><span className="font-medium">{r.value}</span></div>))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Settings
   ───────────────────────────────────────────────────────────── */
function SettingsView(){
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 p-4">
        <div className="font-semibold mb-2">Integrations (placeholders)</div>
        <ul className="text-sm space-y-1 list-disc ml-6">
          <li>e-Signature (e.g., DocuSign/Adobe)</li>
          <li>Secure Storage (e.g., Supabase/S3/Drive)</li>
          <li>Payments (e.g., Stripe)</li>
          <li>Messaging (email/SMS)</li>
          <li>E-file gateways (federal/state/local)</li>
        </ul>
      </div>
      <div className="rounded-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 p-4">
        <div className="font-semibold mb-2">AI & Automations (demo)</div>
        <ul className="text-sm space-y-1 list-disc ml-6">
          <li>Auto-classify incoming docs and map to return sections</li>
          <li>Predict workload spikes & staffing needs</li>
          <li>Advisory playbooks: S-Corp salary, quarterly estimates, entity selection</li>
          <li>Risk controls: two-person review, anomaly detection</li>
        </ul>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Add Client Modal
   ───────────────────────────────────────────────────────────── */
function AddClientModal({ setAllClients, onClose, onCreated }){
  const [form, setForm] = useState({
    name: "",
    type: "Individual",
    filingStatus: "Single",
    email: "",
    phone: "",
  });

  function save() {
    if (!form.name) return alert("Client name required");
    const newClient = {
      id: "C" + String(Math.floor(Math.random()*10000)).padStart(4,"0"),
      ...form,
      income: 0, expenses: 0, dependents: 0,
      lastFiledYear: 2024, status: "Ready", refund: 0, balanceDue: 0, riskScore: 0,
      city: "Lexington", state: "KY"
    };
    setAllClients(prev => [newClient, ...prev]);
    onCreated && onCreated(newClient);
    onClose();
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input placeholder="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="border rounded p-2 dark:bg-slate-900 dark:border-slate-700"/>
        <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="border rounded p-2 dark:bg-slate-900 dark:border-slate-700">
          {TYPES.map(t=><option key={t}>{t}</option>)}
        </select>
        <select value={form.filingStatus} onChange={e=>setForm({...form,filingStatus:e.target.value})} className="border rounded p-2 dark:bg-slate-900 dark:border-slate-700">
          {FILING.map(f=><option key={f}>{f}</option>)}
        </select>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="border rounded p-2 dark:bg-slate-900 dark:border-slate-700"/>
        <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="border rounded p-2 dark:bg-slate-900 dark:border-slate-700"/>
      </div>
      <div className="flex items-center gap-2">
        <motion.button whileTap={{scale:.98}} onClick={save} className="px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700">Save Client</motion.button>
        <motion.button whileTap={{scale:.98}} onClick={onClose} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</motion.button>
      </div>
    </div>
  );
}
