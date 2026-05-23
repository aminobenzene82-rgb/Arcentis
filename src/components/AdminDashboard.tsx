import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Search, ShoppingBag, Users, ShoppingCart, CreditCard, 
  MapPin, Phone, CheckCircle2, Clock, Trash2, Eye, Filter, 
  TrendingUp, LogOut, Lock, ArrowUpRight, DollarSign, Layers
} from "lucide-react";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FirestoreOrder {
  id: string;
  uniqueOrderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  senderNumber?: string;
  paymentMethod: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  status: "pending" | "shipping" | "delivered";
  createdAt: any;
}

interface FirestoreCartActivity {
  id: string;
  sessionId: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    image: string;
  }[];
  updatedAt: any;
}

interface CustomerSummary {
  phone: string;
  name: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: any;
  orders: FirestoreOrder[];
}

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("ta_admin_auth") === "true";
  });
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "carts" | "customers">("overview");
  const [authError, setAuthError] = useState("");

  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [cartActivities, setCartActivities] = useState<FirestoreCartActivity[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<FirestoreOrder | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  // Search and Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [cartSearch, setCartSearch] = useState("");

  // Quick Stats
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersCount: 0,
    productsCount: 0,
    avgOrderVal: 0,
    activeCartsCount: 0,
    conversionRate: 0,
  });

  // Helper helper to handle client-side milliseconds extraction from Timestamp or standard formats
  const getMillis = (timestamp: any): number => {
    if (!timestamp) return Date.now(); // Fallback for real-time optimistic updates with pending serverTimestamp()
    if (typeof timestamp.toMillis === 'function') {
      return timestamp.toMillis();
    }
    if (timestamp.seconds !== undefined) {
      return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000;
    }
    const dateValue = new Date(timestamp).getTime();
    if (!isNaN(dateValue)) return dateValue;
    return 0;
  };

  // Load orders and carts with real-time sync
  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    // Use collection directly without server orderBy filter. We sort on the client-side inside the listener to
    // completely prevent any missing fields/null pending serverTimestamp query-filtering delays.
    const ordersQuery = collection(db, "orders");
    const unsubscribeOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orderList: FirestoreOrder[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          orderList.push({
            id: doc.id,
            uniqueOrderNumber: data.uniqueOrderNumber,
            customerName: data.customerName,
            phone: data.phone,
            address: data.address,
            senderNumber: data.senderNumber,
            paymentMethod: data.paymentMethod,
            items: data.items || [],
            totalAmount: data.totalAmount || 0,
            status: data.status || "pending",
            createdAt: data.createdAt,
          });
        });

        // Fast client-side sorting by creation date DESC
        orderList.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));
        setOrders(orderList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "orders");
      }
    );

    const cartsQuery = collection(db, "cartActivities");
    const unsubscribeCarts = onSnapshot(
      cartsQuery,
      (snapshot) => {
        const cartList: FirestoreCartActivity[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          cartList.push({
            id: doc.id,
            sessionId: data.sessionId,
            items: data.items || [],
            updatedAt: data.updatedAt,
          });
        });

        // Fast client-side sorting by update date DESC
        cartList.sort((a, b) => getMillis(b.updatedAt) - getMillis(a.updatedAt));
        setCartActivities(cartList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "cartActivities");
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeCarts();
    };
  }, [isAuthenticated, isOpen]);

  // Recalculate stats whenever orders or carts change
  useEffect(() => {
    const totalCartItems = cartActivities.reduce(
      (sum, cart) => sum + (cart.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0),
      0
    );

    if (orders.length === 0) {
      setStats({
        totalSales: 0,
        ordersCount: 0,
        productsCount: 0,
        avgOrderVal: 0,
        activeCartsCount: totalCartItems,
        conversionRate: 0,
      });
      return;
    }

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedOrders = orders.filter(o => o.status !== "pending").length;
    const avgOrderVal = totalSales / orders.length;

    // Estimate conversion rate: Orders placed vs total (Orders placed + live carts)
    const totalSessions = orders.length + cartActivities.length;
    const conversionRate = totalSessions > 0 ? (orders.length / totalSessions) * 100 : 0;

    const totalItems = orders.reduce(
      (sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0),
      0
    );

    setStats({
      totalSales,
      ordersCount: orders.length,
      productsCount: totalItems,
      avgOrderVal,
      activeCartsCount: totalCartItems,
      conversionRate,
    });
  }, [orders, cartActivities]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");

    // Admin Credentials validation using ADMIN_EMAIL and ADMIN_PASSWORD
    const adminEmail = "diazoniamsalt@gmail.com";
    const adminPassword = "9ty6tyfirex";

    if (
      emailInput.trim().toLowerCase() === adminEmail &&
      passwordInput === adminPassword
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem("ta_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("ভুল ইমেইল অথবা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("ta_admin_auth");
    setEmailInput("");
    setPasswordInput("");
  };

  // Change order status in Firestore
  const handleUpdateOrderStatus = async (orderId: string, itemIdx: string, newStatus: "pending" | "shipping" | "delivered") => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // Delete/Cancel Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই অর্ডারটি ডিলিট করতে চান?")) return;
    try {
      await deleteDoc(doc(db, "orders", orderId));
      setSelectedOrder(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  // Delete Cart Entry
  const handleDeleteCart = async (activityId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই কার্ট হিস্টোরি ডিলিট করতে চান?")) return;
    try {
      await deleteDoc(doc(db, "cartActivities", activityId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `cartActivities/${activityId}`);
    }
  };

  // Aggregate Customers by phone number
  const getCustomers = (): CustomerSummary[] => {
    const customerMap: { [phone: string]: CustomerSummary } = {};

    orders.forEach((order) => {
      const cleanPhone = order.phone.replace(/\s+/g, "").trim();
      if (!cleanPhone) return;

      if (!customerMap[cleanPhone]) {
        customerMap[cleanPhone] = {
          phone: cleanPhone,
          name: order.customerName,
          address: order.address,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
          orders: [],
        };
      }

      const summary = customerMap[cleanPhone];
      summary.totalOrders += 1;
      summary.totalSpent += order.totalAmount;
      summary.orders.push(order);

      // Save latest client details
      if (order.createdAt && (!summary.lastOrderDate || order.createdAt.seconds > summary.lastOrderDate.seconds)) {
        summary.lastOrderDate = order.createdAt;
        summary.name = order.customerName;
        summary.address = order.address;
      }
    });

    return Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
  };

  const aggregateCustomers = getCustomers();

  // Filter Orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.uniqueOrderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.phone.includes(orderSearch) ||
      order.address.toLowerCase().includes(orderSearch.toLowerCase());
    
    const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter Customers
  const filteredCustomers = aggregateCustomers.filter((cust) => {
    return (
      cust.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      cust.phone.includes(customerSearch) ||
      cust.address.toLowerCase().includes(customerSearch.toLowerCase())
    );
  });

  // Filter Live Carts
  const filteredCarts = cartActivities.filter((cart) => {
    if (cart.items.length === 0) return false;
    const itemNames = cart.items.map(i => i.name).join(" ").toLowerCase();
    return itemNames.includes(cartSearch.toLowerCase()) || cart.sessionId.includes(cartSearch);
  });

  // Chart Data preparation
  // Group by Area
  const getAreaChartData = () => {
    const areasList = ["Gulshan", "Banani", "Dhanmondi", "Uttara", "Baridhara", "Other"];
    const areaCounts: { [key: string]: number } = {};
    areasList.forEach(a => areaCounts[a] = 0);

    orders.forEach(o => {
      const addr = o.address.toLowerCase();
      let found = false;
      for (const area of areasList) {
        if (addr.includes(area.toLowerCase())) {
          areaCounts[area] += o.totalAmount;
          found = true;
          break;
        }
      }
      if (!found) {
        areaCounts["Other"] += o.totalAmount;
      }
    });

    return Object.keys(areaCounts).map(name => ({
      name,
      value: areaCounts[name]
    })).filter(item => item.value > 0);
  };

  const areaData = getAreaChartData();
  const COLORS = ["#C5A059", "#1A1A1A", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  // Group by Payment methods
  const getPaymentChartData = () => {
    const methodCounts: { [key: string]: number } = { bkash: 0, nagad: 0, cod: 0 };
    orders.forEach(o => {
      const p = o.paymentMethod || "cod";
      if (methodCounts[p] !== undefined) {
        methodCounts[p] += o.totalAmount;
      }
    });
    return [
      { name: "bKash", value: methodCounts.bkash },
      { name: "Nagad", value: methodCounts.nagad },
      { name: "Cash on delivery", value: methodCounts.cod },
    ].filter(v => v.value > 0);
  };

  const paymentData = getPaymentChartData();

  // Watch models metrics
  const getWatchPopularityData = () => {
    const popularity: { [name: string]: number } = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        popularity[item.name] = (popularity[item.name] || 0) + item.quantity;
      });
    });
    return Object.keys(popularity).map(name => ({
      name: name.split(" ").slice(0, 3).join(" "), // trim name for graph display
      quantity: popularity[name]
    })).sort((a,b) => b.quantity - a.quantity).slice(0, 5);
  };

  const watchPopularity = getWatchPopularityData();

  const formatTimestamp = (ts: any) => {
    if (!ts) return "সময় পাওয়া যায়নি";
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString("bn-BD", { 
        timeZone: "Asia/Dhaka",
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "সঠিক সময় নেই";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex flex-col bg-slate-100 font-sans text-slate-800 overflow-hidden">
          
          {/* Header */}
          <header className="bg-luxury-black text-white px-6 py-4 flex items-center justify-between border-b border-luxury-gold/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xl font-serif font-light tracking-[0.2em] text-luxury-gold italic leading-none">
                  ARCENTIS
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-slate-400 mt-1.5 font-sans">
                  Merchant Control Center
                </span>
              </div>
              <span className="bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold text-[8px] tracking-[0.25em] px-2 py-0.5 rounded-full uppercase ml-4">
                Shopify Powered API
              </span>
            </div>

            <div className="flex items-center gap-6">
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-300 hover:text-red-400 text-xs tracking-wider uppercase transition-colors"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full transition-all text-slate-300 hover:text-white"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
          </header>

          {/* Authentication Barrier */}
          {!isAuthenticated ? (
            <div className="flex-1 flex items-center justify-center p-4 bg-luxury-cream">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-luxury-silver w-full max-w-md p-8 shadow-2xl relative"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-luxury-black text-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4 border border-luxury-gold/30 shadow-md">
                    <Lock size={26} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-serif text-luxury-black uppercase tracking-[0.2em] mb-1">
                    Secure Admin Panel
                  </h2>
                  <p className="text-[10px] uppercase text-slate-400 tracking-[0.15em] font-sans">
                    Restricted Area for ARCENTIS Officials
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-slate-500 block mb-2 font-bold">
                      Admin Email
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="email@domain.com"
                      className="w-full border border-luxury-silver px-4 py-3 text-xs tracking-wider outline-none focus:border-luxury-gold bg-luxury-cream/20"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-slate-500 block mb-2 font-bold">
                      Password
                    </label>
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      className="w-full border border-luxury-silver px-4 py-3 text-xs tracking-widest outline-none focus:border-luxury-gold bg-luxury-cream/20"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                    />
                  </div>

                  {authError && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-200 p-3 text-center leading-relaxed">
                      {authError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-luxury-black hover:bg-luxury-gold text-white font-sans text-[10px] tracking-widest uppercase py-4 transition-all duration-300 border border-luxury-black flex items-center justify-center gap-2"
                  >
                    <span>Authenticate Console</span>
                    <ArrowUpRight size={14} />
                  </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                  <p className="text-[9px] text-slate-400 leading-relaxed uppercase tracking-[0.2em]">
                    ARCENTIS Horology Group
                  </p>
                </div>
              </motion.div>
            </div>
          ) : (
            
            // Logged in Dashboard View
            <div className="flex-1 flex overflow-hidden">
              
              {/* Sidebar Navigation */}
              <nav className="w-64 bg-luxury-black border-r border-slate-800 flex flex-col justify-between p-4 shrink-0">
                <div className="space-y-2">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.3em] px-3 block mb-4">
                    Analytics Suite
                  </span>

                  {[
                    { id: "overview", label: "Store Overview", icon: TrendingUp },
                    { id: "orders", label: `Orders (${orders.length})`, icon: ShoppingBag },
                    { id: "carts", label: `Active Carts (${stats.activeCartsCount})`, icon: ShoppingCart },
                    { id: "customers", label: `Customer Profile CRM`, icon: Users },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setSelectedCustomer(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs tracking-wider uppercase transition-all duration-200 outline-none ${
                        activeTab === tab.id 
                          ? "bg-luxury-gold text-white shadow-md shadow-luxury-gold/20" 
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        <Icon size={16} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Footer status */}
                <div className="bg-slate-900 border border-slate-800 p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">
                      Live Firebase Synced
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-sans tracking-wide mt-2 block italic leading-none">
                    Admin: diazoniamsalt@gmail.com
                  </span>
                </div>
              </nav>

              {/* Main Workspace */}
              <main className="flex-1 flex flex-col overflow-y-auto p-8 bg-slate-50">
                
                {/* Stat Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Gross Revenue</p>
                      <h3 className="text-2xl font-serif text-slate-800 font-medium font-bengali">৳{stats.totalSales.toLocaleString()}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                      <DollarSign size={20} />
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Orders Count</p>
                      <h3 className="text-2xl font-serif text-slate-800 font-medium">
                        {stats.ordersCount} <span className="text-xs text-slate-400 font-sans tracking-normal font-normal">({stats.productsCount} products)</span>
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <ShoppingBag size={20} />
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Average Order Value (AOV)</p>
                      <h3 className="text-2xl font-serif text-slate-800 font-medium font-bengali">৳{Math.round(stats.avgOrderVal).toLocaleString()}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Active Carts Right Now</p>
                      <h3 className="text-2xl font-serif text-slate-800 font-medium">{stats.activeCartsCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                      <ShoppingCart size={20} />
                    </div>
                  </motion.div>
                </div>

                {/* TAB 1: OVERVIEW STORE INSIGHTS */}
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Popular Watches */}
                      <div className="bg-white p-6 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-3">
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Top watch models</h4>
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest">Ordered quantity</span>
                        </div>
                        {watchPopularity.length === 0 ? (
                          <div className="h-64 flex items-center justify-center text-xs text-slate-400">অর্ডারের কোন তথ্য পাওয়া যায়নি</div>
                        ) : (
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={watchPopularity}>
                                <XAxis dataKey="name" fontSize={9} />
                                <YAxis fontSize={9} width={15} />
                                <Tooltip formatter={(value) => [`${value} Units`, "Quantity"]} contentStyle={{ fontSize: "10px" }} />
                                <Bar dataKey="quantity" fill="#C5A059" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      {/* Area Distribution */}
                      <div className="bg-white p-6 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-3">
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Area Sales Volume</h4>
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest">Gulshan / Banani etc.</span>
                        </div>
                        {areaData.length === 0 ? (
                          <div className="h-64 flex items-center justify-center text-xs text-slate-400">কোন সেলস এরিয়া ডাটা পাওয়া যায়নি</div>
                        ) : (
                          <div className="h-64 flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={areaData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {areaData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, "Revenue"]} contentStyle={{ fontSize: "10px" }} />
                              </PieChart>
                            </ResponsiveContainer>
                            
                            <div className="absolute right-2 bottom-2 space-y-1.5 max-h-40 overflow-y-auto">
                              {areaData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 text-[9px] font-medium leading-none">
                                  <span className="w-2.5 h-2.5 inline-block shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                  <span className="text-slate-600">{d.name}: ৳{d.value.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Methods Breakdown */}
                      <div className="bg-white p-6 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-3">
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Payments Split</h4>
                          <span className="text-[8px] text-slate-400 uppercase tracking-widest">bKash vs. Nagad vs. COD</span>
                        </div>
                        {paymentData.length === 0 ? (
                          <div className="h-64 flex items-center justify-center text-xs text-slate-400">পেমেন্ট মেথড সংক্রান্ত কোনো তথ্য নেই</div>
                        ) : (
                          <div className="h-64 flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={paymentData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={0}
                                  outerRadius={75}
                                  dataKey="value"
                                >
                                  {paymentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, "Amount"]} contentStyle={{ fontSize: "10px" }} />
                              </PieChart>
                            </ResponsiveContainer>

                            <div className="absolute right-2 bottom-2 space-y-1.5">
                              {paymentData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 text-[9px] font-medium leading-none">
                                  <span className="w-2.5 h-2.5 inline-block shrink-0" style={{ backgroundColor: COLORS[(i + 3) % COLORS.length] }} />
                                  <span className="text-slate-600">{d.name}: ৳{d.value.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Recent Dynamic Activity Feed */}
                    <div className="bg-white p-6 border border-slate-100 shadow-sm">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-600 mb-6 border-b border-zinc-150 pb-3">
                        Recent Store Activities
                      </h4>
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-3">
                            <div className="flex items-center gap-4">
                              <span className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 p-2 font-bold text-[9px] min-w-16 text-center border border-emerald-100 uppercase">
                                Order
                              </span>
                              <div>
                                <p className="font-bold text-slate-800 uppercase">{order.customerName} ({order.uniqueOrderNumber})</p>
                                <p className="text-[10px] text-slate-400 tracking-wide mt-0.5">
                                  Ordered {order.items.reduce((sum, item) => sum + item.quantity, 0)} watch(es) total of ৳{order.totalAmount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono italic">{formatTimestamp(order.createdAt)}</span>
                          </div>
                        ))}

                        {cartActivities.slice(0, 5).map((cart) => (
                          <div key={cart.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-3">
                            <div className="flex items-center gap-4">
                              <span className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 p-2 font-bold text-[9px] min-w-16 text-center border border-indigo-100 uppercase">
                                Cart Add
                              </span>
                              <div>
                                <p className="font-bold text-slate-800">Shopping Session ({cart.sessionId})</p>
                                <p className="text-[10px] text-slate-400 tracking-wide mt-0.5">
                                  Currently holding {cart.items.reduce((sum, i) => sum + i.quantity, 0)} watches: {cart.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono italic">{formatTimestamp(cart.updatedAt)}</span>
                          </div>
                        ))}

                        {orders.length === 0 && cartActivities.length === 0 && (
                          <div className="text-center py-20 text-xs text-slate-400 uppercase tracking-widest p-4 pb-12">
                            কোন স্টোর অ্যাক্টিভিটি এখনো শুরু হয়নি
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ORDERS LISTINGS */}
                {activeTab === "orders" && (
                  <div className="bg-white p-6 border border-slate-100 shadow-sm flex flex-col min-h-[500px]">
                    
                    {/* Filter & Search actions bar */}
                    <div className="flex flex-col md:flex-row shadow-sm gap-4 items-center justify-between bg-slate-50 p-4 border border-zinc-150 mb-6">
                      <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search orders (by order ID, name, phone, address)..."
                          className="w-full pl-10 pr-4 py-3 text-xs outline-none bg-white border border-slate-200 focus:border-luxury-gold"
                          value={orderSearch}
                          onChange={(e) => setOrderSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <Filter size={15} className="text-slate-400" />
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status:</span>
                        <select
                          className="border border-slate-200 font-bold bg-white text-xs px-3 py-2 outline-none focus:border-luxury-gold tracking-wide rounded-sm"
                          value={orderStatusFilter}
                          onChange={(e) => setOrderStatusFilter(e.target.value)}
                        >
                          <option value="all">All Orders</option>
                          <option value="pending">Pending</option>
                          <option value="shipping">Shipping</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>

                    {/* Table View */}
                    <div className="flex-1 overflow-x-auto min-h-[400px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                            <th className="py-4 px-2 font-bold">Order Reference</th>
                            <th className="py-4 px-2 font-bold">Customer Details</th>
                            <th className="py-4 px-2 font-bold">Quantity & Items</th>
                            <th className="py-4 px-2 font-bold text-center">Payment</th>
                            <th className="py-4 px-2 font-bold text-right">Pricing (BDT)</th>
                            <th className="py-4 px-2 font-bold text-center">Status</th>
                            <th className="py-4 px-2 font-bold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-20 text-xs text-slate-400 uppercase tracking-widest">
                                কোনো ম্যাচিং অর্ডার পাওয়া যায়নি
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((order) => {
                              const qty = order.items.reduce((sum, item) => sum + item.quantity, 0);
                              return (
                                <tr key={order.id} className="border-b border-sans border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                                  <td className="py-4 px-2 font-medium">
                                    <div className="font-bold text-slate-800 uppercase tracking-wider">{order.uniqueOrderNumber}</div>
                                    <div className="text-[9px] text-slate-400 font-mono mt-1">{formatTimestamp(order.createdAt)}</div>
                                  </td>
                                  <td className="py-4 px-2 max-w-xs">
                                    <div className="font-bold text-slate-800">{order.customerName}</div>
                                    <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                                      <Phone size={10} strokeWidth={1.5} className="inline" />
                                      <span>{order.phone}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate mt-0.5" title={order.address}>
                                      <MapPin size={9} strokeWidth={1.5} className="inline mr-1" />
                                      <span>{order.address}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-2">
                                    <div className="font-bold text-slate-800">{qty} Point Model(s)</div>
                                    <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                                      {order.items.map(i => `${i.name} (${i.quantity}x)`).join(", ")}
                                    </div>
                                  </td>
                                  <td className="py-4 px-2 text-center">
                                    <span className={`px-2 py-1 text-[8px] font-bold uppercase border tracking-widest font-sans ${
                                      order.paymentMethod === 'cod' 
                                        ? 'bg-slate-100 text-slate-600 border-slate-200' 
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                      {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod.toUpperCase()}
                                    </span>
                                    {order.senderNumber && (
                                      <div className="text-[9px] text-amber-600 font-mono mt-1 font-bold">
                                        Sender: {order.senderNumber}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-4 px-2 text-right font-bold text-slate-800 font-bengali">
                                    ৳{order.totalAmount.toLocaleString()}
                                  </td>
                                  <td className="py-4 px-2 text-center">
                                    <select
                                      className={`px-2 py-1 text-[9px] font-bold border rounded outline-none ${
                                        order.status === 'delivered' 
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                          : order.status === 'shipping' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-300' 
                                            : 'bg-rose-50 text-rose-700 border-rose-300'
                                      }`}
                                      value={order.status}
                                      onChange={(e) => handleUpdateOrderStatus(order.id, "0", e.target.value as any)}
                                    >
                                      <option value="pending">PENDING</option>
                                      <option value="shipping">SHIPPING</option>
                                      <option value="delivered">DELIVERED</option>
                                    </select>
                                  </td>
                                  <td className="py-4 px-2 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 border text-slate-600 border-slate-200 rounded"
                                        title="View Invoice Detail"
                                      >
                                        <Eye size={12} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded"
                                        title="Delete Order/Cancel"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* TAB 3: LIVE ACTIVE CARTS MONITOR */}
                {activeTab === "carts" && (
                  <div className="bg-white p-6 border border-slate-100 shadow-sm flex flex-col min-h-[500px]">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Cart Additions & Trapping Analysis</h4>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">Live customer sessions before placing reservation</p>
                      </div>
                      <div className="relative w-full max-w-xs shrink-0 shadow-sm">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                        <input
                          type="text"
                          placeholder="Search live carts..."
                          className="w-full pl-8 pr-3 py-2 text-[11px] outline-none bg-slate-50 border border-slate-200 focus:border-luxury-gold"
                          value={cartSearch}
                          onChange={(e) => setCartSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto max-h-[600px] pr-2">
                      {filteredCarts.length === 0 ? (
                        <div className="col-span-2 text-center py-20 text-xs text-slate-400 uppercase tracking-widest">
                          কোনো লাইভ কেনাকাটার কার্ট সেশন সচল নেই
                        </div>
                      ) : (
                        filteredCarts.map((cart) => {
                          const quantityTotal = cart.items.reduce((sum, item) => sum + item.quantity, 0);
                          return (
                            <motion.div
                              layout
                              key={cart.id}
                              className="border border-slate-200 bg-slate-50 p-5 rounded-md flex flex-col justify-between hover:bg-slate-50/50 transition-all shadow-sm"
                            >
                              <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest rounded">
                                      Session: {cart.sessionId.slice(0, 8)}...
                                    </span>
                                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                                      Last Action: {formatTimestamp(cart.updatedAt)}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteCart(cart.id)}
                                    className="p-1.5 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 border border-rose-100 rounded-sm"
                                    title="Cancel session history tracking"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                <div className="border-t border-b border-dashed border-zinc-200 py-3 space-y-2">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Products Added ({quantityTotal})</p>
                                  {cart.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 items-center text-xs">
                                      <div className="w-8 h-8 bg-zinc-100 p-0.5 border">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 truncate uppercase mt-0.5">{item.name}</p>
                                        <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="pt-4 flex items-center justify-between text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wide bg-white p-3 border rounded">
                                <span>Cart Conversion Potential</span>
                                <span className="text-luxury-gold font-bold">100% Retained</span>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: CUSTOMERS INFORMATION CRM */}
                {activeTab === "customers" && (
                  <div className="flex gap-6 flex-col md:flex-row flex-1 overflow-hidden min-h-[500px]">
                    
                    {/* Customer List Panel */}
                    <div className="w-full md:w-5/12 bg-white p-6 border border-slate-100 shadow-sm flex flex-col h-full">
                      <div className="space-y-4 mb-6">
                        <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Premium Customers Profiles</h4>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">Aggregated by active transactions</p>
                        </div>
                        <div className="relative shadow-sm">
                          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                          <input
                            type="text"
                            placeholder="Search by client details..."
                            className="w-full pl-8 pr-3 py-2 text-[11px] outline-none bg-slate-50 border border-slate-200 focus:border-luxury-gold"
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[500px]">
                        {filteredCustomers.length === 0 ? (
                          <div className="text-center py-20 text-xs text-slate-400 uppercase tracking-widest">
                            গ্রাহকের কোনো প্রোফাইল পাওয়া যায়নি
                          </div>
                        ) : (
                          filteredCustomers.map((cust) => (
                            <button
                              key={cust.phone}
                              onClick={() => setSelectedCustomer(cust)}
                              className={`w-full text-left p-4 border transition-all pointer-events-auto block ${
                                selectedCustomer?.phone === cust.phone 
                                  ? 'bg-luxury-gold/5 border-luxury-gold shadow-sm ring-1 ring-luxury-gold/20' 
                                  : 'bg-slate-50 hover:bg-white border-zinc-150'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1.5">
                                <span className="font-bold text-slate-800 text-xs block">{cust.name}</span>
                                <span className="bg-luxury-gold text-white text-[9px] font-bold font-sans px-1.5 py-0.5 uppercase tracking-widest rounded-sm">
                                  {cust.totalOrders} Order(s)
                                </span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[11px] font-mono text-slate-500 font-bold">{cust.phone}</p>
                                <p className="text-[10px] text-slate-400 truncate leading-relaxed">{cust.address}</p>
                              </div>
                              <div className="mt-3 border-t border-slate-100 pt-2 flex justify-between items-center text-[10px]">
                                <span className="text-slate-400 uppercase tracking-widest text-[9px]">Total Spend:</span>
                                <span className="text-luxury-black font-extrabold font-bengali">৳{cust.totalSpent.toLocaleString()}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Customer Detail Profile Display */}
                    <div className="flex-1 bg-white p-6 border border-slate-100 shadow-sm flex flex-col h-full justify-between">
                      {selectedCustomer ? (
                        <div className="space-y-6 flex flex-col justify-between h-full">
                          
                          {/* Inner Header */}
                          <div className="border-b border-slate-150 pb-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold mb-3 italic">Discerning Prospect Profile</h4>
                            <h2 className="text-2xl font-serif text-slate-800 mb-1">{selectedCustomer.name}</h2>
                            <p className="text-xs text-slate-400 font-mono tracking-widest uppercase mb-4">Elite Segment Target Client</p>

                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 border border-zinc-150">
                              <div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Contact Phone</span>
                                <p className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
                                  <Phone size={12} className="text-luxury-gold" />
                                  <span>{selectedCustomer.phone}</span>
                                </p>
                              </div>
                              <div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Customer Premium Address</span>
                                <p className="text-xs text-slate-800 leading-relaxed flex items-center gap-1.5 font-sans">
                                  <MapPin size={12} className="text-luxury-gold shrink-0 align-text-top" />
                                  <span className="truncate" title={selectedCustomer.address}>{selectedCustomer.address}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Orders History Tab inside profile */}
                          <div className="flex-1 overflow-y-auto py-2 space-y-4 max-h-[300px]">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Reservation History</h4>
                            {selectedCustomer.orders.map((order) => (
                              <div key={order.id} className="border border-slate-200 bg-slate-50 p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <span className="font-bold text-slate-800 text-[11px] block">{order.uniqueOrderNumber}</span>
                                    <span className="text-[9px] text-slate-400 font-mono">{formatTimestamp(order.createdAt)}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 text-[8px] font-bold uppercase border tracking-widest ${
                                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                    order.status === 'shipping' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                    'bg-rose-50 text-rose-700 border-rose-300'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>

                                <div className="space-y-2 border-t border-slate-100 pt-3">
                                  {order.items.map((item, id) => (
                                    <div key={id} className="flex justify-between items-center text-[11px]">
                                      <span className="text-slate-600 font-bold uppercase">{item.name} ({item.quantity}x)</span>
                                      <span className="text-slate-800 font-bold font-bengali">৳{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                  ))}
                                  {order.senderNumber && (
                                    <div className="mt-2 text-[9px] text-amber-600 font-mono font-bold flex gap-1 items-center">
                                      <span className="bg-amber-100 px-1 py-0.5 text-[8px] rounded uppercase">bKash/Nagad Sender:</span>
                                      <span>{order.senderNumber}</span>
                                    </div>
                                  )}
                                  <div className="border-t border-dashed border-zinc-200 pt-2 flex justify-between items-center text-xs font-bold leading-none mt-2">
                                    <span className="text-slate-500 uppercase tracking-widest text-[9px]">Grand Total:</span>
                                    <span className="text-slate-800 font-bengali">৳{order.totalAmount.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Profile Statistics block */}
                          <div className="border-t border-slate-150 pt-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center bg-slate-50 p-3 border">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Total Lifetime Orders</span>
                                <span className="text-2xl font-serif text-slate-800 font-medium">{selectedCustomer.totalOrders}</span>
                              </div>
                              <div className="text-center bg-slate-50 p-3 border">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Aggregate Revenue Contribution</span>
                                <span className="text-2xl font-serif text-luxury-gold font-medium font-bengali">৳{selectedCustomer.totalSpent.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                          <Users size={48} strokeWidth={1} className="text-slate-300" />
                          <div>
                            <p className="text-xs uppercase font-bold text-slate-600 tracking-wider">No Customer Selected</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Select a client profile from the list to view comprehensive transactions logs</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </main>
            </div>
          )}

          {/* ORDER DETAIL MODAL INVOICE OVERLAY */}
          <AnimatePresence>
            {selectedOrder && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                  onClick={() => setSelectedOrder(null)}
                />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-2xl bg-white shadow-2xl overflow-hidden my-auto border border-zinc-200 pointer-events-auto"
                >
                  {/* Modal Header */}
                  <div className="bg-luxury-black text-white px-6 py-4 flex items-center justify-between border-b border-luxury-gold/20">
                    <div className="font-serif">
                      <span className="text-xs text-luxury-gold uppercase tracking-widest block mb-1">Invoice Statement</span>
                      <span className="text-lg italic tracking-wider uppercase">{selectedOrder.uniqueOrderNumber}</span>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Invoice content */}
                  <div className="p-8 space-y-6">
                    
                    {/* Customer overview card */}
                    <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-6">
                      <div>
                        <h4 className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Reservation Client</h4>
                        <p className="text-sm font-bold text-slate-800 leading-snug">{selectedOrder.customerName}</p>
                        <p className="text-xs font-mono text-slate-500 mt-1">{selectedOrder.phone}</p>
                        <p className="text-xs text-slate-500 leading-relaxed mt-2 font-sans">{selectedOrder.address}</p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Acquisition Log</h4>
                        <p className="text-xs font-mono text-slate-800">{formatTimestamp(selectedOrder.createdAt)}</p>
                        
                        <div className="mt-4">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Payment Method</span>
                          <span className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 border font-sans">
                            {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : selectedOrder.paymentMethod.toUpperCase()}
                          </span>
                          {selectedOrder.senderNumber && (
                            <p className="text-[10px] text-amber-600 font-bold font-mono mt-2">
                              Sender No: {selectedOrder.senderNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order line items */}
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b pb-2">Secured Horology Items</h4>
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center justify-between pb-3 border-b border-dashed border-slate-100 text-xs">
                          <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 bg-slate-50 border p-1 shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 uppercase leading-none mb-1.5">{item.name}</p>
                              <p className="text-[10px] text-slate-400">Qty: {item.quantity} x ৳{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-800 font-bengali">৳{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Invoicing summary total */}
                    <div className="bg-slate-50 p-5 border flex items-center justify-between">
                      <div>
                        <span className="text-[8.5px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Transaction Status</span>
                        <select
                          className={`px-3 py-1.5 text-xs font-bold border rounded outline-none ${
                            selectedOrder.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            selectedOrder.status === 'shipping' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                            'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                          value={selectedOrder.status}
                          onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, "0", e.target.value as any)}
                        >
                          <option value="pending">PENDING</option>
                          <option value="shipping">SHIPPING</option>
                          <option value="delivered">DELIVERED</option>
                        </select>
                      </div>
                      <div className="text-right">
                        <span className="text-[8.5px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Grand Investment Total</span>
                        <span className="text-2xl font-serif text-luxury-black font-semibold font-bengali italic">৳{selectedOrder.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}
    </AnimatePresence>
  );
}
