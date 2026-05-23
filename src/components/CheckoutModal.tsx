import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Star, X, CheckCircle2, Phone, User, MapPin, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";
import { CartItem } from "../App";
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemove?: (id: string) => void;
  onOrderSuccess?: () => void;
}

export default function CheckoutModal({ isOpen, onClose, items, onOrderSuccess, onUpdateQuantity, onRemove }: CheckoutModalProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [senderNumber, setSenderNumber] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [step, setStep] = useState<"details" | "form">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (!isOpen) {
      setStep("form");
      setIsSuccess(false);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAdvancePayment = paymentMethod !== "cod";
  const discount = isAdvancePayment ? subtotal * 0.1 : 0;
  const deliveryCharge = totalQuantity >= 3 ? 0 : 100; 
  const finalTotal = subtotal - discount + deliveryCharge;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (isSubmitting) return;

    if (paymentMethod === "bkash" || paymentMethod === "nagad") {
      if (!senderNumber.trim()) {
        setError("অনুগ্রহ করে আপনার নম্বরটি লিখুন");
        return;
      }
      if (senderNumber.trim() === "01787867722") {
        setError("অনুগ্রহ করে আপনার সঠিক নম্বরটি লিখুন");
        return;
      }
    }
    
    setIsSubmitting(true);

    try {
      // Generate order number
      const generatedOrderNumber = `LUX-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Save to Firestore
      const orderData = {
        uniqueOrderNumber: generatedOrderNumber,
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        senderNumber: senderNumber || '',
        paymentMethod: paymentMethod,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: finalTotal,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      if (paymentMethod === "cod") {
        // Optimistic UI for Cash on Delivery - transition to success instantly!
        setOrderNumber(generatedOrderNumber);
        setIsSuccess(true);
        if (onOrderSuccess) onOrderSuccess();

        // Perform writes in the background to provide zero-latency user experience
        addDoc(collection(db, 'orders'), orderData)
          .then(() => {
            const sessionId = localStorage.getItem('ta_session_id');
            if (sessionId) {
              deleteDoc(doc(db, 'cartActivities', sessionId)).catch(e => {
                console.error("Failed to delete cart activity in background:", e);
              });
            }
          })
          .catch((err) => {
            console.error("Delayed COD order creation failed:", err);
            handleFirestoreError(err, OperationType.CREATE, 'orders');
          });
      } else {
        // For bKash / Nagad, await database write of the order details,
        // but skip awaiting cart tracking deletion to speed up response significantly.
        await addDoc(collection(db, 'orders'), orderData);

        const sessionId = localStorage.getItem('ta_session_id');
        if (sessionId) {
          deleteDoc(doc(db, 'cartActivities', sessionId)).catch(e => {
            console.error("Failed to delete cart activity in background:", e);
          });
        }

        setOrderNumber(generatedOrderNumber);
        setIsSuccess(true);
        if (onOrderSuccess) onOrderSuccess();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentButtons = [
    { 
      id: "bkash", 
      name: "Bkash", 
      logo: "https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" 
    },
    { 
      id: "nagad", 
      name: "Nagad", 
      logo: "https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg" 
    },
    { 
      id: "cod", 
      name: "Cash on delivery", 
      logo: "" 
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 overflow-y-auto pt-20 pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative w-full ${step === 'details' ? 'max-w-4xl' : 'max-w-3xl'} bg-white border border-luxury-silver shadow-2xl overflow-hidden my-auto transition-all duration-500 pointer-events-auto`}
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key="form-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col md:flex-row min-h-[500px]"
              >
                {/* Left Side: Order Summary */}
                  <div className="hidden md:flex md:w-5/12 bg-luxury-cream/50 border-r border-luxury-silver/20 flex-col p-8 space-y-6">
                    <div className="text-[9px] font-bold text-luxury-gold uppercase tracking-widest flex items-center gap-2">
                       Order Summary ({items.length})
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                      {items.map((item) => (
                        <div key={item.id} className="group flex gap-4 items-center bg-white p-3 border border-luxury-silver/20 shadow-sm relative">
                          <div className="w-16 h-16 shrink-0 bg-luxury-beige/30 p-1">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] font-bold text-luxury-black truncate uppercase tracking-tight mb-1">{item.name}</h4>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-luxury-silver/20 bg-luxury-cream/10">
                                <button 
                                  onClick={() => onUpdateQuantity?.(item.id, -1)}
                                  className="p-1 hover:bg-luxury-gold hover:text-white transition-colors"
                                >
                                  <Minus size={8} />
                                </button>
                                <span className="text-[9px] font-bold w-6 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => onUpdateQuantity?.(item.id, 1)}
                                  className="p-1 hover:bg-luxury-gold hover:text-white transition-colors"
                                >
                                  <Plus size={8} />
                                </button>
                              </div>
                              <button 
                                onClick={() => onRemove?.(item.id)}
                                className="text-luxury-silver hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                          <div className="text-[10px] font-bold text-luxury-black">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      ))}

                      {items.length === 0 && (
                        <div className="text-center py-12">
                           <p className="text-[10px] uppercase tracking-widest text-luxury-silver">Cart is empty</p>
                           <button 
                            onClick={onClose}
                            className="mt-4 text-[9px] font-bold text-luxury-gold uppercase border-b border-luxury-gold"
                           >
                            Go Back to Collection
                           </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-6 border-t border-luxury-silver/30">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-luxury-gray uppercase tracking-wider">Subtotal</span>
                        <span className="text-luxury-black font-medium">৳{subtotal.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between text-[10px]">
                          <span className="text-luxury-gold uppercase tracking-wider">Adv. Payment Discount (10%)</span>
                          <span className="text-luxury-gold font-medium">-৳{discount.toLocaleString()}</span>
                        </motion.div>
                      )}
                      <div className="flex justify-between text-[10px]">
                        <span className="text-luxury-gray uppercase tracking-wider">Shipping</span>
                        {deliveryCharge === 0 ? (
                          <span className="text-green-600 font-bold uppercase tracking-widest">Free</span>
                        ) : (
                          <span className="text-luxury-black font-medium">৳{deliveryCharge}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Form or Success */}
                  <div className="w-full md:w-7/12 p-8 relative flex flex-col">
                    <button onClick={onClose} className="absolute top-6 right-6 text-luxury-silver hover:text-luxury-black transition-colors">
                      <X size={24} strokeWidth={1} />
                    </button>

                    <AnimatePresence mode="wait">
                      {isSuccess ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center space-y-6 my-auto pt-10"
                        >
                          <div className="w-20 h-20 bg-luxury-gold rounded-full flex items-center justify-center mx-auto shadow-lg shadow-luxury-gold/20">
                            <CheckCircle2 size={40} className="text-white" strokeWidth={1.5} />
                          </div>
                          <div className="space-y-2">
                             <h3 className="text-2xl font-serif text-luxury-black italic">Acquisition Secured</h3>
                             <p className="text-[10px] text-luxury-gray uppercase tracking-[0.2em]">Order Ref: {orderNumber}</p>
                          </div>
                          <button onClick={onClose} className="luxury-button w-full bg-luxury-black text-white hover:bg-luxury-gold transition-all">
                            Gallery
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div key="form-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                          <h3 className="text-sm font-bold text-luxury-black uppercase tracking-[0.3em] mb-8">Reservation Details</h3>
                          <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                              <label className="tracked-label !text-[8px] mb-2 block">Name</label>
                              <input 
                                required 
                                type="text" 
                                placeholder="ENTER NAME" 
                                className="w-full px-4 py-3 border border-luxury-silver/60 text-[10px] tracking-widest outline-none focus:border-luxury-gold" 
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div>
                                <label className="tracked-label !text-[8px] mb-2 block">Phone</label>
                                <input 
                                  required 
                                  type="tel" 
                                  placeholder="017..." 
                                  className="w-full px-4 py-3 border border-luxury-silver/60 text-[10px] tracking-widest outline-none focus:border-luxury-gold" 
                                  value={formData.phone}
                                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="tracked-label !text-[8px] mb-2 block">Address</label>
                                <textarea 
                                  required 
                                  rows={2} 
                                  placeholder="ADDRESS" 
                                  className="w-full px-4 py-3 border border-luxury-silver/60 text-[10px] tracking-widest outline-none focus:border-luxury-gold resize-none" 
                                  value={formData.address}
                                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                />
                            </div>
                            <div>
                              <label className="tracked-label !text-[8px] mb-3 block">Payment</label>
                              <div className="grid grid-cols-3 gap-2">
                                {paymentButtons.map((m) => (
                                  <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)} className={`py-6 px-2 border transition-all text-center flex flex-col items-center justify-center gap-2 ${paymentMethod === m.id ? "bg-luxury-gold/5 border-luxury-gold ring-1 ring-luxury-gold" : "bg-white border-luxury-silver/60"}`}>
                                    {m.logo ? (
                                      <img src={m.logo} alt={m.name} className="h-16 w-auto object-contain" />
                                    ) : (
                                      <div className="h-16 flex items-center justify-center">
                                        <span className="text-[14px] font-bold text-luxury-black uppercase tracking-widest">Cash on delivery</span>
                                      </div>
                                    )}
                                    <span className="text-[8px] font-bold uppercase tracking-wider">{m.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {isAdvancePayment && (
                              <section className="p-4 bg-luxury-gold/5 border border-luxury-gold/20 space-y-4">
                                <p className="text-[18px] text-luxury-black font-bold font-bengali">01787867722 নম্বরে সেন্ড মানি করুন</p>
                                <div className="space-y-1">
                                  <p className="text-[14px] text-luxury-black font-bold font-bengali">
                                    {paymentMethod === 'bkash' ? "আপনার বিকাশ নম্বর দিন" : "আপনার নগদ নম্বর দিন"}
                                  </p>
                                  <input required value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} placeholder="SENDER NUMBER" className="w-full px-3 py-2 text-[10px] border border-luxury-gold/30 outline-none" />
                                </div>
                                {error && <p className="text-[10px] text-red-600 font-bengali">{error}</p>}
                              </section>
                            )}

                            <div className="pt-4 border-t border-luxury-silver/20">
                              <div className="flex justify-between items-center">
                                <span className="tracked-label font-bold text-luxury-black">Investment Total</span>
                                <span className="text-2xl font-serif text-luxury-black italic">৳{finalTotal.toLocaleString()}</span>
                              </div>
                            </div>

                            <button 
                              disabled={isSubmitting}
                              className="luxury-button w-full bg-luxury-black text-white hover:bg-luxury-gold py-4 text-[10px] tracking-widest font-bold uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                              {isSubmitting && <Loader2 size={14} className="animate-spin text-luxury-gold" />}
                              {isSubmitting ? 'Securing Acquisition...' : 'Finalize Order'}
                            </button>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
