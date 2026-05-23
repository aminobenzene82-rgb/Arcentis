import { MessageCircle, Facebook, Instagram, Twitter, Phone, Mail, MapPin, Truck, RotateCcw, ShieldCheck } from "lucide-react";

interface FooterProps {
  onOpenAdmin: () => void;
}

export default function Footer({ onOpenAdmin }: FooterProps) {
  return (
    <footer className="pt-24 pb-12 bg-luxury-black text-white overflow-hidden relative border-t border-luxury-silver/10">
      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
          
          {/* Brand Info */}
          <div className="lg:col-span-1">
             <div className="flex flex-col mb-10">
               <span className="text-3xl font-serif font-light tracking-[0.25em] text-luxury-gold leading-none">
                 ARCENTIS
               </span>
               <span className="text-[9px] tracking-[0.4em] uppercase text-slate-500 mt-2">
                 Boutique Excellence
               </span>
             </div>
             <p className="text-slate-400 text-xs leading-relaxed mb-10 max-w-xs font-sans tracking-wide">
               Dedicated to the discerning elite of Bangladesh. We curate only the finest timepieces from historic Swiss houses.
             </p>
             <div className="flex items-center gap-6">
               {[Facebook, Instagram, Twitter].map((Icon, i) => (
                 <a key={i} href="#" className="text-slate-500 hover:text-luxury-gold transition-colors">
                   <Icon size={18} strokeWidth={1} />
                 </a>
               ))}
             </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="tracked-label !text-luxury-gold mb-12 italic">Curation</h4>
            <ul className="space-y-5">
               <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-[10px] tracking-widest uppercase flex items-center gap-4">Heritage Collection</a></li>
               <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-[10px] tracking-widest uppercase flex items-center gap-4">Bespoke Concierge</a></li>
               <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-[10px] tracking-widest uppercase flex items-center gap-4">Authenticity Protocol</a></li>
               <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-[10px] tracking-widest uppercase flex items-center gap-4">Privacy Standards</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="tracked-label !text-luxury-gold mb-12 italic">Contact Us</h4>
            <ul className="space-y-8">
               <li className="flex gap-4">
                 <MapPin className="text-luxury-gold flex-shrink-0" size={18} strokeWidth={1} />
                 <span className="text-slate-400 text-[11px] font-sans tracking-wide leading-relaxed">Level 4, Gulshan Tower, Gulshan-2, Dhaka 1212, Bangladesh</span>
               </li>
               <li className="flex gap-4 items-center">
                 <Phone className="text-luxury-gold flex-shrink-0" size={18} strokeWidth={1} />
                 <span className="text-slate-400 text-[11px] font-sans tracking-widest">+880 1787-867722</span>
               </li>
               <li className="flex gap-4 items-center">
                 <Mail className="text-luxury-gold flex-shrink-0" size={18} strokeWidth={1} />
                 <span className="text-slate-400 text-[11px] font-sans tracking-widest uppercase">support@arcentis.bd</span>
               </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in">
           <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
             <p className="text-slate-600 text-[8px] uppercase tracking-[0.4em]">
               © 2026 ARCENTIS. The Pinnacle of Horology.
             </p>
             <button
               onClick={onOpenAdmin}
               className="text-luxury-gold hover:text-white text-[8px] font-bold uppercase tracking-[0.4em] transition-all cursor-pointer outline-none border border-luxury-gold/20 hover:border-white/30 px-3 py-1.5 focus:ring-1 focus:ring-luxury-gold"
             >
               Admin panel
             </button>
           </div>
           <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-50" />
             <span className="text-slate-600 text-[8px] font-bold uppercase tracking-[0.4em]">Serving Premium Customers Across Bangladesh</span>
           </div>
        </div>
      </div>
    </footer>
  );
}

