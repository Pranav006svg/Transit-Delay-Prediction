import { AlertTriangle, Lightbulb, Code2, Brain, Database, Server, Layout } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const techFrontend = [
  { icon: Layout, label: "React + TypeScript" },
  { icon: Layout, label: "Tailwind CSS" },
  { icon: Layout, label: "Recharts" },
  { icon: Layout, label: "Leaflet / Maps API" },
];

const techBackend = [
  { icon: Code2, label: "Python" },
  { icon: Brain, label: "Machine Learning (scikit-learn / TensorFlow)" },
  { icon: Server, label: "Flask / FastAPI" },
  { icon: Database, label: "Transit Data APIs" },
];

const About = () => (
  <div className="min-h-screen pt-24 pb-16">
    <div className="container mx-auto px-4 max-w-3xl">
      <AnimatedSection className="text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
          About the <span className="gradient-text">Project</span>
        </h1>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mb-10">
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Problem Statement</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Public transport delays are unpredictable and disrupt the daily commute of millions. Commuters lack reliable tools to anticipate delays and plan alternative routes, leading to wasted time and frustration.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2} className="mb-10">
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Our Solution</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            An AI-powered transit prediction system that forecasts delays, estimates uncertainty, and recommends the most reliable routes — helping commuters make informed travel decisions in real time.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.3}>
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Technology Stack</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-primary mb-3">Frontend</h3>
              <div className="space-y-2">
                {techFrontend.map((t) => (
                  <div key={t.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t.label}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-accent mb-3">Future Backend</h3>
              <div className="space-y-2">
                {techBackend.map((t) => (
                  <div key={t.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {t.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  </div>
);

export default About;
