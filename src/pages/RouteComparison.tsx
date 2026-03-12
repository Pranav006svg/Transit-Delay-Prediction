import { useState, useEffect } from "react";
import { MapPin, ArrowRight, Shield, Loader2, Wifi, WifiOff, TrendingDown, TrendingUp, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimatedSection from "@/components/AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";
import { fetchRoutes, RouteStats } from "@/services/api";

// Fallback data derived from the dataset (Route_1–Route_20)
const FALLBACK_ROUTES: RouteStats[] = [
  { route_id: "Route_1",  total: 1752, delayed: 1120, avg_delay: 13.2, delay_rate: 63.9, reliability: 36.1 },
  { route_id: "Route_2",  total: 1752, delayed: 980,  avg_delay: 11.4, delay_rate: 55.9, reliability: 44.1 },
  { route_id: "Route_3",  total: 1752, delayed: 1400, avg_delay: 16.3, delay_rate: 79.9, reliability: 20.1 },
  { route_id: "Route_4",  total: 1752, delayed: 720,  avg_delay: 8.7,  delay_rate: 41.1, reliability: 58.9 },
  { route_id: "Route_5",  total: 1752, delayed: 560,  avg_delay: 6.9,  delay_rate: 32.0, reliability: 68.0 },
  { route_id: "Route_6",  total: 1752, delayed: 840,  avg_delay: 10.1, delay_rate: 48.0, reliability: 52.0 },
  { route_id: "Route_7",  total: 1752, delayed: 1440, avg_delay: 17.5, delay_rate: 82.2, reliability: 17.8 },
  { route_id: "Route_8",  total: 1752, delayed: 660,  avg_delay: 7.8,  delay_rate: 37.7, reliability: 62.3 },
  { route_id: "Route_9",  total: 1752, delayed: 1050, avg_delay: 12.6, delay_rate: 59.9, reliability: 40.1 },
  { route_id: "Route_10", total: 1752, delayed: 490,  avg_delay: 5.8,  delay_rate: 28.0, reliability: 72.0 },
  { route_id: "Route_11", total: 1752, delayed: 910,  avg_delay: 10.9, delay_rate: 52.0, reliability: 48.0 },
  { route_id: "Route_12", total: 1752, delayed: 1260, avg_delay: 14.8, delay_rate: 71.9, reliability: 28.1 },
  { route_id: "Route_13", total: 1752, delayed: 770,  avg_delay: 9.2,  delay_rate: 44.0, reliability: 56.0 },
  { route_id: "Route_14", total: 1752, delayed: 1190, avg_delay: 14.0, delay_rate: 67.9, reliability: 32.1 },
  { route_id: "Route_15", total: 1752, delayed: 630,  avg_delay: 7.5,  delay_rate: 36.0, reliability: 64.0 },
  { route_id: "Route_16", total: 1752, delayed: 350,  avg_delay: 4.2,  delay_rate: 20.0, reliability: 80.0 },
  { route_id: "Route_17", total: 1752, delayed: 1050, avg_delay: 12.3, delay_rate: 59.9, reliability: 40.1 },
  { route_id: "Route_18", total: 1752, delayed: 875,  avg_delay: 10.5, delay_rate: 50.0, reliability: 50.0 },
  { route_id: "Route_19", total: 1752, delayed: 455,  avg_delay: 5.4,  delay_rate: 26.0, reliability: 74.0 },
  { route_id: "Route_20", total: 1752, delayed: 1330, avg_delay: 15.7, delay_rate: 76.0, reliability: 24.0 },
];

type SortKey = "route_id" | "delay_rate" | "avg_delay" | "reliability" | "total";

const getRisk = (rate: number) => {
  if (rate < 40) return { label: "Low", color: "text-success", bg: "bg-success/10" };
  if (rate < 65) return { label: "Medium", color: "text-warning", bg: "bg-warning/10" };
  return { label: "High", color: "text-destructive", bg: "bg-destructive/10" };
};

const RouteComparison = () => {
  const [routes, setRoutes] = useState<RouteStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("delay_rate");
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState("");

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const data = await fetchRoutes();
      if (data && data.length > 0) {
        setRoutes(data);
        setApiOnline(true);
      } else {
        setRoutes(FALLBACK_ROUTES);
        setApiOnline(false);
      }
    } catch {
      setRoutes(FALLBACK_ROUTES);
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoutes(); }, []);

  const sorted = [...routes]
    .filter(r => r.route_id.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === "string") return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span className="text-muted-foreground/40 ml-1">⇅</span>;
    return sortAsc
      ? <TrendingUp className="inline w-3 h-3 ml-1 text-primary" />
      : <TrendingDown className="inline w-3 h-3 ml-1 text-primary" />;
  };

  const best = [...routes].sort((a, b) => a.delay_rate - b.delay_rate)[0];
  const worst = [...routes].sort((a, b) => b.delay_rate - a.delay_rate)[0];

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 dot-bg opacity-20" />
      <div className="orb w-[300px] h-[300px] bg-highlight/6 top-[20%] right-[10%]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-highlight/5 border border-highlight/20 mb-6">
            <Shield className="w-4 h-4 text-highlight" />
            <span className="text-sm text-highlight font-medium">Smart Comparison</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Route <span className="text-primary">Comparison</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Compare all 20 transit routes ranked by reliability — powered by{" "}
            <span className="text-primary font-medium">real dataset analytics</span>.
          </p>
          <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full text-xs font-medium border ${apiOnline ? "border-success/30 bg-success/5 text-success" : "border-muted-foreground/20 bg-secondary text-muted-foreground"}`}>
            {apiOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {apiOnline ? "Live data from ML backend" : "Offline — using pre-computed estimates"}
          </div>
        </AnimatedSection>

        {/* Highlight cards */}
        {!loading && routes.length > 0 && (
          <AnimatedSection delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            <div className="glass-card p-5 flex items-center gap-4 gradient-border">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Most Reliable Route</p>
                <p className="text-foreground font-bold text-lg">{best?.route_id}</p>
                <p className="text-success text-sm font-medium">{best?.delay_rate.toFixed(1)}% delay rate</p>
              </div>
            </div>
            <div className="glass-card p-5 flex items-center gap-4 gradient-border">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Least Reliable Route</p>
                <p className="text-foreground font-bold text-lg">{worst?.route_id}</p>
                <p className="text-destructive text-sm font-medium">{worst?.delay_rate.toFixed(1)}% delay rate</p>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Filter + refresh bar */}
        <AnimatedSection delay={0.2} className="max-w-4xl mx-auto mb-6">
          <div className="border border-border bg-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 relative w-full">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-primary" />
              <Input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter by route ID (e.g. Route_7)"
                className="pl-11 bg-secondary/60 border-border/30 text-foreground h-11 rounded-xl w-full"
              />
            </div>
            <Button
              variant="outline"
              onClick={loadRoutes}
              disabled={loading}
              className="gap-2 rounded-xl h-11 px-5 flex-shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </Button>
          </div>
        </AnimatedSection>

        {/* Table */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Loading route statistics…</p>
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
              <div className="glass-card overflow-hidden gradient-border">
                <div className="px-6 py-4 border-b border-border/20 flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-foreground font-semibold text-sm">All Routes — Ranked by Delay Rate</h2>
                  <span className="ml-auto text-xs text-muted-foreground">{sorted.length} routes</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20 bg-secondary/20">
                        {(
                          [
                            { key: "route_id" as SortKey, label: "Route" },
                            { key: "total" as SortKey, label: "Total Trips" },
                            { key: "delay_rate" as SortKey, label: "Delay Rate" },
                            { key: "avg_delay" as SortKey, label: "Avg Delay" },
                            { key: "reliability" as SortKey, label: "Reliability" },
                          ] as { key: SortKey; label: string }[]
                        ).map(({ key, label }) => (
                          <th
                            key={key}
                            onClick={() => toggleSort(key)}
                            className="px-5 py-3 text-left text-xs text-muted-foreground font-medium uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
                          >
                            {label}<SortIcon k={key} />
                          </th>
                        ))}
                        <th className="px-5 py-3 text-left text-xs text-muted-foreground font-medium uppercase tracking-wider">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((r, i) => {
                        const risk = getRisk(r.delay_rate);
                        return (
                          <motion.tr
                            key={r.route_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-border/10 transition-colors hover:bg-secondary/20"
                          >
                            <td className="px-5 py-4 font-semibold text-foreground text-sm">{r.route_id}</td>
                            <td className="px-5 py-4 text-muted-foreground text-sm">{r.total.toLocaleString()}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${r.delay_rate}%` }}
                                    transition={{ duration: 0.8, delay: 0.1 + i * 0.03 }}
                                    className={`h-full rounded-full ${r.delay_rate >= 65 ? "bg-destructive" : r.delay_rate >= 40 ? "bg-warning" : "bg-success"}`}
                                  />
                                </div>
                                <span className={`text-sm font-semibold ${risk.color}`}>{r.delay_rate.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-foreground text-sm font-medium">{r.avg_delay.toFixed(1)} min</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${r.reliability}%` }}
                                    transition={{ duration: 0.8, delay: 0.1 + i * 0.03 }}
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                  />
                                </div>
                                <span className="text-sm font-semibold text-foreground">{r.reliability.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${risk.color} ${risk.bg}`}>
                                {risk.label}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                      {sorted.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">
                            No routes match your filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 border-t border-border/20 text-xs text-muted-foreground">
                  Risk thresholds: <span className="text-success font-medium">Low</span> &lt;40% ·{" "}
                  <span className="text-warning font-medium">Medium</span> 40–65% ·{" "}
                  <span className="text-destructive font-medium">High</span> &gt;65% delay rate
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
