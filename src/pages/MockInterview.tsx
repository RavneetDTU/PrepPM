import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Timer,
  ChevronRight,
  Settings as SettingsIcon,
  Loader2,
  Waves
} from 'lucide-react';
import { Shell } from '../components/ui/Layout';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { speakQuestion, transcribeAudio, getAIFeedback } from '../services/openai';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const QUESTION_TYPES = ['Product Sense', 'Estimation', 'Behavioral', 'Metrics', 'Strategy', 'Execution', 'Mixed'];
const COMPANIES = ['Google', 'Meta', 'Stripe', 'Amazon', 'Microsoft', 'Apple', 'Uber', 'Airbnb'];

const SAMPLE_QUESTIONS: Record<string, any[]> = {
  'Product Sense': [
    { id: 'ps1', text: 'How would you improve Google Maps for explorers?' },
    { id: 'ps2', text: 'Design a vacuum cleaner for the elderly.' }
  ],
  'Estimation': [
    { id: 'e1', text: 'How many windows are in London?' },
    { id: 'e2', text: 'Estimate the annual revenue of an airport terminal.' }
  ],
  'Behavioral': [
    { id: 'b1', text: 'Tell me about a time you missed a deadline.' },
    { id: 'b2', text: 'Describe a conflict with a technical lead.' }
  ]
};

