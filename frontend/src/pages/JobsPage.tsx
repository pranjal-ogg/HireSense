import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Building2, Briefcase, ChevronRight, Loader2, Search, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Job {
  _id: string;
  title: string;
  company: string;
  status: string;
  requirements?: {
    requiredSkills?: string[];
    minExperienceYears?: number;
  };
}

interface MatchResult {
  jobId: string;
  jobTitle: string;
  company: string;
  overallScore: number;
  breakdown: { skills: number; experience: number; education: number };
  analysis: string[];
}

const ScoreBar = ({ value, color }: { value: number; color: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
    <span className="text-xs font-bold text-white/50 w-8 text-right">{value}%</span>
  </div>
);

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        // Fetch jobs and the user's latest resume in parallel
        const [jobsRes, resumesRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/resumes'),
        ]);
        setJobs(jobsRes.data.data?.jobs || []);
        const resumes = resumesRes.data.data?.resumes || [];
        if (resumes.length > 0 && resumes[0].parseStatus === 'completed') {
          const latestId = resumes[0]._id;
          setResumeId(latestId);
          // Fetch matches for this resume
          const matchRes = await api.get(`/matches/resumes/${latestId}?limit=20`);
          setMatches(matchRes.data.data?.matches || []);
        }
      } catch {
        toast.error('Failed to load jobs.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const scoreColor = (s: number) =>
    s >= 80 ? 'text-accent-green' : s >= 60 ? 'text-accent-cyan' : s >= 40 ? 'text-accent-amber' : 'text-red-400';

  const scoreBgColor = (s: number) =>
    s >= 80 ? 'bg-accent-green/10 border-accent-green/20' : s >= 60 ? 'bg-accent-cyan/10 border-accent-cyan/20' : 'bg-white/5 border-white/10';

  // Build lookup for match score by jobId
  const matchMap = new Map(matches.map((m) => [m.jobId, m]));

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lg:ml-72 p-8 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight mb-1">Job Matches</h1>
            <p className="text-white/40">
              {resumeId ? 'Ranked by AI compatibility with your profile.' : 'Upload a resume to see match scores.'}
            </p>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs…"
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-accent-violet/50 w-64 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={36} className="animate-spin text-accent-violet" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card flex flex-col items-center py-24 text-center">
            <AlertCircle size={48} className="text-white/20 mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">No Jobs Found</h2>
            <p className="text-white/40 text-sm">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((job, i) => {
              const match = matchMap.get(job._id);
              const score = match?.overallScore ?? null;
              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card border transition-all hover:scale-[1.01] flex flex-col gap-5 ${score !== null ? scoreBgColor(score) : 'border-white/10'}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Building2 size={22} className="text-white/50" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg leading-tight">{job.title}</h3>
                        <p className="text-white/40 text-sm">{job.company}</p>
                      </div>
                    </div>
                    {score !== null && (
                      <div className={`flex-shrink-0 text-right`}>
                        <p className={`font-display text-3xl font-black ${scoreColor(score)}`}>{score}%</p>
                        <p className="text-white/30 text-xs">match</p>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {job.requirements?.requiredSkills && job.requirements.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.requiredSkills.slice(0, 5).map((skill, si) => (
                        <span key={si} className="px-2.5 py-1 glass rounded-lg text-xs font-bold text-white/50">{skill}</span>
                      ))}
                      {job.requirements.requiredSkills.length > 5 && (
                        <span className="px-2.5 py-1 glass rounded-lg text-xs text-white/30">+{job.requirements.requiredSkills.length - 5}</span>
                      )}
                    </div>
                  )}

                  {/* Score Breakdown */}
                  {match && (
                    <div className="space-y-2.5">
                      <div>
                        <p className="text-white/30 text-xs mb-1 flex items-center gap-1.5"><Target size={12} />Skills</p>
                        <ScoreBar value={match.breakdown.skills} color="bg-accent-violet" />
                      </div>
                      <div>
                        <p className="text-white/30 text-xs mb-1 flex items-center gap-1.5"><Briefcase size={12} />Experience</p>
                        <ScoreBar value={match.breakdown.experience} color="bg-accent-cyan" />
                      </div>
                    </div>
                  )}

                  {/* Exp badge */}
                  <div className="flex items-center justify-between">
                    {job.requirements?.minExperienceYears !== undefined && (
                      <span className="text-xs text-white/40 font-medium">
                        Min. {job.requirements.minExperienceYears} yr{job.requirements.minExperienceYears !== 1 ? 's' : ''} exp
                      </span>
                    )}
                    <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${
                      job.status === 'active' ? 'bg-accent-green/15 text-accent-green' : 'bg-white/10 text-white/40'
                    }`}>{job.status}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!resumeId && !loading && (
          <div className="mt-10 glass-card bg-accent-violet/5 border-accent-violet/20 flex items-center justify-between gap-6 p-6">
            <div>
              <h3 className="font-display font-bold text-lg mb-1">Get Your Match Scores</h3>
              <p className="text-white/40 text-sm">Upload your resume to see how compatible you are with each job.</p>
            </div>
            <Link to="/upload" className="btn-primary whitespace-nowrap flex items-center gap-2 text-sm">
              Upload Resume <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default JobsPage;
