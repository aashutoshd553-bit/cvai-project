import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Plus, 
  Upload, 
  Trash2, 
  Edit, 
  FileText, 
  TrendingUp,
  AlertCircle,
  FileCheck,
  Calendar,
  Layers
} from 'lucide-react';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resumesRes, analysisRes] = await Promise.all([
        api.get('/resumes'),
        api.get('/analysis/history')
      ]);
      setResumes(resumesRes.data);
      setAnalyses(analysisRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not retrieve dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteResume = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await api.delete(`/resumes/${id}`);
        setResumes(resumes.filter(r => r._id !== id));
      } catch (err) {
        console.error('Error deleting resume:', err);
        alert('Failed to delete resume');
      }
    }
  };

  const handleEditResume = (id) => {
    navigate('/designer', { state: { resumeId: id } });
  };

  const handleCreateNew = () => {
    navigate('/designer');
  };

  const handleAnalyzeNew = () => {
    navigate('/analyzer');
  };

  const templates = [
    { id: 'modern', name: 'Modern Style', style: 'bg-slate-50 hover:bg-slate-100 text-black border border-slate-200' },
    { id: 'classic', name: 'Classic Serif', style: 'bg-slate-50 hover:bg-slate-100 text-black border border-slate-200' },
    { id: 'professional', name: 'Professional Layout', style: 'bg-slate-50 hover:bg-slate-100 text-black border border-slate-200' },
    { id: 'corporate', name: 'Corporate Grid', style: 'bg-slate-50 hover:bg-slate-100 text-black border border-slate-200' },
    { id: 'minimal', name: 'Minimalist Clean', style: 'bg-slate-50 hover:bg-slate-100 text-black border border-slate-200' },
    { id: 'creative', name: 'Creative Designer', style: 'bg-slate-50 hover:bg-slate-100 text-black border border-slate-200' }
  ];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin"></div>
        </div>
      </div>
    );
  }

  const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 min-h-[90vh]">
      {/* Welcome & Stats Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-xs mt-1">Manage and track your career assets in one central workspace</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateNew}
            className="px-4 py-2.5 bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition-colors duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Create Resume</span>
          </button>
          <button
            onClick={handleAnalyzeNew}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition-colors duration-150"
          >
            <Upload className="w-4 h-4" />
            <span>Analyze Resume</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Resumes, Right is Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Resumes (ColSpan 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-none border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-black uppercase tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                <span>Recent Resumes</span>
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {resumes.length} Total
              </span>
            </div>

            {resumes.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-slate-700 font-bold text-sm mb-1 uppercase tracking-wider">No resumes created yet</h3>
                <p className="text-xs text-slate-500 mb-6">Start from scratch using our form designer</p>
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Resume</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div
                    key={resume._id}
                    onClick={() => handleEditResume(resume._id)}
                    className="p-4 rounded-none bg-white border border-slate-200 hover:border-slate-400 transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-bold text-black group-hover:text-slate-600 transition-colors text-sm uppercase tracking-tight">
                          {resume.personalInfo?.fullName || 'Untitled Resume'}
                        </h4>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          {resume.templateId}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="flex items-center gap-3 max-w-xs">
                        <div className="flex-1 bg-slate-100 rounded-none h-1.5 overflow-hidden border border-slate-200">
                          <div 
                            className="bg-black h-full rounded-none" 
                            style={{ width: `${resume.completionPercentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {resume.completionPercentage || 0}% COMPLETE
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0 self-end sm:self-center">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(resume.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditResume(resume._id); }}
                          className="p-2 bg-slate-50 hover:bg-slate-100 hover:text-black border border-slate-200 transition-colors"
                          title="Edit Resume"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteResume(resume._id, e)}
                          className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 transition-colors"
                          title="Delete Resume"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Template Gallery */}
          <div className="glass-panel p-6 rounded-none border border-slate-200">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-slate-700" />
              <span>Resume Layouts</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">Select a preset layout style to start mapping content in the designer</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {templates.map(tmpl => (
                <div
                  key={tmpl.id}
                  onClick={() => navigate('/designer', { state: { initialTemplate: tmpl.id } })}
                  className={`p-4 rounded-none cursor-pointer flex flex-col justify-between min-h-[90px] transition-colors ${tmpl.style} group`}
                >
                  <span className="text-xs font-bold text-slate-900 group-hover:text-black uppercase tracking-wider">
                    {tmpl.name}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-4 self-end">
                    <span>Use layout</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Last Analysis Widget (ColSpan 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-none border border-slate-200 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-lg font-bold text-black uppercase tracking-tight mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-700" />
                <span>Last Scan Report</span>
              </h2>

              {!latestAnalysis ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                  <FileCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-slate-700 font-bold text-sm mb-1 uppercase tracking-wider">No scans found</h3>
                  <p className="text-xs text-slate-500 mb-6">Get insights on layout checks and missing job skills</p>
                  <button
                    onClick={handleAnalyzeNew}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px] transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Parse</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Score Widget */}
                  <div className="flex items-center gap-6 p-4 border border-slate-200 bg-slate-50">
                    {/* SVG Circular score */}
                    <div className="relative w-20 h-20 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-black"
                          strokeDasharray={`${latestAnalysis.atsScore}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <span className="text-lg font-black text-black">{latestAnalysis.atsScore}%</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-black text-sm uppercase tracking-wider">ATS Score</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Based on formatting conventions and keywords density indexes.</p>
                    </div>
                  </div>

                  {/* Summary items */}
                  <div className="space-y-3.5 border-t border-b border-slate-200 py-4">
                    <div className="text-xs flex justify-between">
                      <span className="text-slate-500 font-medium">File Name</span>
                      <span className="text-black font-bold truncate max-w-[200px]">{latestAnalysis.fileName}</span>
                    </div>
                    {latestAnalysis.jobMatch && (
                      <div className="text-xs flex justify-between">
                        <span className="text-slate-500 font-medium">Vacancy Matching</span>
                        <span className="text-black font-bold">{latestAnalysis.jobMatch.score}% Match</span>
                      </div>
                    )}
                    <div className="text-xs flex justify-between">
                      <span className="text-slate-500 font-medium">Layout Rating</span>
                      <span className="text-black font-bold">{latestAnalysis.layoutEvaluation?.score || 100}%</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span className="text-slate-500 font-medium">Scan Date</span>
                      <span className="text-slate-700 font-medium">{new Date(latestAnalysis.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Layout issues warning */}
                  {latestAnalysis.layoutEvaluation?.feedback?.length > 0 && (
                    <div className="p-3 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                      <div>
                        <span className="font-bold uppercase tracking-wider block mb-0.5">Layout Flag</span>
                        <p className="leading-relaxed">{latestAnalysis.layoutEvaluation.feedback[0]}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {latestAnalysis && (
              <button
                onClick={() => navigate('/analyzer', { state: { activeRecordId: latestAnalysis._id } })}
                className="w-full mt-6 py-2.5 bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 transition-colors duration-150"
              >
                <span>View Full Scan Report</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
