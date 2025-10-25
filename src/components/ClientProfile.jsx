// ─────────────────────────────────────────────────────────────
// src/components/ClientProfile.jsx — Light-only, full feature
// OrcaTax Cloud: Client deep profile (tabs + charts + PDF + e-file mock)
// Requires: react, framer-motion, recharts, lucide-react, react-toastify, pdf-lib
// ─────────────────────────────────────────────────────────────

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import {
  FileText, Download, CheckCircle2, X, Send, Sparkles,
  TrendingUp, Brain, FileSignature, ChevronRight,
  PieChart as PieIcon, BarChart3, Calculator, Shield, Upload
} from "lucide-react";
import { toast } from "react-toastify";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// small atom
const Pill = ({children}) => (
  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 border">{children}</span>
);

// color pool for recharts cells (kept neutral; Recharts applies default stroke)
const COLORS = ["#38bdf8","#0ea5e9","#60a5fa","#34d399","#a78bfa","#f59e0b","#ef4444"];

/* -----------------------------------------------------------
   ClientProfile (main)
----------------------------------------------------------- */
export default function ClientProfile({ client, onStatusChange, onClose }) {
  const [tab, setTab] = useState("overview");

  const kpis = useMemo(() => {
    const { income, expenses } = client;
    const net = income - expenses;
    const effRate = Math.max(0, Math.min(37, Math.round((client.balanceDue ? client.balanceDue : 0) / Math.max(1, income) * 100)));
    return { net, effRate };
  }, [client]);

  const cashLine = useMemo(() => {
    const pts = [
      { name: "Income", value: client.income, expenses: 0 },
      { name: "Expenses", value: Math.max(client.income * 0.05, client.income * 0.02), expenses: client.expenses },
      { name: "Net", value: Math.max(0, client.income - client.expenses), expenses: 0 },
    ];
    return pts;
  }, [client]);

  const deductionMix = useMemo(() => ([
    { name: "Standard/Personal", value: 1 },
    { name: "Home Office", value: client.type !== "Individual" ? 1 : 0.5 },
    { name: "Health", value: 0.6 },
    { name: "Charity", value: 0.4 },
    { name: "Retirement", value: 0.8 },
  ].map((x,i)=>({ ...x, value: Math.max(0.15, x.value) }))), [client.type]);

  const riskBuckets = useMemo(() => ([
    { label: "Documentation", value: Math.round(client.riskScore * 0.35) },
    { label: "Income Coverage", value: Math.round(client.riskScore * 0.25) },
    { label: "Deductions", value: Math.round(client.riskScore * 0.20) },
    { label: "Local/State", value: Math.round(client.riskScore * 0.20) },
  ]), [client.riskScore]);

  function exportPDF() {
    (async () => {
      try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([612, 792]); // Letter portrait
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const drawText = (txt, x, y, size=12, f=font, color=rgb(0.08,0.1,0.16)) =>
          page.drawText(txt, { x, y, size, font: f, color });

        // Header
        drawText("OrcaTax Cloud — Client Summary", 48, 740, 16, bold, rgb(0.0,0.4,0.75));
        drawText(`${client.name} (${client.id})`, 48, 716, 12, bold);
        drawText(`${client.city}, ${client.state} • ${client.type} • ${client.filingStatus}`, 48, 698);

        // Divider
        page.drawLine({ start: {x:48, y:688}, end:{x:564, y:688}, thickness: 1, color: rgb(0.86,0.9,0.95) });

        // KPIs
        drawText("Financials", 48, 664, 13, bold);
        drawText(`Income: $${client.income.toLocaleString()}`, 48, 644);
        drawText(`Expenses: $${client.expenses.toLocaleString()}`, 48, 628);
        drawText(`Net: $${(client.income-client.expenses).toLocaleString()}`, 48, 612);

        drawText("Posture", 260, 664, 13, bold);
        drawText(`Status: ${client.status}`, 260, 644);
        if (client.refund) drawText(`Refund (est): $${client.refund.toLocaleString()}`, 260, 628);
        if (client.balanceDue) drawText(`Balance Due (est): $${client.balanceDue.toLocaleString()}`, 260, 612);

        drawText("Risk & Notes", 420, 664, 13, bold);
        drawText(`Risk Score: ${client.riskScore}`, 420, 644);
        drawText(`Last Filed: ${client.lastFiledYear}`, 420, 628);
        drawText(`Dependents: ${client.dependents}`, 420, 612);

        // Advisory bullets
        drawText("AI Advisory (demo):", 48, 580, 12, bold);
        const bullets = [
          "Verify income coverage (W-2/1099/K-1).",
          "Consider entity election and KY local obligations.",
          "Review estimated payments & credits.",
          "Two-person review prior to filing.",
        ];
        bullets.forEach((b, idx) => drawText(`• ${b}`, 60, 560 - (idx * 16)));

        // Footer
        drawText("Generated by OrcaTax Cloud (demo) — not tax advice.", 48, 64, 10, font, rgb(0.45,0.48,0.55));

        const bytes = await pdfDoc.save();
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `OrcaTax_${client.id}_${client.name.replace(/\s/g,"_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("📄 PDF exported");
      } catch (e) {
        console.error(e);
        toast.error("PDF export failed");
      }
    })();
  }

  return (
    <div className="rounded-2xl bg-white border shadow p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border flex items-center justify-center">
            <FileText className="w-6 h-6 text-sky-600"/>
          </div>
          <div>
            <div className="text-lg font-semibold flex items-center gap-2">
              {client.name} <span className="text-xs text-slate-400">({client.id})</span>
            </div>
            <div className="text-xs text-slate-500">{client.city}, {client.state} • {client.type} • {client.filingStatus}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportPDF} className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 flex items-center gap-1">
            <Download className="w-4 h-4"/> Export PDF
          </button>
          <EFileSubmitMock
            onFiled={() => {
              onStatusChange?.("Filed");
              toast.success("📨 E-file submitted (mock)");
            }}
          />
          {onClose && (
            <button onClick={onClose} className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50">Close</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        <TabBtn icon={<BarChart3 className="w-4 h-4" />} label="Overview" active={tab==="overview"} onClick={() => setTab("overview")} />
        <TabBtn icon={<Calculator className="w-4 h-4" />} label="Tax Analysis" active={tab==="tax"} onClick={() => setTab("tax")} />
        <TabBtn icon={<PieIcon className="w-4 h-4" />} label="Deductions" active={tab==="deductions"} onClick={() => setTab("deductions")} />
        <TabBtn icon={<TrendingUp className="w-4 h-4" />} label="Graphs" active={tab==="graphs"} onClick={() => setTab("graphs")} />
        <TabBtn icon={<Brain className="w-4 h-4" />} label="AI Advisor" active={tab==="advisor"} onClick={() => setTab("advisor")} />
        <TabBtn icon={<Shield className="w-4 h-4" />} label="Compliance" active={tab==="compliance"} onClick={() => setTab("compliance")} />
      </div>

      {/* Content */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: .2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              {/* Cash line */}
              <div className="rounded-2xl bg-white border p-4 shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Income / Expenses / Net</div>
                  <Pill>Snapshot</Pill>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cashLine}>
                      <XAxis dataKey="name"/>
                      <YAxis/>
                      <Tooltip/>
                      <Legend/>
                      <Line type="monotone" dataKey="value" name="Value" strokeWidth={3} dot />
                      <Line type="monotone" dataKey="expenses" name="Expenses" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Posture + KPI */}
              <div className="rounded-2xl bg-white border p-4 shadow">
                <div className="font-semibold mb-2">Posture</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border p-3 bg-gray-50">
                    <div className="text-xs text-slate-500">Refund (est)</div>
                    <div className="text-lg font-semibold text-emerald-700">${(client.refund || 0).toLocaleString()}</div>
                  </div>
                  <div className="rounded-xl border p-3 bg-gray-50">
                    <div className="text-xs text-slate-500">Balance Due (est)</div>
                    <div className="text-lg font-semibold text-rose-700">${(client.balanceDue || 0).toLocaleString()}</div>
                  </div>
                  <div className="rounded-xl border p-3 bg-gray-50">
                    <div className="text-xs text-slate-500">Net</div>
                    <div className="text-lg font-semibold">${kpis.net.toLocaleString()}</div>
                  </div>
                  <div className="rounded-xl border p-3 bg-gray-50">
                    <div className="text-xs text-slate-500">Effective Rate (mock)</div>
                    <div className="text-lg font-semibold">{kpis.effRate}%</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500">Demo estimates only.</div>
              </div>
            </motion.div>
          )}

          {tab === "tax" && (
            <motion.div
              key="tax"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: .2 }}
              className="space-y-4"
            >
              <div className="rounded-2xl bg-white border p-4 shadow">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <Calculator className="w-4 h-4"/> 1040 Breakdown (mock)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <KV label="Wages/Salary (W-2)" value={`$${Math.round(client.income*0.55).toLocaleString()}`} />
                  <KV label="Other Income (1099)" value={`$${Math.round(client.income*0.25).toLocaleString()}`} />
                  <KV label="Business (Sch C/K-1)" value={`$${Math.round(client.income*0.20).toLocaleString()}`} />
                  <KV label="Adjustments" value={`$${Math.round(client.income*0.06).toLocaleString()}`} />
                  <KV label="Deductions (std/itemized)" value={`$${Math.round(client.income*0.1).toLocaleString()}`} />
                  <KV label="Taxable Income" value={`$${Math.max(0, Math.round(client.income*0.64 - client.expenses*0.1)).toLocaleString()}`} />
                  <div className="md:col-span-3 rounded-xl border p-3 bg-gray-50 text-xs text-slate-600">
                    * This is a demo composition based on mock assumptions (not advice).
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white border p-4 shadow">
                <div className="font-semibold mb-2">KY & Lexington Notes</div>
                <ul className="list-disc ml-6 text-sm space-y-1">
                  <li>Verify KY state return requirements (individual or entity).</li>
                  <li>Check Lexington local business license/occupational tax if applicable.</li>
                  <li>Confirm quarterly estimates for business owners with variable income.</li>
                  <li>Maintain records for two-person review prior to filing.</li>
                </ul>
              </div>
            </motion.div>
          )}

          {tab === "deductions" && (
            <motion.div
              key="deductions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: .2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              <div className="rounded-2xl bg-white border p-4 shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Deduction Mix (mock)</div>
                  <Pill>Itemized vs Standard</Pill>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={deductionMix} dataKey="value" nameKey="name" outerRadius={90} innerRadius={40}>
                        {deductionMix.map((_,i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]} />))}
                      </Pie>
                      <Tooltip/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl bg-white border p-4 shadow">
                <div className="font-semibold mb-2">Top Deduction Opportunities (demo)</div>
                <ul className="text-sm space-y-2">
                  <li className="rounded-xl border p-3 bg-gray-50">
                    <strong>Retirement Contributions</strong> — Consider IRA/SEP/Solo 401(k).
                  </li>
                  <li className="rounded-xl border p-3 bg-gray-50">
                    <strong>Health (HSA/FSA)</strong> — Evaluate HSA eligibility and funding.
                  </li>
                  <li className="rounded-xl border p-3 bg-gray-50">
                    <strong>Charitable Giving</strong> — Bunching strategy to maximize impact.
                  </li>
                  <li className="rounded-xl border p-3 bg-gray-50">
                    <strong>Home Office</strong> — For LLC/S-Corp owners meeting requirements.
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {tab === "graphs" && (
            <motion.div
              key="graphs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: .2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              <div className="rounded-2xl bg-white border p-4 shadow">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <BarChart3 className="w-4 h-4"/> Risk Buckets
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskBuckets}>
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Score">
                        {riskBuckets.map((_, i) => (
                          <Cell key={i} fill={COLORS[i%COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl bg-white border p-4 shadow">
                <div className="font-semibold mb-2">Seasonality Forecast (mock)</div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={genSeason(client)}>
                      <XAxis dataKey="m" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="rev" name="Revenue" strokeWidth={3} dot={false}/>
                      <Line type="monotone" dataKey="work" name="Workload" strokeWidth={2} dot={false}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "advisor" && (
            <motion.div
              key="advisor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: .2 }}
              className="space-y-4"
            >
              <div className="rounded-2xl bg-white border p-4 shadow">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <Brain className="w-4 h-4"/> AI Recommendations (demo)
                </div>
                <ul className="list-disc ml-6 text-sm space-y-1">
                  <li>Send secure upload link; check for missing W-2 / 1099 / K-1.</li>
                  <li>Evaluate estimated tax payments for current year.</li>
                  <li>Consider entity planning and KY local compliance.</li>
                  <li>Schedule two-person review before submission.</li>
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 flex items-center gap-1">
                    <Sparkles className="w-4 h-4"/> Run TaxAgent (mock)
                  </button>
                  <button className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 flex items-center gap-1">
                    <Upload className="w-4 h-4"/> Request Docs
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white border p-4 shadow">
                <div className="font-semibold mb-2">Next Steps</div>
                <ol className="list-decimal ml-6 space-y-2 text-sm">
                  <li>Finalize income mapping (W-2/1099/K-1).</li>
                  <li>Confirm deductions and credits.</li>
                  <li>Lock review checklist and prepare engagement letter.</li>
                  <li>Collect e-signature and submit return.</li>
                </ol>
              </div>
            </motion.div>
          )}

          {tab === "compliance" && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: .2 }}
              className="space-y-4"
            >
              <div className="rounded-2xl bg-white border p-4 shadow">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <Shield className="w-4 h-4"/> Review Controls (mock)
                </div>
                <ul className="text-sm space-y-2">
                  <li className="rounded-xl border p-3 bg-gray-50">
                    <strong>ID Verification</strong> — Verified (KYC passed).
                  </li>
                  <li className="rounded-xl border p-3 bg-gray-50">
                    <strong>Two-Person Review</strong> — Scheduled.
                  </li>
                  <li className="rounded-xl border p-3 bg-gray-50">
                    <strong>Document Coverage</strong> — Income docs mapped.
                  </li>
                  <li className="rounded-xl border p-3 bg-gray-50">
                    <strong>Checklist</strong> — Locked on submit.
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   Subcomponents
----------------------------------------------------------- */

function TabBtn({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${
        active ? "bg-sky-600 text-white" : "bg-white hover:bg-slate-50"
      }`}
    >
      {icon}{label}
    </button>
  );
}

function KV({ label, value }) {
  return (
    <div className="rounded-xl border p-3 bg-white">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold mt-1">{value}</div>
    </div>
  );
}

/* -----------------------------------------------------------
   E-File Submit (Mock, inline)
----------------------------------------------------------- */
function EFileSubmitMock({ onFiled }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const steps = ["Validate", "Package", "Transmit", "Done"];

  function advance() {
    if (step < steps.length - 1) {
      const next = step + 1;
      setStep(next);
      if (next === steps.length - 1) {
        onFiled?.();
      }
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setStep(0); toast("Starting e-file (mock)…"); }}
        className="px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1"
      >
        <Send className="w-4 h-4"/> Submit 1040 (Mock)
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: .96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .96, y: 8 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              className="relative w-full max-w-xl bg-white rounded-2xl border shadow-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">E-File Submit (Mock)</div>
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm mb-3">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full border ${i <= step ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50"}`}>
                      {s}
                    </div>
                    {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200" />}
                  </div>
                ))}
              </div>

              <div className="rounded-xl border p-3 bg-gray-50 text-sm">
                {step === 0 && <div>Validating form set and attachments…</div>}
                {step === 1 && <div>Packaging e-file payload (XML, PDFs)…</div>}
                {step === 2 && <div>Transmitting to gateway (mock)…</div>}
                {step === 3 && (
                  <div className="text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4"/> Submitted — ACK pending.
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50" onClick={() => setOpen(false)}>Close</button>
                <button
                  onClick={() => {
                    if (step === 0) { toast.info("No errors found."); }
                    if (step === 2) { toast.success("Transmission complete."); }
                    advance();
                  }}
                  className="px-3 py-2 rounded-lg bg-black text-white hover:opacity-90 flex items-center gap-1"
                >
                  {step < steps.length - 1 ? <>Next <ChevronRight className="w-4 h-4" /></> : "Finish"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* -----------------------------------------------------------
   Helpers
----------------------------------------------------------- */
function genSeason(client) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months.map((m, i) => ({
    m,
    rev: Math.max(1000, 8000 + Math.sin(i/12*2*Math.PI)*5000 + i*450 + (client.riskScore%500)),
    work: Math.max(800,  7000 + Math.cos(i/12*2*Math.PI)*3500 + i*300 + (client.dependents*100)),
  }));
}
