import { useState, useEffect } from "react";
import { Clock, Route, CheckCircle, Shield, TrendingUp, BarChart3, Activity, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import AnimatedSection, { useCounter } from "@/components/AnimatedSection";
import { motion } from "framer-motion";

const lineData = [
  { time: "6AM", delay: 3, predicted: 4 }, { time: "7AM", delay: 8, predicted: 7 }, { time: "8AM", delay: 14, predicted: 13 },
  { time: "9AM", delay: 10, predicted: 11 }, { time: "10AM", delay: 5, predicted: 6 }, { time: "11AM", delay: 4, predicted: 4 },
  { time: "12PM", delay: 6, predicted: 5 }, { time: "1PM", delay: 5, predicted: 6 }, { time: "2PM", delay: 7, predicted: 8 },
  { time: "3PM", delay: 9, predicted: 10 }, { time: "4PM", delay: 12, predicted: 11 }, { time: "5PM", delay: 18, predicted: 17 },
  { time: "6PM", delay: 20, predicted: 19 }, { time: "7PM", delay: 15, predicted: 16 }, { time: "8PM", delay: 8, predicted: 9 },
];

const barData = [
  { hour: "6-8", delay: 12, color: "#3b82f6" }, { hour: "8-10", delay: 9, color: "#22d3ee" },
  { hour: "10-12", delay: 4, color: "#22c55e" }, { hour: "12-2", delay: 5, color: "#22c55e" },
  { hour: "2-4", delay: 8, color: "#22d3ee" }, { hour: "4-6", delay: 16, color: "#eab308" },
  { hour: "6-8", delay: 18, color: "#ef4444" }, { hour: "8-10", delay: 6, color: "#22c55e" },
];

const pieData = [
  { name: "On Time", value: 72, color: "#22c55e" },
  { name: "Slight Delay", value: 18, color: "#eab308" },
  { name: "Major Delay", value: 10, color: "#ef4444" },
];

const trafficData = [
  { time: "Mon", impact: 65 }, { time: "Tue", impact: 72 },
  { time: "Wed", impact: 58 }, { time: "Thu", impact: 80 },
  { time: "Fri", impact: 90 }, { time: "Sat", impact: 40 }, { time: "Sun", impact: 30 },
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
      <div className={`w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center`}>
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
  const [activeTab, setActiveTab] = useState<"overview" | "traffic">("overview");

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute inset-0 dot-bg opacity-20" />
      <div className="orb w-[400px] h-[400px] bg-primary/6 top-[5%] right-[10%]" />
      <div className="orb w-[300px] h-[300px] bg-accent/5 bottom-[20%] left-[5%]" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <AnimatedSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 mb-6">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Live Analytics</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Analytics <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            AI-powered transit analytics with real-time performance metrics.
          </p>
        </AnimatedSection>

        {/* Tab switcher */}
        <AnimatedSection className="flex justify-center mb-10">
          <div className="glass-card p-1 inline-flex gap-1 rounded-xl">
            {(["overview", "traffic"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
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
            <MetricCard icon={Clock} label="Avg Delay Today" value="8 min" color="text-primary" trend="+12%" trendUp={false} />
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <MetricCard icon={Route} label="Most Delayed" value="Route 21" color="text-destructive" trend="-5%" trendUp={true} />
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <MetricCard icon={CheckCircle} label="On Time" value="72%" color="text-success" trend="+3%" trendUp={true} />
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <MetricCard icon={Shield} label="Reliability" value="87%" color="text-accent" trend="+1.5%" trendUp={true} />
          </AnimatedSection>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AnimatedSection delay={0.1}>
                <div className="chart-card">
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Delay vs. AI Prediction</h3>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Actual</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" />Predicted</span>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={lineData}>
                        <defs>
                          <linearGradient id="delayGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(217, 91%, 53%)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(217, 91%, 53%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsla(217, 30%, 18%, 0.5)" />
                        <XAxis dataKey="time" stroke="hsl(215, 20%, 40%)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(215, 20%, 40%)" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="delay" stroke="hsl(217, 91%, 53%)" strokeWidth={2.5} fill="url(#delayGrad)" dot={false} activeDot={{ r: 5, fill: "hsl(217, 91%, 53%)", stroke: "hsl(222, 47%, 8%)", strokeWidth: 2 }} />
                        <Area type="monotone" dataKey="predicted" stroke="hsl(187, 85%, 53%)" strokeWidth={2} strokeDasharray="6 3" fill="url(#predGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="chart-card">
                  <div className="flex items-center gap-2 mb-6 relative z-10">
                    <BarChart3 className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-foreground">Peak Hour Delays</h3>
                  </div>
                  <div className="relative z-10">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barData} barCategoryGap="20%">
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(187, 85%, 53%)" stopOpacity={1} />
                            <stop offset="100%" stopColor="hsl(217, 91%, 53%)" stopOpacity={0.6} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsla(217, 30%, 18%, 0.5)" />
                        <XAxis dataKey="hour" stroke="hsl(215, 20%, 40%)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(215, 20%, 40%)" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="delay" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection delay={0.3}>
              <div className="chart-card max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4 relative z-10">
                  <Sparkles className="w-5 h-5 text-highlight" />
                  <h3 className="font-semibold text-foreground">Route Reliability</h3>
                </div>
                <div className="relative z-10">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <defs>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                      </defs>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={4} dataKey="value" strokeWidth={0} filter="url(#glow)">
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ color: "hsl(215, 20%, 55%)", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </AnimatedSection>
          </>
        ) : (
          <AnimatedSection>
            <div className="chart-card">
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <Activity className="w-5 h-5 text-highlight" />
                <h3 className="font-semibold text-foreground">Weekly Traffic Impact Analysis</h3>
              </div>
              <div className="relative z-10">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(263, 70%, 58%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(217, 30%, 18%, 0.5)" />
                    <XAxis dataKey="time" stroke="hsl(215, 20%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(215, 20%, 40%)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="impact" stroke="hsl(263, 70%, 58%)" strokeWidth={2.5} fill="url(#trafficGrad)" dot={{ r: 4, fill: "hsl(263, 70%, 58%)", stroke: "hsl(222, 47%, 8%)", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
