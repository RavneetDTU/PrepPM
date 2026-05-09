import { useState, useEffect } from 'react';
import { Shell } from '../components/ui/Layout';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Star, 
  MessageSquare, 
  Layout, 
  Trophy,
  Play,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Question } from '../types';
import { Plus, X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Product Sense', 'Estimation', 'Behavioral', 'Metrics', 'Strategy', 'Execution'];
const COMPANIES = ['Google', 'Meta', 'Stripe', 'Amazon', 'Microsoft', 'Netflix', 'Uber', 'Airbnb'];

export default function Questions() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [search, setSearch] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    company: 'Google',
    category: 'Product Sense',
    difficulty: 'Medium' as any,
    questionText: '',
    frameworkHint: '',
    goldAnswer: '',
    rubricItems: [''],
    upvotes: 0
  });

  const fetchQuestions = async () => {
    setLoading(true);
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const qSnap = await getDocs(q);
    const data = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
    setQuestions(data);
    if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'questions'), {
        ...newQuestion,
        createdAt: serverTimestamp(),
      });
      setShowAddModal(false);
      setNewQuestion({
        company: 'Google',
        category: 'Product Sense',
        difficulty: 'Medium' as any,
        questionText: '',
        frameworkHint: '',
        goldAnswer: '',
        rubricItems: [''],
        upvotes: 0
      });
      fetchQuestions();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const seedQuestions = async () => {
    setSubmitting(true);
    const sampleQuestions: Partial<Question>[] = [
      {
        company: 'Google',
        category: 'Estimation',
        difficulty: 'Medium' as any,
        questionText: 'How many people are in the air over the US at any given time?',
        frameworkHint: 'Clarify, Divide-and-Conquer, Sanity Check',
        goldAnswer: 'Start by estimating US population. Assume % of people traveling by air. Calculate average flight duration vs total hours in a day. Account for peak vs off-peak times.',
        rubricItems: ['Clarified assumptions', 'Structured estimation steps', 'Reasonable math operations', 'Confidence Check'],
        upvotes: 12
      },
      {
        company: 'Meta',
        category: 'Product Sense',
        difficulty: 'Hard' as any,
        questionText: 'Design a travel product for Facebook.',
        frameworkHint: 'CIRCLE Framework',
        goldAnswer: 'Identify goals (Engagement/Retention). Personas: Group travelers vs solo adventurers. Pain points: Planning friction, trust, real-time coordination. Solution: Shared itineraries with social social proof.',
        rubricItems: ['Defined mission & goals', 'Prioritized user needs', 'Innovative solutioning', 'Defined success metrics'],
        upvotes: 24
      }
    ];

    for (const q of sampleQuestions) {
      await addDoc(collection(db, 'questions'), {
        ...q,
        createdAt: serverTimestamp(),
      });
    }
    fetchQuestions();
    setSubmitting(false);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesCompany = selectedCompany === 'All' || q.company === selectedCompany;
    const matchesSearch = q.questionText.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesCompany && matchesSearch;
  });

  const selectedQuestion = questions.find(q => q.id === selectedId);

  if (loading) return <Shell><div className="flex items-center justify-center min-h-[400px] text-text-sub">Loading questions...</div></Shell>;

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-custom mb-1">Question Bank</h1>
            <p className="text-sm text-text-sub font-medium">Curated repository of the most common PM interview questions.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 transition-all text-sm"
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>

        {/* Filters */}
        <div className="professional-card p-5 space-y-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" size={16} />
              <input 
                type="text" 
                placeholder="Search by keyword, company, or type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-bg border border-border-custom rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className="bg-bg border border-border-custom rounded-lg px-3 py-2 text-sm font-semibold text-text-custom outline-none"
              >
                <option value="All">All Companies</option>
                {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="flex items-center gap-2 px-3 py-2 border border-border-custom rounded-lg text-sm font-semibold text-text-custom hover:bg-bg transition-all">
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-all border",
                  selectedCategory === cat 
                    ? "bg-primary text-white border-primary" 
                    : "bg-white text-text-sub border-border-custom hover:border-primary/50"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Question List */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-3">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(q => (
                <div 
                  key={q.id}
                  onClick={() => setSelectedId(q.id)}
                  className={cn(
                    "p-5 professional-card cursor-pointer transition-all hover:bg-bg/20",
                    selectedId === q.id ? "ring-2 ring-primary border-primary" : "border-border-custom"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="professional-badge bg-primary-light text-primary">{q.company}</span>
                        <span className="professional-badge bg-bg text-text-sub border border-border-custom">{q.category}</span>
                        <span className={cn(
                          "professional-badge",
                          q.difficulty === 'Hard' ? "bg-red-light text-red-custom" : "bg-amber-light text-amber-custom"
                        )}>{q.difficulty}</span>
                      </div>
                      <h3 className="font-bold text-text-custom text-[15px] leading-tight transition-colors group-hover:text-primary">{q.questionText}</h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-dashed border-border-custom">
                    <div className="flex items-center gap-4 text-text-sub text-[11px] font-semibold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Star size={12} className="text-amber-custom" fill="currentColor" />
                        <span>{q.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={12} />
                        <span>{q.frameworkHint}</span>
                      </div>
                    </div>
                    <Link 
                      to="/mock"
                      className="flex items-center gap-1 text-primary text-xs font-bold hover:underline"
                    >
                      Practice <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 professional-card bg-bg/50 border-dashed text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-text-sub border border-border-custom">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-text-custom">No questions found</h3>
                  <p className="text-sm text-text-sub">Try adjusting your filters or seed the database.</p>
                </div>
                <button 
                  onClick={seedQuestions}
                  disabled={submitting}
                  className="px-6 py-2 bg-white border border-border-custom text-sm font-bold rounded-lg hover:bg-bg transition-all flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-primary" />}
                  Seed Sample Questions
                </button>
              </div>
            )}
          </div>

          {/* Question Details */}
          {selectedQuestion && (
            <div className="lg:col-span-12 xl:col-span-5 hidden xl:block sticky top-8">
              <div className="professional-card overflow-hidden flex flex-col h-[calc(100vh-160px)]">
                <div className="p-6 border-b border-border-custom space-y-4">
                  <h3 className="text-lg font-bold text-text-custom leading-tight">
                    {selectedQuestion.questionText}
                  </h3>
                  <div className="flex gap-2">
                    <span className="professional-badge bg-primary text-white">{selectedQuestion.company}</span>
                    <span className="professional-badge bg-bg text-text-sub border border-border-custom">{selectedQuestion.category}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-primary">
                      <Layout size={16} />
                      <h4 className="font-bold text-[11px] uppercase tracking-wider">Suggested Framework</h4>
                    </div>
                    <div className="p-3 bg-bg rounded-lg text-[13px] font-semibold text-text-custom border border-border-custom">
                      {selectedQuestion.frameworkHint}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-green-custom">
                      <Trophy size={16} />
                      <h4 className="font-bold text-[11px] uppercase tracking-wider">Gold Standard Answer</h4>
                    </div>
                    <div className="text-[13px] text-text-sub font-medium leading-relaxed whitespace-pre-line bg-bg/50 p-4 rounded-lg border border-border-custom border-dashed">
                      {selectedQuestion.goldAnswer}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-text-custom">Rubric Checklist</h4>
                    <ul className="space-y-2.5">
                      {selectedQuestion.rubricItems?.map(item => (
                        <li key={item} className="flex items-start gap-3 text-[13px] text-text-sub font-medium leading-snug">
                          <CheckCircle2 size={15} className="text-green-custom shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 bg-bg/50 border-t border-border-custom">
                  <Link 
                    to="/mock"
                    className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    Practice this question
                    <Play size={16} fill="currentColor" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-dark-bg/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border-custom flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-custom">Add New Question</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-bg rounded-lg transition-colors text-text-sub"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddQuestion} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Company</label>
                    <select
                      required
                      className="w-full p-2.5 bg-bg border border-border-custom rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10"
                      value={newQuestion.company}
                      onChange={e => setNewQuestion({ ...newQuestion, company: e.target.value })}
                    >
                      {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Category</label>
                    <select
                      required
                      className="w-full p-2.5 bg-bg border border-border-custom rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10"
                      value={newQuestion.category}
                      onChange={e => setNewQuestion({ ...newQuestion, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Question Text</label>
                  <textarea
                    required
                    placeholder="e.g. Design a parking lot system for autonomous vehicles."
                    rows={3}
                    className="w-full p-3 bg-bg border border-border-custom rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                    value={newQuestion.questionText}
                    onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Suggested Framework / Hint</label>
                  <input
                    required
                    placeholder="e.g. CIRCLE Framework, BUS Framework"
                    className="w-full p-2.5 bg-bg border border-border-custom rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10"
                    value={newQuestion.frameworkHint}
                    onChange={e => setNewQuestion({ ...newQuestion, frameworkHint: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-sub uppercase tracking-wider">Gold Standard Answer (Draft)</label>
                  <textarea
                    required
                    placeholder="Provide a high-level summary of the ideal answer structure..."
                    rows={4}
                    className="w-full p-3 bg-bg border border-border-custom rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-primary/10 resize-none"
                    value={newQuestion.goldAnswer}
                    onChange={e => setNewQuestion({ ...newQuestion, goldAnswer: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-bold text-text-sub hover:text-text-custom transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={submitting}
                    type="submit"
                    className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 transition-all text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    Add to Bank
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Shell>
  );
}
