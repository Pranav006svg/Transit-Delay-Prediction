import { useState, useEffect } from "react";
import { Clock, Route, CheckCircle, Shield, TrendingUp, BarChart3, Activity, Sparkles, ArrowUpRight, ArrowDownRight, Database } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import AnimatedSection, { useCounter } from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import { fetchStats, type ApiStats } from "@/services/api";

// â”€â”€ Fallback static data (dataset-derived estimates) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FALLBACK_HOURLY = [
  { time: "5AM", delay: 10 }, { time: "6AM", delay: 10 }, { time: "7AM", delay: 13 },
  { time: "8AM", delay: 15 }, { time: "9AM", delay: 14 }, { time: "10AM", delay: 11 },
  { time: "11AM", delay: 10 }, { time: "12PM", delay: 11 }, { time: "1PM", delay: 11 },
  { time: "2PM", delay: 12 }, { time: "3PM", delay: 12 }, { time: "4PM", delay: 13 },
  { time: "5PM", delay: 15 }, { time: "6PM", delay: 16 }, { time: "7PM", delay: 13 },
  { time: "8PM", delay: 11 }, { time: "9PM", delay: 10 }, { time: "10PM", delay: 10 },
];

const FALLBACK_WEATHER = [
  { weather_condition: "Storm", avg_delay: 16.2, delay_rate: 78 },
  { weather_condition: "Snow", avg_delay: 14.8, delay_rate: 73 },
  { weather_condition: "Fog", avg_delay: 13.5, delay_rate: 70 },
  { weather_condition: "Rain", avg_delay: 12.9, delay_rate: 68 },
  { weather_condition: "Cloudy", avg_delay: 11.3, delay_rate: 62 },
  { weather_condition: "Clear", avg_delay: 9.8, delay_rate: 54 },
];

const FALLBACK_TRANSPORT = [
  { transport_type: "Bus", delay_rate: 72, avg_delay: 13.1 },
  { transport_type: "Tram", delay_rate: 69, avg_delay: 12.5 },
  { transport_type: "Train", delay_rate: 67, avg_delay: 12.0 },
  { transport_type: "Metro", delay_rate: 65, avg_delay: 11.2 },
];

const FALLBACK_PIE = [
  { name: "On Time", value: 31, color: "#22c55e" },
  { name: "Slight Delay (1â€“10 min)", value: 32, color: "#eab308" },
  { name: "Major Delay (>10 min)", value: 37, color: "#ef4444" },
];

const tooltipStyle = {
  backgroundColor: "hsla(222, 47%, 8%, 0.95)",
  border: "1px solid hsla(217, 30%, 25%, 0.3)",
  borderRadius: "12px",
  color: "hsl(210, 40%, 96%)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  padding: "10px 14px",
  fontSize: "12px",
};

