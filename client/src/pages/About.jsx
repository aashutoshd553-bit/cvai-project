import React from 'react';
import { Award, Settings, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 bg-slate-50 min-h-[90vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-black uppercase tracking-tight">
          About CVAI
        </h1>
        <p className="text-slate-500 mt-3 max-w-xl mx-auto text-xs font-semibold uppercase tracking-wider">
          Integrated Career Building and Application Audit Platform
        </p>
      </div>

      <div className="glass-panel p-8 rounded-none border border-slate-200 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-black uppercase tracking-tight mb-4">Project Overview</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            CVAI was built to bridge the gap between candidate qualifications and technical screening filters. 
            By integrating professional ATS-friendly form structures with state-of-the-art Generative AI parsers, 
            the application provides a simple yet comprehensive platform to draft resumes from scratch and analyze files against job criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-5 rounded-none bg-slate-50 border border-slate-200 flex gap-4">
            <Settings className="w-8 h-8 text-black shrink-0" />
            <div>
              <h3 className="font-bold text-black text-base uppercase tracking-tight">Form-Based Builder</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                A 10-step guided wizard collecting career milestones with real-time PDF template renders.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-none bg-slate-50 border border-slate-200 flex gap-4">
            <Award className="w-8 h-8 text-black shrink-0" />
            <div>
              <h3 className="font-bold text-black text-base uppercase tracking-tight">AI Scanner Diagnostics</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Evaluates layout constraints, keywords distribution, action verb density, and suggests cover letters.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-slate-500 font-medium">
          <span>Technology Stack: React.js, Tailwind CSS, Node.js, Express, Mongoose, Gemini AI API</span>
          <span className="flex items-center gap-1 uppercase tracking-wider font-bold">
            Made with <Heart className="w-3 h-3 text-black fill-black" /> by Owner.
          </span>
        </div>
      </div>
    </div>
  );
};

export default About;
