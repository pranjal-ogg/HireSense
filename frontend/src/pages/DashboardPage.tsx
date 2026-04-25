import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, CheckCircle2, AlertCircle, Zap, Target, Shield,
  FileText, BrainCircuit, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Resume {
  _id: string;
  originalFileName: string;
  parseStatus: string;
  parsedData?: {
    skills: { name: string }[];
    education: { degree: string }[];
    experience: { rawLine?: string }[];
  };
}

// Skeleton loader
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
);

// Circular progress ring
const ScoreRing = ({ score }: { score: number }) => {
  const r = 88;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - score / 100);
  return (
    <div className="relative w-52 h-52 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
        <circle
          cx="100" cy="100" r={r}
          stroke="url(#scoreGrad)" strokeWidth="10" fill="transparent"
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-display font-black">{score}</span>
        <span className="text-white/40 text-sm font-bold">/ 100</span>
      </div>
    </div>
  );
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [loadingResume, setLoadingResume] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingResume(true);
        const { data } = await api.get('/resumes');
        const resumes: Resume[] = data.data?.resumes || [];
        if (resumes.length > 0) {
          const latest = resumes[0];
          setResume(latest);

          // Fetch suggestions if parsing is complete
          if (latest.parseStatus === 'completed') {
            const [suggestRes] = await Promise.all([
              api.get(`/resumes/${latest._id}/suggestions`),
            ]);
            setSuggestions(suggestRes.data.data?.suggestions || []);

            // Compute a local ATS score from parsedData
            const pd = latest.parsedData;
            if (pd) {
              let s = 0;
              if (pd.skills?.length > 0) s += Math.min(pd.skills.length * 5, 40);
              if (pd.education?.length > 0) s += 20;
              if (pd.experience?.length > 0) s += Math.min(pd.experience.length * 10, 30);
              if (pd.skills?.length >= 5) s += 10;
              setScore(Math.min(s, 100));
            }
          }
        }
      } catch (err) {
        toast.error('Failed to load resume data.');
      } finally {
        setLoadingResume(false);
      }
    };
    fetchData();
  }, []);

  const skillColor = (index: number) => {
    const colors = ['text-accent-cyan', 'text-accent-violet', 'text-accent-green', 'text-accent-amber'];
    return colors[index % colors.length];
  };

  const suggestions_icons = [Zap, Target, Shield, BrainCircuit, AlertCircle];

  return (
    <div className="lg:ml-72 p-8 min-h-screen">
      {/* Header */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mb-10">
        <h1 className="font-display text-4xl font-black tracking-tight mb-1">
          Career Intelligence
        </h1>
        <p className="text-white/40">
          Welcome back, <span className="text-white font-semibold">{user?.name}</span>. Here's your latest analysis.
        </p>
      </motion.div>

      {loadingResume ? (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <Skeleton className="h-80" />
          </div>
          <div className="col-span-12 md:col-span-8">
            <Skeleton className="h-80" />
          </div>
          <div className="col-span-12">
            <Skeleton className="h-48" />
          </div>
        </div>
      ) : !resume ? (
        // No resume state
        <motion.div
          {...fadeUp}
          className="flex flex-col items-center justify-center py-32 glass-card text-center max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 rounded-2xl bg-accent-violet/10 text-accent-violet flex items-center justify-center mb-6">
            <FileText size={40} />
          </div>
          <h2 className="font-display text-3xl font-black mb-4">No resume yet</h2>
          <p className="text-white/40 mb-8 leading-relaxed">
            Upload your resume to unlock your career intelligence score, personalized suggestions, and job matching.
          </p>
          <Link to="/upload" className="btn-primary flex items-center gap-2 group">
            Analyze My Resume
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-12 gap-8">

          {/* Score Card */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="col-span-12 md:col-span-4 glass-card flex flex-col items-center justify-center py-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/5 to-transparent pointer-events-none" />
            <p className="font-display text-xs font-black text-white/30 tracking-[0.2em] uppercase mb-6">ATS Readiness</p>
            <ScoreRing score={score ?? 0} />
            <div className="mt-6 flex items-center gap-2 text-accent-green font-bold text-sm">
              <TrendingUp size={16} />
              {resume.parseStatus === 'completed' ? 'Analysis complete' : `Status: ${resume.parseStatus}`}
            </div>
            <p className="mt-3 text-white/30 text-xs text-center px-4">
              Based on: <span className="text-white/60 font-medium">{resume.originalFileName}</span>
            </p>
          </motion.div>

          {/* Skills Breakdown */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="col-span-12 md:col-span-8 glass-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">Skills Detected</h2>
              <span className="text-white/30 text-sm font-medium">
                {resume.parsedData?.skills?.length || 0} found
              </span>
            </div>

            {resume.parsedData?.skills && resume.parsedData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {resume.parsedData.skills.map((skill, i) => (
                  <span
                    key={i}
                    className={`px-4 py-2 glass rounded-xl text-sm font-bold border border-white/10 ${skillColor(i)}`}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm italic">No skills detected in this resume.</p>
            )}

            {/* Education & Experience summary */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-2">Education</p>
                {resume.parsedData?.education?.length ? (
                  resume.parsedData.education.map((e, i) => (
                    <p key={i} className="text-sm font-semibold capitalize">{e.degree}</p>
                  ))
                ) : (
                  <p className="text-white/30 text-sm">Not detected</p>
                )}
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-2">Experience</p>
                <p className="text-sm font-semibold">
                  {resume.parsedData?.experience?.length
                    ? `${resume.parsedData.experience.length} role(s) detected`
                    : 'Not detected'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Suggestions Panel */}
          {suggestions.length > 0 && (
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.3 }}
              className="col-span-12 glass-card"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-accent-amber/10 text-accent-amber flex items-center justify-center">
                  <AlertCircle size={18} />
                </div>
                <h2 className="font-display text-2xl font-bold">Improvement Suggestions</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((suggestion, i) => {
                  const Icon = suggestions_icons[i % suggestions_icons.length];
                  const isPositive = suggestion.toLowerCase().includes('excellent') || suggestion.toLowerCase().includes('great');
                  return (
                    <div
                      key={i}
                      className={`p-5 rounded-2xl border transition-all hover:scale-[1.01] cursor-default ${
                        isPositive
                          ? 'bg-accent-green/5 border-accent-green/20'
                          : 'bg-white/5 border-white/8 hover:border-white/15'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
                        isPositive ? 'bg-accent-green/15 text-accent-green' : 'bg-accent-amber/10 text-accent-amber'
                      }`}>
                        {isPositive ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">{suggestion}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
