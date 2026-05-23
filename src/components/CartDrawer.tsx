import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { CartItem } from "../App";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartDrawerProps) {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[80] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-luxury-silver/30">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-luxury-gold" />
                <h2 className="text-lg font-serif italic text-luxury-black font-medium uppercase tracking-widest">Your Curation</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-luxury-cream transition-colors text-luxury-gray"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-luxury-gray text-xs tracking-[0.2em] font-medium mb-1 uppercase">Empty Curation</p>
                  <p className="text-slate-300 text-[10px] uppercase tracking-widest">Begin your luxury journey</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <div className="w-24 h-24 bg-[#F9F9F9] p-2 flex-shrink-0 border border-luxury-silver/30">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xs font-bold text-luxury-black uppercase tracking-wider">{item.name}</h3>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="text-slate-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] text-luxury-gold font-light tracking-widest mb-4">৳ {item.price.toLocaleString()}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-luxury-silver/40 px-2 py-1 gap-4">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="text-luxury-gray hover:text-luxury-black transition-colors"
                          >
                            <Minus size={12} strokeWidth={1.5} />
                          </button>
                          <span className="text-[11px] font-bold text-luxury-black min-w-[12px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="text-luxury-gray hover:text-luxury-black transition-colors"
                          >
                            <Plus size={12} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 border-t border-luxury-silver/30 bg-luxury-cream/30">
                <div className="flex justify-between items-center mb-6">
                  <span className="tracked-label !text-luxury-black">Subtotal</span>
                  <span className="text-xl font-serif text-luxury-black">৳ {total.toLocaleString()}</span>
                </div>
                <button
                  onClick={onCheckout}
                  className="luxury-button w-full bg-luxury-black text-white hover:bg-luxury-gold shadow-xl shadow-luxury/10"
                >
                  Proceed to Checkout
                </button>
                <div className="mt-6 flex flex-col items-center gap-2">
                   <p className="text-[8px] text-luxury-gray uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-green-500" />
                      Secure Global Standards Checkout
                   </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
