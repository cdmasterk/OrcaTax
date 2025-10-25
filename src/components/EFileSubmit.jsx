// src/components/EFileSubmit.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, Loader2, Download } from "lucide-react";
import { toast } from "react-toastify";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function EFileSubmit({ client, onClose, onComplete }){
  const [step, setStep] = useState(0);
  const [log, setLog] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(()=>{
    const seq = [
      { t: 500, m: "Validating return data…" },
      { t: 900, m: "Packaging IRS XML (Form 1040)…" },
      { t: 1100, m: "Transmitting to IRS gateway…" },
      { t: 800, m: "Awaiting acknowledgment…" },
      { t: 600, m: "IRS Accepted (mock)." },
    ];
    let acc = 0;
    toast("📤 Sending to IRS (mock)…");
    seq.forEach((s, i)=>{
      acc += s.t;
      setTimeout(()=>{
        setLog(prev=> [...prev, s.m]);
        setStep(i+1);
        if(i===seq.length-1){
          makeMockPDF(client).then(url=> setPdfUrl(url));
          onComplete && onComplete();
        }
      }, acc);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div initial={{opacity:0, scale:.96, y:8}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:.96, y:8}} transition={{type:'spring', stiffness:240, damping:22}} className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">IRS e-File (Mock)</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4"/></button>
        </div>

        <div className="flex items-center gap-3 my-3">
          {["Validate","Package","Transmit","Await Ack","Accepted"].map((s,i)=>(
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${i<step? 'bg-emerald-500 text-white border-emerald-600':'bg-white dark:bg-slate-900'}`}>
                {i<step? <CheckCircle2 className="w-4 h-4"/> : <span className="text-xs">{i+1}</span>}
              </div>
              {i<4 && <div className="w-8 h-px bg-gray-200 dark:bg-slate-700"></div>}
            </div>
          ))}
        </div>

        <div className="rounded-xl border dark:border-slate-800 p-3 bg-gray-50 dark:bg-slate-800/50 min-h-[120px] text-sm">
          {log.length===0 ? (
            <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin"/> Initializing…</div>
          ) : (
            <ul className="list-disc ml-5 space-y-1">{log.map((l,i)=>(<li key={i}>{l}</li>))}</ul>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-slate-500">Submission ID: TX{String(client.id).slice(1)}-MOCK</div>
          <div className="flex gap-2">
            {pdfUrl && (
              <a href={pdfUrl} download={`OrcaTax_${client.id}_1040.pdf`} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2">
                <Download className="w-4 h-4"/> Download PDF
              </a>
            )}
            <button onClick={onClose} className="px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">Close</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

async function makeMockPDF(client){
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const draw = (text, x, y, size=12)=>{ page.drawText(text, { x, y, size, font, color: rgb(0,0,0) }); };

  draw("Form 1040 (Mock) — U.S. Individual Income Tax Return", 40, 800, 14);
  draw("OrcaTax Cloud — Demonstration Output", 40, 780, 10);
  page.drawLine({ start: {x:40,y:775}, end: {x:555,y:775}, thickness: 1, color: rgb(0,0,0) });

  draw("Taxpayer", 40, 750, 12);
  draw(`Name: ${client.name} (${client.id})`, 40, 732);
  draw(`City/State: ${client.city}, ${client.state}`, 40, 716);
  draw(`Email: ${client.email}`, 40, 700);

  draw("Summary", 40, 670, 12);
  draw(`Income: $${(client.income||0).toLocaleString()}`, 40, 652);
  draw(`Expenses: $${(client.expenses||0).toLocaleString()}`, 40, 636);
  const net = (client.income||0) - (client.expenses||0);
  draw(`Net Income: $${net.toLocaleString()}`, 40, 620);

  const federal = Math.round((client.income||0) * 0.22);
  const state = Math.round((client.income||0) * 0.05);
  const city = Math.round((client.income||0) * 0.0225);
  const credits = (client.dependents||0) * 2000;
  const totalTax = federal + state + city;
  const estRefund = Math.max(credits - totalTax * 0.1, 0);

  draw("Computed (Mock):", 40, 590, 12);
  draw(`Federal Tax (22%): $${federal.toLocaleString()}`, 40, 572);
  draw(`KY State Tax (5%): $${state.toLocaleString()}`, 40, 556);
  draw(`Lexington Local (2.25%): $${city.toLocaleString()}`, 40, 540);
  draw(`Credits: $${credits.toLocaleString()}`, 40, 524);
  draw(`Total Tax: $${totalTax.toLocaleString()}`, 40, 508);
  draw(`Estimated Refund: $${estRefund.toLocaleString()}`, 40, 492);

  page.drawLine({ start: {x:40,y:80}, end: {x:555,y:80}, thickness: 1, color: rgb(0,0,0) });
  draw("This is a demo PDF generated by OrcaTax Cloud. Not a valid IRS submission.", 40, 62, 10);

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}
