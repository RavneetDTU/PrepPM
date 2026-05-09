import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dna, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  BrainCircuit,
  BarChart3,
  Search,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const STEPS = [
  { id: 'start', title: 'Welcome', icon: Target },
  { id: 'diagnostic', title: 'Diagnostic', icon: BrainCircuit },
  { id: 'results', title: 'Analysis', icon: BarChart3 }
];

const QUESTIONS = [
  { 
    id: 1, 
    category: 'Product Sense', 
    text: 'How would you improve Instagram for creators in emerging markets?',
    placeholder: 'I would start by identifying user needs such as...'
  },
  { 
    id: 2, 
    category: 'Metrics', 
    text: 'What metrics define success for YouTube Shorts?',
    placeholder: 'The primary metric would be...'
  },
  { 
    id: 3, 
    category: 'Estimation', 
    text: 'How many elevators are in San Francisco?',
    placeholder: 'I will use a top-down approach...'
  },
  { 
    id: 4, 
    category: 'Behavioral', 
    text: 'Tell me about a time you had to make a difficult trade-off.',
    placeholder: 'Last year, we had to decide between...'
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleNextStep = () => {
    if (step === 0) setStep(1);
    else if (step === 1) {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setAnalyzing(true);
        setTimeout(() => {
          setStep(2);
          setAnalyzing(false);
        }, 2000);
      }
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="p-8 flex justify-between items-center max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-text-custom tracking-tight">
            <span className="text-primary">Prep</span>AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                step >= idx ? "bg-primary text-white" : "bg-white text-text-sub border border-border-custom"
              )}>
                <s.icon size={14} />
              </div>
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider hidden md:block",
                step >= idx ? "text-text-custom" : "text-text-sub"
              )}>{s.title}</span>
              {idx < STEPS.length - 1 && <div className="w-4 h-[1px] bg-border-custom hidden md:block" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-8"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary animate-bounce">
                  <Sparkles size={48} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text-custom mb-4">You're in, {profile?.fullName?.split(' ')[0]}!</h1>
                  <p className="text-text-sub text-lg leading-relaxed">
                    Let's set your baseline. We'll ask 4 quick diagnostic questions to identify your strengths and tailor your prep plan.
                  </p>
                </div>
                <div className="p-6 bg-white border border-border-custom rounded-2xl text-left flex items-start gap-4">
                  <div className="p-2 bg-green-light text-green-custom rounded-lg shrink-0">
                    <Target size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-custom text-sm mb-1">Your target is {profile?.targetCompanies?.join(' & ') || 'top tech companies'}.</h4>
                    <p className="text-xs text-text-sub font-medium leading-relaxed">
                      We've aligned your diagnostic with the hiring bars for these companies.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleNextStep}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                >
                  Start Diagnostic
                  <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="diagnostic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                    {QUESTIONS[currentQ].category}
                  </span>
                  <span className="text-xs font-bold text-text-sub">
                    Question {currentQ + 1} of {QUESTIONS.length}
                  </span>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-text-custom leading-tight">
                    {QUESTIONS[currentQ].text}
                  </h2>
                  <textarea
                    value={answers[currentQ] || ''}
                    onChange={e => setAnswers({ ...answers, [currentQ]: e.target.value })}
                    placeholder={QUESTIONS[currentQ].placeholder}
                    className="w-full h-48 p-6 bg-white border border-border-custom rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all text-text-custom placeholder:text-text-sub/50 leading-relaxed font-medium"
                  />
                </div>

                <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl border border-dashed border-border-custom">
                  <div className="flex items-center gap-2 text-text-sub text-xs font-medium">
                    <MessageSquare size={14} className="text-primary" />
                    <span>Focus on structure and user empathy.</span>
                  </div>
                  <button 
                    disabled={!answers[currentQ] || answers[currentQ].length < 10 || analyzing}
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {analyzing ? 'Analyzing...' : (currentQ === QUESTIONS.length - 1 ? 'Finish Diagnostic' : 'Next Question')}
                    {!analyzing && <ArrowRight size={18} />}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="w-20 h-20 bg-green-light rounded-full flex items-center justify-center mx-auto text-green-custom border-4 border-white shadow-xl">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-text-custom mb-3">Diagnostic Ready</h1>
                  <p className="text-text-sub text-lg leading-relaxed max-w-md mx-auto">
                    We've benchmarked your answers. Your prep plan is now active on your dashboard.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Baseline Score', value: '62/100', color: 'text-amber-custom', bg: 'bg-amber-light' },
                    { label: 'Strongest Area', value: 'Estimation', color: 'text-green-custom', bg: 'bg-green-light' },
                    { label: 'Weakest Area', value: 'Strategy', color: 'text-red-custom', bg: 'bg-red-light' },
                    { label: 'Readiness', value: 'Developing', color: 'text-primary', bg: 'bg-primary/10' }
                  ].map(stat => (
                    <div key={stat.label} className="p-4 bg-white border border-border-custom rounded-2xl text-left">
                      <div className="text-[10px] font-bold text-text-sub uppercase tracking-wider mb-1">{stat.label}</div>
                      <div className={cn("text-lg font-bold", stat.color)}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleNextStep}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                >
                  Enter Dashboard
                  <ArrowRight size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
