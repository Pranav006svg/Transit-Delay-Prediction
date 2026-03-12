import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, Calendar, ArrowRight, Zap, Shield, Route,
  AlertTriangle, Sparkles, Loader2, CloudRain, Activity, Wifi, WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimatedSection from "@/components/AnimatedSection";
import { predictDelay, heuristicPredict, checkHealth, type PredictResponse } from "@/services/api";

// ── Dataset-derived station list ──────────────────────────────────────────────
const STATIONS = Array.from({ length: 50 }, (_, i) => `Station_${i + 1}`);
const TRANSPORT_TYPES = ["Bus", "Tram", "Metro", "Train"];
const WEATHER_CONDITIONS = ["Clear", "Cloudy", "Rain", "Storm", "Snow", "Fog"];
const EVENT_TYPES = ["None", "Sports", "Concert", "Festival", "Parade", "Protest"];
const SEASONS = ["Winter", "Spring", "Summer", "Autumn"];

const getSeason = (date: Date): string => {
  const m = date.getMonth() + 1;
  if (m >= 3 && m <= 5) return "Spring";
  if (m >= 6 && m <= 8) return "Summer";
  if (m >= 9 && m <= 11) return "Autumn";
  return "Winter";
};

const isPeakHour = (hour: number): boolean =>
  (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

const riskColour = (r: string) =>
  r === "Low" ? "text-success" : r === "Medium" ? "text-warning" : "text-destructive";

const riskBg = (r: string) =>
  r === "Low" ? "bg-success/10" : r === "Medium" ? "bg-warning/10" : "bg-destructive/10";

const Prediction = () => {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Form state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [transport, setTransport] = useState("Bus");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("08:00");
  const [weather, setWeather] = useState("Clear");
  const [eventType, setEventType] = useState("None");
  const [traffic, setTraffic] = useState(50);

  // Result state
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkHealth().then(setApiOnline);
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const departureDate = new Date(`${date}T${time}:00`);
    const hour = departureDate.getHours();

    const req = {
      transport_type: transport,
      weather_condition: weather,
      event_type: eventType,
      traffic_congestion_index: traffic,
      peak_hour: isPeakHour(hour) ? 1 : 0,
      season: getSeason(departureDate),
      weekday: departureDate.getDay(),
      hour,
      temperature_C: 20,
      humidity_percent: 60,
      wind_speed_kmh: 15,
      precipitation_mm: weather === "Rain" || weather === "Storm" ? 8 : weather === "Snow" ? 5 : 0,
      holiday: 0,
    };

    try {
      if (apiOnline) {
        const res = await predictDelay(req);
        setResult(res);
      } else {
        // Use client-side heuristic when backend is offline
        await new Promise((r) => setTimeout(r, 900));
        setResult(heuristicPredict(req));
      }
    } catch {
      setError("Prediction failed. Using offline estimate.");
      setResult(heuristicPredict(req));
    } finally {
      setLoading(false);
    }
  };

  const transportIcon: Record<string, string> = { Bus: "🚌", Tram: "🚃", Metro: "🚇", Train: "🚆" };

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
            Enter your route details and our ML model — trained on 35 000+ real trips — will predict delay probability and risk.
          </p>
          {/* API status badge */}
          {apiOnline !== null && (
            <div className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full text-xs font-medium ${apiOnline ? "bg-success/10 text-success" : "bg-muted/40 text-muted-foreground"}`}>
              {apiOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {apiOnline ? "ML backend connected" : "Offline — using heuristic model"}
            </div>
          )}
        </AnimatedSection>

        <div className="max-w-2xl mx-auto">
          <AnimatedSection delay={0.1}>
            <div className="glass-card p-8 gradient-border space-y-5">

              {/* Origin / Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Origin Station</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-primary z-10" />
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full pl-11 pr-4 bg-secondary/60 border border-border/30 text-foreground h-11 rounded-xl text-sm focus:outline-none focus:border-primary/50 appearance-none"
                    >
                      <option value="">Select station…</option>
                      {STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Destination Station</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-accent z-10" />
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-11 pr-4 bg-secondary/60 border border-border/30 text-foreground h-11 rounded-xl text-sm focus:outline-none focus:border-accent/50 appearance-none"
                    >
                      <option value="">Select station…</option>
                      {STATIONS.filter((s) => s !== origin).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Transport / Date / Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Transport Mode</label>
                  <Select value={transport} onValueChange={setTransport}>
                    <SelectTrigger className="bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSPORT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{transportIcon[t]} {t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                      className="pl-11 bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">Departure Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                      className="pl-11 bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Weather / Event */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">
                    <CloudRain className="inline w-3.5 h-3.5 mr-1" />Weather Condition
                  </label>
                  <Select value={weather} onValueChange={setWeather}>
                    <SelectTrigger className="bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEATHER_CONDITIONS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block font-medium">
                    <Activity className="inline w-3.5 h-3.5 mr-1" />Nearby Event
                  </label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Traffic congestion slider */}
              <div>
                <label className="text-sm text-muted-foreground mb-3 block font-medium">
                  Traffic Congestion Index —
                  <span className={`font-bold ml-1 ${traffic < 40 ? "text-success" : traffic < 70 ? "text-warning" : "text-destructive"}`}>
                    {traffic} / 100
                  </span>
                </label>
                <Slider
                  min={0} max={100} step={1}
                  value={[traffic]}
                  onValueChange={([v]) => setTraffic(v)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Free flow</span><span>Heavy congestion</span>
                </div>
              </div>

              {error && (
                <div className="text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg px-4 py-2">{error}</div>
              )}

              <Button
                onClick={handlePredict}
                disabled={loading}
                className="w-full text-primary-foreground gap-2 rounded-xl h-12 text-base"
                size="lg"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Running ML Model…</>
                  : <><Sparkles className="w-4 h-4" /> Predict Delay & Risk <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </div>
          </AnimatedSection>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="mt-10 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <h3 className="text-xl font-bold text-foreground">Prediction Results</h3>
                  </div>
                  {result.model_accuracy > 0 && (
                    <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                      Model Accuracy: <span className="text-foreground font-semibold">{result.model_accuracy}%</span>
                    </span>
                  )}
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: AlertTriangle, label: "Delay Probability", value: `${result.delay_probability}%`, color: result.delay_probability > 60 ? "text-destructive" : result.delay_probability > 35 ? "text-warning" : "text-success" },
                    { icon: Clock, label: "Expected Delay", value: `${result.expected_delay_min} min`, color: "text-primary" },
                    { icon: Shield, label: "Confidence", value: `${result.confidence}%`, color: "text-accent" },
                    { icon: Activity, label: "Risk Level", value: result.risk_level, color: riskColour(result.risk_level) },
                  ].map((r, i) => (
                    <motion.div
                      key={r.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.5 }}
                      className="border border-border bg-card rounded-2xl p-5 relative overflow-hidden"
                    >
                      <r.icon className={`w-6 h-6 ${r.color} mb-2`} />
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{r.label}</div>
                      <div className={`text-2xl font-bold mt-1 ${r.color}`}>{r.value}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Delay probability bar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="glass-card p-5 gradient-border"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Delay Probability</span>
                    <span className={`text-sm font-bold ${riskColour(result.risk_level)}`}>{result.risk_level} Risk</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.delay_probability}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
                      className={`h-3 rounded-full ${result.delay_probability > 60 ? "bg-destructive" : result.delay_probability > 35 ? "bg-warning" : "bg-success"}`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0% Certain</span><span>100% Certain delay</span>
                  </div>
                </motion.div>

                {/* Route suggestions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.5 }}
                  className="border border-border bg-card rounded-2xl p-6 space-y-3"
                >
                  <h4 className="font-semibold text-foreground text-sm mb-1">Route Recommendations</h4>
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-primary/5 hover:bg-primary/8 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Recommended</div>
                      <div className="text-foreground font-semibold truncate">{transport} via Route_1 → Direct</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${riskBg("Low")} ${riskColour("Low")}`}>Best</div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-highlight/10 flex items-center justify-center">
                      <Route className="w-5 h-5 text-highlight" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Alternative</div>
                      <div className="text-foreground font-semibold truncate">
                        {transport === "Bus" ? "Metro" : "Bus"} via Route_2 → Alternative path
                      </div>
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
