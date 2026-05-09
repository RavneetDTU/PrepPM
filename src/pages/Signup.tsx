import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronRight, Globe, Lock, Mail, User } from 'lucide-react';
import { cn } from '../lib/utils';

const COMPANIES = ['Google', 'Meta', 'Stripe', 'Amazon', 'Microsoft', 'Apple', 'Uber', 'Airbnb'];
const ROLES = ['APM', 'PM', 'Senior PM', 'Staff PM', 'Transitioning to PM'];

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    currentRole: 'PM',
    targetCompanies: [] as string[],
    targetLevel: 'PM',
    interviewDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleToggleCompany = (company: string) => {
    setFormData(prev => ({
      ...prev,
      targetCompanies: prev.targetCompanies.includes(company)
        ? prev.targetCompanies.filter(c => c !== company)
        : [...prev.targetCompanies, company]
    }));
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const profileData = {
        id: user.uid,
        fullName: formData.fullName,
        currentRole: formData.currentRole,
        targetCompanies: formData.targetCompanies,
        targetLevel: formData.targetLevel,
        interviewDate: formData.interviewDate,
        streakCount: 0,
        lastActiveDate: null,
        subscriptionTier: 'free',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'profiles', user.uid), profileData);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Panel */}
      <div className="lg:w-[450px] bg-dark-bg p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
        <div className="relative z-10">
          <Link to="/" className="text-2xl font-bold text-white mb-12 block">
            <span className="text-primary">Prep</span>AI
          </Link>
          
          <div className="space-y-8 mt-24">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Start your journey <br /> to your dream <br /> product role.
            </h2>
            <div className="space-y-6">
              {[
                'Unlimited mock interview sessions',
                'Hyper-realistic AI voice feedback',
                'Curated company-specific questions',
                'Data-driven readiness tracking'
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-text-sub font-medium">
                  <CheckCircle2 size={20} className="text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto relative z-10 p-6 bg-dark-card rounded-2xl border border-dark-border">
          <p className="text-sm text-white font-medium italic mb-2">
            "PrepAI was the difference between another rejection and my offer at Meta."
          </p>
          <div className="text-xs text-text-sub">— Sarah L., PM @ Google</div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -ml-32 -mb-32" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-custom mb-1.5">Create free account</h1>
            <p className="text-sm text-text-sub font-medium">No credit card required. Start prepping in seconds.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-light text-red-custom text-[13px] font-semibold rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text-sub uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" size={16} />
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-bg border border-border-custom rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-sub uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" size={16} />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-bg border border-border-custom rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-sub uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" size={16} />
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-bg border border-border-custom rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-sub uppercase tracking-wider mb-1.5">Current Role</label>
                <select
                  value={formData.currentRole}
                  onChange={e => setFormData({ ...formData, currentRole: e.target.value })}
                  className="w-full px-4 py-2 bg-bg border border-border-custom rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold"
                >
                  {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-sub uppercase tracking-wider mb-2">Target Companies</label>
                <div className="flex flex-wrap gap-1.5">
                  {COMPANIES.map(company => (
                    <button
                      key={company}
                      type="button"
                      onClick={() => handleToggleCompany(company)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all",
                        formData.targetCompanies.includes(company)
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-border-custom text-text-sub hover:border-primary/50"
                      )}
                    >
                      {company}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-text-sub uppercase tracking-wider mb-1.5">Interview Date</label>
                  <input
                    type="date"
                    value={formData.interviewDate}
                    onChange={e => setFormData({ ...formData, interviewDate: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-border-custom rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-sub uppercase tracking-wider mb-1.5">Target Level</label>
                  <select
                    value={formData.targetLevel}
                    onChange={e => setFormData({ ...formData, targetLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-bg border border-border-custom rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-bold"
                  >
                    <option value="PM">PM</option>
                    <option value="Senior PM">Senior PM</option>
                    <option value="Staff PM">Staff PM</option>
                    <option value="Group PM">Group PM</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Creating account...' : (
                <>
                  Create free account
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-sub font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
