import { 
  CheckCircle2, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { Shell } from '../components/ui/Layout';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Link } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useState, useEffect } from 'react';

const SKILLS = [
  { name: 'Product Sense', score: 85, color: 'bg-green-custom' },
  { name: 'Behavioral', score: 72, color: 'bg-green-custom' },
  { name: 'Execution', score: 45, color: 'bg-amber-custom' },
  { name: 'Metrics', score: 62, color: 'bg-amber-custom' },
  { name: 'Strategy', score: 38, color: 'bg-red-custom' },
  { name: 'Estimation', score: 90, color: 'bg-green-custom' },
];

const PREP_TASKS = [
  { id: 1, text: 'Review "Facebook Marketplace" design case' },
  { id: 2, text: 'Practice estimation: "Users in India"' },
  { id: 3, text: 'Watch "Trade-offs" video module' },
  { id: 4, text: 'Complete behavioral mock (2 questions)' },
];

const RECENT_SESSIONS = [
  { id: '1', date: 'Oct 24', company: 'Google', type: 'Product Sense', score: 82, feedback: 'Strong empathy, work on structure.' },
  { id: '2', date: 'Oct 22', company: 'Meta', type: 'Execution', score: 68, feedback: 'Better prioritization needed.' },
  { id: '3', date: 'Oct 20', company: 'Stripe', type: 'Behavioral', score: 91, feedback: 'Excellent storytelling.' },
];

const SAMPLE_QUESTIONS = [
  { company: 'Meta', category: 'Product Sense', difficulty: 'hard', questionText: 'How would you improve Facebook Marketplace for sellers in emerging markets?', frameworkHint: 'CIRCLES Method', rubricItems: ['Clarify scope', 'Identify user segments', 'Prioritize needs', 'Brainstorm solutions', 'Evaluate trade-offs'], goldAnswer: 'Start by defining emerging markets...' },
  { company: 'Google', category: 'Estimation', difficulty: 'medium', questionText: 'How many Google Maps users are there in India?', frameworkHint: 'Top-down approach', rubricItems: ['Smartphone penetration', 'Data usage patterns', 'Urban vs Rural divide'], goldAnswer: 'Population 1.4B...' },
  { company: 'Stripe', category: 'Behavioral', difficulty: 'medium', questionText: 'Tell me about a time you had to make a difficult trade-off under time pressure.', frameworkHint: 'STAR Method', rubricItems: ['Context', 'Options considered', 'Criteria for decision', 'Outcome'], goldAnswer: 'At my previous role...' }
];

