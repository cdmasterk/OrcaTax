import { motion } from "framer-motion";

export default function FakeLogin({ onEnter }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-sky-900 to-slate-800 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h1
        className="text-5xl font-bold mb-6 tracking-tight"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        OrcaTax<span className="text-sky-400"> Cloud</span>
      </motion.h1>
      <p className="text-slate-300 mb-8 text-center max-w-md leading-relaxed">
        Next-Gen Tax Advisory Platform for Lexington, KY —
        <br />
        powered by AI, built for speed.
      </p>
      <button
        onClick={onEnter}
        className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-lg shadow-lg"
      >
        Enter Demo
      </button>
    </motion.div>
  );
}
