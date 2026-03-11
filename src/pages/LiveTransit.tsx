import { Bus, Train, Clock, MapPin, AlertTriangle, CheckCircle, Activity, Radio } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";

const vehicles = [
  { type: "Bus", number: "45", location: "City Center", arrival: "8 min", status: "Slight Delay", statusColor: "text-warning", icon: Bus, pulse: true },
  { type: "Metro", number: "Blue Line", location: "Central Station", arrival: "3 min", status: "On Time", statusColor: "text-success", icon: Train, pulse: false },
  { type: "Bus", number: "12", location: "University Ave", arrival: "15 min", status: "On Time", statusColor: "text-success", icon: Bus, pulse: false },
  { type: "Train", number: "Express 7", location: "North Terminal", arrival: "22 min", status: "Delayed", statusColor: "text-destructive", icon: Train, pulse: true },
];

const LiveTransit = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 dot-bg opacity-20" />
      <div className="orb w-[350px] h-[350px] bg-accent/6 top-[15%] left-[5%]" />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/20 mb-6">
            <Radio className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent font-medium">Real-time Tracking</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Live <span className="gradient-text">Transit Map</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Real-time tracking of buses, trains, and metro across the city.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnimatedSection className="lg:col-span-2">
            <div className="glass-card gradient-border h-[520px] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="absolute inset-8">
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  {/* Routes */}
                  <path d="M50 250 Q100 200 150 180 T250 120 T350 80" stroke="hsl(217, 91%, 53%)" strokeWidth="2.5" fill="none" opacity="0.4" strokeDasharray="8 4">
                    <animate attributeName="stroke-dashoffset" values="0;-24" dur="2s" repeatCount="indefinite" />
                  </path>
                  <path d="M80 50 Q120 100 180 150 T300 250" stroke="hsl(187, 85%, 53%)" strokeWidth="2.5" fill="none" opacity="0.4" strokeDasharray="8 4">
                    <animate attributeName="stroke-dashoffset" values="0;-24" dur="2.5s" repeatCount="indefinite" />
                  </path>
                  <path d="M350 200 Q280 180 200 200 T50 150" stroke="hsl(263, 70%, 58%)" strokeWidth="2.5" fill="none" opacity="0.4" strokeDasharray="8 4">
                    <animate attributeName="stroke-dashoffset" values="0;-24" dur="3s" repeatCount="indefinite" />
                  </path>
                  
                  {/* Glow circles */}
                  <circle cx="150" cy="180" r="16" fill="hsl(217, 91%, 53%)" opacity="0.1">
                    <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="250" cy="120" r="16" fill="hsl(187, 85%, 53%)" opacity="0.1">
                    <animate attributeName="r" values="12;20;12" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  
                  {/* Vehicle dots */}
                  <circle cx="150" cy="180" r="6" fill="hsl(217, 91%, 53%)" filter="url(#mapGlow)" />
                  <circle cx="250" cy="120" r="6" fill="hsl(187, 85%, 53%)" filter="url(#mapGlow)" />
                  <circle cx="180" cy="150" r="6" fill="hsl(263, 70%, 58%)" filter="url(#mapGlow)" />
                  <circle cx="300" cy="250" r="5" fill="hsl(38, 92%, 50%)" filter="url(#mapGlow)" />
                  
                  <defs>
                    <filter id="mapGlow">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  
                  <text x="150" y="168" fill="hsl(210, 40%, 96%)" fontSize="8" textAnchor="middle" fontWeight="600">Bus 45</text>
                  <text x="250" y="108" fill="hsl(210, 40%, 96%)" fontSize="8" textAnchor="middle" fontWeight="600">Metro</text>
                  <text x="180" y="140" fill="hsl(210, 40%, 96%)" fontSize="8" textAnchor="middle" fontWeight="600">Bus 12</text>
                  <text x="300" y="240" fill="hsl(210, 40%, 96%)" fontSize="8" textAnchor="middle" fontWeight="600">Train</text>
                </svg>
              </div>
              <div className="absolute bottom-4 left-4 glass-card px-4 py-2.5 text-xs text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Live — Connect API for real data
              </div>
              <div className="absolute top-4 right-4 glass-card px-4 py-2.5 text-xs text-foreground font-mono">
                4 vehicles tracked
              </div>
            </div>
          </AnimatedSection>

          <div className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Active Vehicles</div>
            {vehicles.map((v, i) => (
              <AnimatedSection key={v.number} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass-card-hover p-5 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center">
                        <v.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm">{v.type} {v.number}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {v.location}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs font-medium ${v.statusColor} flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/50`}>
                      {v.status === "On Time" ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {v.status}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> Arrives in <span className="text-foreground font-semibold">{v.arrival}</span>
                    </div>
                    {v.pulse && <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />}
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTransit;