const MetricCard = ({ icon: Icon, label, value, color, trend, trendUp }: {
  icon: React.ElementType; label: string; value: string; color: string; trend: string; trendUp: boolean;
}) => (
  <div className="metric-card group hover:scale-[1.02] transition-transform duration-300">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? "text-success" : "text-destructive"}`}>
        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
    <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "weather" | "transport">("overview");
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    fetchStats()
      .then((s) => { setStats(s); setApiOnline(true); })
      .catch(() => { /* use fallback */ });
  }, []);

  // Derived display data
  const onTimeRate = stats ? stats.on_time_rate : 31;
  const delayedRate = stats ? stats.delayed_rate : 69;
  const avgDelay = stats ? stats.avg_delay_min : 11.5;
  const totalTrips = stats ? stats.total_trips : 35040;
  const modelAcc = stats ? stats.classifier_accuracy : null;

  // Chart data
  const hourlyData = stats
    ? stats.by_hour.map((h) => ({
        time: `${h.hour}:00`,
        delay: h.avg_delay,
        rate: h.delay_rate,
      }))
    : FALLBACK_HOURLY.map((h) => ({ ...h, rate: 65 }));

  const weatherData = stats ? stats.by_weather : FALLBACK_WEATHER;

  const transportData = stats ? stats.by_transport : FALLBACK_TRANSPORT;

  const pieData = stats
    ? [
        { name: "On Time", value: +stats.on_time_rate.toFixed(1), color: "#22c55e" },
        { name: "Delayed", value: +stats.delayed_rate.toFixed(1), color: "#ef4444" },
      ]
    : FALLBACK_PIE;

  const topRoutes = stats
    ? stats.top_delayed_routes.slice(0, 8).map((r) => ({
        route: r.route_id.replace("Route_", "R"),
        delay_rate: r.delay_rate,
        avg_delay: r.avg_delay,
      }))
    : [
        { route: "R7", delay_rate: 82, avg_delay: 16 },
        { route: "R3", delay_rate: 80, avg_delay: 15.5 },
        { route: "R15", delay_rate: 78, avg_delay: 15 },
        { route: "R19", delay_rate: 76, avg_delay: 14.5 },
        { route: "R11", delay_rate: 74, avg_delay: 14 },
        { route: "R8", delay_rate: 72, avg_delay: 13.5 },
      ];

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 dot-bg opacity-20" />
      <div className="orb w-[400px] h-[400px] bg-primary/6 top-[5%] right-[10%]" />
      <div className="orb w-[300px] h-[300px] bg-accent/5 bottom-[20%] left-[5%]" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 mb-6">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Dataset Analytics</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Analytics <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Insights computed from <span className="text-foreground font-semibold">{totalTrips.toLocaleString()}</span> real transit trips in the dataset.
          </p>
          {apiOnline && (
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
              <Database className="w-3 h-3" /> Live data from ML backend
              {modelAcc !== null && <span className="ml-1.5 opacity-80">Â· Model accuracy: {modelAcc}%</span>}
            </div>
          )}
        </AnimatedSection>

        {/* Tab switcher */}
        <AnimatedSection className="flex justify-center mb-10">
          <div className="border border-border bg-secondary/50 p-1 inline-flex gap-1 rounded-xl flex-wrap justify-center">
            {(["overview", "weather", "transport"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                  activeTab === tab
                    ? "btn-primary-glow text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnimatedSection delay={0}>
            <MetricCard icon={Clock} label="Avg Arrival Delay" value={`${avgDelay} min`} color="text-primary" trend="dataset avg" trendUp={false} />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <MetricCard icon={CheckCircle} label="On-Time Rate" value={`${onTimeRate}%`} color="text-success" trend="of all trips" trendUp={true} />
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <MetricCard icon={Route} label="Delayed Rate" value={`${delayedRate}%`} color="text-destructive" trend="of all trips" trendUp={false} />
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <MetricCard icon={Shield} label="Model Accuracy" value={modelAcc ? `${modelAcc}%` : "~82%"} color="text-accent" trend="GBM classifier" trendUp={true} />
          </AnimatedSection>
        </div>

        {/* â”€â”€ Overview Tab â”€â”€ */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AnimatedSection delay={0.1}>
                <div className="chart-card bg-secondary/20 p-4 md:p-6 rounded-2xl border border-border/40">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Average Delay by Hour of Day</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={290}>
                    <AreaChart data={hourlyData}>
                      <defs>
                        <linearGradient id="delayGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(217, 91%, 53%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(217, 91%, 53%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsla(217, 30%, 18%, 0.5)" />
                      <XAxis dataKey="time" stroke="hsl(215, 20%, 40%)" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                      <YAxis stroke="hsl(215, 20%, 40%)" fontSize={11} tickLine={false} axisLine={false} unit=" min" />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} min`, "Avg Delay"]} />
                      <Area type="monotone" dataKey="delay" stroke="hsl(217, 91%, 53%)" strokeWidth={2.5} fill="url(#delayGrad)" dot={false} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="chart-card bg-secondary/20 p-4 md:p-6 rounded-2xl border border-border/40">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-highlight" />
                    <h3 className="font-semibold text-foreground">On-Time vs Delayed Breakdown</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={290}>
                    <PieChart>
                      <defs>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" strokeWidth={0} filter="url(#glow)">
                        {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, ""]} />
                      <Legend wrapperStyle={{ color: "hsl(215, 20%, 55%)", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedSection>
            </div>

            {/* Top delayed routes bar chart */}
            <AnimatedSection delay={0.3}>
              <div className="chart-card bg-secondary/20 p-4 md:p-6 rounded-2xl border border-border/40">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Top Delayed Routes â€” Delay Rate (%)</h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topRoutes} barCategoryGap="18%">
                    <defs>
                      <linearGradient id="routeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(263, 70%, 58%)" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(217, 91%, 53%)" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(217, 30%, 18%, 0.5)" />
                    <XAxis dataKey="route" stroke="hsl(215, 20%, 40%)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(215, 20%, 40%)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n: string) => [`${v}${n === "delay_rate" ? "%" : " min"}`, n === "delay_rate" ? "Delay Rate" : "Avg Delay"]} />
                    <Bar dataKey="delay_rate" fill="url(#routeGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AnimatedSection>
          </>
        )}

        {/* â”€â”€ Weather Tab â”€â”€ */}
        {activeTab === "weather" && (
          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="chart-card bg-secondary/20 p-4 md:p-6 rounded-2xl border border-border/40">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Delay Rate by Weather Condition</h3>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={weatherData} layout="vertical" barCategoryGap="20%">
                    <defs>
                      <linearGradient id="weatherGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="hsl(217, 91%, 53%)" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(217, 30%, 18%, 0.5)" />
                    <XAxis type="number" stroke="hsl(215, 20%, 40%)" fontSize={11} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                    <YAxis type="category" dataKey="weather_condition" stroke="hsl(215, 20%, 40%)" fontSize={11} tickLine={false} axisLine={false} width={60} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Delay Rate"]} />
                    <Bar dataKey="delay_rate" fill="url(#weatherGrad)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card bg-secondary/20 p-4 md:p-6 rounded-2xl border border-border/40">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Avg Delay (min) by Weather</h3>
                </div>
                <div className="space-y-4 mt-4">
                  {weatherData.map((w) => (
                    <div key={w.weather_condition}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-foreground font-medium">{w.weather_condition}</span>
                        <span className="text-muted-foreground">{w.avg_delay} min avg</span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (w.avg_delay / 20) * 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* â”€â”€ Transport Tab â”€â”€ */}
        {activeTab === "transport" && (
          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="chart-card bg-secondary/20 p-4 md:p-6 rounded-2xl border border-border/40">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-highlight" />
                  <h3 className="font-semibold text-foreground">Delay Rate by Transport Type</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={transportData} barCategoryGap="30%">
                    <defs>
                      <linearGradient id="transGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(38, 92%, 50%)" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(217, 30%, 18%, 0.5)" />
                    <XAxis dataKey="transport_type" stroke="hsl(215, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(215, 20%, 40%)" fontSize={11} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Delay Rate"]} />
                    <Bar dataKey="delay_rate" fill="url(#transGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card bg-secondary/20 p-4 md:p-6 rounded-2xl border border-border/40">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-success" />
                  <h3 className="font-semibold text-foreground">Reliability Summary</h3>
                </div>
                <div className="space-y-5 mt-2">
                  {transportData.map((t) => {
                    const reliability = +(100 - t.delay_rate).toFixed(1);
                    return (
                      <div key={t.transport_type}>
                        <div className="flex justify-between items-center text-sm mb-1.5">
                          <span className="text-foreground font-semibold">{t.transport_type}</span>
                          <span className={reliability >= 35 ? "text-success" : reliability >= 28 ? "text-warning" : "text-destructive"}>
                            {reliability}% reliable Â· {t.avg_delay} min avg
                          </span>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-2.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${reliability}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-2.5 rounded-full ${reliability >= 35 ? "bg-success" : reliability >= 28 ? "bg-warning" : "bg-destructive"}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
