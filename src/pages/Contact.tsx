import { Send, Mail, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AnimatedSection from "@/components/AnimatedSection";
import { toast } from "sonner";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you for your feedback!");
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-lg">
        <AnimatedSection className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-muted-foreground">We'd love to hear your feedback and suggestions.</p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Your name" className="pl-10 bg-secondary border-border/50 text-foreground" required />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="you@email.com" className="pl-10 bg-secondary border-border/50 text-foreground" required />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Message</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea placeholder="Your feedback..." className="pl-10 bg-secondary border-border/50 text-foreground min-h-[120px]" required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-border gap-2" size="lg">
              Send Feedback <Send className="w-4 h-4" />
            </Button>
          </form>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Contact;
