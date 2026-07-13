import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import {
  Upload,
  FileText,
  Briefcase,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  History,
  Copy
} from 'lucide-react';

const Analyzer = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // History & Active Report states
  const [history, setHistory] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  
  // Expandable cards for parsed data
  const [expandedSection, setExpandedSection] = useState(null);

  // Cover Letter generation states
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [hiringManager, setHiringManager] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');

  const location = useLocation();

  const fetchHistory = async (autoSelectId = null) => {
    try {
      const res = await api.get('/analysis/history');
      setHistory(res.data);
      if (res.data.length > 0) {
        if (autoSelectId) {
          const match = res.data.find(h => h._id === autoSelectId);
          setActiveReport(match || res.data[0]);
        } else if (!activeReport) {
          setActiveReport(res.data[0]);
        } else {
          // Keep the currently active report refreshed if it exists in list
          const match = res.data.find(h => h._id === activeReport._id);
          setActiveReport(match || res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    // Check if redirecting from dashboard with a pre-selected analysis ID
    const routeRecordId = location.state?.activeRecordId;
    fetchHistory(routeRecordId);
  }, [location.state]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size exceeds the 5MB limit.');
        setFile(null);
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a resume file (PDF, DOCX, or TXT)');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription.trim()) {
      formData.append('jobDescription', jobDescription);
    }

    try {
      const res = await api.post('/analysis/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFile(null);
      setJobDescription('');
      setActiveReport(res.data);
      if (res.data.coverLetter?.content) {
        setGeneratedLetter(res.data.coverLetter.content);
      } else {
        setGeneratedLetter('');
      }
      // Refresh list and make the new one active
      await fetchHistory(res.data._id);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.message || 'Error occurred during file analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async (e) => {
    e.preventDefault();
    if (!activeReport) return;
    if (!companyName || !role) {
      alert('Please fill in Company Name and Role');
      return;
    }

    setCoverLetterLoading(true);
    try {
      const res = await api.post('/analysis/cover-letter', {
        analysisId: activeReport._id,
        companyName,
        role,
        hiringManager
      });
      setGeneratedLetter(res.data.content);
      // Refresh active report to sync cover letter saved state
      fetchHistory(activeReport._id);
    } catch (err) {
      console.error('Cover letter error:', err);
      alert('Failed to generate cover letter.');
    } finally {
      setCoverLetterLoading(false);
    }
  };

  const handleCopyLetter = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      alert('Cover Letter copied to clipboard!');
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleDeleteAnalysis = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this analysis from history?')) {
      try {
        await api.delete(`/analysis/history/${id}`);
        const remaining = history.filter(h => h._id !== id);
        setHistory(remaining);
        if (activeReport?._id === id) {
          setActiveReport(remaining.length > 0 ? remaining[0] : null);
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete record');
      }
    }
  };

  // Sync letter when selecting different history record
  useEffect(() => {
    if (activeReport) {
      setGeneratedLetter(activeReport.coverLetter?.content || '');
      setCompanyName(activeReport.coverLetter?.companyName || '');
      setRole(activeReport.coverLetter?.role || '');
    }
  }, [activeReport]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 min-h-[90vh]">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-black text-black uppercase tracking-tight">Resume Analyzer</h1>
        <p className="text-slate-500 text-xs mt-1">AI-powered parsing diagnostics, ATS reviews, and job suitability ratings</p>
      </div>

      {/* Main Grid: Left Upload Form/History, Right Analysis Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload Form & History (ColSpan 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* File Uploader */}
          <div className="glass-panel p-6 rounded-none border border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-black uppercase tracking-tight flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-700" />
              <span>Upload Resume</span>
            </h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-none flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-4">
              {/* Drag and Drop Container */}
              <div className="border border-dashed border-slate-300 rounded-none p-5 text-center bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:scale-105 transition-transform" />
                <span className="block text-xs font-bold text-slate-800">
                  {file ? file.name : 'Choose PDF or Word File'}
                </span>
                <span className="block text-[10px] text-slate-500 mt-2 uppercase font-bold tracking-wider">Only PDF and Word files accepted (Max 5MB)</span>
              </div>

              {/* Job Description text area */}
              <div>
                <label className="block text-xs text-slate-700 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>Job Vacancy Description</span>
                </label>
                <textarea
                  rows="4"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste details of target vacancy to evaluate keyword fitting..."
                  className="w-full glass-input text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3 px-4 bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Analyzing File...' : 'Start Audit'}</span>
              </button>
            </form>
          </div>

          {/* History selector */}
          {history.length > 0 && (
            <div className="glass-panel p-6 rounded-none border border-slate-200 space-y-3">
              <h2 className="text-sm font-bold text-black uppercase tracking-tight flex items-center gap-2">
                <History className="w-4 h-4 text-slate-700" />
                <span>Version History</span>
              </h2>
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Toggle previously parsed files</p>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {history.map((h) => (
                  <div
                    key={h._id}
                    onClick={() => { setActiveReport(h); }}
                    className={`p-3 rounded-none border text-left cursor-pointer flex justify-between items-center transition-all ${
                      activeReport?._id === h._id
                        ? 'border-black bg-slate-100 text-black font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-black'
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="text-xs truncate font-bold uppercase tracking-tight">{h.fileName}</div>
                      <div className="text-[9px] text-slate-500 font-semibold uppercase">
                        {new Date(h.createdAt).toLocaleDateString()} • ATS: {h.atsScore}%
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteAnalysis(h._id, e)}
                      className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Active Scan Details (ColSpan 8) */}
        <div className="lg:col-span-8">
          
          {loading ? (
            <div className="glass-panel p-12 rounded-none border border-slate-200 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-black animate-spin"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-black uppercase tracking-tight">AI Engine Running</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                  We are parsing file buffers, auditing structural margins, evaluating keyword densities, and matching job descriptions.
                </p>
              </div>
            </div>
          ) : !activeReport ? (
            <div className="glass-panel p-12 rounded-none border border-slate-200 text-center py-16">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-black uppercase tracking-tight">No active reports loaded</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                Upload your resume on the left to start a new analysis or pick a scan report from the historical logs list.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Core metrics panel (ATS score & Job match side-by-side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Score circle 1 */}
                <div className="glass-panel p-6 rounded-none border border-slate-200 flex items-center gap-6">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-black"
                        strokeDasharray={`${activeReport.atsScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="text-xl font-black text-black">{activeReport.atsScore}%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-sm uppercase tracking-wider">ATS Compatibility</h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Matches layout parsing models and key standard headings formatting conventions.
                    </p>
                  </div>
                </div>

                {/* Score circle 2 (Job description match) */}
                <div className="glass-panel p-6 rounded-none border border-slate-200 flex items-center gap-6">
                  {activeReport.jobMatch ? (
                    <>
                      <div className="relative w-20 h-20 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-black"
                            strokeDasharray={`${activeReport.jobMatch.score}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <span className="text-xl font-black text-black">{activeReport.jobMatch.score}%</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-black text-sm uppercase tracking-wider">Job Fit Score</h3>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          Keyword density matched against target vacancies.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col justify-center h-full text-left py-2">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">No Job Vacancy Matched</h3>
                      <p className="text-[9px] text-slate-500 mt-1 leading-relaxed uppercase font-semibold">
                        Paste a job description on the left upload form to audit custom keyword compliance.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Keyword badges (if job fit exists) */}
              {activeReport.jobMatch && (
                <div className="glass-panel p-6 rounded-none border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-black uppercase tracking-tight">Keyword Matching Audit</h3>
                  
                  <div className="space-y-4">
                    {/* Matched */}
                    {activeReport.jobMatch.matchedKeywords?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-emerald-800 tracking-wider">Matched ({activeReport.jobMatch.matchedKeywords.length})</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeReport.jobMatch.matchedKeywords.map((k, i) => (
                            <span key={i} className="text-xs px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing */}
                    {activeReport.jobMatch.missingKeywords?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-red-800 tracking-wider">Missing ({activeReport.jobMatch.missingKeywords.length})</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeReport.jobMatch.missingKeywords.map((k, i) => (
                            <span key={i} className="text-xs px-2.5 py-1.5 bg-red-50 border border-red-200 text-red-800 font-semibold">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended */}
                    {activeReport.jobMatch.recommendedKeywords?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-amber-800 tracking-wider">Recommended ({activeReport.jobMatch.recommendedKeywords.length})</span>
                        <div className="flex flex-wrap gap-1.5">
                          {activeReport.jobMatch.recommendedKeywords.map((k, i) => (
                            <span key={i} className="text-xs px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 font-semibold">{k}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Parsing Diagnostics (expandable cards) */}
              <div className="glass-panel p-6 rounded-none border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-black uppercase tracking-tight">Parsed Data Integrity</h3>
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Compare parsed fields vs raw file texts</p>
                
                <div className="space-y-2">
                  {[
                    { id: 'meta', label: 'Primary Metadata', data: `Name: ${activeReport.parsedData?.name || 'N/A'}\nEmail: ${activeReport.parsedData?.email || 'N/A'}\nPhone: ${activeReport.parsedData?.phone || 'N/A'}` },
                    { id: 'skills', label: 'Extracted Skills', data: activeReport.parsedData?.skills?.join(', ') || 'N/A' },
                    { id: 'education', label: 'Parsed Education Blocks', data: activeReport.parsedData?.education?.join('\n\n') || 'N/A' },
                    { id: 'experience', label: 'Parsed Experience Blocks', data: activeReport.parsedData?.experience?.join('\n\n') || 'N/A' }
                  ].map(sec => {
                    const isExpanded = expandedSection === sec.id;
                    return (
                      <div key={sec.id} className="border border-slate-200 rounded-none overflow-hidden">
                        <button
                          onClick={() => toggleSection(sec.id)}
                          className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left text-xs font-bold text-slate-700 flex justify-between items-center transition-colors"
                        >
                          <span className="uppercase tracking-wider">{sec.label}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>
                        {isExpanded && (
                          <div className="p-4 bg-white border-t border-slate-200">
                            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">{sec.data}</pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Content performance quality checks */}
              <div className="glass-panel p-6 rounded-none border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-black uppercase tracking-tight">Content Performance Audit</h3>
                
                <div className="space-y-4">
                  {/* Action verbs */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="uppercase tracking-wider">Action Verb Density</span>
                      <span>{activeReport.contentPerformance?.actionVerbsScore || 0}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-none overflow-hidden border border-slate-200">
                      <div className="bg-black h-full rounded-none" style={{ width: `${activeReport.contentPerformance?.actionVerbsScore || 0}%` }}></div>
                    </div>
                    {activeReport.contentPerformance?.actionVerbsFeedback?.length > 0 && (
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{activeReport.contentPerformance.actionVerbsFeedback[0]}</p>
                    )}
                  </div>

                  {/* Measurable metrics */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="uppercase tracking-wider">Measurable Impact & Metrics</span>
                      <span>{activeReport.contentPerformance?.metricsScore || 0}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-none overflow-hidden border border-slate-200">
                      <div className="bg-black h-full rounded-none" style={{ width: `${activeReport.contentPerformance?.metricsScore || 0}%` }}></div>
                    </div>
                    {activeReport.contentPerformance?.metricsFeedback?.length > 0 && (
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{activeReport.contentPerformance.metricsFeedback[0]}</p>
                    )}
                  </div>

                  {/* Grammar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="uppercase tracking-wider">Readability & Grammar</span>
                      <span>{activeReport.contentPerformance?.grammarScore || 0}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-none overflow-hidden border border-slate-200">
                      <div className="bg-black h-full rounded-none" style={{ width: `${activeReport.contentPerformance?.grammarScore || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI suggestions */}
              <div className="glass-panel p-6 rounded-none border border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-black uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-700" />
                  <span>AI Suggestions (PAR Framework)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {activeReport.aiSuggestions?.summary && (
                    <div className="p-4 rounded-none bg-slate-50 border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-black uppercase tracking-wider text-[10px]">Suggested Profile Summary</h4>
                      <p className="text-slate-600 leading-relaxed">{activeReport.aiSuggestions.summary}</p>
                    </div>
                  )}
                  {activeReport.aiSuggestions?.experience && (
                    <div className="p-4 rounded-none bg-slate-50 border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-black uppercase tracking-wider text-[10px]">Bullet Points Improvements</h4>
                      <p className="text-slate-600 leading-relaxed">{activeReport.aiSuggestions.experience}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter Panel */}
              <div className="glass-panel p-6 rounded-none border border-slate-200 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-black uppercase tracking-tight flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-700" />
                    <span>Personalized Cover Letter Generator</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold mt-1">Generates an application note matching candidate text</p>
                </div>

                <form onSubmit={handleGenerateCoverLetter} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] text-slate-700 font-bold uppercase tracking-wider mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Samsung"
                      className="w-full glass-input text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-700 font-bold uppercase tracking-wider mb-1">Role Title</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Software Engineer"
                      className="w-full glass-input text-xs"
                      required
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={coverLetterLoading}
                      className="w-full py-3 px-4 bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs transition-colors duration-150 disabled:opacity-50"
                    >
                      {coverLetterLoading ? 'Generating...' : 'Generate Letter'}
                    </button>
                  </div>
                </form>

                {/* Display cover letter */}
                {generatedLetter && (
                  <div className="p-4 rounded-none bg-slate-50 border border-slate-200 relative">
                    <button
                      onClick={handleCopyLetter}
                      className="absolute top-3 right-3 p-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 hover:text-black transition-colors"
                      title="Copy Cover Letter"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed pr-8">
                      {generatedLetter}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

// Trash2 SVG icon for clean standalone render
const Trash2 = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

export default Analyzer;
