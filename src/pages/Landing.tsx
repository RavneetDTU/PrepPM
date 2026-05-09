import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Mic2, 
  TrendingUp, 
  Database, 
  Users2,
  Play
} from 'lucide-react';
import { cn } from '../lib/utils';

const STATS = [
  { label: 'Users prepped', value: '2,400+' },
  { label: 'Pass rate', value: '94%' },
  { label: 'Companies', value: '50+' },
  { label: 'Mock interviews', value: '15k+' },
];

const FEATURES = [
  {
    icon: Mic2,
    title: 'AI Mock Interview',
    description: 'Practice with a realistic AI voice interviewer that reacts to your structure and empathy.',
    color: 'bg-primary'
  },
  {
    icon: Database,
    title: 'Company Intel',
    description: 'Get questions curated for specific companies like Google, Meta, and Stripe.',
    color: 'bg-green-custom'
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Visualize your skill growth across 6 core PM frameworks with data-driven heatmaps.',
    color: 'bg-amber-custom'
  },
  {
    icon: Users2,
    title: 'Peer Mocks',
    description: 'Connect with other candidates for high-quality peer feedback sessions.',
    color: 'bg-red-custom'
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border-custom">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-text-custom tracking-tight">
              <span className="text-primary">Prep</span>AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-text-sub hover:text-text-custom transition-colors">
              Login
            </Link>
            <Link to="/signup" className="px-5 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-text-custom tracking-tight mb-6">
              Ace your PM <span className="text-primary">interview</span> with AI
            </h1>
            <p className="text-lg text-text-sub max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Personalized mock interviews with live feedback. Practice Google, Meta, and Stripe questions with our professional AI coach.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="group px-8 py-3.5 bg-primary text-white rounded-lg font-bold flex items-center gap-2 hover:bg-primary/95 transition-all shadow-xl shadow-primary/20">
                Start free onboarding
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-3.5 bg-white text-text-custom border border-border-custom rounded-lg font-bold flex items-center gap-2 hover:bg-bg transition-all">
                <Play size={18} className="text-primary" />
                See how it works
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-y border-border-custom px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-extrabold text-text-custom tracking-tight mb-1">{stat.value}</div>
                <div className="text-[11px] text-text-sub font-bold uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-text-custom mb-3 tracking-tight">Everything you need to prep</h2>
            <p className="text-text-sub font-medium">Data-driven preparation for the modern Product Manager.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group p-8 bg-white border border-border-custom rounded-xl hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/5"
              >
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white mb-6 shadow-lg", feature.color)}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-text-custom mb-2">{feature.title}</h3>
                <p className="text-sm text-text-sub leading-relaxed font-medium">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah L.', role: 'PM @ Google', text: "The AI feedback was spooky-accurate. It pointed out structure issues I didn't even notice myself." },
              { name: 'Kevin M.', role: 'Senior PM @ Stripe', text: "PrepAI helped me refine my metrics answers. Found the specific framework for pricing questions incredibly helpful." },
              { name: 'Ankita P.', role: 'APM @ Meta', text: "I cleared my product sense round thanks to the session recordings and Gold Standard answers." }
            ].map((t) => (
              <div key={t.name} className="p-8 bg-white border border-border-custom rounded-2xl">
                <p className="text-text-custom mb-6 font-medium italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center font-bold text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text-custom">{t.name}</div>
                    <div className="text-xs text-text-sub">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-primary rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none"
          />
          <h2 className="text-4xl font-bold mb-6">Ready to land your dream role?</h2>
          <p className="text-primary-light text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join 2,400+ candidates who have aced their interviews using PrepAI.
          </p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-bold hover:bg-white/90 transition-all">
            Get started for free
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border-custom px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xl font-bold text-text-custom">
            <span className="text-primary">Prep</span>AI
          </div>
          <div className="flex gap-8 text-sm text-text-sub font-medium">
            <a href="#" className="hover:text-primary transition-colors">X (Twitter)</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">Community</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </div>
          <div className="text-sm text-text-sub">
            © 2026 PrepAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