export default function Dashboard() {
  const { profile } = useAuth();

  const daysToInterview = profile?.interviewDate 
    ? Math.max(0, Math.ceil((new Date(profile.interviewDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : '--';

  return (
    <Shell>
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-text-custom">
              Good morning, {profile?.fullName?.split(' ')[0] || 'Alex'} 👋
            </h1>
            <p className="text-sm text-text-sub font-medium">
              You have a {profile?.targetCompany || 'Meta'} interview in <span className="text-primary font-semibold text-sm">{daysToInterview} days</span>. Keep it up!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="countdown-pill">
              {profile?.targetCompany || 'Meta'} Interview: {daysToInterview} Days Left
            </div>
            <Link 
              to="/mock"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary/90 transition-all"
            >
              Start Mock Interview
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Readiness Score" 
            value="74%" 
            change="+4%"
            isPositive={true}
          />
          <StatCard 
            label="Mocks Completed" 
            value="12" 
            sub="/ 30 planned" 
          />
          <StatCard 
            label="Current Streak" 
            value={`${profile?.streakCount || 5}`} 
            sub="days" 
          />
          <StatCard 
            label="Avg. Feedback" 
            value="Strong" 
            change="Steady"
            isPositive={null}
          />
        </div>

        <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6 min-w-0">
            {/* Recent Performance */}
            <div className="professional-card flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 px-5 border-b border-border-custom flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-text-custom">Recent Performance</h3>
                <button className="text-primary text-xs font-semibold hover:underline">View all history →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-border-custom">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-text-sub uppercase tracking-wider">Date</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-text-sub uppercase tracking-wider">Type</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-text-sub uppercase tracking-wider">Company</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-text-sub uppercase tracking-wider">Score</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-text-sub uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-custom">
                    {RECENT_SESSIONS.map((session) => (
                      <tr key={session.id} className="hover:bg-bg/40 transition-colors">
                        <td className="px-5 py-4 text-[13px] whitespace-nowrap text-text-custom">{session.date}</td>
                        <td className="px-5 py-4 text-[13px] whitespace-nowrap font-medium text-text-custom">{session.type}</td>
                        <td className="px-5 py-4 text-[13px] whitespace-nowrap">
                          <span className="professional-badge bg-primary-light text-primary">
                            {session.company}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[13px] whitespace-nowrap">
                          <span className={cn(
                            "font-bold",
                            session.score >= 80 ? "text-green-custom" : session.score >= 60 ? "text-amber-custom" : "text-red-custom"
                          )}>
                            {session.score}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[13px] whitespace-nowrap">
                          <button className="text-primary text-xs font-semibold hover:underline">
                            Replay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Skill Heatmap */}
              <div className="p-4 px-5 border-t border-border-custom">
                <h3 className="text-[15px] font-bold text-text-custom mb-4">Skill Heatmap</h3>
                <div className="space-y-4 py-2">
                  {[
                    { name: 'Product Sense', score: 84, color: 'bg-green-custom' },
                    { name: 'Estimation', score: 62, color: 'bg-amber-custom' },
                    { name: 'Execution & Metrics', score: 76, color: 'bg-green-custom' },
                  ].map(skill => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between text-[13px] font-medium text-text-custom">
                        <span>{skill.name}</span>
                        <span>{skill.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#EEE] rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-1000", skill.color)}
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Panel */}
          <div className="space-y-6">
            {/* Prep Plan */}
            <div className="professional-card pb-5">
              <div className="p-4 px-5 border-b border-border-custom flex items-center justify-between mb-2">
                <h3 className="text-[15px] font-bold text-text-custom">Today's Prep Plan</h3>
                <span className="text-[11px] bg-[#F0F0F5] px-2 py-0.5 rounded font-bold text-text-sub">DAILY</span>
              </div>
              <div className="space-y-0.5">
                {[
                  { text: 'Complete 1 Estimation Mock', sub: 'Target: Uber rides in NYC', done: true },
                  { text: 'Review Meta Case Study', sub: 'Product Sense: FB Marketplace', done: false },
                  { text: 'Practice 3 Behavioral Qs', sub: 'Focus on "Conflict with Engineering"', done: false },
                  { text: 'Review Metrics Glossary', sub: 'LTV, Churn, and ARPU focus', done: false },
                ].map((task, idx) => (
                  <div key={idx} className="flex gap-3 px-5 py-3.5 border-b border-[#F0F0F5] last:border-0 items-start">
                    <div className={cn(
                      "w-[18px] h-[18px] border-2 rounded shrink-0 mt-0.5 transition-colors",
                      task.done ? "bg-primary border-primary" : "border-border-custom bg-white"
                    )} />
                    <div>
                      <p className={cn(
                        "text-[14px] font-semibold leading-tight",
                        task.done ? "line-through opacity-50" : "text-text-custom"
                      )}>
                        {task.text}
                      </p>
                      <p className="text-[11px] text-text-sub mt-1">{task.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Coaching Tip */}
              <div className="px-5 mt-6">
                <div className="bg-primary-light p-4 rounded-lg text-center border border-primary/5">
                  <h4 className="text-primary font-bold text-[12px] mb-2 tracking-wide">AI COACH TIP</h4>
                  <p className="text-[12px] text-text-custom leading-relaxed font-medium">
                    "Your estimation scores are improving. Try practicing one without a calculator today to build confidence."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function StatCard({ label, value, sub, change, isPositive }: any) {
  return (
    <div className="professional-card p-5 hover:border-primary/40 transition-colors">
      <p className="text-[12px] text-text-sub font-semibold uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-text-custom">{value}</span>
        {change && (
          <span className={cn(
            "text-[11px] font-semibold px-1.5 py-0.5 rounded",
            isPositive === true ? "bg-green-light text-green-custom" : 
            isPositive === false ? "bg-red-light text-red-custom" : 
            "bg-amber-light text-amber-custom"
          )}>
            {change}
          </span>
        )}
        {sub && <span className="text-[13px] text-text-sub font-medium">{sub}</span>}
      </div>
    </div>
  );
}
