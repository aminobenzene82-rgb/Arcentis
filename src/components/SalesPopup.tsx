import { motion, AnimatePresence } from "motion/react";
import { WATCHES, SALES_ALERTS } from "../constants";
import { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function SalesPopup() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimeout = setTimeout(() => setIsVisible(true), 1500);
    
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SALES_ALERTS.length);
        setIsVisible(true);
      }, 500);
    }, 4500);

    return () => {
      clearTimeout(showTimeout);
      clearInterval(interval);
    };
  }, []);

  const current = SALES_ALERTS[index];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.8 }}
          className="fixed bottom-8 left-4 md:left-8 z-[100] bg-white/95 backdrop-blur-md p-4 border border-luxury-silver shadow-2xl rounded-sm flex items-center gap-4 w-72"
        >
          <div className="w-10 h-10 rounded-full bg-luxury-beige flex items-center justify-center text-luxury-gold text-lg font-serif">
            {current.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-sans text-luxury-black font-medium leading-tight">
              <strong>{current.name}</strong> from <span className="text-luxury-gold">{current.location}</span>
            </p>
            <p className="text-[9px] text-luxury-gray font-sans mt-0.5 tracking-wide">
              just bought {current.product}
            </p>
          </div>
          <div className="text-[8px] text-slate-300 font-sans tracking-widest uppercase">2s ago</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
