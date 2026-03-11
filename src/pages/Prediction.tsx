import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Calendar, ArrowRight, Zap, Shield, Route, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimatedSection from "@/components/AnimatedSection";

const dummyResult = {
  travelTime: "35 minutes",
  delayProb: "27%",
  confidence: "92%",
  recommended: "Bus 21 → Metro Blue Line",
  alternative: "Metro Green Line",
};

const Prediction = () => {
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePredict = () => {
    setLoading(true);
    setShowResults(false);
    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 dot-bg opacity-20" />
      <div className="orb w-[400px] h-[400px] bg-primary/8 top-[10%] right-[5%]" />
      <div className="orb w-[300px] h-[300px] bg-accent/5 bottom-[20%] left-[10%]" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI Prediction Engine</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Transit <span className="gradient-text">Prediction</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Enter your route details and let AI predict travel time, delays, and optimal routes.
          </p>
        </AnimatedSection>

        <div className="max-w-2xl mx-auto">
          <AnimatedSection delay={0.1}>
            <div className="glass-card p-8 gradient-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">From Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-primary" />
                    <Input placeholder="e.g., City Center" className="pl-11 bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">To Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-accent" />
                    <Input placeholder="e.g., Airport Terminal" className="pl-11 bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl focus:border-accent/50 focus:ring-accent/20 transition-all" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Transport Mode</label>
                  <Select>
                    <SelectTrigger className="bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bus">🚌 Bus</SelectItem>
                      <SelectItem value="metro">🚇 Metro</SelectItem>
                      <SelectItem value="train">🚆 Train</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                    <Input type="date" className="pl-11 bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Departure Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                    <Input type="time" className="pl-11 bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl" />
                  </div>
                </div>
              </div>
              <Button
                onClick={handlePredict}
                disabled={loading}
                className="w-full btn-primary-glow text-primary-foreground gap-2 rounded-xl h-12 text-base"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Routes...
                  </>
                ) : (
                  <>
                    Predict Travel Time <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </AnimatedSection>

          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mt-10 space-y-6"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h3 className="text-xl font-bold text-foreground">Prediction Results</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: Clock, label: "Predicted Travel Time", value: dummyResult.travelTime, color: "text-primary", glow: "shadow-primary/10" },
                    { icon: AlertTriangle, label: "Delay Probability", value: dummyResult.delayProb, color: "text-warning", glow: "shadow-warning/10" },
                    { icon: Shield, label: "Confidence Score", value: dummyResult.confidence, color: "text-success", glow: "shadow-success/10" },
                  ].map((r, i) => (
                    <motion.div
                      key={r.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.5 }}
                    >
                      <div className={`metric-card hover:scale-[1.02] transition-transform duration-300 shadow-lg ${r.glow}`}>
                        <r.icon className={`w-7 h-7 ${r.color} mb-3`} />
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{r.label}</div>
                        <div className="text-3xl font-bold text-foreground mt-1">{r.value}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="glass-card p-6 gradient-border space-y-4"
                >
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-primary/5 hover:bg-primary/8 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Recommended Route</div>
                      <div className="text-foreground font-semibold">{dummyResult.recommended}</div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">Best</div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-highlight/10 flex items-center justify-center">
                      <Route className="w-5 h-5 text-highlight" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Alternative Route</div>
                      <div className="text-foreground font-semibold">{dummyResult.alternative}</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
