import { useState } from "react";
import { MapPin, ArrowRight, CheckCircle, Shield, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimatedSection from "@/components/AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";

const routes = [
  { name: "Route A — Bus 21 → Metro Blue", time: "40 min", risk: "Low", reliability: 90, recommended: false },
  { name: "Route B — Metro Green Line Direct", time: "35 min", risk: "Medium", reliability: 70, recommended: false },
  { name: "Route C — Express Train + Walk", time: "45 min", risk: "Very Low", reliability: 95, recommended: true },
];

const riskColor = (r: string) => r === "Low" || r === "Very Low" ? "text-success" : r === "Medium" ? "text-warning" : "text-destructive";
const riskBg = (r: string) => r === "Low" || r === "Very Low" ? "bg-success/10" : r === "Medium" ? "bg-warning/10" : "bg-destructive/10";

const RouteComparison = () => {
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCompare = () => {
    setLoading(true);
    setShowTable(false);
    setTimeout(() => { setLoading(false); setShowTable(true); }, 1200);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 dot-bg opacity-20" />
      <div className="orb w-[300px] h-[300px] bg-highlight/6 top-[20%] right-[10%]" />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-highlight/5 border border-highlight/20 mb-6">
            <Shield className="w-4 h-4 text-highlight" />
            <span className="text-sm text-highlight font-medium">Smart Comparison</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Route <span className="gradient-text">Comparison</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">Compare transit routes side by side and pick the most reliable option.</p>
        </AnimatedSection>

        <div className="max-w-xl mx-auto mb-10">
          <AnimatedSection delay={0.1}>
            <div className="glass-card p-6 gradient-border flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-primary" />
                <Input placeholder="Start Location" className="pl-11 bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl" />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-accent" />
                <Input placeholder="Destination" className="pl-11 bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl" />
              </div>
              <Button onClick={handleCompare} disabled={loading} className="btn-primary-glow text-primary-foreground gap-2 rounded-xl h-11 px-6">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Compare <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </div>
          </AnimatedSection>
        </div>

        <AnimatePresence>
          {showTable && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <div className="glass-card overflow-hidden gradient-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20">
                        <th className="text-left p-5 text-xs text-muted-foreground font-medium uppercase tracking-wider">Route</th>
                        <th className="text-center p-5 text-xs text-muted-foreground font-medium uppercase tracking-wider">Time</th>
                        <th className="text-center p-5 text-xs text-muted-foreground font-medium uppercase tracking-wider">Risk</th>
                        <th className="text-center p-5 text-xs text-muted-foreground font-medium uppercase tracking-wider">Reliability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map((r, i) => (
                        <motion.tr
                          key={r.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`border-b border-border/10 transition-colors hover:bg-secondary/20 ${r.recommended ? "bg-primary/5" : ""}`}
                        >
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              {r.recommended && <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />}
                              <div>
                                <div className="text-foreground text-sm font-medium">{r.name}</div>
                                {r.recommended && <span className="text-xs text-success font-medium">✨ AI Recommended</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-center text-foreground text-sm font-medium">{r.time}</td>
                          <td className="p-5 text-center">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${riskColor(r.risk)} ${riskBg(r.risk)}`}>
                              {r.risk}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${r.reliability}%` }}
                                  transition={{ duration: 1, delay: 0.3 + i * 0.15 }}
                                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                />
                              </div>
                              <span className="text-sm text-foreground font-semibold">{r.reliability}%</span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RouteComparison;
