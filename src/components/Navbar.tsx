import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Train, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Prediction", path: "/prediction" },
  { label: "Live Transit", path: "/live-transit" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Route Comparison", path: "/route-comparison" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-navbar" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl btn-primary-glow flex items-center justify-center transition-transform group-hover:scale-105">
            <Train className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">
            AI Transit <span className="gradient-text">Predict</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link px-3 py-2 rounded-lg ${location.pathname === item.path ? "active bg-primary/5" : "hover:bg-secondary/50"}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:block">
          <Link to="/prediction">
            <Button className="btn-primary-glow text-primary-foreground text-sm px-5 gap-2 rounded-xl">
              <Sparkles className="w-3.5 h-3.5" /> Get Prediction
            </Button>
          </Link>
        </div>

        <button
          className="lg:hidden text-foreground p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass-navbar border-t border-border/20 overflow-hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm transition-all ${
                      location.pathname === item.path
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <Link to="/prediction" onClick={() => setMobileOpen(false)}>
                <Button className="w-full btn-primary-glow text-primary-foreground mt-2 gap-2 rounded-xl">
                  <Sparkles className="w-3.5 h-3.5" /> Get Prediction
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
