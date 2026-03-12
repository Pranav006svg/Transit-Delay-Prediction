import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, MapPin, CloudRain, Route, ArrowRight, Zap, Shield, BarChart3, Sparkles, Activity, Cpu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection, { useCounter } from "@/components/AnimatedSection";

const features = [
  { icon: Brain, title: "Smart Delay Prediction", desc: "Predict transit delays using models trained on historical data.", gradient: "from-primary/20 to-primary/5" },
  { icon: MapPin, title: "Live Transit Tracking", desc: "Monitor buses, trains, and metro movement in real time on an interactive map.", gradient: "from-accent/20 to-accent/5" },
  { icon: CloudRain, title: "Traffic & Weather Insights", desc: "Understand how external conditions like rain and traffic jams affect transit.", gradient: "from-highlight/20 to-highlight/5" },
  { icon: Route, title: "Smart Route Optimization", desc: "Find the most reliable travel route based on our prediction engine.", gradient: "from-success/20 to-success/5" },
];

const steps = [
  { num: "01", title: "Enter Route", desc: "Input your starting point and destination with preferred transport mode.", icon: Globe },
  { num: "02", title: "Data Collection", desc: "System gathers real-time transit, weather, and traffic data.", icon: Activity },
  { num: "03", title: "Engine Prediction", desc: "Advanced prediction models calculate uncertainty and potential delays.", icon: Cpu },
  { num: "04", title: "Optimized Result", desc: "Receive travel recommendations with confidence scores.", icon: Zap },
];

const CounterStat = ({ value, suffix, label, icon: Icon }: { value: number; suffix: string; label: string; icon: React.ElementType }) => {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="glass-card gradient-border p-5 text-center group hover:scale-[1.02] transition-transform duration-300">
      <Icon className="w-5 h-5 text-primary mx-auto mb-2 group-hover:text-accent transition-colors" />
      <div className="text-3xl font-bold text-foreground tabular-nums">{count}{suffix}</div>
      <div className="text-xs text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 grid-bg animate-grid-move" />
        
        {/* Animated orbs */}
        <div className="orb w-[500px] h-[500px] bg-primary/12 top-[10%] left-[15%]" style={{ animationDelay: "0s" }} />
        <div className="orb w-[400px] h-[400px] bg-accent/8 bottom-[15%] right-[10%]" style={{ animationDelay: "2s" }} />
        <div className="orb w-[300px] h-[300px] bg-highlight/6 top-[40%] right-[25%]" style={{ animationDelay: "4s" }} />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 1.5}s`,
              "--tx": `${(i % 2 ? 1 : -1) * 50}px`,
              "--ty": `-${40 + i * 15}px`,
            } as React.CSSProperties}
          />
        ))}

        <div className="container mx-auto px-4 relative z-10 text-center pt-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.05] tracking-tight">
              <span className="text-foreground">Smart Transit</span>
              <br />
              <span className="gradient-text">Uncertainty Prediction</span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Predict travel delays, estimate arrival times, and optimize transit routes using advanced analytics and real-time data.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/prediction">
                <Button size="lg" className="btn-primary-glow text-primary-foreground px-8 gap-2 rounded-xl h-12 text-base">
                  Try Prediction <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="px-8 rounded-xl h-12 text-base border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  View Dashboard
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24 max-w-3xl mx-auto"
          >
            <CounterStat value={2} suffix="K+" label="Trips Analyzed" icon={BarChart3} />
            <CounterStat value={20} suffix="" label="Routes Covered" icon={Route} />
            <CounterStat value={68} suffix="%" label="ML Accuracy" icon={Zap} />
            <CounterStat value={50} suffix="" label="Stations" icon={Shield} />
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features */}
      <section className="py-28 relative">
        <div className="absolute inset-0 dot-bg opacity-40" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/20 mb-6">
              <Brain className="w-4 h-4 text-accent" />
              <span className="text-sm text-accent font-medium">Core Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-5">Intelligent Transit Features</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">Leveraging advanced engineering to transform public transportation prediction and optimization.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.1}>
                <div className="glass-card-hover p-7 h-full group relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/10">
                      <f.icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors duration-300" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-lg">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-highlight/5 border border-highlight/20 mb-6">
              <Activity className="w-4 h-4 text-highlight" />
              <span className="text-sm text-highlight font-medium">Process</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-5">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">Four simple steps to get smart transit predictions.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-px">
              <div className="w-full h-full bg-gradient-to-r from-primary via-accent to-highlight opacity-30" />
              <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-primary to-transparent opacity-50 animate-shimmer" style={{ animation: "shimmer 3s ease-in-out infinite" }} />
            </div>
            {steps.map((s, i) => (
              <AnimatedSection key={s.num} delay={i * 0.15}>
                <div className="glass-card p-7 text-center relative group hover:scale-[1.02] transition-transform duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                      <s.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="text-xs font-mono text-primary/60 mb-2 tracking-widest">{s.num}</div>
                    <h3 className="font-semibold text-foreground mb-2 text-lg">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* AI Insights Area (Removed mention of AI) */}
      <section className="py-28 relative">
        <div className="absolute inset-0 dot-bg opacity-20" />
        <div className="orb w-[300px] h-[300px] bg-accent/6 top-[20%] right-[5%]" style={{ animationDelay: "1s" }} />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Real-time Intelligence</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-5">Live Insights</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Peak Delay Hours", value: "7–9 AM · 5–7 PM", icon: "⏰", borderColor: "border-l-destructive" },
              { label: "Most Reliable Route", value: "Route_16", icon: "🛤️", borderColor: "border-l-success" },
              { label: "Worst Weather", value: "Storm (+18% delays)", icon: "🌩️", borderColor: "border-l-warning" },
              { label: "Transport Modes", value: "Bus · Tram · Metro · Train", icon: "🚌", borderColor: "border-l-primary" },
            ].map((insight, i) => (
              <AnimatedSection key={insight.label} delay={i * 0.1}>
                <div className={`glass-card-hover p-6 border-l-2 ${insight.borderColor}`}>
                  <div className="text-2xl mb-2">{insight.icon}</div>
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">{insight.label}</div>
                  <div className="text-lg font-bold text-foreground">{insight.value}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="glass-card p-16 text-center relative overflow-hidden gradient-border">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/6" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-5">Ready to Predict Your Commute?</h2>
                  <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg">Get started with smart transit predictions and never be late again.</p>
                  <Link to="/prediction">
                    <Button size="lg" className="btn-primary-glow text-primary-foreground px-10 gap-2 rounded-xl h-13 text-base">
                      Start Predicting <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Index;
