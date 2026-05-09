import { Shell } from './Layout';
import { Rocket, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface UpcomingProps {
  title: string;
  description: string;
  featureDescription: string;
}

export default function Upcoming({ title, description, featureDescription }: UpcomingProps) {
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary"
        >
          <Rocket size={40} />
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-text-custom tracking-tight">{title}</h1>
          <p className="text-lg text-text-sub font-medium leading-relaxed">
            {description}
          </p>
        </div>

        <div className="professional-card p-8 bg-primary-light border-primary/10 w-full relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles size={120} />
          </div>
          
          <h3 className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Coming Soon</h3>
          <p className="text-text-custom text-sm font-medium leading-relaxed relative z-10">
            {featureDescription}
          </p>
        </div>

        <p className="text-xs text-text-sub uppercase font-bold tracking-widest">
          Stay tuned for updates
        </p>
      </div>
    </Shell>
  );
}
