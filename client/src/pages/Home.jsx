import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileEdit, LineChart, ChevronRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative isolate px-6 pt-12 lg:px-8 bg-slate-50 min-h-[90vh]">
      <div className="mx-auto max-w-5xl py-12 sm:py-16">
        
        {/* Title / Hero section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-slate-100 border border-slate-200 text-xs text-slate-800 font-bold mb-6 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>AI Professional Workspace</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl text-black uppercase">
            Build and Optimize Your{' '}
            <span className="text-slate-800 block sm:inline font-light">
              Professional Resume
            </span>
          </h1>
          <p className="mt-6 text-base leading-relaxed text-slate-600 max-w-2xl mx-auto">
            Design an ATS-friendly resume from scratch using minimal, corporate layouts or audit your existing file with our AI parser.
          </p>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Resume Designer */}
          <div className="glass-card p-8 rounded-none border border-slate-200 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center text-black mb-6">
                <FileEdit className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-black uppercase tracking-tight mb-3">Resume Designer</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-8">
                Create a professional, modern, and ATS-friendly resume from scratch. Pick a layout, input your career info step-by-step, and export instantly.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/designer')}
              className="w-full py-3 px-5 bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all duration-150"
            >
              <span>Start Designing</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Card 2: Resume Analyzer */}
          <div className="glass-card p-8 rounded-none border border-slate-200 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center text-black mb-6">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-black uppercase tracking-tight mb-3">Resume Analyzer</h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-8">
                Upload your existing resume in PDF/DOCX to compute compatibility ratings, scan high-value keywords, and receive cover letter recommendations.
              </p>
            </div>

            <button
              onClick={() => navigate('/analyzer')}
              className="w-full py-3 px-5 bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all duration-150"
            >
              <span>Analyze Resume</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Feature section */}
        <div className="mt-24 border-t border-slate-200 pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left max-w-4xl mx-auto">
          <div>
            <h4 className="font-bold text-black text-sm uppercase tracking-wider">ATS Compliance</h4>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">Strictly structured content tables and headers tailored for ATS scanner software readability.</p>
          </div>
          <div>
            <h4 className="font-bold text-black text-sm uppercase tracking-wider">Instant Previews</h4>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">Tweak elements, toggle styles, and witness real-time layout rendering adjustments side-by-side.</p>
          </div>
          <div>
            <h4 className="font-bold text-black text-sm uppercase tracking-wider">AI Suggestions</h4>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">Dynamically rewrite summaries, build projects narratives, and draft tailored cover letters with Gemini.</p>
          </div>
        </div>

        {/* Footer section */}
        <div className="mt-20 border-t border-slate-200 pt-8 text-center">
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            Developed by AASHUTOSH DUBEY • OWNER
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
