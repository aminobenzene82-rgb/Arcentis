import { motion } from "motion/react";
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, Clock, Star } from "lucide-react";

interface HeroProps {
  onShopNow: () => void;
}

export default function Hero({ onShopNow }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-28 pb-20 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-luxury-beige/50 -skew-x-12 translate-x-1/4 z-0" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-luxury-gold/5 rounded-full blur-3xl z-0" />
      
      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16">
          {/* Text Content */}
          <div className="w-full md:w-[60%] text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                <span className="h-px w-10 bg-luxury-gold" />
                <span className="tracked-label !text-luxury-gray">Exclusivity Reimagined</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-luxury-black leading-[1.1] mb-6 font-light italic">
                Luxury Timepieces for <br />
                <span className="text-luxury-gold font-normal not-italic">Timeless Elegance</span>
              </h1>
              
              <p className="text-xs md:text-sm text-luxury-gray mb-8 max-w-md mx-auto md:mx-0 font-sans tracking-wide leading-relaxed">
                Premium Watches Trusted by <span className="font-semibold text-luxury-black">1000+ Happy Customers</span>. Crafting moments of precision and elegance for Gulshan, Banani, and beyond.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <motion.button 
                  whileHover={{ backgroundColor: "#C5A059" }}
                  onClick={onShopNow}
                  className="luxury-button bg-luxury-black text-white w-full sm:w-auto text-[10px] py-3 px-8"
                >
                  Shop Now
                </motion.button>
                
                <motion.button 
                  onClick={onShopNow}
                  className="luxury-button border border-luxury-black text-luxury-black hover:bg-luxury-black hover:text-white w-full sm:w-auto text-[10px] py-3 px-8"
                >
                  View Collection
                </motion.button>
              </div>

              {/* Trust Features */}
              <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 border-t border-luxury-silver/30 pt-8">
                 {[
                   { icon: ShieldCheck, text: "Authentic" },
                   { icon: Truck, text: "Fast Delivery" },
                   { icon: Clock, text: "2Y Warranty" },
                   { icon: Star, text: "4.9 Rated" }
                 ].map((item, i) => (
                   <div key={i} className="flex flex-col items-center md:items-start group">
                      <item.icon size={16} strokeWidth={1} className="text-luxury-gold mb-2 transition-transform group-hover:scale-110" />
                      <span className="tracked-label !text-[7px]">{item.text}</span>
                   </div>
                 ))}
              </div>
            </motion.div>
          </div>

          {/* Image Content */}
          <div className="w-full md:w-[40%] relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative z-10"
            >
              <div className="relative aspect-square max-w-[300px] md:max-w-none mx-auto overflow-hidden shadow-2xl border border-luxury-silver/30 bg-white p-2">
                <img 
                  src="https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=800&auto=format&fit=crop" 
                  alt="Premium Luxury Watch" 
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute top-4 left-4">
                   <div className="bg-luxury-gold text-white text-[7px] px-2 py-0.5 tracking-[0.2em] uppercase">
                     Limited Offer
                   </div>
                </div>

                {/* Minimal Floating Price Badge */}
                <div className="absolute bottom-6 right-6 glass p-4 border shadow-2xl flex flex-col items-center text-center">
                   <p className="tracked-label !text-[7px] mb-0.5">Starting From</p>
                   <p className="text-lg font-serif text-luxury-black leading-none">৳12,500</p>
                </div>
              </div>

              {/* Decorative Geometric Element */}
              <div className="absolute -top-6 -right-6 w-24 h-24 border border-luxury-gold opacity-20 rounded-full z-0 hidden lg:block" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
