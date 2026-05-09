import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shell } from '../components/ui/Layout';
import { 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft,
  RefreshCcw,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function MockResults() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQs, setExpandedQs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchSession = async () => {
      if (sessionId) {
        const docRef = await getDoc(doc(db, 'sessions', sessionId));
        if (docRef.exists()) {
          setSession(docRef.data());
        }
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) return <Shell><div className="flex items-center justify-center h-64">Loading results...</div></Shell>;
  if (!session) return <Shell><div>Session not found.</div></Shell>;

  const scoreColor = session.overallScore >= 80 ? 'text-green-custom' : session.overallScore >= 60 ? 'text-amber-custom' : 'text-red-custom';
  const scoreBg = session.overallScore >= 80 ? 'bg-green-light' : session.overallScore >= 60 ? 'bg-amber-light' : 'bg-red-light';

  return (
    <Shell>
      <div className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-text-sub hover:text-text-custom transition-colors font-bold text-sm">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <div className="text-xs font-bold text-text-sub uppercase tracking-widest">{new Date(session.createdAt).toLocaleDateString()}</div>
        </div>

        {/* Hero Score */}
        <div className="bg-white p-10 rounded-3xl border border-border-custom shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mt-32" />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 space-y-4"
          >
            <div className={cn("inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-white shadow-xl text-4xl font-black mb-2", scoreBg, scoreColor)}>
              {session.overallScore}
            </div>
            <h1 className="text-3xl font-bold text-text-custom">Interactive Mock Results</h1>
            <p className="text-text-sub font-medium max-w-lg mx-auto">
              You performed in the top 20% for <span className="text-text-custom font-bold">{session.company}</span> PM candidates today. 
              Focus on improving your prioritization framework.
            </p>
          </motion.div>
        </div>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(session.scores || {}).map(([key, value]: any) => (
            <div key={key} className="bg-white p-4 rounded-2xl border border-border-custom text-center space-y-1">
              <div className="text-[10px] font-bold text-text-sub uppercase tracking-wider">{key.replace('_', ' ')}</div>
              <div className={cn(
                "text-xl font-bold",
                value >= 80 ? "text-green-custom" : value >= 60 ? "text-amber-custom" : "text-red-custom"
              )}>{value}</div>
              <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden mt-2">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", value >= 80 ? "bg-green-custom" : value >= 60 ? "bg-amber-custom" : "bg-red-custom")}
                  style={{ width: `${value}%` }} 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Detailed Feedback */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-text-custom flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Question-by-Question Analysis
            </h2>
            
            <div className="space-y-4">
              {session.transcript.map((item: any, idx: number) => (
                <div key={idx} className="bg-white rounded-2xl border border-border-custom overflow-hidden">
                  <button 
                    onClick={() => setExpandedQs(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    className="w-full text-left p-6 flex items-center justify-between hover:bg-bg/40 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                        Q{idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-custom leading-tight pr-8">{item.questionText}</h4>
                        <div className="flex gap-4 mt-2">
                          <span className={cn(
                            "text-xs font-bold",
                            item.score >= 80 ? "text-green-custom" : "text-amber-custom"
                          )}>Score: {item.score}/100</span>
                        </div>
                      </div>
                    </div>
                    {expandedQs[idx] ? <ChevronUp size={20} className="text-text-sub" /> : <ChevronDown size={20} className="text-text-sub" />}
                  </button>

                  <AnimatePresence>
                    {expandedQs[idx] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border-custom bg-bg/20"
                      >
                        <div className="p-8 space-y-8">
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-bold text-text-sub uppercase tracking-widest flex items-center gap-2">
                              <MessageSquare size={12} className="text-primary" />
                              Your Answer
                            </h5>
                            <p className="text-sm text-text-custom font-medium leading-relaxed italic p-4 bg-white rounded-xl border border-border-custom shadow-inner">
                              "{item.answer}"
                            </p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h5 className="text-[10px] font-bold text-green-custom uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 size={12} />
                                Strengths
                              </h5>
                              <ul className="space-y-2">
                                {item.feedback?.good.map((g: string, i: number) => (
                                  <li key={i} className="text-xs text-text-sub font-medium flex items-start gap-2">
                                    <div className="w-1 h-1 rounded-full bg-green-custom mt-1.5 shrink-0" />
                                    {g}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-4">
                              <h5 className="text-[10px] font-bold text-amber-custom uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle size={12} />
                                Areas to Improve
                              </h5>
                              <ul className="space-y-2">
                                {item.feedback?.improve.map((imp: string, i: number) => (
                                  <li key={i} className="text-xs text-text-sub font-medium flex items-start gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-custom mt-1.5 shrink-0" />
                                    {imp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Coach's Summary</h5>
                            <p className="text-xs text-text-custom font-medium italic">
                              {item.feedback?.summary}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar CTA */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-border-custom shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <Trophy size={48} className="mx-auto text-amber-custom mb-2" />
                <h3 className="text-lg font-bold text-text-custom">Done with this session?</h3>
                <p className="text-sm text-text-sub font-medium leading-relaxed">
                  Every mock puts you ahead of 90% of candidates who don't practice aloud.
                </p>
              </div>
              <div className="space-y-3">
                <Link to="/mock" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  <RefreshCcw size={18} />
                  Practice again
                </Link>
                <Link to="/dashboard" className="w-full py-3 bg-bg text-text-custom border border-border-custom font-bold rounded-xl hover:bg-border-custom transition-all flex items-center justify-center gap-2">
                  <BarChart3 size={18} />
                  View Progress
                </Link>
              </div>
            </div>

            <div className="bg-dark-bg p-8 rounded-3xl border border-dark-border text-white space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider">Gold Standard Answer</h4>
              <p className="text-xs text-text-sub leading-relaxed">
                Unlock expert-crafted "Gold Standard" answers for this session and compare them line-by-line with your transcripts.
              </p>
              <button className="text-primary text-xs font-bold hover:underline">Go Pro to unlock →</button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
