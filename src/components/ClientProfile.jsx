// src/components/ClientProfile.jsx
import React, { useState, useMemo } from "react";
import {
  ArrowLeft, BarChart3, PieChart as PieIcon, TrendingUp, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from "recharts";
import { toast } from "react-toastify";

export default function ClientProfile({ client, onClose }) {
  const [tab, setTab] = useState("overview");

  const taxData = useMemo(() => calculateTaxProfile(client), [client]);
  const forecastData = useMemo(() => forecastRefunds(client), [client]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white overflow-y-auto"
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white/70 backdrop-blur border-b pb-2">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-3 py-2 rounded-lg border bg-slate-50 hover:bg-slate-100 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </motion.button>
            <div>
              <div className="text-xl font-semibold">
                {client.name}{" "}
                <span className="text-xs text-slate-400">({client.id})</span>
              </div>
              <div className="text-sm text-slate-500">
                {client.type} • {client.city}, {client.state}
              </div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              toast("📄 Exporting 1040 Preview (mock)");
              setTimeout(() => toast.success("✅ 1040 Preview Generated"), 800);
            }}
            className="px-3 py-2 rounded-lg border bg-black text-white hover:opacity-90 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Export 1040
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["overview", "tax", "deductions", "forecast"].map((t) => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTab(t)}
              className={`px-3 py-2 rounded-lg border ${
                tab === t ? "bg-sky-600 text-white" : "bg-white hover:bg-slate-50"
              }`}
            >
              {t === "overview" && <BarChart3 className="inline w-4 h-4 mr-1" />}
              {t === "tax" && <PieIcon className="inline w-4 h-4 mr-1" />}
              {t === "deductions" && <span className="inline-block w-4 h-4 mr-1">💡</span>}
              {t === "forecast" && <TrendingUp className="inline w-4 h-4 mr-1" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="rounded-2xl border p-4 bg-white">
                <div className="font-semibold mb-2">Income vs Expenses</div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={buildIncomeExpense(client)}>
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="Income" stroke="#0ea5e9" />
                    <Line type="monotone" dataKey="Expenses" stroke="#f97316" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border p-4 bg-white">
                <div className="font-semibold mb-2">Profile Summary</div>
                <ul className="text-sm space-y-1">
                  <li>Filing Status: {client.filingStatus}</li>
                  <li>Dependents: {client.dependents}</li>
                  <li>Risk Score: {client.riskScore}</li>
                  <li>Last Filed: {client.lastFiledYear}</li>
                  <li>Current Status: {client.status}</li>
                </ul>
              </div>
            </motion.div>
          )}

          {tab === "tax" && (
            <motion.div
              key="tax"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="rounded-2xl border p-4 bg-white">
                <div className="font-semibold mb-2">Tax Breakdown (KY + Federal)</div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      nameKey="label"
                      data={taxData.breakdown}
                      innerRadius={60}
                      outerRadius={100}
                      label
                    >
                      {taxData.breakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 text-sm">
                  <strong>Total Tax:</strong> ${taxData.total.toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl border p-4 bg-white">
                <div className="font-semibold mb-2">Regional Adjustments</div>
                <ul className="text-sm space-y-1">
                  <li>Federal tax: 22%</li>
                  <li>Kentucky state tax: 5%</li>
                  <li>Lexington local tax: 2.25%</li>
                  <li>Credits per dependent: $2,000</li>
                </ul>
                <div className="mt-3 p-3 rounded-xl bg-sky-50 border">
                  <strong>Refund (est):</strong> ${taxData.refund.toLocaleString()}
                </div>
                <div className="mt-3">
                  <div className="font-semibold mb-1">Tax Efficiency Score</div>
                  <div className="relative w-full h-4 bg-gray-100 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${taxData.efficiency}%` }}
                      transition={{ duration: 0.6 }}
                      className="absolute top-0 left-0 h-4 rounded-full bg-emerald-500"
                    />
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    {taxData.efficiency}% Efficiency — target 90%+
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "deductions" && (
            <motion.div
              key="deductions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl border p-4 bg-white"
            >
              <div className="font-semibold mb-2">AI-Suggested Deductions</div>
              <ul className="text-sm list-disc ml-5 space-y-1">
                <li>Maximize 401(k) and IRA contributions</li>
                <li>Track business mileage for potential deduction</li>
                <li>Consider KY education credit for dependent tuition</li>
                <li>Evaluate home office deduction (if self-employed)</li>
                <li>Review medical expense threshold for itemization</li>
              </ul>
            </motion.div>
          )}

          {tab === "forecast" && (
            <motion.div
              key="forecast"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <div className="rounded-2xl border p-4 bg-white">
                <div className="font-semibold mb-2">Refund / Balance Forecast</div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={forecastData}>
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="refund"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border p-4 bg-white">
                <div className="font-semibold mb-2">Notes</div>
                <ul className="text-sm list-disc ml-5 space-y-1">
                  <li>Plan estimated quarterly payments if refund &lt; $500.</li>
                  <li>Consider S-Corp election if net income &gt; $70k.</li>
                  <li>Check KY local occupational tax filings deadlines.</li>
                  <li>Offer mid-year tax planning session.</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

const COLORS = ["#0ea5e9", "#38bdf8", "#f59e0b", "#10b981", "#6366f1"];

function calculateTaxProfile(c) {
  const federal = c.income * 0.22;
  const state = c.income * 0.05;
  const city = c.income * 0.0225;
  const total = federal + state + city;
  const credits = c.dependents * 2000;
  const refund = Math.max(credits - total * 0.1, 0);
  const efficiency = Math.min(
    100,
    Math.round(((c.income - total) / Math.max(c.income, 1)) * 100)
  );
  const breakdown = [
    { label: "Federal Tax", value: Math.round(federal) },
    { label: "KY State Tax", value: Math.round(state) },
    { label: "Lexington Local Tax", value: Math.round(city) },
    { label: "Credits", value: Math.round(credits) },
  ];
  return { federal, state, city, total, credits, refund, efficiency, breakdown };
}

function buildIncomeExpense(c) {
  const net = c.income - c.expenses;
  return [
    { label: "Income", Income: c.income, Expenses: 0 },
    { label: "Expenses", Income: 0, Expenses: c.expenses },
    { label: "Net", Income: net, Expenses: 0 },
  ];
}

function forecastRefunds(c) {
  const base = c.refund || 2000;
  return Array.from({ length: 5 }).map((_, i) => ({
    year: 2021 + i,
    refund: Math.round(base * (1 + (i - 2) * 0.08 + Math.random() * 0.05)),
  }));
}
