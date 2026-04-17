import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, ChevronRight, Shield, Sparkles } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const UploadPage = () => {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedResume, setParsedResume] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are accepted.'); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB.'); return; }
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const uploadResume = async () => {
    if (!file) return;
    setUploadState('uploading'); setProgress(0);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const { data } = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => { if (e.total) setProgress(Math.round((e.loaded / e.total) * 100)); },
      });
      setParsedResume(data.data?.resume);
      setUploadState('success');
      toast.success('Resume analyzed successfully!');
    } catch (err: any) {
      setUploadState('error');
      toast.error(err?.response?.data?.message || 'Upload failed.');
    }
  };

  const reset = () => { setFile(null); setUploadState('idle'); setProgress(0); setParsedResume(null); };

  return (
    <div className="lg:ml-72 p-8 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-black tracking-tight mb-2">Analyze Resume</h1>
        <p className="text-white/40 mb-10">Upload your PDF resume. Our AI engine will extract and score your profile.</p>

        <AnimatePresence mode="wait">
          {uploadState === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && inputRef.current?.click()}
                className={`glass-card border-2 border-dashed transition-all duration-300 py-20 flex flex-col items-center cursor-pointer group ${
                  dragging ? 'border-accent-violet/70 bg-accent-violet/5 scale-[1.01]'
                  : file ? 'border-accent-green/50 bg-accent-green/5 cursor-default'
                  : 'border-white/10 hover:border-accent-violet/40 hover:bg-white/5'
                }`}
              >
                <input ref={inputRef} type="file" accept=".pdf" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {file ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-accent-green/10 text-accent-green flex items-center justify-center mb-6"><FileText size={32} /></div>
                    <p className="font-display text-xl font-bold mb-1">{file.name}</p>
                    <p className="text-white/40 text-sm">{(file.size / 1024).toFixed(1)} KB • PDF</p>
                    <button onClick={(e) => { e.stopPropagation(); reset(); }} className="mt-4 text-white/30 hover:text-red-400 text-xs transition-colors">Remove file</button>
                  </>
                ) : (
                  <>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${dragging ? 'bg-accent-violet/20 text-accent-violet scale-110' : 'bg-white/5 text-white/30 group-hover:bg-accent-violet/10 group-hover:text-accent-violet'}`}><Upload size={32} /></div>
                    <p className="font-display text-2xl font-bold mb-2">Drop your PDF here</p>
                    <p className="text-white/40 text-sm">or click to browse files</p>
                    <p className="text-white/20 text-xs mt-2">Maximum size: 10MB</p>
                  </>
                )}
              </div>
              {file && (
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={uploadResume} className="btn-primary w-full mt-6 flex items-center justify-center gap-2 group">
                  Start AI Analysis <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              )}
            </motion.div>
          )}

          {uploadState === 'uploading' && (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card flex flex-col items-center py-20 text-center">
              <Loader2 size={48} className="text-accent-violet animate-spin mb-6" />
              <h2 className="font-display text-2xl font-bold mb-2">Analyzing your resume…</h2>
              <p className="text-white/40 text-sm mb-8">Extracting skills, experience, and education</p>
              <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan rounded-full"
                  initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
              </div>
              <p className="text-white/30 text-xs mt-3">{progress}% uploaded</p>
            </motion.div>
          )}

          {uploadState === 'success' && parsedResume && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="glass-card bg-accent-green/5 border-accent-green/20 flex items-center gap-4">
                <CheckCircle2 size={32} className="text-accent-green flex-shrink-0" />
                <div>
                  <h3 className="font-bold font-display text-lg">Analysis Complete!</h3>
                  <p className="text-white/50 text-sm">Your resume has been parsed and stored.</p>
                </div>
              </div>
              <div className="glass-card">
                <h3 className="font-display text-xl font-bold mb-6">Extracted Data Preview</h3>
                <div className="space-y-5">
                  <div>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-2.5">Skills Detected</p>
                    <div className="flex flex-wrap gap-2">
                      {(parsedResume.parsedData?.skills || []).slice(0, 10).map((s: any, i: number) => (
                        <span key={i} className="px-3 py-1.5 glass rounded-lg text-xs font-bold text-accent-cyan border-accent-cyan/20">{s.name}</span>
                      ))}
                      {parsedResume.parsedData?.skills?.length > 10 && (
                        <span className="px-3 py-1.5 glass rounded-lg text-xs font-bold text-white/30">+{parsedResume.parsedData.skills.length - 10} more</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-2.5">Education</p>
                    {(parsedResume.parsedData?.education || []).map((e: any, i: number) => (
                      <p key={i} className="text-sm font-semibold capitalize text-white/80">{e.degree}</p>
                    ))}
                    {!parsedResume.parsedData?.education?.length && <p className="text-white/30 text-sm">Not detected</p>}
                  </div>
                  <div>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-2.5">Experience Entries</p>
                    <p className="text-sm font-semibold text-white/80">{parsedResume.parsedData?.experience?.length || 0} role(s) found</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1 flex items-center justify-center gap-2">View Dashboard <ChevronRight size={18} /></button>
                <button onClick={reset} className="btn-secondary flex-1">Upload Another</button>
              </div>
            </motion.div>
          )}

          {uploadState === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card bg-red-500/5 border-red-500/20 flex flex-col items-center py-16 text-center">
              <XCircle size={48} className="text-red-400 mb-4" />
              <h2 className="font-display text-2xl font-bold mb-2">Analysis Failed</h2>
              <p className="text-white/40 text-sm mb-8">Something went wrong while processing your resume.</p>
              <button onClick={reset} className="btn-secondary">Try Again</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/20 text-xs font-medium">
          <div className="flex items-center gap-2"><Shield size={14} /> Encrypted Storage</div>
          <div className="flex items-center gap-2"><Sparkles size={14} /> AI-Powered Parsing</div>
          <div className="flex items-center gap-2"><CheckCircle2 size={14} /> Auto-Deleted after 90 days</div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadPage;
