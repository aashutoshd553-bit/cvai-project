import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import html2pdf from 'html2pdf.js';
import { 
  User, 
  BookOpen, 
  Briefcase, 
  FolderGit, 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Download, 
  Award, 
  Globe, 
  CheckCircle,
  FileDown
} from 'lucide-react';

const INITIAL_RESUME_STATE = {
  title: 'My Resume',
  templateId: 'modern',
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    address: '',
    dateOfBirth: '',
    profilePhoto: ''
  },
  summary: '',
  education: [],
  skills: {
    programmingLanguages: '',
    frameworks: '',
    libraries: '',
    databases: '',
    tools: '',
    cloud: '',
    softSkills: ''
  },
  experience: [],
  projects: [],
  achievements: [''],
  certifications: [],
  languages: [],
  interests: [''],
  extracurricularActivities: ['']
};

const Designer = () => {
  const [resume, setResume] = useState(INITIAL_RESUME_STATE);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Load existing resume if ID is passed via state
  useEffect(() => {
    const existingId = location.state?.resumeId;
    const initialTemplate = location.state?.initialTemplate;

    if (existingId) {
      setResumeId(existingId);
      const fetchResume = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/resumes/${existingId}`);
          // Ensure arrays are initialized if missing from DB
          const loadedData = {
            ...INITIAL_RESUME_STATE,
            ...res.data,
            personalInfo: { ...INITIAL_RESUME_STATE.personalInfo, ...res.data.personalInfo },
            skills: { ...INITIAL_RESUME_STATE.skills, ...res.data.skills },
            education: res.data.education || [],
            experience: res.data.experience || [],
            projects: res.data.projects || [],
            achievements: res.data.achievements?.length ? res.data.achievements : [''],
            certifications: res.data.certifications || [],
            languages: res.data.languages || [],
            interests: res.data.interests?.length ? res.data.interests : [''],
            extracurricularActivities: res.data.extracurricularActivities?.length ? res.data.extracurricularActivities : ['']
          };
          setResume(loadedData);
        } catch (err) {
          console.error('Error fetching resume:', err);
          alert('Failed to load resume details.');
        } finally {
          setLoading(false);
        }
      };
      fetchResume();
    } else if (initialTemplate) {
      setResume(prev => ({ ...prev, templateId: initialTemplate }));
    }
  }, [location.state]);

  const steps = [
    { name: 'Personal Info', icon: User },
    { name: 'Summary', icon: FileText },
    { name: 'Education', icon: BookOpen },
    { name: 'Skills', icon: Globe },
    { name: 'Experience', icon: Briefcase },
    { name: 'Projects', icon: FolderGit },
    { name: 'Achievements', icon: Award },
    { name: 'Certifications', icon: Award },
    { name: 'Languages', icon: Globe },
    { name: 'Preview & Export', icon: FileDown }
  ];

  // Input change helpers
  const handlePersonalInfoChange = (field, value) => {
    setResume(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleSkillsChange = (field, value) => {
    setResume(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    setResume(prev => {
      const arr = [...prev[section]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [section]: arr };
    });
  };

  const addArrayItem = (section, defaultObj = {}) => {
    setResume(prev => ({
      ...prev,
      [section]: [...prev[section], defaultObj]
    }));
  };

  const removeArrayItem = (section, index) => {
    setResume(prev => {
      const arr = [...prev[section]];
      arr.splice(index, 1);
      return { ...prev, [section]: arr };
    });
  };

  const handleStringArrayChange = (section, index, value) => {
    setResume(prev => {
      const arr = [...prev[section]];
      arr[index] = value;
      return { ...prev, [section]: arr };
    });
  };

  const addStringArrayItem = (section) => {
    setResume(prev => ({
      ...prev,
      [section]: [...prev[section], '']
    }));
  };

  const removeStringArrayItem = (section, index) => {
    setResume(prev => {
      const arr = [...prev[section]];
      arr.splice(index, 1);
      return { ...prev, [section]: arr };
    });
  };

  // AI Summary generation
  const handleGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/analysis/generate-summary', { resumeData: resume });
      setResume(prev => ({ ...prev, summary: res.data.summary }));
    } catch (err) {
      console.error('Error generating summary:', err);
      alert('Failed to generate summary with AI: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  // Save resume handler
  const handleSave = async () => {
    setSaveLoading(true);
    try {
      if (resumeId) {
        const res = await api.put(`/resumes/${resumeId}`, resume);
        setResume(res.data);
      } else {
        const res = await api.post('/resumes', resume);
        setResumeId(res.data._id);
        setResume(res.data);
      }
      alert('Resume saved successfully!');
    } catch (err) {
      console.error('Error saving resume:', err);
      alert('Failed to save resume.');
    } finally {
      setSaveLoading(false);
    }
  };

  // PDF Export via html2pdf library
  const handleExportPDF = () => {
    setShowDropdown(false);
    const element = document.getElementById('resume-preview-container');
    if (!element) {
      alert('Preview container not found');
      return;
    }
    const opt = {
      margin:       [0.2, 0.2, 0.2, 0.2],
      filename:     `${(resume.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2.5, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  // HTML/DOCX Export wrapper
  const handleExportWord = () => {
    const content = document.getElementById('resume-preview-container').innerHTML;
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; }
        h1 { font-size: 24px; margin-bottom: 5px; color: #1e293b; }
        h2 { font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 3px; margin-top: 15px; color: #3b82f6; }
        .header { text-align: center; margin-bottom: 20px; }
        .contact-info { font-size: 12px; margin-bottom: 15px; color: #64748b; }
        .section-item { margin-bottom: 10px; }
        .item-title { font-weight: bold; }
        .item-subtitle { color: #475569; font-style: italic; }
        .skills-grid { margin-top: 5px; }
        .skills-label { font-weight: bold; font-size: 13px; }
      </style>
    `;
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${resume.personalInfo.fullName || 'Resume'}</title>
        ${styles}
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(resume.personalInfo.fullName || 'Resume').replace(/\s+/g, '_')}_Resume.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowDropdown(false);
  };

  // Step Navigation
  const nextStep = () => {
    if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-t-2 border-primary-500 border-r-2 border-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  // Resume Templates Renders
  const renderResumeContent = () => {
    const p = resume.personalInfo;
    const s = resume.summary;
    const edu = resume.education;
    const sk = resume.skills;
    const exp = resume.experience;
    const proj = resume.projects;
    const ach = resume.achievements;
    const cert = resume.certifications;
    const lang = resume.languages;

    const hasSkills = Object.values(sk).some(v => v && v.trim());

    // TEMPLATE 1: Modern
    if (resume.templateId === 'modern') {
      return (
        <div className="p-8 text-[#1e293b] bg-white leading-relaxed text-sm h-full print-container">
          <div className="border-b-2 border-primary-500 pb-4 mb-6">
            <h1 className="text-3xl font-extrabold text-[#0f172a]">{p.fullName || 'Your Name'}</h1>
            <p className="text-primary-600 font-semibold text-xs mt-1 uppercase tracking-wider">Candidate Profile</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-[#475569]">
              {p.email && <span>Email: {p.email}</span>}
              {p.phone && <span>Phone: {p.phone}</span>}
              {p.address && <span>Loc: {p.address}</span>}
              {p.linkedin && <span>LinkedIn: {p.linkedin}</span>}
              {p.github && <span>GitHub: {p.github}</span>}
            </div>
          </div>

          {s && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Professional Summary</h2>
              <p className="text-xs text-[#334155]">{s}</p>
            </div>
          )}

          {edu.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Education History</h2>
              <div className="space-y-3">
                {edu.map((e, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-[#0f172a]">
                      <span>{e.degree} {e.branch ? `in ${e.branch}` : ''}</span>
                      <span>{e.passingYear || e.expectedGraduation}</span>
                    </div>
                    <div className="flex justify-between text-[#475569] italic">
                      <span>{e.instituteName}</span>
                      {e.cgpa ? <span>CGPA: {e.cgpa}</span> : e.percentage ? <span>Marks: {e.percentage}%</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasSkills && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Key Skills</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-[#334155]">
                {sk.programmingLanguages && <div><span className="font-bold text-[#0f172a]">Languages:</span> {sk.programmingLanguages}</div>}
                {sk.frameworks && <div><span className="font-bold text-[#0f172a]">Frameworks:</span> {sk.frameworks}</div>}
                {sk.libraries && <div><span className="font-bold text-[#0f172a]">Libraries:</span> {sk.libraries}</div>}
                {sk.databases && <div><span className="font-bold text-[#0f172a]">Databases:</span> {sk.databases}</div>}
                {sk.tools && <div><span className="font-bold text-[#0f172a]">Tools:</span> {sk.tools}</div>}
                {sk.cloud && <div><span className="font-bold text-[#0f172a]">Cloud:</span> {sk.cloud}</div>}
                {sk.softSkills && <div><span className="font-bold text-[#0f172a]">Soft Skills:</span> {sk.softSkills}</div>}
              </div>
            </div>
          )}

          {exp.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Work Experience</h2>
              <div className="space-y-4">
                {exp.map((e, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-[#0f172a]">
                      <span>{e.role}</span>
                      <span>{e.duration}</span>
                    </div>
                    <div className="font-semibold text-primary-600 mb-1">{e.company}</div>
                    {e.responsibilities && <p className="text-[#475569] mb-1 leading-relaxed">{e.responsibilities}</p>}
                    {e.technologiesUsed && <div className="text-[11px] text-[#64748b]"><span className="font-bold">Tech:</span> {e.technologiesUsed}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {proj.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Projects</h2>
              <div className="space-y-4">
                {proj.map((pr, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex justify-between font-bold text-[#0f172a]">
                      <span>{pr.projectName}</span>
                      <span>{pr.duration}</span>
                    </div>
                    {pr.projectDescription && <p className="text-[#475569] mt-0.5 leading-relaxed">{pr.projectDescription}</p>}
                    {pr.technologies && <div className="text-[11px] text-[#64748b] mt-1"><span className="font-bold">Tech Stack:</span> {pr.technologies}</div>}
                    <div className="flex gap-4 mt-1 text-[11px] text-primary-600">
                      {pr.githubLink && <a href={pr.githubLink} target="_blank" rel="noreferrer">GitHub Repo</a>}
                      {pr.liveLink && <a href={pr.liveLink} target="_blank" rel="noreferrer">Live Demo</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ach.length > 0 && ach[0].trim() && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Key Achievements</h2>
              <ul className="list-disc list-inside text-xs text-[#334155] space-y-1">
                {ach.map((a, idx) => a.trim() && <li key={idx}>{a}</li>)}
              </ul>
            </div>
          )}

          {cert.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">Certifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#334155]">
                {cert.map((c, idx) => (
                  <div key={idx} className="border-l-2 border-slate-200 pl-2 py-0.5">
                    <div className="font-bold text-[#0f172a]">{c.certificateName}</div>
                    <div className="text-[11px] text-[#475569]">{c.platform} • {c.completionDate}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // FALLBACK / GENERAL TEMPLATE RENDERING (5 others)
    // For general design preview, we will apply styling tweaks based on templateId.
    const isClassic = resume.templateId === 'classic';
    const isMinimal = resume.templateId === 'minimal';
    const isCreative = resume.templateId === 'creative';
    const isCorporate = resume.templateId === 'corporate';
    const isProfessional = resume.templateId === 'professional';

    const fontStyle = isClassic ? 'font-serif' : 'font-sans';
    const alignHeader = isClassic ? 'text-center' : 'text-left';
    const colorTheme = isCorporate ? 'text-emerald-700 border-emerald-600' : isProfessional ? 'text-blue-700 border-blue-600' : isCreative ? 'text-pink-600 border-pink-500' : 'text-slate-800 border-slate-800';

    return (
      <div className={`p-8 text-[#1e293b] bg-white leading-relaxed text-sm h-full print-container ${fontStyle}`}>
        {/* Header */}
        <div className={`border-b pb-4 mb-6 ${alignHeader} ${isCreative ? 'bg-slate-50 p-4 -m-8 mb-6' : ''}`}>
          <h1 className="text-3xl font-bold text-[#0f172a]">{p.fullName || 'Your Name'}</h1>
          <div className={`flex flex-wrap gap-4 mt-2 justify-start ${isClassic ? 'justify-center' : ''} text-xs text-[#475569]`}>
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.address && <span>{p.address}</span>}
            {p.linkedin && <span className="underline">{p.linkedin}</span>}
            {p.github && <span className="underline">{p.github}</span>}
          </div>
        </div>

        {/* Summary */}
        {s && (
          <div className="mb-5">
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5 ${colorTheme}`}>Summary</h2>
            <p className="text-xs text-[#334155]">{s}</p>
          </div>
        )}

        {/* Edu */}
        {edu.length > 0 && (
          <div className="mb-5">
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5 ${colorTheme}`}>Education</h2>
            <div className="space-y-3">
              {edu.map((e, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-[#0f172a]">
                    <span>{e.degree} {e.branch ? `- ${e.branch}` : ''}</span>
                    <span>{e.passingYear}</span>
                  </div>
                  <div className="flex justify-between text-[#475569]">
                    <span>{e.instituteName}</span>
                    <span>{e.cgpa ? `CGPA: ${e.cgpa}` : e.percentage ? `${e.percentage}%` : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {hasSkills && (
          <div className="mb-5">
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5 ${colorTheme}`}>Technical Skills</h2>
            <div className="grid grid-cols-1 gap-1 text-xs text-[#334155]">
              {sk.programmingLanguages && <div><span className="font-bold">Programming:</span> {sk.programmingLanguages}</div>}
              {sk.frameworks && <div><span className="font-bold">Frameworks:</span> {sk.frameworks}</div>}
              {sk.databases && <div><span className="font-bold">Databases:</span> {sk.databases}</div>}
              {sk.tools && <div><span className="font-bold">Tools/Other:</span> {sk.tools}</div>}
              {sk.softSkills && <div><span className="font-bold">Soft Skills:</span> {sk.softSkills}</div>}
            </div>
          </div>
        )}

        {/* Experience */}
        {exp.length > 0 && (
          <div className="mb-5">
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5 ${colorTheme}`}>Experience</h2>
            <div className="space-y-4">
              {exp.map((e, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-[#0f172a]">
                    <span>{e.role} | {e.company}</span>
                    <span>{e.duration}</span>
                  </div>
                  {e.responsibilities && <p className="text-[#475569] mt-1 leading-relaxed">{e.responsibilities}</p>}
                  {e.technologiesUsed && <div className="text-[11px] text-[#64748b] mt-1"><span className="font-bold">Technologies:</span> {e.technologiesUsed}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {proj.length > 0 && (
          <div className="mb-5">
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5 ${colorTheme}`}>Academic Projects</h2>
            <div className="space-y-4">
              {proj.map((pr, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-bold text-[#0f172a]">
                    <span>{pr.projectName}</span>
                    <span>{pr.duration}</span>
                  </div>
                  {pr.projectDescription && <p className="text-[#475569] mt-1 leading-relaxed">{pr.projectDescription}</p>}
                  {pr.technologies && <div className="text-[11px] text-[#64748b] mt-1"><span className="font-bold">Keywords:</span> {pr.technologies}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {ach.length > 0 && ach[0].trim() && (
          <div className="mb-5">
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5 ${colorTheme}`}>Achievements</h2>
            <ul className="list-disc list-inside text-xs text-[#334155] space-y-1">
              {ach.map((a, idx) => a.trim() && <li key={idx}>{a}</li>)}
            </ul>
          </div>
        )}

        {/* Certs */}
        {cert.length > 0 && (
          <div className="mb-5">
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 border-b-2 pb-0.5 ${colorTheme}`}>Certifications</h2>
            <div className="grid grid-cols-1 gap-2 text-xs text-[#334155]">
              {cert.map((c, idx) => (
                <div key={idx}>
                  <span className="font-bold">{c.certificateName}</span> - <span className="italic">{c.platform}</span> ({c.completionDate})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">Resume Designer</h1>
          <p className="text-slate-500 text-xs mt-1">Guided wizard to create an ATS compliant resume</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saveLoading}
            className="px-4 py-2.5 bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveLoading ? 'Saving...' : 'Save Draft'}</span>
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 transition-colors focus:outline-none"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-40 glass-panel p-1 rounded-none z-50">
                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:text-black hover:bg-slate-50 rounded-none transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={handleExportWord}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:text-black hover:bg-slate-50 rounded-none transition-colors"
                >
                  Download Word (.doc)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left form, Right preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Wizard column */}
        <div className="lg:col-span-5 space-y-6 no-print">
          
          {/* Step indicators */}
          <div className="glass-panel p-4 rounded-none border border-slate-200 flex items-center justify-between overflow-x-auto gap-4">
            <span className="text-xs font-bold text-slate-600 shrink-0">
              Step {activeStep + 1} of {steps.length}
            </span>
            <div className="flex gap-1 flex-grow max-w-[200px]">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`h-1.5 rounded-none flex-grow cursor-pointer transition-colors ${
                    idx <= activeStep ? 'bg-black' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-black font-bold uppercase tracking-wider shrink-0">
              {steps[activeStep].name}
            </span>
          </div>

          {/* Form input elements based on activeStep */}
          <div className="glass-panel p-6 rounded-none border border-slate-200 space-y-5 min-h-[350px]">
            
            {/* Step 1: Personal Info */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-black uppercase tracking-tight">Personal Information</h3>
                
                <div>
                  <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={resume.personalInfo.fullName}
                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full glass-input text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={resume.personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full glass-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">Phone *</label>
                    <input
                      type="text"
                      value={resume.personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full glass-input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1.5">Address</label>
                  <input
                    type="text"
                    value={resume.personalInfo.address}
                    onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                    placeholder="City, State, Country"
                    className="w-full glass-input text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={resume.personalInfo.linkedin}
                      onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className="w-full glass-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">GitHub URL</label>
                    <input
                      type="text"
                      value={resume.personalInfo.github}
                      onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                      placeholder="github.com/username"
                      className="w-full glass-input text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Summary */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-black uppercase tracking-tight">Professional Summary</h3>
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={aiLoading}
                    className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-[11px] text-slate-800 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiLoading ? 'Drafting...' : 'AI Generate'}</span>
                  </button>
                </div>

                <textarea
                  rows="8"
                  value={resume.summary}
                  onChange={(e) => setResume(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Describe your qualifications, key experience, and skills in 3-4 sentences..."
                  className="w-full glass-input text-sm resize-none"
                />
              </div>
            )}

            {/* Step 3: Education */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Education History</h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem('education', { instituteName: '', degree: '', branch: '', passingYear: '', cgpa: '' })}
                    className="p-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {resume.education.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No education records added. Click + to add one.</p>
                ) : (
                  <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1">
                    {resume.education.map((eduItem, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => removeArrayItem('education', idx)}
                          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="text-xs font-semibold text-slate-400">Record #{idx + 1}</div>
                        
                        <div>
                          <label className="block text-slate-400 text-[10px] font-medium mb-1">Institute Name</label>
                          <input
                            type="text"
                            value={eduItem.instituteName}
                            onChange={(e) => handleArrayChange('education', idx, 'instituteName', e.target.value)}
                            placeholder="College or High School"
                            className="w-full glass-input text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Degree</label>
                            <input
                              type="text"
                              value={eduItem.degree}
                              onChange={(e) => handleArrayChange('education', idx, 'degree', e.target.value)}
                              placeholder="B.Tech, CBSE 12th"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Branch / Stream</label>
                            <input
                              type="text"
                              value={eduItem.branch}
                              onChange={(e) => handleArrayChange('education', idx, 'branch', e.target.value)}
                              placeholder="CSE, Science"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Passing Year</label>
                            <input
                              type="text"
                              value={eduItem.passingYear}
                              onChange={(e) => handleArrayChange('education', idx, 'passingYear', e.target.value)}
                              placeholder="2025"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">CGPA / Percentage</label>
                            <input
                              type="text"
                              value={eduItem.cgpa}
                              onChange={(e) => handleArrayChange('education', idx, 'cgpa', e.target.value)}
                              placeholder="e.g. 9.1 or 88%"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Skills */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Technical & Soft Skills</h3>
                <p className="text-[10px] text-slate-500">Provide comma-separated entries for each category</p>

                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1">Programming Languages</label>
                  <input
                    type="text"
                    value={resume.skills.programmingLanguages}
                    onChange={(e) => handleSkillsChange('programmingLanguages', e.target.value)}
                    placeholder="Python, Java, JavaScript"
                    className="w-full glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1">Frameworks & Libraries</label>
                  <input
                    type="text"
                    value={resume.skills.frameworks}
                    onChange={(e) => handleSkillsChange('frameworks', e.target.value)}
                    placeholder="React, Express, TailwindCSS"
                    className="w-full glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1">Databases & Cloud</label>
                  <input
                    type="text"
                    value={resume.skills.databases}
                    onChange={(e) => handleSkillsChange('databases', e.target.value)}
                    placeholder="MongoDB, SQL, AWS S3"
                    className="w-full glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1">Tools & Platforms</label>
                  <input
                    type="text"
                    value={resume.skills.tools}
                    onChange={(e) => handleSkillsChange('tools', e.target.value)}
                    placeholder="Git, Docker, VS Code"
                    className="w-full glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1">Soft Skills</label>
                  <input
                    type="text"
                    value={resume.skills.softSkills}
                    onChange={(e) => handleSkillsChange('softSkills', e.target.value)}
                    placeholder="Communication, Teamwork, Leadership"
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Experience */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Work Experience</h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem('experience', { company: '', role: '', duration: '', responsibilities: '', technologiesUsed: '' })}
                    className="p-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {resume.experience.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No experience records. Click + to add.</p>
                ) : (
                  <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1">
                    {resume.experience.map((expItem, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => removeArrayItem('experience', idx)}
                          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Company</label>
                            <input
                              type="text"
                              value={expItem.company}
                              onChange={(e) => handleArrayChange('experience', idx, 'company', e.target.value)}
                              placeholder="e.g. Google"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Role</label>
                            <input
                              type="text"
                              value={expItem.role}
                              onChange={(e) => handleArrayChange('experience', idx, 'role', e.target.value)}
                              placeholder="Frontend Intern"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Duration</label>
                            <input
                              type="text"
                              value={expItem.duration}
                              onChange={(e) => handleArrayChange('experience', idx, 'duration', e.target.value)}
                              placeholder="May 2024 - Jul 2024"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Technologies Used</label>
                            <input
                              type="text"
                              value={expItem.technologiesUsed}
                              onChange={(e) => handleArrayChange('experience', idx, 'technologiesUsed', e.target.value)}
                              placeholder="React, CSS, Git"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[10px] font-medium mb-1">Responsibilities / Milestones</label>
                          <textarea
                            rows="3"
                            value={expItem.responsibilities}
                            onChange={(e) => handleArrayChange('experience', idx, 'responsibilities', e.target.value)}
                            placeholder="Detail your roles. Mention quantifiable items if possible..."
                            className="w-full glass-input text-xs resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Projects */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Academic Projects</h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem('projects', { projectName: '', projectDescription: '', technologies: '', githubLink: '', duration: '' })}
                    className="p-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {resume.projects.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No projects added yet.</p>
                ) : (
                  <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1">
                    {resume.projects.map((projItem, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => removeArrayItem('projects', idx)}
                          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Project Name</label>
                            <input
                              type="text"
                              value={projItem.projectName}
                              onChange={(e) => handleArrayChange('projects', idx, 'projectName', e.target.value)}
                              placeholder="AI Resume App"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Duration</label>
                            <input
                              type="text"
                              value={projItem.duration}
                              onChange={(e) => handleArrayChange('projects', idx, 'duration', e.target.value)}
                              placeholder="2 Months"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Technologies</label>
                            <input
                              type="text"
                              value={projItem.technologies}
                              onChange={(e) => handleArrayChange('projects', idx, 'technologies', e.target.value)}
                              placeholder="Node.js, Express, AI"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Repo URL</label>
                            <input
                              type="text"
                              value={projItem.githubLink}
                              onChange={(e) => handleArrayChange('projects', idx, 'githubLink', e.target.value)}
                              placeholder="github.com/..."
                              className="w-full glass-input text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[10px] font-medium mb-1">Project Summary</label>
                          <textarea
                            rows="2"
                            value={projItem.projectDescription}
                            onChange={(e) => handleArrayChange('projects', idx, 'projectDescription', e.target.value)}
                            placeholder="Detail what challenges you solved and what tech were deployed..."
                            className="w-full glass-input text-xs resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Achievements */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Achievements</h3>
                  <button
                    type="button"
                    onClick={() => addStringArrayItem('achievements')}
                    className="p-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {resume.achievements.map((achItem, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={achItem}
                        onChange={(e) => handleStringArrayChange('achievements', idx, e.target.value)}
                        placeholder="Secured 1st rank in Hackathon, Solved 500+ LeetCode..."
                        className="flex-grow glass-input text-xs"
                      />
                      {resume.achievements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStringArrayItem('achievements', idx)}
                          className="p-2 text-slate-500 hover:text-red-400 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 8: Certifications */}
            {activeStep === 7 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Certifications</h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem('certifications', { certificateName: '', platform: '', completionDate: '', credentialLink: '' })}
                    className="p-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {resume.certifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No certification records.</p>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {resume.certifications.map((c, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => removeArrayItem('certifications', idx)}
                          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div>
                          <label className="block text-slate-400 text-[10px] font-medium mb-1">Certification Name</label>
                          <input
                            type="text"
                            value={c.certificateName}
                            onChange={(e) => handleArrayChange('certifications', idx, 'certificateName', e.target.value)}
                            placeholder="AWS Certified Cloud Practitioner"
                            className="w-full glass-input text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Platform</label>
                            <input
                              type="text"
                              value={c.platform}
                              onChange={(e) => handleArrayChange('certifications', idx, 'platform', e.target.value)}
                              placeholder="Coursera / AWS"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-medium mb-1">Completion Date</label>
                            <input
                              type="text"
                              value={c.completionDate}
                              onChange={(e) => handleArrayChange('certifications', idx, 'completionDate', e.target.value)}
                              placeholder="Jul 2024"
                              className="w-full glass-input text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 9: Languages */}
            {activeStep === 8 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Languages</h3>
                  <button
                    type="button"
                    onClick={() => addArrayItem('languages', { language: '', proficiency: '' })}
                    className="p-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {resume.languages.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No language items added.</p>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {resume.languages.map((l, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={l.language}
                          onChange={(e) => handleArrayChange('languages', idx, 'language', e.target.value)}
                          placeholder="e.g. English"
                          className="flex-grow glass-input text-xs"
                        />
                        <select
                          value={l.proficiency}
                          onChange={(e) => handleArrayChange('languages', idx, 'proficiency', e.target.value)}
                          className="w-32 glass-input text-xs bg-slate-900"
                        >
                          <option value="">Select Level</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Native">Native</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeArrayItem('languages', idx)}
                          className="p-2 text-slate-500 hover:text-red-400 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 10: Preview & Templates Toggle */}
            {activeStep === 9 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Template & Layout</h3>
                <p className="text-[10px] text-slate-500">Pick an ATS layout. These structure headers and grids differently.</p>
                
                <div className="grid grid-cols-2 gap-3.5">
                  {[
                    { id: 'modern', name: 'Modern' },
                    { id: 'classic', name: 'Classic Serif' },
                    { id: 'professional', name: 'Professional' },
                    { id: 'corporate', name: 'Corporate' },
                    { id: 'minimal', name: 'Minimal' },
                    { id: 'creative', name: 'Creative' }
                  ].map(tmpl => (
                    <button
                      key={tmpl.id}
                      onClick={() => setResume(prev => ({ ...prev, templateId: tmpl.id }))}
                      className={`p-3 border text-xs font-bold text-center transition-all ${
                        resume.templateId === tmpl.id
                          ? 'border-black bg-slate-100 text-black'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-black'
                      }`}
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-black uppercase tracking-wider">Document Summary</h4>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-none space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Total Education Entries</span>
                      <span className="text-slate-800 font-bold">{resume.education.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Experience Blocks</span>
                      <span className="text-slate-800 font-bold">{resume.experience.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Achievements Listed</span>
                      <span className="text-slate-800 font-bold">{resume.achievements.filter(a => a.trim()).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom navigation buttons */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={prevStep}
              disabled={activeStep === 0}
              className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            
            <button
              onClick={nextStep}
              disabled={activeStep === steps.length - 1}
              className="px-4 py-2.5 bg-black hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Live Preview column (ColSpan 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between no-print">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Preview (Interactive)</span>
            </span>
            <span className="text-xs text-slate-500">Scale represents print layout spacing</span>
          </div>

          {/* Bordered sheet preview */}
          <div className="shadow-2xl rounded-none overflow-hidden border border-slate-300 bg-slate-200 p-6">
            <div id="resume-preview-container" className="min-h-[750px] shadow-inner bg-slate-200">
              {renderResumeContent()}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Designer;
