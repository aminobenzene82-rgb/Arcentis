import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Heart, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
}

export default function Navbar({ cartCount, onOpenCart }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled ? "py-4 glass border-luxury-silver/30" : "py-8 bg-transparent border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-12 flex items-center justify-between">
        {/* Left Side Links */}
        <div className="hidden md:flex items-center space-x-10">
          {["Collection"].map((item, index) => (
            <motion.a
              key={item}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              href={`#${item.toLowerCase()}`}
              className="tracked-label hover:text-luxury-gold transition-colors"
            >
              {item}
            </motion.a>
          ))}
        </div>

        {/* Center Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="text-3xl font-serif font-light tracking-[0.25em] text-luxury-gold leading-none">
            ARCENTIS
          </span>
          <span className="text-[9px] tracking-[0.35em] uppercase text-luxury-gray mt-2 -mr-[0.35em]">
            The Art of Precision
          </span>
        </motion.div>

        {/* Right Side Links & Icons */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-6">
            <button className="relative group" onClick={onOpenCart}>
              <div className="flex items-center space-x-2 px-4 py-1.5 border border-luxury-gold/50 rounded-full group-hover:bg-luxury-gold transition-all">
                <ShoppingCart size={16} strokeWidth={1.5} className="text-luxury-gold group-hover:text-white" />
                <span className="text-[10px] font-sans font-bold tracking-widest text-luxury-gold group-hover:text-white uppercase">
                  CART ({cartCount})
                </span>
              </div>
            </button>

            <button 
              className="md:hidden text-luxury-gray"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass absolute top-full left-0 right-0 bg-white z-40 overflow-hidden"
          >
            <div className="flex flex-col items-center py-10 space-y-8">
              {["Collection", "New Arrivals", "Best Sellers", "About Us"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-xl uppercase tracking-widest font-serif"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
