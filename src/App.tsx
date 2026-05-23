/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import TrustSection from "./components/TrustSection";
import Footer from "./components/Footer";
import SalesPopup from "./components/SalesPopup";
import WhatsAppButton from "./components/WhatsAppButton";
import CheckoutModal from "./components/CheckoutModal";
import CartDrawer from "./components/CartDrawer";
import ProductDetailModal from "./components/ProductDetailModal";
import { Watch } from "./constants";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "./lib/firebase";
import AdminDashboard from "./components/AdminDashboard";

export interface CartItem extends Watch {
  quantity: number;
}

// Simple session manager for cart tracking
const getSessionId = () => {
  let id = localStorage.getItem('ta_session_id');
  if (!id) {
    id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('ta_session_id', id);
  }
  return id;
};

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Watch | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [productForDetail, setProductForDetail] = useState<Watch | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    // Simulate premium loading experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Track cart activity in Firestore
  useEffect(() => {
    if (cart.length > 0) {
      const trackCart = async () => {
        try {
          const sessionId = getSessionId();
          await setDoc(doc(db, 'cartActivities', sessionId), {
            sessionId,
            items: cart.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              image: item.image
            })),
            updatedAt: serverTimestamp()
          });
        } catch (err) {
          console.error("Cart tracking failed:", err);
        }
      };
      trackCart();
    }
  }, [cart]);

  const handleProductClick = (product: Watch) => {
    setProductForDetail(product);
    setIsProductDetailOpen(true);
  };

  const addToCart = (product: Watch) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleOrderNow = (product: Watch) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCheckoutOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (cart.length > 0) {
      setIsCheckoutOpen(true);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="relative min-h-screen bg-luxury-cream selection:bg-luxury-gold selection:text-white">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white flex flex-center flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
                <span className="text-4xl font-serif font-light tracking-[0.3em] text-luxury-gold leading-none mb-6 text-center">
                  ARCENTIS
                </span>
               <div className="w-48 h-[1px] bg-slate-100 relative overflow-hidden">
                 <motion.div 
                   className="absolute inset-0 bg-luxury-gold"
                   initial={{ x: "-100%" }}
                   animate={{ x: "0%" }}
                   transition={{ duration: 1, ease: "easeInOut" }}
                 />
               </div>
               <span className="text-[10px] tracking-[6px] uppercase text-slate-400 mt-4 font-sans animate-pulse">
                 The Art of Precision
               </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <>
          <Navbar cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} />
          
          <main>
            <Hero onShopNow={() => {
              const el = document.getElementById('collection');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} />
            
            {/* Promotion Banner */}
            <div className="w-full py-3 px-4 bg-luxury-black text-white overflow-hidden relative">
              <motion.div 
                animate={{ x: [0, -1000] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="flex whitespace-nowrap gap-28 uppercase font-sans font-bold tracking-[0.3em] text-[8px]"
              >
                {[...Array(10)].map((_, i) => (
                  <span key={i} className="flex items-center gap-28">
                    <span>Authentic Swiss Heritage</span>
                    <span>Complimentary Express Shipping</span>
                    <span>10% Benefit on Advance Secure Payments</span>
                    <span>Serving Gulshan & Banani Elite</span>
                  </span>
                ))}
              </motion.div>
            </div>

            <ProductGrid onProductClick={handleProductClick} onAddToCart={addToCart} />
            
            <TrustSection />
            
            {/* Features Showcase Section */}
            <section className="py-24 bg-luxury-beige/30">
               <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                     {[
                       { title: "Premium Packaging", text: "Every watch comes in a luxurious signature box with velvet lining." },
                       { title: "Authenticity Card", text: "Verified hologram authenticity card included with every purchase." },
                       { title: "Personalised Service", text: "Our luxury concierge team is available 24/7 for our elite clients." }
                     ].map((item, i) => (
                       <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        key={i} 
                        className="text-center"
                       >
                         <h4 className="text-xl font-serif text-slate-800 mb-4">{item.title}</h4>
                         <p className="text-sm text-slate-500 font-light leading-relaxed">{item.text}</p>
                       </motion.div>
                     ))}
                  </div>
               </div>
            </section>
          </main>

          <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

          {/* Overlays */}
          <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
          <SalesPopup />
          <WhatsAppButton />
          
          <ProductDetailModal 
            isOpen={isProductDetailOpen}
            onClose={() => setIsProductDetailOpen(false)}
            product={productForDetail}
            onOrderNow={handleOrderNow}
          />
          
          <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
          />
          
          <CheckoutModal 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)} 
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onOrderSuccess={() => setCart([])}
          />
        </>
      )}
    </div>
  );
}

