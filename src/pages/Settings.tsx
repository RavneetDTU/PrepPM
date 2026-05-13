import { useState, FormEvent } from 'react';
import { Shell } from '../components/ui/Layout';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  ShieldCheck,
  CreditCard,
  Bell,
  Plus,
  FileText,
  Tag,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Question } from '../types';

const CATEGORIES = ['Product Sense', 'Estimation', 'Behavioral', 'Metrics', 'Strategy', 'Execution', 'Technical'];
const COMPANIES = ['Google', 'Meta', 'Stripe', 'Amazon', 'Microsoft', 'Netflix', 'Uber', 'Airbnb'];
const TAGS = ['Product Sense', 'Strategy', 'Estimation', 'Technical', 'Behavioral', 'Execution', 'Metrics', 'Analytical', 'Design', 'GTM'];

export default function Settings() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Question Form State
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    company: 'Google',
    category: 'Product Sense',
    difficulty: 'Medium',
    questionText: '',
    frameworkHint: '',
    goldAnswer: '',
    solutionDocUrl: '',
    tags: [],
    upvotes: 0
  });

  const handleSaveKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddQuestion = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'questions'), {
        ...newQuestion,
        rubricItems: [],
        createdAt: serverTimestamp(),
      });
      setShowSuccess(true);
      setNewQuestion({
        company: 'Google',
        category: 'Product Sense',
        difficulty: 'Medium',
        questionText: '',
        frameworkHint: '',
        goldAnswer: '',
        solutionDocUrl: '',
        tags: [],
        upvotes: 0
      });
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error(error);
      alert(`Failed to add question: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    const currentTags = newQuestion.tags || [];
    if (currentTags.includes(tag)) {
      setNewQuestion({ ...newQuestion, tags: currentTags.filter(t => t !== tag) });
    } else {
      setNewQuestion({ ...newQuestion, tags: [...currentTags, tag] });
    }
  };

  return (
    <Shell>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-text-custom mb-2">Settings</h1>
          <p className="text-text-sub font-medium">Manage your AI configurations and account preferences.</p>
        </div>

        <div className="space-y-8">
          {/* AI Configuration */}
          <div className="bg-white rounded-3xl border border-border-custom shadow-sm overflow-hidden">
            <div className="p-8 border-b border-border-custom">
              <h3 className="text-lg font-bold text-text-custom mb-2">AI Configuration</h3>
              <p className="text-sm text-text-sub font-medium">Configuration for OpenAI voice and feedback engines.</p>
            </div>
            {/* ... key config content remains ... */}
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-text-custom">OpenAI API Key</label>
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-primary text-xs font-bold hover:underline"
                  >
                    Get a key from OpenAI →
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-bg border border-border-custom rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                    placeholder="sk-..."
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-sub hover:text-text-custom transition-colors"
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[10px] text-text-sub font-medium leading-relaxed">
                  Your key is stored locally in your browser and never sent to our servers. Usage costs are billed directly to your OpenAI account.
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-text-custom mb-0.5">Privacy First</h4>
                    <p className="text-xs text-text-sub leading-snug">We use client-side direct calls. Your recordings and data are processed directly between you and OpenAI.</p>
                  </div>
                </div>
                <button 
                  onClick={handleSaveKey}
                  className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  {saved ? (
                    <>
                      <CheckCircle2 size={16} />
                      Saved
                    </>
                  ) : 'Save Key'}
                </button>
              </div>
            </div>
          </div>

          {/* Question Bank Contribution */}
          <div className="bg-white rounded-3xl border border-border-custom shadow-sm overflow-hidden">
            <div className="p-8 border-b border-border-custom">
              <h3 className="text-lg font-bold text-text-custom mb-2">Question Bank Contribution</h3>
              <p className="text-sm text-text-sub font-medium">Contribute new PM interview questions and detailed solutions to the library.</p>
            </div>
            <div className="p-8">
              {showSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-green-light border border-green-200 rounded-2xl text-center space-y-4"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-custom mx-auto shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-custom">Question Added Successfully!</h4>
                    <p className="text-sm text-green-custom opacity-80">Thank you for contributing to the Prep PM community.</p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleAddQuestion} className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Question Text</label>
                      <textarea
                        required
                        placeholder="e.g. Design a vacation sharing product for internal Facebook users..."
                        rows={3}
                        className="w-full p-3 bg-bg border border-border-custom rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                        value={newQuestion.questionText}
                        onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Company</label>
                        <select
                          className="w-full p-2.5 bg-bg border border-border-custom rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10"
                          value={newQuestion.company}
                          onChange={e => setNewQuestion({ ...newQuestion, company: e.target.value })}
                        >
                          {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Difficulty</label>
                        <select
                          className="w-full p-2.5 bg-bg border border-border-custom rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10"
                          value={newQuestion.difficulty}
                          onChange={e => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Suggested Framework / Hint</label>
                      <input
                        required
                        placeholder="e.g. CIRCLES, BUS, STAR"
                        className="w-full p-2.5 bg-bg border border-border-custom rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10"
                        value={newQuestion.frameworkHint}
                        onChange={e => setNewQuestion({ ...newQuestion, frameworkHint: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Solution Doc URL / File Link</label>
                      <div className="relative">
                        <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" />
                        <input
                          placeholder="Link to detailed solution (Drive, Dropbox, etc.)"
                          className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border-custom rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10"
                          value={newQuestion.solutionDocUrl}
                          onChange={e => setNewQuestion({ ...newQuestion, solutionDocUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Tags (Select all that apply)</label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {TAGS.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                              newQuestion.tags?.includes(tag)
                                ? "bg-primary border-primary text-white"
                                : "bg-bg border-border-custom text-text-sub hover:border-primary/40"
                            )}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Gold Answer (Snippet)</label>
                      <textarea
                        required
                        placeholder="Provide a high-level summary of the ideal response..."
                        rows={4}
                        className="w-full p-3 bg-bg border border-border-custom rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                        value={newQuestion.goldAnswer}
                        onChange={e => setNewQuestion({ ...newQuestion, goldAnswer: e.target.value })}
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        disabled={submitting}
                        type="submit"
                        className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        Add to Global Question Bank
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-3xl border border-border-custom shadow-sm overflow-hidden">
            <div className="p-8 border-b border-border-custom">
              <h3 className="text-lg font-bold text-text-custom mb-2">Preferences</h3>
              <p className="text-sm text-text-sub font-medium">Customize your mock interview experience.</p>
            </div>
            <div className="p-8 space-y-6">
              {[
                { label: 'Voice Mode Enabled', desc: 'Auto-read questions and AI feedback using TTS.', enabled: true },
                { label: 'Live Feedback Sidebar', desc: 'Show hints and score and real-time during sessions.', enabled: true },
                { label: 'Ambient Noise Suppression', desc: 'Filter background noise from recordings.', enabled: false },
                { label: 'Email Notifications', desc: 'Receive weekly progress reports and prep reminders.', enabled: true }
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between pb-6 border-b border-border-custom last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-text-custom">{pref.label}</h4>
                    <p className="text-xs text-text-sub font-medium">{pref.desc}</p>
                  </div>
                  <button className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-300",
                    pref.enabled ? "bg-primary" : "bg-border-custom"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                      pref.enabled ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-3xl border border-border-custom shadow-sm overflow-hidden">
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-text-custom">Subscription Tier</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="px-2 py-0.5 bg-bg border border-border-custom text-[10px] font-bold text-text-sub rounded-md uppercase tracking-wider">Free Plan</div>
                  </div>
                </div>
                <button className="px-6 py-2.5 bg-dark-bg text-white text-sm font-bold rounded-xl hover:bg-dark-bg/90 transition-all flex items-center gap-2">
                  <CreditCard size={18} />
                  Upgrade to Pro
                </button>
              </div>
              <p className="text-xs text-text-sub font-medium leading-relaxed max-w-lg">
                Your current free plan includes 5 mock sessions/month and basic results analysis. Pro unlocks unlimited sessions, Gold Standard answers, and peer mock credits.
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-8 bg-red-light rounded-3xl border border-red-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-red-custom">Danger Zone</h3>
                <p className="text-xs text-red-custom/80 font-medium">Irreversibly delete your account and all session history.</p>
              </div>
              <button className="px-4 py-2 bg-white border border-red-200 text-red-custom text-xs font-bold rounded-lg hover:bg-red-custom hover:text-white transition-all flex items-center gap-2">
                <Trash2 size={14} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
