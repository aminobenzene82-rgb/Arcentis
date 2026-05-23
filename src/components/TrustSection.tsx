import { motion } from "motion/react";
import { REVIEWS } from "../constants";
import { Star, ShieldCheck } from "lucide-react";

export default function TrustSection() {
  return (
    <section className="py-24 bg-luxury-cream overflow-hidden border-t border-luxury-silver/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-luxury-black mb-6 italic"
          >
            Customer reviews
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-luxury-gray text-sm font-sans tracking-wide max-w-2xl mx-auto"
          >
            Join our inner circle of elite horology enthusiasts who have experienced the ARCENTIS standard of excellence.
          </motion.p>
        </div>

        {/* Trust Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 bg-white/50 backdrop-blur-sm border border-white p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Star size={120} className="text-luxury-gold" />
          </div>
          <div className="flex items-center gap-10 relative z-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-luxury-gold mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={1} />
                ))}
              </div>
              <p className="tracked-label !text-luxury-black !text-[11px] font-bold">4.9/5 Excellence</p>
              <p className="text-[9px] text-luxury-gray uppercase tracking-[0.2em] mt-1">Global Standard Verified</p>
            </div>
            <div className="h-12 w-px bg-luxury-silver/50 hidden md:block" />
            <div className="text-center">
              <p className="text-3xl font-serif text-luxury-black font-light">1,200+</p>
              <p className="tracked-label !text-[8px] mt-1">Happy Elite Clients</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-luxury-gray border border-luxury-silver/40 px-6 py-2">
             <div className="w-2 h-2 rounded-full bg-luxury-gold" />
             <span className="tracked-label !text-[9px] !text-luxury-black">Directly from Authorized Distributors</span>
          </div>
        </div>

        {/* Floating Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white p-10 border border-luxury-silver/20 flex flex-col justify-between hover:border-luxury-gold/40 transition-all duration-500 hover:-translate-y-2 group shadow-sm hover:shadow-xl"
            >
              <div>
                <div className="flex items-center gap-1 text-luxury-gold mb-6">
                  {[...Array(review.rating)].map((_, star) => (
                    <Star key={star} size={12} fill="currentColor" strokeWidth={1} />
                  ))}
                </div>
                <p className="text-luxury-black italic text-base mb-10 leading-relaxed font-serif tracking-tight">
                  "{review.text}"
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-luxury-silver/10 pt-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-luxury-cream border border-luxury-gold/20 flex items-center justify-center text-luxury-gold font-serif text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-luxury-black uppercase tracking-widest">{review.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="tracked-label !text-[8px] !text-luxury-gold">{review.location}</span>
                      <span className="w-1 h-1 rounded-full bg-luxury-silver" />
                      <span className="text-[7px] text-slate-400 uppercase tracking-tighter">Verified Acquisition</span>
                    </div>
                  </div>
                </div>
                <ShieldCheck size={16} className="text-luxury-gold opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
