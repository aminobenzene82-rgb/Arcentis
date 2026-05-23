import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/01787867722"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/20 group"
    >
      <MessageCircle size={32} />
      
      {/* Label Tooltip */}
      <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-xl text-slate-800 text-xs font-bold uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border pointer-events-none">
        Chat With Expert
      </div>
    </motion.a>
  );
}