export default function MockInterview() {
  const [config, setConfig] = useState<{
    show: boolean;
    company: string;
    type: string;
    qCount: number;
    mode: 'voice' | 'text';
  }>({
    show: true,
    company: 'Google',
    type: 'Product Sense',
    qCount: 2,
    mode: 'voice'
  });

  const [session, setSession] = useState<{
    started: boolean;
    currentQ: number;
    questions: any[];
    responses: any[];
    timer: number;
    isRecording: boolean;
    transcript: string;
    isAnalysing: boolean;
    liveFeedback: any;
  }>({
    started: false,
    currentQ: 0,
    questions: [],
    responses: [],
    timer: 0,
    isRecording: false,
    transcript: '',
    isAnalysing: false,
    liveFeedback: null
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const apiKey = localStorage.getItem('openai_api_key');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session.started) {
      interval = setInterval(() => {
        setSession(prev => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session.started]);

  const startMock = (questions: any[]) => {
    setSession(prev => ({
      ...prev,
      started: true,
      questions,
      timer: 0,
      currentQ: 0,
    }));
    setConfig(prev => ({ ...prev, show: false }));
    
    if (config.mode === 'voice' && apiKey) {
      speakQuestion(questions[0].text, apiKey);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (apiKey) {
          setSession(prev => ({ ...prev, isAnalysing: true }));
          try {
            const text = await transcribeAudio(audioBlob, apiKey);
            setSession(prev => ({ ...prev, transcript: text }));
            const feedback = await getAIFeedback(
              session.questions[session.currentQ].text,
              text,
              config.company,
              apiKey
            );
            setSession(prev => ({ ...prev, liveFeedback: feedback, isAnalysing: false }));
          } catch (err) {
            console.error(err);
            setSession(prev => ({ ...prev, isAnalysing: false }));
          }
        }
      };

      mediaRecorder.start();
      setSession(prev => ({ ...prev, isRecording: true }));
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setSession(prev => ({ ...prev, isRecording: false }));
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleNextQuestion = () => {
    const feedback = session.liveFeedback;
    const response = {
      questionId: session.questions[session.currentQ].id,
      questionText: session.questions[session.currentQ].text,
      answer: session.transcript,
      score: feedback?.score || 0,
      feedback: feedback
    };

    const newResponses = [...session.responses, response];

    if (session.currentQ < session.questions.length - 1) {
      const nextQ = session.currentQ + 1;
      setSession(prev => ({
        ...prev,
        currentQ: nextQ,
        responses: newResponses,
        transcript: '',
        liveFeedback: null
      }));
      if (config.mode === 'voice' && apiKey) {
        speakQuestion(session.questions[nextQ].text, apiKey);
      }
    } else {
      finishSession(newResponses);
    }
  };

  const finishSession = async (finalResponses: any[]) => {
    const overallScore = Math.round(finalResponses.reduce((acc, curr) => acc + curr.score, 0) / finalResponses.length);
    
    // Save to Firebase
    if (user) {
      const docRef = await addDoc(collection(db, 'sessions'), {
        userId: user.uid,
        company: config.company,
        questionType: config.type,
        mode: config.mode,
        questionCount: config.qCount,
        overallScore,
        scores: finalResponses[0].feedback?.dimension_scores || {},
        transcript: finalResponses,
        createdAt: new Date().toISOString()
      });
      navigate(`/mock/results/${docRef.id}`);
    }
  };

  if (config.show) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6 lg:p-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full professional-card shadow-2xl p-8 lg:p-12 space-y-10"
        >
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold text-text-custom">Configure Mock Session</h1>
            <p className="text-sm text-text-sub font-medium">Customize your practice experience to match your interview goals.</p>
          </div>

          {!apiKey && (
            <div className="p-4 bg-amber-light border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-amber-custom shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-amber-custom">No OpenAI API Key Found</p>
                <p className="text-[12px] text-amber-custom font-medium opacity-80 leading-relaxed">
                  Voice features and AI feedback require an API key. 
                  <button onClick={() => navigate('/settings')} className="ml-1 underline font-bold">Add it in Settings</button>.
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Target Company</label>
                <select 
                  className="w-full p-3 bg-bg border border-border-custom rounded-lg font-bold text-text-custom text-sm outline-none focus:ring-2 focus:ring-primary/10"
                  value={config.company}
                  onChange={e => setConfig({ ...config, company: e.target.value })}
                >
                  {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Question Type</label>
                <select 
                  className="w-full p-3 bg-bg border border-border-custom rounded-lg font-bold text-text-custom text-sm outline-none focus:ring-2 focus:ring-primary/10"
                  value={config.type}
                  onChange={e => setConfig({ ...config, type: e.target.value })}
                >
                  {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Questions</label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 4, 6].map(n => (
                    <button
                      key={n}
                      onClick={() => setConfig({ ...config, qCount: n })}
                      className={cn(
                        "py-2.5 rounded-lg border text-sm font-bold transition-all",
                        config.qCount === n ? "bg-primary text-white border-primary" : "bg-bg text-text-sub border-border-custom"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Interview Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'voice', label: 'Voice' },
                    { id: 'text', label: 'Text' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setConfig({ ...config, mode: m.id as any })}
                      className={cn(
                        "py-2.5 rounded-lg border text-sm font-bold transition-all",
                        config.mode === m.id ? "bg-primary text-white border-primary" : "bg-bg text-text-sub border-border-custom"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              disabled={!apiKey && config.mode === 'voice'}
              onClick={() => {
                const qs = SAMPLE_QUESTIONS[config.type] || SAMPLE_QUESTIONS['Product Sense'];
                startMock(qs.slice(0, config.qCount));
              }}
              className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Start Interactive Mock Interview
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-primary/30 overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="h-16 border-b border-dark-border px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-dark-card border border-dark-border rounded-full text-xs font-bold text-text-sub">
            <span className="text-primary">{config.company}</span>
            <div className="w-1 h-1 rounded-full bg-dark-border" />
            <span>{config.type}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-text-sub">
            <Timer size={14} className="text-primary" />
            {formatTime(session.timer)}
          </div>
        </div>

        <div className="flex gap-2">
          {session.questions.map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === session.currentQ ? "bg-primary scale-125" : idx < session.currentQ ? "bg-green-custom" : "bg-dark-border"
              )}
            />
          ))}
        </div>

        <button 
          onClick={() => { if(confirm('End session? Progressive will be lost.')) setConfig({ ...config, show: true }) }}
          className="px-4 py-1.5 bg-red-950/30 text-red-400 border border-red-900/50 rounded-lg text-xs font-bold hover:bg-red-900/40 transition-all"
        >
          End Session
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: AI Interviewer */}
        <div className="flex-1 flex flex-col border-r border-dark-border relative p-12 justify-center items-center">
          <div className="max-w-xl w-full space-y-12 text-center">
            <div className="relative inline-block">
              <div className={cn(
                "w-32 h-32 rounded-full bg-primary flex items-center justify-center relative z-10",
                session.isRecording && "animate-pulse-ring"
              )}>
                <div className="w-24 h-24 rounded-full bg-dark-card flex items-center justify-center p-4">
                  <Waves size={48} className={cn("text-primary", session.isRecording && "animate-pulse")} />
                </div>
              </div>
              {session.isAnalysing && (
                <div className="absolute -inset-2 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-primary text-xs font-bold uppercase tracking-widest">AI Interviewer</h4>
              <h2 className="text-3xl font-bold leading-tight">
                {session.questions[session.currentQ]?.text}
              </h2>
              <div className="flex items-center justify-center gap-2 text-text-sub font-medium text-sm">
                <AlertCircle size={16} />
                Focus on: Structure & User Segments
              </div>
            </div>
          </div>
        </div>

        {/* Center/Main Panel: User Response */}
        <div className="flex-[1.5] flex flex-col relative bg-dark-card/30">
          <div className="flex-1 p-12 overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-dark-border shrink-0 flex items-center justify-center font-bold text-text-sub">
                  ME
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-sub uppercase tracking-wider">My Response</span>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded",
                      session.isRecording ? "text-red-400 bg-red-400/10" : "text-text-sub"
                    )}>{session.isRecording ? 'Recording Live...' : 'Awaiting Input'}</span>
                  </div>
                  
                  {config.mode === 'voice' ? (
                    <div className="min-h-[200px] text-xl font-medium text-white/90 leading-relaxed whitespace-pre-line border-l-2 border-primary/20 pl-6">
                      {session.transcript || (session.isRecording ? 'Listening...' : 'Press the mic to start your answer.')}
                    </div>
                  ) : (
                    <textarea 
                      className="w-full h-64 bg-dark-bg/50 border border-dark-border rounded-2xl p-6 outline-none focus:border-primary transition-all text-lg font-medium"
                      placeholder="Type your answer here..."
                      value={session.transcript}
                      onChange={e => setSession({ ...session, transcript: e.target.value })}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-8 border-t border-dark-border flex items-center justify-center gap-6">
            {config.mode === 'voice' && (
              <button 
                onClick={session.isRecording ? stopRecording : startRecording}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl",
                  session.isRecording 
                    ? "bg-red-500 scale-110 hover:bg-red-600" 
                    : "bg-primary hover:bg-primary/90 hover:scale-105"
                )}
              >
                {session.isRecording ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
            )}
            
            <button 
              disabled={!session.transcript || session.isAnalysing}
              onClick={handleNextQuestion}
              className="px-8 py-4 bg-white text-dark-bg font-bold rounded-2xl hover:bg-white/90 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group flex items-center gap-2"
            >
              {session.isAnalysing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Analysing...
                </>
              ) : (
                <>
                  {session.currentQ < session.questions.length - 1 ? 'Next Question' : 'Finish Session'}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Feedback Sidebar */}
        <div className="w-[320px] border-l border-dark-border flex flex-col bg-dark-bg shrink-0">
          <div className="p-6 border-b border-dark-border">
            <h3 className="text-sm font-bold text-text-sub uppercase tracking-widest mb-4">Live Feedback</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-sub font-medium">Readiness Score</span>
              <span className={cn(
                "text-2xl font-black",
                (session.liveFeedback?.score || 0) >= 80 ? "text-green-custom" : (session.liveFeedback?.score || 0) >= 60 ? "text-amber-custom" : "text-text-sub"
              )}>
                {session.liveFeedback?.score || '--'}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence mode='wait'>
              {session.liveFeedback ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <FeedbackGroup title="Done Well" icon={CheckCircle2} color="text-green-custom" items={session.liveFeedback.good} />
                  <FeedbackGroup title="To Improve" icon={AlertCircle} color="text-amber-custom" items={session.liveFeedback.improve} />
                  <FeedbackGroup title="Critical Missing" icon={XCircle} color="text-red-custom" items={session.liveFeedback.missing} />
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4 opacity-30">
                  <div className="w-12 h-12 rounded-full border-2 border-dark-border border-dashed flex items-center justify-center">
                    <StarsIcon />
                  </div>
                  <p className="text-xs font-medium leading-relaxed">
                    Start speaking to get <br /> real-time feedback and score updates.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-dark-card/50 border-t border-dark-border">
            <button className="flex items-center gap-2 text-xs font-bold text-text-sub hover:text-white transition-colors">
              <SettingsIcon size={14} />
              Feedback settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackGroup({ title, icon: Icon, color, items }: any) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className={cn("flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest", color)}>
        <Icon size={12} />
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((item: string, idx: number) => (
          <li key={idx} className="text-xs text-text-sub font-medium leading-relaxed bg-dark-card/50 p-2 rounded-lg border border-dark-border">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StarsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}
