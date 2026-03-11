import { Train, Github, Mail, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="relative border-t border-border/20">
    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
    <div className="container mx-auto px-4 py-14 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl btn-primary-glow flex items-center justify-center">
              <Train className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">AI Transit <span className="gradient-text">Predict</span></span>
          </div>
          <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
            Advanced transit uncertainty prediction system. Forecasting delays, optimizing routes, and improving commuter experiences through data analytics.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
          <div className="flex flex-col gap-3">
            {[
              { label: "Home", to: "/" },
              { label: "Prediction", to: "/prediction" },
              { label: "Dashboard", to: "/dashboard" },
              { label: "About", to: "/about" },
            ].map((item) => (
              <Link key={item.label} to={item.to} className="text-muted-foreground hover:text-primary text-sm transition-colors duration-200">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">Connect</h4>
          <div className="flex flex-col gap-3">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-muted-foreground hover:text-primary text-sm transition-colors duration-200">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a href="mailto:contact@aitransit.dev" className="flex items-center gap-2.5 text-muted-foreground hover:text-primary text-sm transition-colors duration-200">
              <Mail className="w-4 h-4" /> contact@aitransit.dev
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/20 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between text-muted-foreground text-xs gap-2">
        <span>© {new Date().getFullYear()} AI Transit Predict. All rights reserved.</span>
        <span className="flex items-center gap-1">Built with <Heart className="w-3 h-3 text-destructive" /> using AI</span>
      </div>
    </div>
  </footer>
);

export default Footer;
