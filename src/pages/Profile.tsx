import { Shell } from '../components/ui/Layout';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Target, 
  MapPin, 
  Calendar,
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ACTIVITY_DATA = [
  { name: 'Mon', sessions: 2 },
  { name: 'Tue', sessions: 1 },
  { name: 'Wed', sessions: 0 },
  { name: 'Thu', sessions: 3 },
  { name: 'Fri', sessions: 1 },
  { name: 'Sat', sessions: 4 },
  { name: 'Sun', sessions: 2 },
];

const SKILLS = [
  { name: 'Product Sense', score: 85, color: 'bg-green-custom' },
  { name: 'Behavioral', score: 72, color: 'bg-green-custom' },
  { name: 'Execution', score: 45, color: 'bg-amber-custom' },
  { name: 'Metrics', score: 62, color: 'bg-amber-custom' },
  { name: 'Strategy', score: 38, color: 'bg-red-custom' },
];

const ACHIEVEMENTS = [
  { id: 1, title: 'Early Bird', icon: Trophy, desc: '3 mocks before 9 AM', unlocked: true },
  { id: 2, title: 'Company Pro', icon: Target, desc: 'Completed Google track', unlocked: true },
  { id: 3, title: 'Consistent', icon: Award, desc: '7 day streak', unlocked: false },
  { id: 4, title: 'Expert Analyst', icon: Clock, desc: 'Avg score > 85', unlocked: false },
];

export default function Profile() {
  const { profile } = useAuth();

  return (
    <Shell>
      <div className="space-y-8 pb-12">
        {/* Profile Hero */}
        <div className="bg-white p-10 rounded-3xl border border-border-custom shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-3xl bg-primary flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/20">
              {profile?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div className="text-center md:text-left space-y-4 flex-1">
              <div>
                <h1 className="text-3xl font-bold text-text-custom mb-1">{profile?.fullName}</h1>
                <p className="text-text-sub font-medium flex items-center justify-center md:justify-start gap-2">
                  <Briefcase size={16} />
                  {profile?.currentRole}
                </p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {profile?.targetCompanies?.map(c => (
                  <span key={c} className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full border border-primary/10 tracking-widest uppercase">
                    {c}
                  </span>
                ))}
                <span className="px-3 py-1 bg-bg text-text-sub text-[10px] font-bold rounded-full border border-border-custom tracking-widest uppercase flex items-center gap-1">
                  <Calendar size={10} />
                  {profile?.interviewDate ? new Date(profile.interviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date set'}
                </span>
              </div>
            </div>
            <button className="px-6 py-3 border border-border-custom rounded-xl text-sm font-bold text-text-custom hover:bg-bg transition-all">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Mocks Done', value: '12', icon: Trophy, color: 'text-primary' },
            { label: 'Best Score', value: '92', icon: Award, color: 'text-green-custom' },
            { label: 'Avg Score', value: '74', icon: TrendingUp, color: 'text-amber-custom' },
            { label: 'Streak', value: '5d', icon: Clock, color: 'text-red-custom' },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-border-custom text-center space-y-1">
              <div className={cn("inline-flex mb-2", stat.color)}><stat.icon size={20} /></div>
              <div className="text-2xl font-bold text-text-custom">{stat.value}</div>
              <div className="text-[10px] font-bold text-text-sub uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Activity */}
            <div className="bg-white p-8 rounded-3xl border border-border-custom shadow-sm">
              <h3 className="text-lg font-bold text-text-custom mb-8">Weekly Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ACTIVITY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E1E8" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 500, fill: '#6B6B80' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 500, fill: '#6B6B80' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(74, 74, 235, 0.05)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="sessions" fill="#4A4AEB" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Sessions Table (Simplified) */}
            <div className="bg-white rounded-3xl border border-border-custom shadow-sm overflow-hidden">
              <div className="p-8 border-b border-border-custom flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-custom">Session History</h3>
              </div>
              <div className="p-8 space-y-4">
                {[
                  { date: 'Oct 24', company: 'Google', type: 'Product Sense', score: 82 },
                  { date: 'Oct 22', company: 'Meta', type: 'Execution', score: 68 },
                  { date: 'Oct 20', company: 'Stripe', type: 'Behavioral', score: 91 },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-bg rounded-2xl border border-border-custom group cursor-pointer hover:border-primary/30 transition-all">
                    <div className="flex gap-4 items-center">
                      <div className="text-xs font-bold text-text-sub uppercase">{session.date}</div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-text-custom">{session.type}</div>
                        <div className="text-[10px] font-medium text-text-sub">{session.company}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={cn("text-lg font-black", session.score >= 80 ? "text-green-custom" : "text-amber-custom")}>{session.score}</div>
                        <div className="text-[8px] font-bold text-text-sub uppercase tracking-wider">Score</div>
                      </div>
                      <ChevronRight size={18} className="text-text-sub group-hover:text-primary transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Skill Bars */}
            <div className="bg-white p-8 rounded-3xl border border-border-custom shadow-sm">
              <h3 className="text-lg font-bold text-text-custom mb-6">Skill Readiness</h3>
              <div className="space-y-6">
                {SKILLS.map(skill => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-text-custom">
                      <span>{skill.name}</span>
                      <span>{skill.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", skill.color)}
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white p-8 rounded-3xl border border-border-custom shadow-sm">
              <h3 className="text-lg font-bold text-text-custom mb-6">Achievements</h3>
              <div className="grid grid-cols-2 gap-4">
                {ACHIEVEMENTS.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={cn(
                      "p-4 rounded-2xl border text-center space-y-2 transition-all",
                      achievement.unlocked 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-bg border-border-custom opacity-40 grayscale"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mx-auto",
                      achievement.unlocked ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-border-custom text-text-sub"
                    )}>
                      <achievement.icon size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-text-custom leading-tight">{achievement.title}</div>
                      <div className="text-[8px] font-medium text-text-sub mt-0.5 leading-tight">{achievement.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
