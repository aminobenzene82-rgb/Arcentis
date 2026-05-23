import { motion } from "motion/react";
import { WATCHES, Watch } from "../constants";
import { ShoppingCart, Star, Heart, Flame } from "lucide-react";
import { useState, useEffect } from "react";

interface ProductGridProps {
  onProductClick: (product: Watch) => void;
  onAddToCart: (product: Watch) => void;
}

export default function ProductGrid({ onProductClick, onAddToCart }: ProductGridProps) {
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 45, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="collection" className="py-24 bg-luxury-cream">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Combo Offers Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white border border-luxury-silver/50 p-10 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="relative z-10">
              <span className="tracked-label !text-luxury-gray mb-2 block">Special Curation</span>
              <h3 className="text-3xl font-serif mb-4 text-luxury-black">Buy 2 Watches</h3>
              <p className="text-luxury-gold text-xl font-bold tracking-widest mb-8">Get 10% Discount</p>
              <button 
                onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                className="luxury-button bg-luxury-black text-white !py-3 !px-8 hover:bg-luxury-gold"
              >
                Browse Collection
              </button>
            </div>
            <div className="absolute right-0 top-0 h-full opacity-[0.03] pointer-events-none">
              <ShoppingCart size={200} className="-mr-20 -mt-10 rotate-12" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-luxury-black p-10 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="relative z-10">
              <span className="tracked-label !text-luxury-gold mb-2 block">Premium Privilege</span>
              <h3 className="text-3xl font-serif mb-4 text-white">Buy 3 Watches</h3>
              <p className="text-white text-xl font-bold tracking-widest mb-8">Get 10% Discount and Free Delivery</p>
              <button 
                onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                className="luxury-button border border-white text-white !py-3 !px-8 hover:bg-white hover:text-luxury-black"
              >
                Claim Exclusive Deal
              </button>
            </div>
            <div className="absolute right-0 top-0 h-full opacity-[0.07] pointer-events-none">
              <Star size={200} className="-mr-10 -mt-10" />
            </div>
          </motion.div>
        </div>

        {/* Section Header with Countdown */}
        <div id="products-grid" className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-luxury-gold" />
              <span className="tracked-label uppercase">Curated Collection</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-luxury-black font-light italic">Timeless <span className="font-normal not-italic text-luxury-gold">Elegance</span></h2>
          </div>
          
          <div className="flex items-center gap-6 bg-white px-8 py-4 border border-luxury-silver/30 shadow-sm">
            <span className="tracked-label !text-[9px]">Limited availability</span>
            <div className="flex items-center gap-3">
              {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xl font-serif text-luxury-black">
                    {val < 10 ? `0${val}` : val}
                  </span>
                  {i < 2 && <span className="text-luxury-silver pb-1">:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {WATCHES.map((watch, i) => (
            <motion.div
              key={watch.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="group cursor-pointer max-w-[290px] sm:max-w-none w-full mx-auto"
            >
              <div className="bg-white border border-luxury-silver/30 p-2 flex flex-col items-center group transition-all duration-700 hover:border-luxury-gold/40 hover:shadow-[0_20px_50px_-15px_rgba(197,160,89,0.15)]">
                <div className="relative w-full aspect-[4/5] bg-luxury-cream/30 overflow-hidden flex items-center justify-center p-8 transition-colors duration-700 group-hover:bg-luxury-cream/60">
                  {watch.badge && (
                    <motion.span 
                      initial={{ x: -10, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      className="absolute top-6 left-6 z-20 bg-luxury-gold text-white text-[7px] px-3 py-1.5 tracking-[0.3em] font-bold uppercase shadow-lg shadow-luxury-gold/20"
                    >
                      {watch.badge}
                    </motion.span>
                  )}
                  
                  <img 
                    src={watch.image} 
                    alt={watch.name} 
                    loading="lazy"
                    className="w-full h-full object-contain transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  
                  {/* Heart Button */}
                  <button className="absolute top-6 right-6 z-20 text-luxury-silver hover:text-red-400 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4 opacity-0 group-hover:opacity-100">
                    <Heart size={16} strokeWidth={1.5} />
                  </button>

                  <div className="absolute inset-0 border-[1px] border-luxury-gold/0 group-hover:border-luxury-gold/10 transition-all duration-700 m-4 pointer-events-none" />

                  {/* Hover Actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(watch);
                      }}
                      className="w-full py-4 bg-luxury-black text-white text-[9px] tracking-[0.3em] font-bold uppercase hover:bg-luxury-gold transition-colors shadow-2xl relative z-30"
                    >
                      Add To Cart
                    </button>
                  </div>
                  
                  {/* Image Click Area */}
                  <div className="absolute inset-0 z-10 bg-luxury-black/0 group-hover:bg-luxury-black/5 transition-all duration-700 cursor-zoom-in" onClick={() => onProductClick(watch)} />
                </div>

                <div className="w-full text-center py-8 px-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-[7px] font-bold text-luxury-gold tracking-[0.2em] uppercase">{watch.category}</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-luxury-gold/30" />
                    <div className="flex items-center gap-1">
                       <Star size={8} fill="#C5A059" className="text-luxury-gold" />
                       <span className="text-[9px] font-bold text-luxury-black">{watch.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-serif text-luxury-black mb-4 group-hover:text-luxury-gold transition-colors font-medium relative inline-block">
                    {watch.name}
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-px bg-luxury-gold transition-all duration-500 group-hover:w-1/2" />
                  </h3>
                  
                  <div className="flex flex-col items-center mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-sans text-luxury-black font-light tracking-tighter">৳{watch.price.toLocaleString()}</span>
                    </div>
                    <span className="text-[9px] text-luxury-gray/40 line-through tracking-widest mt-1">৳{watch.originalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
