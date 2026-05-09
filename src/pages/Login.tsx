import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <Link 
        to="/" 
        className="fixed top-8 left-8 flex items-center gap-2 text-text-sub hover:text-text-custom transition-colors font-medium text-sm"
      >
        <ArrowLeft size={18} />
        Back to home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 professional-card shadow-2xl shadow-black/5"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-custom mb-1.5">Login</h1>
          <p className="text-sm text-text-sub font-medium">Pick up where you left off</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-light text-red-custom text-[13px] font-semibold rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-text-sub uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" size={16} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-bg border border-border-custom rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-text-sub uppercase tracking-wider">Password</label>
                <a href="#" className="text-[11px] text-primary font-bold hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-sub" size={16} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-bg border border-border-custom rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 text-sm"
          >
            {loading ? 'Logging in...' : 'Login to Prep PM'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-sub font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
