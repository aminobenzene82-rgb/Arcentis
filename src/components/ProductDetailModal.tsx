import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingCart, ShieldCheck, Clock, Truck, Star } from "lucide-react";
import { Watch } from "../constants";

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Watch | null;
  onOrderNow: (product: Watch) => void;
}

export default function ProductDetailModal({ isOpen, onClose, product, onOrderNow }: ProductDetailModalProps) {
  if (!product) return null;

  const pros = [
    "Swiss-made precision movement",
    "Scratch-resistant sapphire crystal",
    "Water resistant up to 50m",
    "Genuine leather or stainless steel band"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-luxury-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-luxury-gray" />
            </button>

            {/* Left: Image */}
            <div className="w-full md:w-1/2 bg-luxury-beige flex items-center justify-center p-8">
              <motion.img 
                layoutId={`product-image-${product.id}`}
                src={product.image} 
                alt={product.name}
                className="max-h-[400px] w-auto object-contain drop-shadow-2xl"
              />
            </div>

            {/* Right: Details */}
            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto max-h-[80vh] md:max-h-none">
              <div className="mb-6">
                <span className="tracked-label text-luxury-gold mb-2 block">{product.category}</span>
                <h2 className="text-3xl font-serif text-luxury-black mb-2">{product.name}</h2>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-sans font-medium text-luxury-gold">৳{product.price.toLocaleString()}</span>
                  <span className="text-lg font-sans text-slate-400 line-through">৳{product.originalPrice.toLocaleString()}</span>
                  <span className="bg-luxury-gold/10 text-luxury-gold text-[10px] px-2 py-1 uppercase tracking-wider font-bold">
                    Save {Math.round((1 - product.price/product.originalPrice) * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-luxury-black mb-3">The Highlights</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {pros.map((pro, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-luxury-gray">
                        <Star size={14} className="text-luxury-gold mt-0.5 shrink-0" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-luxury-cream p-3 text-center border border-luxury-silver/30">
                    <ShieldCheck size={18} className="mx-auto text-luxury-gold mb-2" />
                    <span className="text-[8px] uppercase tracking-wider font-bold block">2 Year Warranty</span>
                  </div>
                  <div className="bg-luxury-cream p-3 text-center border border-luxury-silver/30">
                    <Clock size={18} className="mx-auto text-luxury-gold mb-2" />
                    <span className="text-[8px] uppercase tracking-wider font-bold block">Swiss Quartz</span>
                  </div>
                  <div className="bg-luxury-cream p-3 text-center border border-luxury-silver/30">
                    <Truck size={18} className="mx-auto text-luxury-gold mb-2" />
                    <span className="text-[8px] uppercase tracking-wider font-bold block">Fast Delivery</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  onOrderNow(product);
                  onClose();
                }}
                className="w-full luxury-button bg-luxury-black text-white hover:bg-luxury-gold flex items-center justify-center gap-3 active:scale-95"
              >
                <ShoppingCart size={18} />
                <span>Order Now</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
